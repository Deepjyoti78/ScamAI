"""ScamShield AI — External Web Research Evaluation Benchmark.

Evaluates the web-research and employer-evidence corroboration engine across
curated, controlled functional scenarios using mocked Tavily Search API responses.

Scenarios tested:
  1. Official vacancy match (direct corroboration on company careers page).
  2. Plausible but unconfirmed vacancy match (third-party aggregator/article).
  3. Unrelated search result (news/article without role match).
  4. Missing vacancy result (search returns no records; absence != fraud).
  5. Recruiter-domain inconsistency (search confirms official domain; recruiter email is lookalike).
  6. Legitimate third-party recruitment platform (Greenhouse / Lever / Workday / Ashby ATS).
  7. Conflicting employer information (claimed company website conflicts with verified domain).
  8. Unavailable search provider (HTTP 429 rate limit or HTTP 500).
  9. Insufficient employer information (abstention when employer/website are missing).
  10. Not configured provider (abstention when no API key is provided).

CRITICAL METHODOLOGICAL NOTICE:
  These are functional benchmark tests evaluated on controlled fixtures to verify
  decision logic, epistemic restraint, and attribution fidelity.
  They do NOT establish real-world search retrieval accuracy.
  Web research findings are strictly partitioned from the statistical EMSCAD
  classifier and do NOT modify the ML fraud probability.

Outputs:
  reports/web_research_evaluation_metrics.json
"""

from io import BytesIO
import json
import os
from pathlib import Path
import sys
from typing import Any, Dict, List, Optional
from unittest.mock import MagicMock, patch
import urllib.error

# Ensure project root is in sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from backend.services.web_research import execute_web_research


def _make_mock_response(json_data: dict, status: int = 200):
    raw_bytes = json.dumps(json_data).encode("utf-8")
    mock_resp = MagicMock()
    mock_resp.read.return_value = raw_bytes
    mock_resp.getcode.return_value = status
    mock_resp.headers = {
        "Content-Encoding": "identity",
        "Content-Type": "application/json",
    }
    mock_resp.__enter__.return_value = mock_resp
    mock_resp.__exit__.return_value = None
    return mock_resp


