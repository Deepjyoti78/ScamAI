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
import re
from typing import Any, Dict, List, Optional, Tuple
import urllib.error
import urllib.parse
import urllib.request

from backend.services.trust_chain import (
    PUBLIC_EMAIL_PROVIDERS,
    RECOGNIZED_STAFFING_AGENCIES,
    REPUTABLE_ATS_DOMAINS,
    normalize_domain,
)

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
    snippet = str(result.get("description") or "").strip()

    _, result_domain = normalize_domain(url)
    _, supplied_domain = normalize_domain(supplied_company_website) if supplied_company_website else (None, None)
    _, recruiter_domain = normalize_domain(recruiter_email.split("@")[-1]) if recruiter_email and "@" in recruiter_email else (None, None)
    _, app_domain = normalize_domain(application_url) if application_url else (None, None)

    retrieved_at = datetime.now(timezone.utc).isoformat()

    comparison = {
        "claimed_employer": claimed_employer,
        "advertised_title": advertised_title,
        "supplied_company_domain": supplied_domain,
        "recruiter_email_domain": recruiter_domain,
        "application_destination_domain": app_domain,
        "search_result_domain": result_domain,
    }

    employer_clean = (claimed_employer or "").lower().strip()
    title_clean = (advertised_title or "").lower().strip()
    snippet_lower = snippet.lower()
    title_lower = title.lower()
    combined_text = f"{title_lower} {snippet_lower}"

    # Check 1: Official company careers page match
    if supplied_domain and result_domain == supplied_domain:
        if title_clean and (title_clean in combined_text or any(w in combined_text for w in title_clean.split() if len(w) > 3)):
            return {
                "query_performed": query_performed,
                "source_title": title,
                "source_url": url,
                "source_domain": result_domain or "unknown",
                "snippet": snippet,
                "retrieved_at": retrieved_at,
                "evidence_status": "official_vacancy_match_found",
                "explanation": (
                    f"Corroborating vacancy found on the claimed employer's official website ({result_domain}). "
                    f"The page title or snippet aligns with the advertised job title ('{advertised_title}')."
                ),
                "limitations": (
                    "Corroborates that this vacancy exists on the employer's official web presence. "
                    "However, this does NOT independently authenticate the specific recruiter message, contact email, "
                    "or application link provided by the user (adversaries frequently copy legitimate corporate listings)."
                ),
                "comparison_detail": comparison,
            }
        else:
            return {
                "query_performed": query_performed,
                "source_title": title,
                "source_url": url,
                "source_domain": result_domain or "unknown",
                "snippet": snippet,
                "retrieved_at": retrieved_at,
                "evidence_status": "official_vacancy_match_found",
                "explanation": (
                    f"Official careers presence confirmed on {result_domain}. "
                    "The company operates an official web presence matching the supplied domain."
                ),
                "limitations": (
                    "Confirms the official employer website exists. It does not certify that the submitted "
                    "contact person is authorized to hire for this vacancy."
                ),
                "comparison_detail": comparison,
            }

    # Check 2: Reputable ATS or global recruitment platform hosting this employer's role
    if result_domain in REPUTABLE_ATS_DOMAINS or result_domain in JOB_BOARD_DOMAINS:
        platform_name = REPUTABLE_ATS_DOMAINS.get(result_domain) or JOB_BOARD_DOMAINS.get(result_domain)
        if (employer_clean and employer_clean in combined_text) or (title_clean and title_clean in combined_text):
            return {
                "query_performed": query_performed,
                "source_title": title,
                "source_url": url,
                "source_domain": result_domain or "unknown",
                "snippet": snippet,
                "retrieved_at": retrieved_at,
                "evidence_status": "possible_vacancy_match",
                "explanation": (
                    f"Observed matching job listing on recognized recruitment platform ({platform_name} / {result_domain}) "
                    f"referencing '{claimed_employer or advertised_title}'."
                ),
                "limitations": (
                    f"Third-party listings on {platform_name} indicate public recruitment activity. "
                    "However, listings can be syndicated or posted by unverified intermediaries. "
                    "Always confirm that applications route to the authentic hiring authority."
                ),
                "comparison_detail": comparison,
            }

    # Check 3: Potential domain inconsistency
    # If the search result appears to be the authentic main corporate site of the claimed employer,
    # but the user-supplied website or recruiter email domain does not match it:
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

    if is_employer_in_domain or (employer_clean in title_lower and "official" in combined_text):
        if supplied_domain and supplied_domain != result_domain and result_domain not in REPUTABLE_ATS_DOMAINS and result_domain not in JOB_BOARD_DOMAINS:
            return {
                "query_performed": query_performed,
                "source_title": title,
                "source_url": url,
                "source_domain": result_domain or "unknown",
                "snippet": snippet,
                "retrieved_at": retrieved_at,
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
        elif recruiter_domain and recruiter_domain != result_domain and recruiter_domain not in PUBLIC_EMAIL_PROVIDERS and recruiter_domain not in RECOGNIZED_STAFFING_AGENCIES:
            return {
                "query_performed": query_performed,
                "source_title": title,
                "source_url": url,
                "source_domain": result_domain or "unknown",
                "snippet": snippet,
                "retrieved_at": retrieved_at,
                "evidence_status": "potential_domain_inconsistency",
                "explanation": (
                    f"Search identified {result_domain} for '{claimed_employer}', but the recruiter email domain "
                    f"is '@{recruiter_domain}'. This discrepancy suggests potential lookalike or unverified sender routing."
                ),
                "limitations": (
                    "Search ranking is not legal proof of domain ownership. Exercise caution and verify recruiter "
                    "identity through official company directories."
                ),
                "comparison_detail": comparison,
            }

    # Check 4: General contextual search finding
    return {
        "query_performed": query_performed,
        "source_title": title,
        "source_url": url,
        "source_domain": result_domain or "unknown",
        "snippet": snippet,
        "retrieved_at": retrieved_at,
        "evidence_status": "possible_vacancy_match" if (employer_clean in combined_text and title_clean in combined_text) else "no_matching_vacancy_found_in_search",
        "explanation": (
            f"Public web excerpt mentioning relevant terms from {result_domain}."
            if (employer_clean in combined_text or title_clean in combined_text)
            else f"Search result from {result_domain} returned for query '{query_performed}' without direct role match."
        ),
        "limitations": (
            "Search results are heuristic snippets. Search engines do not guarantee completeness, and absence of an indexed "
            "vacancy does not prove that the vacancy does not exist nor does it indicate fraud."
        ),
        "comparison_detail": comparison,
    }


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
    """Execute live web search via Brave Search API and return structured evidence findings.

    Returns:
      (findings, summary)
    """
    effective_api_key = (api_key or os.getenv("BRAVE_SEARCH_API_KEY", "")).strip()

    # 1. Check if provider is configured
    if not effective_api_key:
        summary = {
            "status": "not_configured",
            "provider": "Brave Search API",
            "total_queries_executed": 0,
            "findings_count": 0,
            "overall_evidence_assessment": (
                "External web search is not configured. (BRAVE_SEARCH_API_KEY is not set in the backend environment). "
                "Investigation proceeded using statistical NLP and local Trust Chain evidence checks."
            ),
            "limitations_disclaimer": (
                "External web verification was bypassed. ScamShield AI did not claim that web research was conducted. "
                "Set BRAVE_SEARCH_API_KEY to enable live employer and vacancy search corroboration."
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
            "provider": "Brave Search API",
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
            "provider": "Brave Search API",
            "total_queries_executed": 0,
            "findings_count": 0,
            "overall_evidence_assessment": "Insufficient input details to construct targeted search queries.",
            "limitations_disclaimer": "External search was bypassed.",
        }
        return [], summary

    findings: List[Dict[str, Any]] = []
    queries_executed = 0
    provider_error: Optional[str] = None

    for query in queries:
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

        req = urllib.request.Request(req_url, headers=headers)
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
                web_results = data.get("web", {}).get("results", [])

                for item in web_results[:max_results_to_analyze]:
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
                provider_error = "Brave Search API rate limit exceeded (HTTP 429). Search temporarily unavailable."
            elif e.code in (401, 403):
                provider_error = f"Brave Search API authentication failed (HTTP {e.code}). Verify BRAVE_SEARCH_API_KEY."
            else:
                provider_error = f"Brave Search API returned HTTP {e.code}: {e.reason}."
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
            "provider": "Brave Search API",
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
                "Absence of search results is NOT definitive evidence of fraud. "
                "Legitimate vacancies may be recently posted, internal, unindexed by search engines, "
                "or managed under a parent corporate entity."
            ),
            "comparison_detail": {
                "claimed_employer": clean_employer,
                "advertised_title": clean_title,
                "supplied_company_domain": supplied_domain,
            },
        })

    # Summarize findings
    official_matches = [f for f in findings if f["evidence_status"] == "official_vacancy_match_found"]
    possible_matches = [f for f in findings if f["evidence_status"] == "possible_vacancy_match"]
    inconsistencies = [f for f in findings if f["evidence_status"] == "potential_domain_inconsistency"]

    if official_matches:
        assessment = (
            f"Official Match Corroborated: Observed {len(official_matches)} matching listing(s) on the employer's "
            "official web presence. Corroborates that this vacancy exists; candidate must still verify sender authenticity."
        )
    elif inconsistencies:
        assessment = (
            f"Domain Inconsistency Observed: Search identified alternate official domains for '{clean_employer}' "
            "that differ from the supplied contact or website details. Exercise caution before sharing sensitive information."
        )
    elif possible_matches:
        assessment = (
            f"Possible Match Found: Found {len(possible_matches)} relevant public listing(s) on reputable recruitment platforms. "
            "Supports that public hiring is occurring for this role."
        )
    elif findings:
        assessment = (
            "No Matching Vacancy Observed in Search: External queries completed, but no direct matching vacancy was observed "
            "in top search results. This is NOT proof of fraud, as many legitimate vacancies are unindexed or newly opened."
        )
    else:
        assessment = "No search results returned for the formulated employer queries."

    disclaimer = (
        "Methodological Note: Web search findings are external informational corroborations. "
        "A verified vacancy does not authenticate unverified recruiter emails or application destinations, "
        "and absence of search results does not establish fraud. Only search result titles and snippets were evaluated."
    )

    summary = {
        "status": "completed",
        "provider": "Brave Search API",
        "total_queries_executed": queries_executed,
        "findings_count": len(findings),
        "overall_evidence_assessment": assessment,
        "limitations_disclaimer": disclaimer,
    }

    return findings, summary
