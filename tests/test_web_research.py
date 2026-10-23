"""Unit tests for ScamShield AI Live Web Research and Employer Evidence Enrichment.

Tests:
1. Search query sanitization and length limits (<= 120 chars).
2. Targeted query generation strategies.
3. Missing API key handling (honest not_configured status).
4. Missing / insufficient employer details.
5. Successful official careers page match corroboration.
6. Possible match on reputable third-party recruitment platform.
7. Potential employer domain inconsistency detection.
8. Unrelated search results handling.
9. Empty search results handling (absence is not proof of fraud).
10. HTTP 429 rate limit handling.
11. Provider network timeout / URLError handling.
12. Gzip decompression of search API response.
13. Prediction service integration with web research findings.
14. Strict separation of signals (ML probability not contaminated).
15. Triage elevation on potential domain inconsistency.
16. Epistemic restraint: No fabricated verification claims.
"""

from io import BytesIO
import gzip
import json
import os
from pathlib import Path
import sys
import unittest
from unittest.mock import MagicMock, patch
import urllib.error

# Ensure project root is in sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

import pytest

from backend.schemas import JobAnalysisRequest
from backend.services.prediction import prediction_service
from backend.services.web_research import (
    analyze_search_result,
    build_targeted_queries,
    execute_web_research,
    sanitize_search_query,
)


def _make_mock_response(json_data: dict, is_gzipped: bool = False, status: int = 200):
    """Helper to generate a mock urllib HTTPResponse."""
    raw_bytes = json.dumps(json_data).encode("utf-8")
    if is_gzipped:
        buf = BytesIO()
        with gzip.GzipFile(fileobj=buf, mode="wb") as gz:
            gz.write(raw_bytes)
        body = buf.getvalue()
    else:
        body = raw_bytes

    mock_resp = MagicMock()
    mock_resp.read.return_value = body
    mock_resp.getcode.return_value = status
    mock_resp.headers = {
        "Content-Encoding": "gzip" if is_gzipped else "identity",
        "Content-Type": "application/json",
    }
    mock_resp.__enter__.return_value = mock_resp
    mock_resp.__exit__.return_value = None
    return mock_resp


# --- 1. Query Sanitization & Query Building Tests ---

def test_sanitize_search_query():
    """Verify input normalization, character filtering, and length clamping."""
    # Excess whitespace and punctuation stripping
    raw = "   Acme Corp   Senior Developer!!!   "
    clean = sanitize_search_query(raw)
    assert clean == "Acme Corp Senior Developer"

    # URL / punctuation stripping
    raw_url = "https://www.example.com/jobs/view?id=123"
    assert "https" in sanitize_search_query(raw_url)

    # Length clamping to 120 chars
    long_query = "Software Engineer " * 20
    sanitized = sanitize_search_query(long_query, max_length=120)
    assert len(sanitized) <= 120
    assert not sanitized.endswith(" ")


def test_build_targeted_queries():
    """Verify targeted search query building strategies."""
    # Employer + Title
    queries = build_targeted_queries(
        employer_name="Stripe",
        job_title="Software Engineer",
    )
    assert len(queries) >= 1
    assert any('"Stripe"' in q and '"Software Engineer"' in q for q in queries)

    # Employer + Title + Official Domain
    queries_with_domain = build_targeted_queries(
        employer_name="Stripe",
        job_title="Software Engineer",
        company_website="https://stripe.com",
    )
    assert any("site:stripe.com" in q for q in queries_with_domain)

    # Domain only with title
    queries_domain_only = build_targeted_queries(
        employer_name=None,
        job_title="DevOps Lead",
        company_website="https://acme.org/jobs",
    )
    assert any("site:acme.org" in q for q in queries_domain_only)

    # Empty inputs
    assert build_targeted_queries(None, None, None) == []
    assert build_targeted_queries("   ", "   ", "   ") == []


# --- 2. Configuration & Guardrail Tests ---

def test_missing_api_key():
    """Verify honest not_configured status when BRAVE_SEARCH_API_KEY is not set."""
    with patch.dict(os.environ, {}, clear=True):
        findings, summary = execute_web_research(
            employer_name="Google",
            job_title="Product Manager",
            company_website="https://google.com",
        )
        assert summary["status"] == "not_configured"
        assert summary["total_queries_executed"] == 0
        assert findings == []
        assert "not configured" in summary["overall_evidence_assessment"].lower()
        assert "ScamShield AI did not claim" in summary["limitations_disclaimer"]