# Definition of Controlled Evaluation Scenarios
WEB_RESEARCH_BENCHMARK_SCENARIOS = [
    {
        "id": "WR-01",
        "name": "Official Vacancy Match",
        "description": "Corroborating opening located directly on claimed employer's verified careers portal.",
        "input": {
            "employer_name": "Stripe",
            "job_title": "Staff Infrastructure Engineer",
            "company_website": "https://stripe.com",
            "recruiter_email": "recruiting@stripe.com",
            "application_url": "https://stripe.com/jobs/staff-infra-101",
        },
        "mock_response": {
            "results": [
                {
                    "title": "Staff Infrastructure Engineer - Stripe Careers",
                    "url": "https://stripe.com/jobs/staff-infra-101",
                    "content": "Stripe is seeking a Staff Infrastructure Engineer to scale our global core payments ledger.",
                    "published_date": "2026-10-18",
                }
            ]
        },
        "expected_summary_status": "completed",
        "expected_evidence_status": "official_vacancy_match_found",
        "expected_domain": "stripe.com",
        "rationale": "Direct domain match with advertised role title in careers page snippet.",
    },
    {
        "id": "WR-02",
        "name": "Plausible But Unconfirmed Vacancy Match",
        "description": "Third-party industry roundup mentioning hiring activity without official employer domain verification.",
        "input": {
            "employer_name": "Anthropic",
            "job_title": "Alignment Research Scientist",
            "company_website": "https://anthropic.com",
            "recruiter_email": "careers@anthropic.com",
            "application_url": None,
        },
        "mock_response": {
            "results": [
                {
                    "title": "Frontier AI Hiring Trends: Anthropic Alignment Research Scientist",
                    "url": "https://tech-digest.org/posts/anthropic-alignment-research-scientist",
                    "content": "Anthropic continues hiring Alignment Research Scientist candidates to develop interpretability frameworks.",
                    "published_date": "2026-10-12",
                }
            ]
        },
        "expected_summary_status": "completed",
        "expected_evidence_status": "possible_vacancy_match",
        "expected_domain": "tech-digest.org",
        "rationale": "Mention of employer and role on third-party aggregator indicates plausible activity but lacks direct employer domain confirmation.",
    },
    {
        "id": "WR-03",
        "name": "Unrelated Search Result",
        "description": "Search returns general company news or articles with no mention of hiring or the advertised title.",
        "input": {
            "employer_name": "Vercel",
            "job_title": "Platform Reliability Architect",
            "company_website": "https://vercel.com",
            "recruiter_email": "talent@vercel.com",
            "application_url": None,
        },
        "mock_response": {
            "results": [
                {
                    "title": "Next.js 15 Release Notes and Architecture Overview",
                    "url": "https://infoworld.com/article/nextjs-15-release",
                    "content": "Comprehensive overview of server components, compiler performance improvements, and edge routing.",
                    "published_date": "2026-10-01",
                }
            ]
        },
        "expected_summary_status": "completed",
        "expected_evidence_status": "no_matching_vacancy_found_in_search",
        "expected_domain": "infoworld.com",
        "rationale": "General tech press without role keywords must not be interpreted as a vacancy match.",
    },
    {
        "id": "WR-04",
        "name": "Missing Vacancy Result (Absence != Fraud)",
        "description": "Search returns zero records for an unindexed or private corporate vacancy.",
        "input": {
            "employer_name": "Apex Stealth Labs",
            "job_title": "Lead Lattice Cryptographer",
            "company_website": "https://apexstealth.internal",
            "recruiter_email": None,
            "application_url": None,
        },
        "mock_response": {
            "results": []
        },
        "expected_summary_status": "completed",
        "expected_evidence_status": "no_matching_vacancy_found_in_search",
        "expected_domain": None,
        "rationale": "Absence of search engine indexation must not be asserted as evidence of recruitment fraud.",
    },
    {
        "id": "WR-05",
        "name": "Recruiter Domain Inconsistency",
        "description": "Search verifies legitimate company domain, revealing that recruiter email domain is an unverified lookalike.",
        "input": {
            "employer_name": "Microsoft",
            "job_title": "Enterprise Cloud Architect",
            "company_website": "https://microsoft.com",
            "recruiter_email": "recruiting@microsoft-cloud-careers.biz",
            "application_url": None,
        },
        "mock_response": {
            "results": [
                {
                    "title": "Microsoft Careers - Official Global Opportunities",
                    "url": "https://microsoft.com/careers/en-us",
                    "content": "Explore official careers and enterprise opportunities at Microsoft Corporation.",
                    "published_date": "2026-09-20",
                }
            ]
        },
        "expected_summary_status": "completed",
        "expected_evidence_status": "potential_domain_inconsistency",
        "expected_domain": "microsoft.com",
        "rationale": "External search confirms microsoft.com as primary corporate identity while recruiter domain is @microsoft-cloud-careers.biz.",
    },
    {
        "id": "WR-06",
        "name": "Legitimate Third-Party ATS Platform",
        "description": "Vacancy hosted on recognized Enterprise ATS (Greenhouse, Lever, Workday, Ashby).",
        "input": {
            "employer_name": "Datadog",
            "job_title": "Site Reliability Engineer",
            "company_website": "https://datadoghq.com",
            "recruiter_email": "careers@datadoghq.com",
            "application_url": "https://boards.greenhouse.io/datadog/jobs/4099281",
        },
        "mock_response": {
            "results": [
                {
                    "title": "Site Reliability Engineer - Datadog Careers (Greenhouse)",
                    "url": "https://boards.greenhouse.io/datadog/jobs/4099281",
                    "content": "Datadog is seeking an SRE to support globally distributed telemetry ingestion pipelines.",
                    "published_date": "2026-10-15",
                }
            ]
        },
        "expected_summary_status": "completed",
        "expected_evidence_status": "possible_vacancy_match",
        "expected_domain": "greenhouse.io",
        "rationale": "Recognized enterprise ATS platform hosting authentic vacancy for the employer.",
    },
    {
        "id": "WR-07",
        "name": "Conflicting Employer Information",
        "description": "User supplied an unvetted portal while search demonstrates official domain is distinct.",
        "input": {
            "employer_name": "Google",
            "job_title": "Senior Product Manager",
            "company_website": "https://google-hiring-portal-fast.com",
            "recruiter_email": "recruiting@google-hiring-portal-fast.com",
            "application_url": None,
        },
        "mock_response": {
            "results": [
                {
                    "title": "Google Careers - Build for Everyone",
                    "url": "https://careers.google.com/jobs",
                    "content": "Official career opportunities and global technology teams at Google.",
                    "published_date": "2026-10-19",
                }
            ]
        },
        "expected_summary_status": "completed",
        "expected_evidence_status": "potential_domain_inconsistency",
        "expected_domain": "google.com",
        "rationale": "Search proves authentic primary domain is google.com, contradicting user-supplied google-hiring-portal-fast.com.",
    },
    {
        "id": "WR-08",
        "name": "Unavailable Search Provider (HTTP 429 / 500 / Network)",
        "description": "Provider rate limit or connection timeout produces honest unavailable status without false fraud accusation.",
        "input": {
            "employer_name": "Netflix",
            "job_title": "Core Systems Engineer",
            "company_website": "https://netflix.com",
            "recruiter_email": "talent@netflix.com",
            "application_url": None,
        },
        "mock_http_error": 429,
        "expected_summary_status": "search_unavailable",
        "expected_evidence_status": None,
        "expected_domain": None,
        "rationale": "Upstream service rate limiting must trigger graceful degradation with explicit disclaimer.",
    },
    {
        "id": "WR-09",
        "name": "Insufficient Employer Information",
        "description": "Inputs lack employer name and company website, leading to clean abstention.",
        "input": {
            "employer_name": "",
            "job_title": "General Associate",
            "company_website": None,
            "recruiter_email": None,
            "application_url": None,
        },
        "expected_summary_status": "insufficient_evidence",
        "expected_evidence_status": None,
        "expected_domain": None,
        "rationale": "System abstains from formulating arbitrary or overly broad search queries.",
    },
    {
        "id": "WR-10",
        "name": "Provider Not Configured",
        "description": "Neither TAVILY_API_KEY nor BRAVE_SEARCH_API_KEY is configured in backend environment.",
        "input": {
            "employer_name": "Apple",
            "job_title": "Swift Core Engineer",
            "company_website": "https://apple.com",
            "recruiter_email": "careers@apple.com",
            "application_url": None,
        },
        "unconfigured_env": True,
        "expected_summary_status": "not_configured",
        "expected_evidence_status": None,
        "expected_domain": None,
        "rationale": "System transparently informs user that external search was bypassed without pretending verification occurred.",
    },
]


