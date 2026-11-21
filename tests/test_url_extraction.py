"""Unit tests for ScamShield AI Safe Job URL Ingestion & Content Extraction.

Tests:
1. URL-only analysis using controlled HTML fixtures.
2. Description-only backward compatibility.
3. Empty / missing input validation.
4. Invalid URL schemes (ftp, file, javascript, data).
5. Localhost and private/reserved IP rejection (SSRF defense).
6. Unsafe redirect rejection (hop-by-hop validation).
7. Timeouts and oversized responses (size cap).
8. Unsupported content types (PDF, JSON, images).
9. Extraction failure fallback (never classify extraction error as fraud).
10. HTML script, style, nav, and footer removal.
11. Correct passage of extracted text into the ML model pipeline.
"""

import io
from pathlib import Path
import sys
from unittest.mock import MagicMock, patch

# Ensure project root is in sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

import pytest
from pydantic import ValidationError

from backend.schemas import JobAnalysisRequest, JobAnalysisResponse
from backend.services.prediction import prediction_service
from backend.services.url_extractor import (
    ALLOWED_PORTS,
    ALLOWED_SCHEMES,
    MAX_RESPONSE_BYTES,
    JobExtractionResult,
    JobPageHTMLParser,
    SecurityValidationError,
    extract_job_posting_from_url,
    validate_url_security,
)


# --- 1. HTML Parser & Content Cleanup Tests ---