def test_insufficient_evidence():
    """Verify insufficient_evidence status when no employer name or domain is provided."""
    with patch.dict(os.environ, {"BRAVE_SEARCH_API_KEY": "test-key-12345"}):
        findings, summary = execute_web_research(
            employer_name="",
            job_title="Generic Developer",
            company_website="",
        )
        assert summary["status"] == "insufficient_evidence"
        assert summary["total_queries_executed"] == 0
        assert findings == []
        assert "insufficient" in summary["overall_evidence_assessment"].lower()


# --- 3. Search Matching & Epistemic Status Tests ---

@patch("urllib.request.urlopen")
def test_official_careers_page_match(mock_urlopen):
    """Verify corroboration of an official vacancy on company's verified domain."""
    mock_data = {
        "web": {
            "results": [
                {
                    "title": "Senior Backend Engineer - Stripe Careers",
                    "url": "https://stripe.com/jobs/listing/senior-backend-engineer/123",
                    "description": "Join Stripe as a Senior Backend Engineer to build payment infrastructure.",
                }
            ]
        }
    }
    mock_urlopen.return_value = _make_mock_response(mock_data)

    with patch.dict(os.environ, {"BRAVE_SEARCH_API_KEY": "test-key-12345"}):
        findings, summary = execute_web_research(
            employer_name="Stripe",
            job_title="Senior Backend Engineer",
            company_website="https://stripe.com",
            recruiter_email="hiring@stripe.com",
        )

        assert summary["status"] == "completed"
        assert summary["findings_count"] >= 1

        official_finding = next(
            (f for f in findings if f["evidence_status"] == "official_vacancy_match_found"), None
        )
        assert official_finding is not None
        assert official_finding["source_domain"] == "stripe.com"
        assert "Stripe Careers" in official_finding["source_title"]
        assert "stripe.com/jobs" in official_finding["source_url"]

        # Crucial epistemic guardrail: Must disclaim that match does not authenticate recruiter message
        assert "does not independently authenticate" in official_finding["limitations"].lower()
        assert "adversaries frequently copy" in official_finding["limitations"].lower()


@patch("urllib.request.urlopen")
def test_possible_match_third_party_recruitment_platform(mock_urlopen):
    """Verify detection of a possible match on reputable third-party platforms (LinkedIn, Greenhouse)."""
    mock_data = {
        "web": {
            "results": [
                {
                    "title": "Acme Corp hiring Data Scientist in New York | LinkedIn",
                    "url": "https://www.linkedin.com/jobs/view/data-scientist-at-acme-corp-12345",
                    "description": "Acme Corp is hiring a Data Scientist. Apply directly on LinkedIn.",
                }
            ]
        }
    }
    mock_urlopen.return_value = _make_mock_response(mock_data)

    with patch.dict(os.environ, {"BRAVE_SEARCH_API_KEY": "test-key-12345"}):
        findings, summary = execute_web_research(
            employer_name="Acme Corp",
            job_title="Data Scientist",
            company_website="https://acmecorp.com",
        )

        assert summary["status"] == "completed"
        possible_finding = next(
            (f for f in findings if f["evidence_status"] == "possible_vacancy_match"), None
        )
        assert possible_finding is not None
        assert possible_finding["source_domain"] == "linkedin.com"
        assert "recruitment platform" in possible_finding["explanation"].lower()
        assert "unverified intermediaries" in possible_finding["limitations"].lower()


