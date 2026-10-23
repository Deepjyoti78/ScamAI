"""ScamShield AI — External Web Research & Employer Evidence Enrichment Service.

Provides targeted, epistemic web-search verification of claimed employers and job vacancies
using the Brave Search API (endpoint: https://api.search.brave.com/res/v1/web/search).

Guiding Principles:
1. Strict API Key Security: Read from BRAVE_SEARCH_API_KEY environment variable. Never exposed to clients.
2. Graceful Fallback: If unconfigured, missing, or rate-limited, returns clearly marked status
   (not_configured, search_unavailable, or insufficient_evidence) without blocking the investigation.
3. Epistemic Restraint:
   - Corroborating a vacancy on an official careers portal indicates that a vacancy exists,
     but DOES NOT authenticate the submitted recruiter email or application destination.
   - Absence of search results or low search ranking is NOT proof of fraud (vacancies can be new,
     internal, unindexed, or syndicated).
   - Only search result snippets and titles are inspected; target pages are not claimed to be visited.
4. Separation of Concerns: External research is returned as an independent structured evidence source
   and is never averaged into statistical ML text probabilities.
"""

from datetime import datetime, timezone
import gzip
import io
import json
import os
from pathlib import Path
import re
from typing import Any, Dict, List, Optional, Tuple
import urllib.error
import urllib.parse
import urllib.request

try:
    from dotenv import load_dotenv
    # Look for .env in project root
    project_root = Path(__file__).resolve().parent.parent.parent
    load_dotenv(project_root / ".env")
except ImportError:
    pass

from backend.services.trust_chain import (
    PUBLIC_EMAIL_PROVIDERS,
    RECOGNIZED_STAFFING_AGENCIES,
    REPUTABLE_ATS_DOMAINS,
    normalize_domain,
)

TAVILY_SEARCH_ENDPOINT = "https://api.tavily.com/search"
BRAVE_SEARCH_ENDPOINT = "https://api.search.brave.com/res/v1/web/search"
DEFAULT_TIMEOUT_SECONDS = 6.0
MAX_QUERY_LENGTH = 120
MAX_RESULTS_TO_ANALYZE = 5

# Major third-party job boards and aggregators
JOB_BOARD_DOMAINS = {
    "linkedin.com": "LinkedIn",
    "indeed.com": "Indeed",
    "glassdoor.com": "Glassdoor",
    "ziprecruiter.com": "ZipRecruiter",
    "simplyhired.com": "SimplyHired",
    "monster.com": "Monster",
    "dice.com": "Dice",
    "careerbuilder.com": "CareerBuilder",
    "naukri.com": "Naukri",
    "wellfound.com": "Wellfound (AngelList)",
}


def sanitize_search_query(raw_query: str, max_length: int = MAX_QUERY_LENGTH) -> str:
    """Sanitize and constrain search query string for safe URL encoding."""
    if not raw_query:
        return ""
    # Strip dangerous characters, control chars, and punctuation that break searches
    cleaned = re.sub(r"[\r\n\t]+", " ", raw_query)
    cleaned = re.sub(r"[<>|!#$?*~`]+", "", cleaned)
    cleaned = re.sub(r"\s+", " ", cleaned).strip()
    return cleaned[:max_length].strip()


def build_targeted_queries(
    employer_name: Optional[str] = None,
    job_title: Optional[str] = None,
    company_website: Optional[str] = None,
) -> List[str]:
    """Construct a small, targeted list of search queries (maximum 2)."""
    queries = []
    clean_employer = sanitize_search_query(employer_name or "")
    clean_title = sanitize_search_query(job_title or "")

    _, website_domain = normalize_domain(company_website) if company_website else (None, None)

    # Query 1: Employer + Title + careers
    if clean_employer and clean_title:
        queries.append(sanitize_search_query(f'"{clean_employer}" "{clean_title}" careers'))
    elif clean_employer:
        queries.append(sanitize_search_query(f'"{clean_employer}" official careers jobs'))
    elif website_domain and clean_title:
        queries.append(sanitize_search_query(f'site:{website_domain} "{clean_title}"'))

    # Query 2: Focused domain search if company website is provided
    if website_domain and clean_employer and len(queries) < 2:
        queries.append(sanitize_search_query(f'site:{website_domain} careers'))

    return queries[:2]


# Seniority classifications for distinguishing internships, junior, staff, and executive roles
SENIORITY_GROUPS = {
    "intern": {"intern", "internship", "co-op", "coop", "trainee", "apprentice"},
    "junior": {"junior", "jr", "entry-level", "entry", "associate", "graduate"},
    "senior": {"senior", "sr"},
    "staff": {"staff"},
    "principal": {"principal", "distinguished"},
    "lead": {"lead"},
    "director_executive": {"director", "vp", "chief", "head of"},
}