def test_html_parser_strips_scripts_styles_and_nav():
    """Verify that script, style, nav, footer, and header tags are completely removed."""
    raw_html = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Lead Backend Architect - Acme Systems</title>
        <meta name="description" content="Acme Systems is hiring a Lead Backend Architect.">
        <style>body { background: #fff; } .nav { display: flex; }</style>
        <script>console.log("analytics tracking code");</script>
    </head>
    <body>
        <header>
            <nav>
                <a href="/home">Home</a>
                <a href="/jobs">Browse Jobs</a>
            </nav>
        </header>
        <main>
            <h1>Lead Backend Architect</h1>
            <p>Location: San Francisco, CA (Hybrid)</p>
            <div>
                <h2>Job Requirements</h2>
                <p>We are seeking an experienced architect with 8+ years designing scalable distributed systems in Python and Go.</p>
                <ul>
                    <li>Deep knowledge of microservices and message queues.</li>
                    <li>Strong experience with cloud infrastructure.</li>
                </ul>
            </div>
        </main>
        <aside>
            <button>Subscribe to Job Alerts</button>
        </aside>
        <footer>
            <p>&copy; 2026 Acme Systems Inc. All rights reserved.</p>
        </footer>
    </body>
    </html>
    """
    parser = JobPageHTMLParser()
    parser.feed(raw_html)

    clean_text = parser.get_clean_text()
    title = parser.get_clean_title()

    assert title == "Lead Backend Architect - Acme Systems"
    assert parser.meta_description == "Acme Systems is hiring a Lead Backend Architect."

    # Confirm boilerplate elements were excluded
    assert "analytics tracking code" not in clean_text
    assert "Browse Jobs" not in clean_text
    assert "All rights reserved" not in clean_text
    assert "Subscribe to Job Alerts" not in clean_text

    # Confirm core job content is preserved
    assert "Lead Backend Architect" in clean_text
    assert "scalable distributed systems in Python and Go" in clean_text
    assert "microservices and message queues" in clean_text


# --- 2. URL Syntax & SSRF Security Tests ---

def test_validate_url_security_disallowed_schemes():
    """Verify rejection of non-HTTP/HTTPS schemes."""
    disallowed = [
        "ftp://example.com/job",
        "file:///etc/passwd",
        "file://c:/windows/system32",
        "javascript:alert(1)",
        "data:text/html,<html>test</html>",
        "gopher://example.com:70",
    ]
    for url in disallowed:
        is_safe, error, _ = validate_url_security(url)
        assert is_safe is False, f"Allowed unsafe scheme: {url}"
        assert "scheme" in error.lower() or "only http and https" in error.lower()


def test_validate_url_security_credentials_rejected():
    """Verify that credentials in URLs are rejected."""
    urls_with_creds = [
        "http://admin:secret@example.com/job",
        "https://user:password@legit-careers.com/listing",
    ]
    for url in urls_with_creds:
        is_safe, error, _ = validate_url_security(url)
        assert is_safe is False
        assert "credentials" in error.lower()


def test_validate_url_security_non_standard_ports():
    """Verify rejection of ports other than 80 and 443."""
    bad_ports = [
        "http://example.com:8080/jobs",
        "http://example.com:3000/jobs",
        "https://example.com:8443/jobs",
        "http://example.com:22/jobs",
    ]
    for url in bad_ports:
        is_safe, error, _ = validate_url_security(url)
        assert is_safe is False
        assert "port" in error.lower()


def test_validate_url_security_loopback_and_private_ips():
    """Verify SSRF protection rejects loopback, private, and link-local destinations."""
    private_destinations = [
        "http://localhost/job",
        "http://localhost:80/job",
        "http://127.0.0.1/job",
        "http://127.0.0.2/job",
        "http://[::1]/job",
        "http://10.0.0.5/job",
        "http://192.168.1.100/job",
        "http://172.16.0.1/job",
        "http://169.254.169.254/latest/meta-data",  # Cloud metadata IP
        "http://metadata.google.internal/computeMetadata/v1",
        "http://instance-data/latest/meta-data",
    ]
    for url in private_destinations:
        is_safe, error, _ = validate_url_security(url)
        assert is_safe is False, f"Failed to reject private destination: {url}"


def test_validate_url_security_dns_resolving_to_private_ip():
    """Verify that hostnames that resolve to private or loopback IPs are blocked."""
    with patch("socket.getaddrinfo") as mock_dns:
        # Mock DNS resolution returning 127.0.0.1
        mock_dns.return_value = [
            (2, 1, 6, "", ("127.0.0.1", 80)),
        ]
        is_safe, error, _ = validate_url_security("http://evil-attacker-rebinding.com/job")
        assert is_safe is False
        assert "restricted ip" in error.lower() or "private" in error.lower()


# --- 3. Mocked HTTP Ingestion Tests (Controlled Fixtures) ---

def make_mock_http_response(
    content: bytes,
    status: int = 200,
    content_type: str = "text/html; charset=utf-8",
    final_url: str = "https://careers.example.com/job/101",
):
    """Helper to construct a mock urllib HTTP response."""
    resp = MagicMock()
    resp.status = status
    resp.geturl.return_value = final_url
    resp.headers = {"Content-Type": content_type}
    stream = io.BytesIO(content)
    resp.read.side_effect = stream.read
    return resp


def test_url_extraction_success_controlled_fixture(monkeypatch):
    monkeypatch.setenv('SCAMSHIELD_ENABLE_URL_FETCH', 'true')
    with patch('backend.services.url_extractor._fetch_html', return_value=('<title>Senior Staff Engineer - TechCorp</title><main>TechCorp seeks an engineer with extensive Python and machine learning experience.</main>', 'https://careers.example.com/job', 200, 'success')):
        result = extract_job_posting_from_url('https://careers.example.com/job')
    assert result.status == 'success'
    assert result.title == 'Senior Staff Engineer - TechCorp'
    assert 'extensive Python' in result.extracted_text


def test_url_extraction_unsupported_content_type(monkeypatch):
    monkeypatch.setenv('SCAMSHIELD_ENABLE_URL_FETCH', 'true')
    with patch('backend.services.url_extractor._fetch_html', return_value=(None, 'https://careers.example.com/job', 200, 'unsupported_content_type')):
        result = extract_job_posting_from_url('https://careers.example.com/job')
    assert result.status == 'unsupported_content_type'
    assert result.extracted_text is None


def test_url_extraction_oversized_response(monkeypatch):
    monkeypatch.setenv('SCAMSHIELD_ENABLE_URL_FETCH', 'true')
    with patch('backend.services.url_extractor._fetch_html', return_value=(None, 'https://careers.example.com/job', 200, 'oversized')):
        result = extract_job_posting_from_url('https://careers.example.com/job')
    assert result.status == 'oversized'
    assert result.extracted_text is None


def test_url_extraction_timeout_handling(monkeypatch):
    monkeypatch.setenv('SCAMSHIELD_ENABLE_URL_FETCH', 'true')
    with patch('backend.services.url_extractor._fetch_html', side_effect=TimeoutError()):
        result = extract_job_posting_from_url('https://careers.example.com/job')
    assert result.status == 'timeout'
    assert 'timed out' in result.error_message


def test_url_extraction_blocked_anti_bot_or_403(monkeypatch):
    monkeypatch.setenv('SCAMSHIELD_ENABLE_URL_FETCH', 'true')
    with patch('backend.services.url_extractor._fetch_html', return_value=(None, 'https://careers.example.com/job', 403, 'blocked')):
        result = extract_job_posting_from_url('https://careers.example.com/job')
    assert result.status == 'blocked'
    assert result.http_status == 403
    assert 'paste' in result.error_message


# --- 4. Pipeline Integration & Backward Compatibility Tests ---

def test_prediction_service_url_only_extraction_flow():
    with patch('backend.services.prediction.extract_job_posting_from_url', return_value=JobExtractionResult(url='', status='success', title='Machine Learning Infrastructure Specialist', extracted_text='We seek a Machine Learning engineer to optimize inference clusters and build feature store pipelines.')):
        result = prediction_service.analyze_job(JobAnalysisRequest(job_url='https://careers.example.com/job'))
    assert result.analysis_status == 'completed'
    assert result.source_type == 'extracted_url'
    assert result.extraction_status == 'success'
    assert result.prediction in (0, 1)
    assert 0 <= result.fraud_probability <= 1


def test_prediction_service_extraction_failure_does_not_flag_as_fraud():
    """Verify that when extraction fails, the URL is NOT classified as fraud."""
    with patch("backend.services.prediction.extract_job_posting_from_url") as mock_extractor:
        mock_extractor.return_value = JobExtractionResult(
            url="https://careers.example.com/protected-job",
            status="blocked",
            http_status=403,
            error_message="Access was restricted by Cloudflare bot protection.",
        )

        req = JobAnalysisRequest(job_url="https://careers.example.com/protected-job")
        response = prediction_service.analyze_job(req)

        assert response.source_type == "extracted_url"
        assert response.extraction_status == "blocked"
        assert response.analysis_status == "unable_to_assess"
        # Confirm not classified as fraud
        assert response.prediction is None
        assert response.fraud_probability is None
        assert response.risk_level == "unknown"
        assert "paste" in response.assessment_summary.lower()


def test_description_only_backward_compatibility():
    """Verify that description-only submissions continue to function seamlessly."""
    req = JobAnalysisRequest(
        description="Senior Frontend Engineer working on React and TypeScript design systems.",
        title="Senior Frontend Engineer",
    )
    response = prediction_service.analyze_job(req)

    assert response.source_type == "pasted_text"
    assert response.extraction_status == "not_applicable"
    assert response.prediction in (0, 1)
    assert 0.0 <= response.fraud_probability <= 1.0


def test_empty_input_validation():
    """Verify that submitting neither description nor job_url raises a clear validation error."""
    with pytest.raises(ValidationError) as exc:
        JobAnalysisRequest.model_validate({})
    assert "either a job description" in str(exc.value).lower()


# --- 5. Unsafe Redirects and Cloud Metadata Protection Tests ---

def test_cloud_metadata_endpoints_blocked():
    """Verify that AWS/GCP/Azure link-local metadata endpoints are strictly blocked."""
    endpoints = [
        "http://169.254.169.254/latest/meta-data/",
        "http://metadata.google.internal/computeMetadata/v1/",
        "http://169.254.169.254:80/job-posting",
    ]
    for ep in endpoints:
        is_safe, error, _ = validate_url_security(ep)
        assert is_safe is False
        assert "private" in error.lower() or "blocked" in error.lower() or "reserved" in error.lower()


def test_unsafe_redirect_to_private_ip_blocked():
    """Verify that SafeRedirectHandler rejects redirects pointing to internal/private targets."""
    from backend.services.url_extractor import SafeRedirectHandler, SecurityValidationError

    handler = SafeRedirectHandler(max_redirects=3)
    mock_req = MagicMock()
    mock_req.full_url = "https://careers.example.com/job"

    with pytest.raises(SecurityValidationError) as exc:
        handler.redirect_request(
            req=mock_req,
            fp=None,
            code=302,
            msg="Found",
            headers={},
            newurl="http://127.0.0.1/admin",
        )
    assert "blocked" in str(exc.value).lower()


def test_redirect_exceeding_max_hops_blocked():
    """Verify that redirect loops exceeding MAX_REDIRECTS are terminated."""
    from backend.services.url_extractor import SafeRedirectHandler, SecurityValidationError

    handler = SafeRedirectHandler(max_redirects=2)
    mock_req = MagicMock()
    mock_req.full_url = "https://careers.example.com/job"
    mock_req.get_method.return_value = "GET"

    with patch("backend.services.url_extractor.validate_url_security", return_value=(True, None, MagicMock())):
        # 1st redirect: allowed
        handler.redirect_request(mock_req, None, 302, "Found", {}, "https://careers.example.com/job2")
        # 2nd redirect: allowed
        handler.redirect_request(mock_req, None, 302, "Found", {}, "https://careers.example.com/job3")
        # 3rd redirect: exceeds limit of 2 -> must raise
        with pytest.raises(SecurityValidationError) as exc:
            handler.redirect_request(mock_req, None, 302, "Found", {}, "https://careers.example.com/job4")
        assert "too many redirects" in str(exc.value).lower()