@patch("urllib.request.urlopen")
def test_potential_domain_inconsistency_detection(mock_urlopen):
    """Verify detection when user-supplied company domain conflicts with top search results."""
    mock_data = {
        "web": {
            "results": [
                {
                    "title": "Apex Global Careers - Official Website",
                    "url": "https://www.apexglobal.com/careers",
                    "description": "Official careers portal for Apex Global corporation.",
                }
            ]
        }
    }
    mock_urlopen.return_value = _make_mock_response(mock_data)

    with patch.dict(os.environ, {"BRAVE_SEARCH_API_KEY": "test-key-12345"}):
        # User supplied a suspicious lookalike / unrelated domain
        findings, summary = execute_web_research(
            employer_name="Apex Global",
            job_title="Security Analyst",
            company_website="https://apexglobal-career-portal.biz",
        )

        assert summary["status"] == "completed"
        inconsistency_finding = next(
            (f for f in findings if f["evidence_status"] == "potential_domain_inconsistency"), None
        )
        assert inconsistency_finding is not None
        assert "apexglobal.com" in inconsistency_finding["source_domain"]
        assert "differs from the user-supplied domain" in inconsistency_finding["explanation"]


@patch("urllib.request.urlopen")
def test_no_matching_vacancy_found(mock_urlopen):
    """Verify that finding no matching vacancy does NOT claim fraud."""
    mock_data = {
        "web": {
            "results": [
                {
                    "title": "Random Historical Article about Industry Trends",
                    "url": "https://blog.example.org/industry-trends",
                    "description": "General overview of tech hiring market conditions.",
                }
            ]
        }
    }
    mock_urlopen.return_value = _make_mock_response(mock_data)

    with patch.dict(os.environ, {"BRAVE_SEARCH_API_KEY": "test-key-12345"}):
        findings, summary = execute_web_research(
            employer_name="Mysterious Startup",
            job_title="Quantum Lead",
            company_website="https://mysteriousstartup.io",
        )

        assert summary["status"] == "completed"
        no_match_finding = next(
            (f for f in findings if f["evidence_status"] == "no_matching_vacancy_found_in_search"), None
        )
        assert no_match_finding is not None
        # Epistemic requirement: Absence of search results is not proof of fraud
        assert "does not prove that the vacancy does not exist" in no_match_finding["limitations"]


@patch("urllib.request.urlopen")
def test_empty_search_results_list(mock_urlopen):
    """Verify handling when provider returns zero results."""
    mock_data = {"web": {"results": []}}
    mock_urlopen.return_value = _make_mock_response(mock_data)

    with patch.dict(os.environ, {"BRAVE_SEARCH_API_KEY": "test-key-12345"}):
        findings, summary = execute_web_research(
            employer_name="Obscure LLC",
            job_title="Rare Specialist",
        )
        assert summary["status"] == "completed"
        assert len(findings) == 1
        assert findings[0]["evidence_status"] == "no_matching_vacancy_found_in_search"


# --- 4. Provider Error, Timeout & Gzip Tests ---

@patch("urllib.request.urlopen")
def test_rate_limiting_429_handling(mock_urlopen):
    """Verify graceful search_unavailable status on HTTP 429 Too Many Requests."""
    mock_urlopen.side_effect = urllib.error.HTTPError(
        url="https://api.search.brave.com/res/v1/web/search",
        code=429,
        msg="Too Many Requests",
        hdrs={},
        fp=BytesIO(b'{"message": "Rate limit exceeded"}'),
    )

    with patch.dict(os.environ, {"BRAVE_SEARCH_API_KEY": "test-key-12345"}):
        findings, summary = execute_web_research(
            employer_name="Acme Corp",
            job_title="Engineer",
        )
        assert summary["status"] == "search_unavailable"
        assert findings == []
        assert "rate limit" in summary["overall_evidence_assessment"].lower()


@patch("urllib.request.urlopen")
def test_provider_timeout_handling(mock_urlopen):
    """Verify graceful search_unavailable status when request times out."""
    mock_urlopen.side_effect = urllib.error.URLError("timed out")

    with patch.dict(os.environ, {"BRAVE_SEARCH_API_KEY": "test-key-12345"}):
        findings, summary = execute_web_research(
            employer_name="Acme Corp",
            job_title="Engineer",
        )
        assert summary["status"] == "search_unavailable"
        assert findings == []
        assert "timed out" in summary["overall_evidence_assessment"].lower()