GENERIC_TITLE_NOISE = {
    "and", "or", "in", "of", "for", "the", "a", "an", "at", "to", "with",
    "careers", "career", "jobs", "job", "hiring", "openings", "opening",
    "remote", "hybrid", "onsite", "full-time", "part-time", "contract",
    "usa", "us", "americas", "emea", "apac", "global", "team", "role", "position",
    "new", "york", "nyc", "london", "city", "area", "bay", "sf", "ca", "ny"
}


def extract_seniority_set(text: str) -> set:
    """Identify which seniority categories appear in the title text."""
    lower = f" {text.lower()} "
    cleaned = re.sub(r"[^a-z0-9\s-]", " ", lower)
    found = set()
    for category, keywords in SENIORITY_GROUPS.items():
        for kw in keywords:
            pattern = r"(?:\b|_)" + re.escape(kw) + r"(?:\b|_)"
            if re.search(pattern, cleaned):
                found.add(category)
                break
    return found


def tokenize_title(title: str, employer_name: Optional[str] = None) -> List[str]:
    """Tokenize and normalize role title, removing noise and employer names."""
    if not title:
        return []
    clean = title.lower()
    if employer_name:
        clean = re.sub(re.escape(employer_name.lower()), " ", clean)
    clean = re.sub(r"[^a-z0-9\s]", " ", clean)
    return [w for w in clean.split() if len(w) >= 2 and w not in GENERIC_TITLE_NOISE]