def run_web_research_benchmark() -> Dict[str, Any]:
    """Execute evaluation benchmark across all controlled scenarios."""
    results = []
    total = len(WEB_RESEARCH_BENCHMARK_SCENARIOS)
    status_matches = 0
    attribution_integrity_count = 0
    abstention_integrity_count = 0

    for scenario in WEB_RESEARCH_BENCHMARK_SCENARIOS:
        sc_id = scenario["id"]
        sc_name = scenario["name"]
        inp = scenario["input"]

        mock_resp = scenario.get("mock_response")
        http_err = scenario.get("mock_http_error")
        is_unconfigured = scenario.get("unconfigured_env", False)

        env_dict = {} if is_unconfigured else {"TAVILY_API_KEY": "tvly-test-benchmark-key"}

        if http_err:
            mock_side_effect = urllib.error.HTTPError(
                url="https://api.tavily.com/search",
                code=http_err,
                msg="Rate Limited",
                hdrs={},
                fp=BytesIO(b'{"detail": "Rate limit exceeded"}'),
            )
        else:
            mock_side_effect = _make_mock_response(mock_resp or {"results": []})

        with patch.dict(os.environ, env_dict, clear=True):
            with patch("urllib.request.urlopen") as mock_urlopen:
                if http_err:
                    mock_urlopen.side_effect = mock_side_effect
                else:
                    mock_urlopen.return_value = mock_side_effect

                findings, summary = execute_web_research(
                    employer_name=inp.get("employer_name"),
                    job_title=inp.get("job_title"),
                    company_website=inp.get("company_website"),
                    recruiter_email=inp.get("recruiter_email"),
                    application_url=inp.get("application_url"),
                )

        # Evaluate summary status
        summary_status_correct = summary["status"] == scenario["expected_summary_status"]

        # Evaluate evidence status of findings
        evidence_status_correct = False
        if scenario["expected_evidence_status"] is None:
            evidence_status_correct = len(findings) == 0
        else:
            if findings:
                evidence_status_correct = any(
                    f["evidence_status"] == scenario["expected_evidence_status"] for f in findings
                )
            else:
                # e.g., WR-04 where results are empty
                evidence_status_correct = (
                    scenario["expected_evidence_status"] == "no_matching_vacancy_found_in_search"
                    and summary["status"] == "completed"
                )

        # Attribution check (URL and Domain preservation)
        attribution_correct = True
        if findings and scenario.get("expected_domain"):
            first_match = next(
                (f for f in findings if f["evidence_status"] == scenario["expected_evidence_status"]),
                findings[0],
            )
            attribution_correct = first_match["source_domain"] == scenario["expected_domain"]

        # Epistemic abstention check (no false fraud claims)
        abstention_correct = (
            "absence of search results does not establish fraud" in summary["limitations_disclaimer"]
            or "External web corroboration could not complete" in summary["limitations_disclaimer"]
            or "External web verification was bypassed" in summary["limitations_disclaimer"]
            or "No external search queries were executed" in summary["limitations_disclaimer"]
            or "NOT definitive evidence of fraud" in summary["limitations_disclaimer"]
        )

        scenario_passed = summary_status_correct and evidence_status_correct and attribution_correct and abstention_correct

        if scenario_passed:
            status_matches += 1
        if attribution_correct:
            attribution_integrity_count += 1
        if abstention_correct:
            abstention_integrity_count += 1

        results.append({
            "scenario_id": sc_id,
            "scenario_name": sc_name,
            "summary_status": summary["status"],
            "expected_summary_status": scenario["expected_summary_status"],
            "findings_count": len(findings),
            "top_evidence_status": findings[0]["evidence_status"] if findings else None,
            "expected_evidence_status": scenario["expected_evidence_status"],
            "source_domain": findings[0]["source_domain"] if findings else None,
            "expected_domain": scenario.get("expected_domain"),
            "summary_status_correct": summary_status_correct,
            "evidence_status_correct": evidence_status_correct,
            "attribution_correct": attribution_correct,
            "abstention_correct": abstention_correct,
            "passed": scenario_passed,
            "rationale": scenario["rationale"],
        })

    accuracy = (status_matches / total) * 100.0
    attribution_rate = (attribution_integrity_count / total) * 100.0
    abstention_rate = (abstention_integrity_count / total) * 100.0

    metrics = {
        "benchmark_name": "ScamShield AI External Web Research Functional Benchmark",
        "evaluation_type": "controlled_functional_fixtures",
        "disclaimer": "These tests measure rule-interpretation correctness on synthetic fixtures. They do NOT measure real-world internet search accuracy.",
        "timestamp_utc": "2026-10-23T20:30:00Z",
        "total_scenarios": total,
        "scenarios_passed": status_matches,
        "scenario_pass_rate_pct": round(accuracy, 2),
        "source_attribution_integrity_pct": round(attribution_rate, 2),
        "epistemic_abstention_integrity_pct": round(abstention_rate, 2),
        "scenarios": results,
    }

    return metrics


def main():
    """Run benchmark and write metrics to reports/web_research_evaluation_metrics.json."""
    metrics = run_web_research_benchmark()

    out_dir = PROJECT_ROOT / "reports"
    out_dir.mkdir(parents=True, exist_ok=True)
    out_file = out_dir / "web_research_evaluation_metrics.json"

    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(metrics, f, indent=2)

    print(f"============================================================")
    print(f"ScamShield AI — Web Research Evaluation Benchmark Complete")
    print(f"============================================================")
    print(f"Total Scenarios Evaluated: {metrics['total_scenarios']}")
    print(f"Scenarios Passed:          {metrics['scenarios_passed']}/{metrics['total_scenarios']} ({metrics['scenario_pass_rate_pct']}%)")
    print(f"Attribution Integrity:     {metrics['source_attribution_integrity_pct']}%")
    print(f"Abstention Integrity:      {metrics['epistemic_abstention_integrity_pct']}%")
    print(f"Report saved to:           {out_file}")
    print(f"============================================================")


if __name__ == "__main__":
    main()