@patch("urllib.request.urlopen")
def test_gzip_compressed_response_handling(mock_urlopen):
    """Verify transparent decompression when Brave Search responds with gzip encoding."""
    mock_data = {
        "web": {
            "results": [
                {
                    "title": "Cloud Architect - Microsoft Careers",
                    "url": "https://careers.microsoft.com/us/en/job/123",
                    "description": "Microsoft is seeking a Cloud Architect.",
                }
            ]
        }
    }
    # Return gzipped response
    mock_urlopen.return_value = _make_mock_response(mock_data, is_gzipped=True)

    with patch.dict(os.environ, {"BRAVE_SEARCH_API_KEY": "test-key-12345"}):
        findings, summary = execute_web_research(
            employer_name="Microsoft",
            job_title="Cloud Architect",
            company_website="https://microsoft.com",
        )
        assert summary["status"] == "completed"
        assert len(findings) >= 1
        assert findings[0]["source_domain"] == "careers.microsoft.com" or findings[0]["source_domain"] == "microsoft.com"


# --- 5. Prediction Service Integration & Signal Separation Tests ---

@patch("backend.services.prediction.execute_web_research")
def test_prediction_service_integration_with_web_research(mock_web_research):
    """Verify web research findings are attached to JobAnalysisResponse without corrupting ML text score."""
    mock_web_research.return_value = (
        [
            {
                "query_performed": '"Acme" "Software Engineer" careers',
                "source_title": "Software Engineer - Acme Careers",
                "source_url": "https://acme.com/careers/se",
                "source_domain": "acme.com",
                "snippet": "Software Engineer job posting at Acme.",
                "retrieved_at": "2026-10-23T19:00:00Z",
                "evidence_status": "official_vacancy_match_found",
                "explanation": "Official careers match verified on employer domain.",
                "limitations": "Does not authenticate recruiter email.",
                "comparison_detail": {},
            }
        ],
        {
            "status": "completed",
            "provider": "Brave Search API",
            "total_queries_executed": 1,
            "findings_count": 1,
            "overall_evidence_assessment": "Corroborated 1 official employer vacancy match.",
            "limitations_disclaimer": "Epistemic separation maintained.",
        },
    )

    req = JobAnalysisRequest(
        description="We are looking for a skilled Software Engineer to develop scalable backend services using Python and React.",
        title="Software Engineer",
        employer_name="Acme",
        company_website="https://acme.com",
    )

    response = prediction_service.analyze_job(req)

    # 1. Web research findings properly attached
    assert response.web_research_findings is not None
    assert len(response.web_research_findings) == 1
    assert response.web_research_findings[0].evidence_status == "official_vacancy_match_found"
    assert response.web_research_summary is not None
    assert response.web_research_summary.status == "completed"

    # 2. Strict signal separation: ML fraud probability is a float between 0 and 1
    assert isinstance(response.fraud_probability, float)
    assert 0.0 <= response.fraud_probability <= 1.0


@patch("backend.services.prediction.execute_web_research")
def test_prediction_service_triage_elevation_on_domain_inconsistency(mock_web_research):
    """Verify that domain inconsistency observed by web research elevates auto_cleared triage to review_recommended."""
    mock_web_research.return_value = (
        [
            {
                "query_performed": '"Acme Corp" "Data Scientist" careers',
                "source_title": "Acme Corp Official Careers",
                "source_url": "https://acmecorp.com/jobs",
                "source_domain": "acmecorp.com",
                "snippet": "Official portal.",
                "retrieved_at": "2026-10-23T19:00:00Z",
                "evidence_status": "potential_domain_inconsistency",
                "explanation": "Claimed domain does not match official employer domain.",
                "limitations": "Search results are heuristic.",
                "comparison_detail": {},
            }
        ],
        {
            "status": "completed",
            "provider": "Brave Search API",
            "total_queries_executed": 1,
            "findings_count": 1,
            "overall_evidence_assessment": "Domain inconsistency detected.",
            "limitations_disclaimer": "Heuristic comparison.",
        },
    )

    # Clean text description that produces low ML fraud probability
    req = JobAnalysisRequest(
        description="We are seeking an experienced Data Scientist with extensive skills in machine learning, statistics, and Python.",
        title="Data Scientist",
        employer_name="Acme Corp",
        company_website="https://acme-scam-lookalike.xyz",
    )

    response = prediction_service.analyze_job(req)

    # Even though text ML is low risk, triage decision must be elevated due to domain inconsistency
    assert response.review_decision in ("review_recommended", "flagged_suspicious")
    assert response.risk_level in ("medium", "high")