def evaluate_vacancy_title_match(
    advertised_title: Optional[str],
    result_title: str,
    snippet: str,
    employer_name: Optional[str] = None,
) -> Tuple[str, str, Dict[str, Any]]:
    """Evaluate title match against result title and snippet.

    Returns:
      (match_type, candidate_title, details)
      where match_type is:
        'exact_match'
        'related_role'
        'seniority_mismatch'
        'unrelated_or_no_role'
    """
    if not advertised_title:
        return "unrelated_or_no_role", result_title, {"reason": "No advertised title provided"}

    # Extract candidate role segment from result_title if separated by standard delimiters
    delimiters = r"\s+[-|–—:•·]\s+|\s+at\s+|\s+hiring\s+"
    parts = [p.strip() for p in re.split(delimiters, result_title, flags=re.IGNORECASE) if p.strip()]
    if not parts:
        parts = [result_title.strip()]

    adv_toks = set(tokenize_title(advertised_title, employer_name))
    if not adv_toks:
        return "unrelated_or_no_role", result_title, {"reason": "Advertised title contained only generic stopwords"}

    # Find the segment with the highest overlap with advertised tokens
    best_part = parts[0]
    best_overlap = -1
    for p in parts:
        p_toks = set(tokenize_title(p, employer_name))
        overlap = len(adv_toks.intersection(p_toks))
        if overlap > best_overlap:
            best_overlap = overlap
            best_part = p

    candidate_role = best_part
    cand_toks = set(tokenize_title(candidate_role, employer_name))

    adv_sen = extract_seniority_set(advertised_title)
    cand_sen = extract_seniority_set(candidate_role)
    if not cand_sen and snippet:
        snippet_sen = extract_seniority_set(snippet)
        if snippet_sen:
            cand_sen = snippet_sen

    # 1. Seniority Mismatch Check:
    # If both have seniority specified and they conflict (e.g. intern vs staff, junior vs senior)
    if adv_sen and cand_sen and adv_sen != cand_sen:
        return (
            "seniority_mismatch",
            candidate_role,
            {
                "advertised_seniority": list(adv_sen),
                "observed_seniority": list(cand_sen),
                "reason": f"Seniority level mismatch ({list(adv_sen)} vs {list(cand_sen)})",
            },
        )

    # 2. Token overlap check:
    common_toks = adv_toks.intersection(cand_toks)
    if not common_toks:
        snippet_toks = set(tokenize_title(snippet, employer_name))
        snippet_common = adv_toks.intersection(snippet_toks)
        if len(snippet_common) < max(1, len(adv_toks) // 2):
            return "unrelated_or_no_role", candidate_role, {"reason": "No core title tokens observed"}
        cand_toks = cand_toks.union(snippet_common)
        common_toks = adv_toks.intersection(cand_toks)

    extra_toks = cand_toks - adv_toks
    missing_toks = adv_toks - cand_toks

    # Substantive extra tokens (e.g. specialization like 'machine', 'learning', 'platform', 'security')
    substantive_extra = {
        w for w in extra_toks
        if len(w) >= 3 and w not in GENERIC_TITLE_NOISE and w not in (employer_name or "").lower()
    }
    # Substantive missing tokens
    substantive_missing = {
        w for w in missing_toks
        if len(w) >= 3 and w not in GENERIC_TITLE_NOISE
    }

    if adv_sen and not cand_sen:
        substantive_missing.update(adv_sen)

    if not substantive_extra and not substantive_missing:
        return (
            "exact_match",
            candidate_role,
            {
                "matching_tokens": list(common_toks),
                "confidence": 1.0,
            },
        )

    if len(common_toks) >= max(1, int(len(adv_toks) * 0.6)):
        return (
            "related_role",
            candidate_role,
            {
                "matching_tokens": list(common_toks),
                "extra_specialization_tokens": list(substantive_extra),
                "missing_tokens": list(substantive_missing),
            },
        )

    return "unrelated_or_no_role", candidate_role, {"reason": "Insufficient title similarity"}


def analyze_search_result(
    result: Dict[str, Any],
    query_performed: str,
    claimed_employer: Optional[str] = None,
    advertised_title: Optional[str] = None,
    supplied_company_website: Optional[str] = None,
    recruiter_email: Optional[str] = None,
    application_url: Optional[str] = None,
) -> Dict[str, Any]:
    """Analyze a single search result item against user-supplied listing details."""
    title = str(result.get("title") or "").strip()
    url = str(result.get("url") or "").strip()
    snippet = str(result.get("content") or result.get("description") or "").strip()

    _, result_domain = normalize_domain(url)
    _, supplied_domain = normalize_domain(supplied_company_website) if supplied_company_website else (None, None)
    _, recruiter_domain = normalize_domain(recruiter_email.split("@")[-1]) if recruiter_email and "@" in recruiter_email else (None, None)
    _, app_domain = normalize_domain(application_url) if application_url else (None, None)

    retrieved_at = datetime.now(timezone.utc).isoformat()
    raw_date = result.get("published_date") or result.get("page_age") or result.get("date")
    published_date = str(raw_date).strip() if raw_date else None

    employer_clean = (claimed_employer or "").lower().strip()
    title_clean = (advertised_title or "").lower().strip()
    snippet_lower = snippet.lower()
    title_lower = title.lower()
    combined_text = f"{title_lower} {snippet_lower}"

    employer_compact = re.sub(r"[^a-z0-9]", "", employer_clean)
    result_compact = re.sub(r"[^a-z0-9]", "", result_domain or "")
    employer_tokens = [
        w
        for w in re.split(r"\s+", employer_clean)
        if len(w) >= 3
        and w not in ("inc", "corp", "corporation", "ltd", "llc", "global", "group", "solutions", "technologies", "careers")
    ]
    matches_domain_token = any(token in (result_domain or "") for token in employer_tokens)
    is_employer_in_domain = bool(
        employer_compact
        and len(employer_compact) >= 3
        and (employer_compact in result_compact or matches_domain_token)
    )

    # Classify source domain category
    if result_domain in REPUTABLE_ATS_DOMAINS:
        source_type = "recognized_ats"
        platform_name = REPUTABLE_ATS_DOMAINS[result_domain]
    elif result_domain in JOB_BOARD_DOMAINS:
        source_type = "third_party_job_board"
        platform_name = JOB_BOARD_DOMAINS[result_domain]
    elif (supplied_domain and result_domain == supplied_domain) or is_employer_in_domain:
        source_type = "official_employer_domain"
        platform_name = claimed_employer or result_domain or "Official Employer Presence"
    else:
        source_type = "third_party_source"
        platform_name = result_domain or "Web Source"

    # Evaluate title and seniority match
    match_type, detected_role, match_detail = evaluate_vacancy_title_match(
        advertised_title=advertised_title,
        result_title=title,
        snippet=snippet,
        employer_name=claimed_employer,
    )

    comparison = {
        "claimed_employer": claimed_employer,
        "advertised_title": advertised_title,
        "supplied_company_domain": supplied_domain,
        "recruiter_email_domain": recruiter_domain,
        "application_destination_domain": app_domain,
        "search_result_domain": result_domain,
        "source_type": source_type,
        "title_match_type": match_type,
        "detected_role_title": detected_role,
        "match_detail": match_detail,
        "verification_basis": "search_snippet_only",
        "target_page_retrieved": False,
    }

    # Snippet limitation disclaimer applied consistently across all findings
    snippet_disclaimer = (
        "Evaluated based solely on search result title and snippet; the destination page was not directly retrieved or parsed. "
        "Corroborating a public vacancy indicates that this role exists, but DOES NOT independently authenticate the submitted "
        "recruiter identity, sender email, or application destination (adversaries frequently copy legitimate corporate job listings)."
    )

    # Check 0: Recruiter domain mismatch against corroborated official employer domain
    if recruiter_domain and recruiter_domain != result_domain and recruiter_domain not in PUBLIC_EMAIL_PROVIDERS and recruiter_domain not in RECOGNIZED_STAFFING_AGENCIES:
        if source_type == "official_employer_domain" or (supplied_domain and result_domain == supplied_domain):
            return {
                "query_performed": query_performed,
                "source_title": title,
                "source_url": url,
                "source_domain": result_domain or "unknown",
                "source_type": source_type,
                "snippet": snippet,
                "retrieved_at": retrieved_at,
                "published_date": published_date,
                "evidence_status": "potential_domain_inconsistency",
                "explanation": (
                    f"External search identified {result_domain} as the official primary domain for '{claimed_employer}', "
                    f"but the recruiter email domain is '@{recruiter_domain}'. This discrepancy suggests potential lookalike or unverified sender routing."
                ),
                "limitations": (
                    "Search ranking is not legal proof of domain ownership. Exercise caution and verify recruiter "
                    "identity through official company directories. Target page was not directly fetched."
                ),
                "comparison_detail": comparison,
            }

    # Check 1: User-supplied domain conflicts with authentic employer domain
    if source_type == "official_employer_domain":
        if supplied_domain and supplied_domain != result_domain and result_domain not in REPUTABLE_ATS_DOMAINS and result_domain not in JOB_BOARD_DOMAINS:
            return {
                "query_performed": query_performed,
                "source_title": title,
                "source_url": url,
                "source_domain": result_domain or "unknown",
                "source_type": source_type,
                "snippet": snippet,
                "retrieved_at": retrieved_at,
                "published_date": published_date,
                "evidence_status": "potential_domain_inconsistency",
                "explanation": (
                    f"External search identified {result_domain} as the likely primary web domain for '{claimed_employer}', "
                    f"which differs from the user-supplied domain '{supplied_domain}'."
                ),
                "limitations": (
                    "Heuristic domain comparison based on search indexing. Companies occasionally use distinct domains "
                    "for brand marketing or regional entities. Candidates should verify domain ownership before sharing personal credentials."
                ),
                "comparison_detail": comparison,
            }

    # Check 2: Official employer website matches
    if source_type == "official_employer_domain":
        if match_type == "exact_match":
            return {
                "query_performed": query_performed,
                "source_title": title,
                "source_url": url,
                "source_domain": result_domain or "unknown",
                "source_type": source_type,
                "snippet": snippet,
                "retrieved_at": retrieved_at,
                "published_date": published_date,
                "evidence_status": "exact_vacancy_match_found",
                "explanation": (
                    f"Corroborating exact vacancy found on the claimed employer's official website ({result_domain}). "
                    f"The search snippet title ('{detected_role}') closely matches the advertised role ('{advertised_title}')."
                ),
                "limitations": snippet_disclaimer,
                "comparison_detail": comparison,
            }
        elif match_type == "related_role":
            return {
                "query_performed": query_performed,
                "source_title": title,
                "source_url": url,
                "source_domain": result_domain or "unknown",
                "source_type": source_type,
                "snippet": snippet,
                "retrieved_at": retrieved_at,
                "published_date": published_date,
                "evidence_status": "related_role_found",
                "explanation": (
                    f"Related role observed on official employer website ({result_domain}): Listing references '{detected_role}', "
                    f"which shares the core title with '{advertised_title}' but contains an additional or distinct specialization. "
                    "Does not confirm the exact submitted vacancy."
                ),
                "limitations": (
                    "Evaluated from search snippet only. A related vacancy corroborates active hiring in this discipline, "
                    "but does not confirm the specific role submitted nor authenticate the recruiter or application link."
                ),
                "comparison_detail": comparison,
            }
        elif match_type == "seniority_mismatch":
            return {
                "query_performed": query_performed,
                "source_title": title,
                "source_url": url,
                "source_domain": result_domain or "unknown",
                "source_type": source_type,
                "snippet": snippet,
                "retrieved_at": retrieved_at,
                "published_date": published_date,
                "evidence_status": "employer_official_presence_found",
                "explanation": (
                    f"Official employer web presence confirmed on {result_domain}. However, the search result reflects a "
                    f"different seniority level ('{detected_role}') rather than the advertised '{advertised_title}' (e.g. internship vs. staff/senior role)."
                ),
                "limitations": (
                    "Confirms the official employer website exists. It does not corroborate the advertised vacancy or seniority level, "
                    "nor does it authenticate the recruiter or application link."
                ),
                "comparison_detail": comparison,
            }
        else:
            # Unrelated role or general company homepage on official domain
            return {
                "query_performed": query_performed,
                "source_title": title,
                "source_url": url,
                "source_domain": result_domain or "unknown",
                "source_type": source_type,
                "snippet": snippet,
                "retrieved_at": retrieved_at,
                "published_date": published_date,
                "evidence_status": "employer_official_presence_found",
                "explanation": (
                    f"Official employer web presence confirmed on {result_domain}. However, no matching vacancy for "
                    f"'{advertised_title}' was identified in top search results (observed: '{detected_role}')."
                ),
                "limitations": (
                    "Confirms the employer's official web domain exists. It does not corroborate the existence of the specific "
                    "advertised vacancy, nor does it authenticate any recruiter communications."
                ),
                "comparison_detail": comparison,
            }

    # Check 3: Reputable ATS platform hosting this employer's role
    if source_type == "recognized_ats":
        # Check if employer is mentioned in URL, title, or snippet
        employer_matches = (
            (employer_clean and employer_clean in combined_text)
            or (employer_compact and employer_compact in result_compact)
            or (employer_compact and employer_compact in url.lower())
        )
        if employer_matches:
            if match_type == "exact_match":
                return {
                    "query_performed": query_performed,
                    "source_title": title,
                    "source_url": url,
                    "source_domain": result_domain or "unknown",
                    "source_type": source_type,
                    "snippet": snippet,
                    "retrieved_at": retrieved_at,
                    "published_date": published_date,
                    "evidence_status": "exact_vacancy_match_found",
                    "explanation": (
                        f"Exact vacancy match identified on recognized enterprise ATS / recruitment platform ({platform_name} / {result_domain}) "
                        f"referencing '{claimed_employer}' with title '{detected_role}'."
                    ),
                    "limitations": (
                        f"Evaluated based on search result snippet from an enterprise ATS or recruitment platform ({platform_name}). "
                        "While recognized ATS platforms host legitimate recruitment pipelines, this finding does not authenticate "
                        "an unverified recruiter's outbound email or contact message."
                    ),
                    "comparison_detail": comparison,
                }
            elif match_type == "related_role":
                return {
                    "query_performed": query_performed,
                    "source_title": title,
                    "source_url": url,
                    "source_domain": result_domain or "unknown",
                    "source_type": source_type,
                    "snippet": snippet,
                    "retrieved_at": retrieved_at,
                    "published_date": published_date,
                    "evidence_status": "related_role_found",
                    "explanation": (
                        f"Related vacancy observed on recognized ATS ({platform_name} / {result_domain}) referencing '{claimed_employer}' "
                        f"with role '{detected_role}'."
                    ),
                    "limitations": (
                        f"Third-party ATS listings on {platform_name} indicate public recruitment activity. "
                        "A related opening does not verify the exact role submitted nor authenticate the recruiter."
                    ),
                    "comparison_detail": comparison,
                }

    # Check 4: Third-party job board (LinkedIn, Indeed, Glassdoor, etc.)
    if source_type == "third_party_job_board":
        employer_matches = (
            (employer_clean and employer_clean in combined_text)
            or (employer_compact and employer_compact in url.lower())
        )
        if employer_matches:
            if match_type == "exact_match":
                return {
                    "query_performed": query_performed,
                    "source_title": title,
                    "source_url": url,
                    "source_domain": result_domain or "unknown",
                    "source_type": source_type,
                    "snippet": snippet,
                    "retrieved_at": retrieved_at,
                    "published_date": published_date,
                    "evidence_status": "exact_vacancy_match_found",
                    "explanation": (
                        f"Matching job listing observed on recognized recruitment platform ({platform_name} / {result_domain}) "
                        f"referencing '{claimed_employer}' and title '{detected_role}'."
                    ),
                    "limitations": (
                        f"Distinguish from official employer domain: Third-party job board listings ({platform_name}) indicate hiring activity "
                        "but can be syndicated, expired, or scraped. Always confirm that applications route to the authentic hiring authority."
                    ),
                    "comparison_detail": comparison,
                }
            elif match_type == "related_role":
                return {
                    "query_performed": query_performed,
                    "source_title": title,
                    "source_url": url,
                    "source_domain": result_domain or "unknown",
                    "source_type": source_type,
                    "snippet": snippet,
                    "retrieved_at": retrieved_at,
                    "published_date": published_date,
                    "evidence_status": "related_role_found",
                    "explanation": (
                        f"Related role observed on recruitment platform ({platform_name} / {result_domain}) referencing '{claimed_employer}' "
                        f"with role '{detected_role}'."
                    ),
                    "limitations": (
                        f"Third-party listing on {platform_name} indicates related recruitment activity. "
                        "Does not confirm the exact submitted vacancy nor authenticate sender."
                    ),
                    "comparison_detail": comparison,
                }

    # Check 5: General third-party web result
    if match_type in ("exact_match", "related_role") and employer_clean and employer_clean in combined_text:
        return {
            "query_performed": query_performed,
            "source_title": title,
            "source_url": url,
            "source_domain": result_domain or "unknown",
            "source_type": source_type,
            "snippet": snippet,
            "retrieved_at": retrieved_at,
            "published_date": published_date,
            "evidence_status": "related_role_found",
            "explanation": (
                f"Public web excerpt referencing a role or hiring activity for '{claimed_employer}' on {result_domain}: '{detected_role}'. "
                "Distinguish from official employer domain: This third-party source indicates public awareness of hiring, but does not independently verify the vacancy."
            ),
            "limitations": snippet_disclaimer,
            "comparison_detail": comparison,
        }

    return {
        "query_performed": query_performed,
        "source_title": title,
        "source_url": url,
        "source_domain": result_domain or "unknown",
        "source_type": source_type,
        "snippet": snippet,
        "retrieved_at": retrieved_at,
        "published_date": published_date,
        "evidence_status": "no_matching_vacancy_found_in_search",
        "explanation": (
            f"Search result from {result_domain} returned for query '{query_performed}' without direct role match for '{advertised_title}'."
        ),
        "limitations": (
            "Search results are heuristic snippets. Search engines do not guarantee completeness, and absence of an indexed "
            "vacancy does not prove that the vacancy does not exist nor does it indicate fraud."
        ),
        "comparison_detail": comparison,
    }


def resolve_search_provider(api_key: Optional[str] = None) -> Tuple[str, str, str]:
    """Resolve the active search provider, display name, and API key.

    Returns:
      (provider_key, display_name, api_key)
      where provider_key is 'tavily', 'brave', or 'none'.
    """
    if api_key and api_key.strip():
        k = api_key.strip()
        if k.startswith("tvly-") or "tvly" in k:
            return "tavily", "Tavily Search API", k
        elif k.startswith("BS") or "brave" in k.lower():
            return "brave", "Brave Search API", k
        return ("tavily", "Tavily Search API", k) if k.startswith("tvly") else ("brave", "Brave Search API", k)

    # Check environment: Tavily takes priority when set, followed by Brave
    tavily_key = os.getenv("TAVILY_API_KEY", "").strip()
    if tavily_key:
        return "tavily", "Tavily Search API", tavily_key

    brave_key = os.getenv("BRAVE_SEARCH_API_KEY", "").strip()
    if brave_key:
        return "brave", "Brave Search API", brave_key

    return "none", "Web Search API", ""


def execute_web_research(
    employer_name: Optional[str] = None,
    job_title: Optional[str] = None,
    company_website: Optional[str] = None,
    recruiter_email: Optional[str] = None,
    application_url: Optional[str] = None,
    api_key: Optional[str] = None,
    timeout_seconds: float = DEFAULT_TIMEOUT_SECONDS,
    max_results_to_analyze: int = MAX_RESULTS_TO_ANALYZE,
) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
    """Execute live web search via Tavily or Brave Search API and return structured evidence findings.

    Returns:
      (findings, summary)
    """
    provider, provider_name, effective_api_key = resolve_search_provider(api_key)

    # 1. Check if provider is configured
    if provider == "none" or not effective_api_key:
        summary = {
            "status": "not_configured",
            "provider": provider_name,
            "total_queries_executed": 0,
            "findings_count": 0,
            "overall_evidence_assessment": (
                "External web search is not configured. (Neither TAVILY_API_KEY nor BRAVE_SEARCH_API_KEY is set in the backend environment). "
                "Investigation proceeded using statistical NLP and local Trust Chain evidence checks."
            ),
            "limitations_disclaimer": (
                "External web verification was bypassed. ScamShield AI did not claim that web research was conducted. "
                "Set TAVILY_API_KEY or BRAVE_SEARCH_API_KEY to enable live employer and vacancy search corroboration."
            ),
        }
        return [], summary

    # 2. Check if sufficient information exists to search meaningfully
    clean_employer = (employer_name or "").strip()
    clean_title = (job_title or "").strip()
    clean_website = (company_website or "").strip()

    if not clean_employer and not clean_website:
        summary = {
            "status": "insufficient_evidence",
            "provider": provider_name,
            "total_queries_executed": 0,
            "findings_count": 0,
            "overall_evidence_assessment": (
                "Insufficient employer or domain details provided to formulate external search queries. "
                "Supply an employer name or official website to enable web corroboration."
            ),
            "limitations_disclaimer": "No external search queries were executed due to lack of input parameters.",
        }
        return [], summary

    queries = build_targeted_queries(clean_employer, clean_title, clean_website)
    if not queries:
        summary = {
            "status": "insufficient_evidence",
            "provider": provider_name,
            "total_queries_executed": 0,
            "findings_count": 0,
            "overall_evidence_assessment": "Insufficient input details to construct targeted search queries.",
            "limitations_disclaimer": "External search was bypassed.",
        }
        return [], summary

    findings: List[Dict[str, Any]] = []
    queries_executed = 0
    provider_error: Optional[str] = None

    seen_urls: set = set()
    for query in queries:
        if provider == "tavily":
            payload = {
                "query": query,
                "search_depth": "basic",
                "max_results": max_results_to_analyze,
                "include_answer": False,
                "include_raw_content": False,
            }
            body_bytes = json.dumps(payload).encode("utf-8")
            headers = {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Authorization": f"Bearer {effective_api_key}",
                "User-Agent": "ScamShieldAI-WebResearch/1.0",
            }
            req = urllib.request.Request(
                TAVILY_SEARCH_ENDPOINT,
                data=body_bytes,
                headers=headers,
                method="POST",
            )
        else:
            params = {
                "q": query,
                "count": max_results_to_analyze,
                "text_decorations": "false",
                "search_lang": "en",
            }
            req_url = f"{BRAVE_SEARCH_ENDPOINT}?{urllib.parse.urlencode(params)}"
            headers = {
                "Accept": "application/json",
                "Accept-Encoding": "gzip",
                "X-Subscription-Token": effective_api_key,
                "User-Agent": "ScamShieldAI-WebResearch/1.0",
            }
            req = urllib.request.Request(req_url, headers=headers, method="GET")

        queries_executed += 1

        try:
            with urllib.request.urlopen(req, timeout=timeout_seconds) as response:
                content = response.read()
                # Decompress gzip if encoded or if gzip magic bytes are present
                encoding = ""
                if hasattr(response, "info") and callable(response.info):
                    info_obj = response.info()
                    if hasattr(info_obj, "get"):
                        encoding = info_obj.get("Content-Encoding", "")
                elif hasattr(response, "headers") and hasattr(response.headers, "get"):
                    encoding = response.headers.get("Content-Encoding", "")

                if encoding == "gzip" or content.startswith(b"\x1f\x8b"):
                    try:
                        content = gzip.decompress(content)
                    except Exception:
                        pass

                data = json.loads(content.decode("utf-8", errors="replace"))
                if "web" in data and isinstance(data["web"], dict):
                    web_results = data["web"].get("results", [])
                else:
                    web_results = data.get("results", [])

                for item in web_results[:max_results_to_analyze]:
                    item_url = (item.get("url") or "").strip().rstrip("/")
                    if item_url and item_url in seen_urls:
                        continue
                    if item_url:
                        seen_urls.add(item_url)

                    finding = analyze_search_result(
                        result=item,
                        query_performed=query,
                        claimed_employer=clean_employer,
                        advertised_title=clean_title,
                        supplied_company_website=clean_website,
                        recruiter_email=recruiter_email,
                        application_url=application_url,
                    )
                    findings.append(finding)

        except urllib.error.HTTPError as e:
            if e.code == 429:
                provider_error = f"{provider_name} rate limit exceeded (HTTP 429). Search temporarily unavailable."
            elif e.code in (401, 403):
                key_env = "TAVILY_API_KEY" if provider == "tavily" else "BRAVE_SEARCH_API_KEY"
                provider_error = f"{provider_name} authentication failed (HTTP {e.code}). Verify {key_env}."
            else:
                provider_error = f"{provider_name} returned HTTP {e.code}: {e.reason}."
            break
        except urllib.error.URLError as e:
            provider_error = f"External search connection error or timeout: {str(e.reason)}."
            break
        except Exception as e:
            provider_error = f"Unexpected error during external search: {str(e)}."
            break

    # Determine overall status and assessment
    if provider_error and not findings:
        summary = {
            "status": "search_unavailable",
            "provider": provider_name,
            "total_queries_executed": queries_executed,
            "findings_count": 0,
            "overall_evidence_assessment": f"External search unavailable: {provider_error}",
            "limitations_disclaimer": (
                "External web corroboration could not complete due to provider error. "
                "Investigation completed using ML text scoring and local Trust Chain rules."
            ),
        }
        return [], summary

    # If queries were executed and returned empty list, synthesize structured finding
    if not findings and queries_executed > 0 and not provider_error:
        first_query = queries[0] if queries else "careers search"
        _, supplied_domain = normalize_domain(clean_website) if clean_website else (None, None)
        findings.append({
            "query_performed": first_query,
            "source_title": "No Search Results Returned",
            "source_url": "",
            "source_domain": supplied_domain or "none",
            "snippet": f"No web search results returned for query: '{first_query}'.",
            "retrieved_at": datetime.now(timezone.utc).isoformat(),
            "evidence_status": "no_matching_vacancy_found_in_search",
            "explanation": (
                f"No indexed web search results were found for query '{first_query}'. "
                "The employer or vacancy was not identified in top search results."
            ),
            "limitations": (
                "Absence of search results is NOT definitive evidence of fraud and does not prove that the vacancy does not exist. "
                "Legitimate vacancies may be recently posted, internal, unindexed by search engines, "
                "or managed under a parent corporate entity."
            ),
            "comparison_detail": {
                "claimed_employer": clean_employer,
                "advertised_title": clean_title,
                "supplied_company_domain": supplied_domain,
            },
        })

    # Summarize findings separately with transparent counts
    exact_matches = [
        f for f in findings if f["evidence_status"] in ("exact_vacancy_match_found", "official_vacancy_match_found")
    ]
    related_roles = [f for f in findings if f["evidence_status"] == "related_role_found"]
    presence_findings = [f for f in findings if f["evidence_status"] == "employer_official_presence_found"]
    inconsistencies = [f for f in findings if f["evidence_status"] == "potential_domain_inconsistency"]
    no_matches = [f for f in findings if f["evidence_status"] == "no_matching_vacancy_found_in_search"]

    if exact_matches:
        domain_list = ", ".join(sorted(set(f["source_domain"] for f in exact_matches if f.get("source_domain"))))
        assessment = (
            f"Exact Vacancy Match Corroborated: Observed {len(exact_matches)} exact vacancy match(es) for '{clean_title}' on {domain_list}."
        )
        if related_roles:
            assessment += f" Additionally identified {len(related_roles)} related role(s) with distinct specializations."
        assessment += (
            " Corroborates that this vacancy exists; however, this does NOT independently authenticate the submitted "
            "recruiter, sender email, or application destination (adversaries frequently copy real vacancies)."
        )
    elif related_roles:
        domain_list = ", ".join(sorted(set(f["source_domain"] for f in related_roles if f.get("source_domain"))))
        assessment = (
            f"Related Role(s) Observed: No exact match found for '{clean_title}'. Observed {len(related_roles)} related role(s) on {domain_list} "
            "(e.g., with additional specialization or distinct scope). Does not confirm the specific submitted vacancy, "
            "nor does it authenticate the recruiter or application URL."
        )
    elif inconsistencies:
        domain_list = ", ".join(sorted(set(f["source_domain"] for f in inconsistencies if f.get("source_domain"))))
        assessment = (
            f"Domain Inconsistency Observed: Search identified official domain(s) ({domain_list}) for '{clean_employer}' "
            "that differ from the supplied contact or website details. Exercise caution before sharing sensitive information."
        )
    elif presence_findings:
        domain_list = ", ".join(sorted(set(f["source_domain"] for f in presence_findings if f.get("source_domain"))))
        assessment = (
            f"Employer Official Web Presence Confirmed: Official domain verified ({domain_list}), but no matching vacancy "
            f"for '{clean_title}' was observed in top search results (results were general pages, unrelated roles, or different seniority levels)."
        )
    elif findings:
        assessment = (
            f"No Matching Vacancy Observed in Search: External queries completed, but top search results did not contain a matching "
            f"vacancy for '{clean_title}'. This is NOT proof of fraud, as many legitimate vacancies are unindexed or newly opened."
        )
    else:
        assessment = "No search results returned for the formulated employer queries."

    disclaimer = (
        "Methodological Note: Web search findings are external informational corroborations based on search result titles and snippets only. "
        "A corroborated vacancy confirms that a matching role exists publicly, but DOES NOT authenticate unverified recruiter emails or "
        "application destinations; absence of search results does not establish fraud. Destination pages were not directly retrieved or parsed."
    )

    summary = {
        "status": "completed",
        "provider": provider_name,
        "total_queries_executed": queries_executed,
        "findings_count": len(findings),
        "exact_matches_count": len(exact_matches),
        "related_roles_count": len(related_roles),
        "official_presence_count": len(presence_findings),
        "inconsistencies_count": len(inconsistencies),
        "overall_evidence_assessment": assessment,
        "limitations_disclaimer": disclaimer,
    }

    return findings, summary
