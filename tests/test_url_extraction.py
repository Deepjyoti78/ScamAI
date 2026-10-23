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


def test_url_extraction_success_controlled_fixture():
    """Verify successful extraction from a controlled HTML response."""
    html_fixture = b"""
    <html>
    <head><title>Senior Staff Engineer - TechCorp</title></head>
    <body>
        <main>
            <h1>Senior Staff Engineer</h1>
            <p>TechCorp is seeking a Senior Staff Engineer with extensive Python and machine learning experience.</p>
            <p>You will lead architectural design and mentor senior engineering staff. Strong background in scalable systems required.</p>
        </main>
    </body>
    </html>
    """
    mock_resp = make_mock_http_response(html_fixture)

    with patch("backend.services.url_extractor.validate_url_security", return_value=(True, None, MagicMock())), \
         patch("urllib.request.build_opener") as mock_opener:
        mock_opener.return_value.open.return_value.__enter__.return_value = mock_resp

        result = extract_job_posting_from_url("https://careers.example.com/job/101")
        assert result.status == "success"
        assert result.title == "Senior Staff Engineer - TechCorp"
        assert "Senior Staff Engineer" in result.extracted_text
        assert "extensive Python and machine learning experience" in result.extracted_text
        assert result.char_count > 50


def test_url_extraction_unsupported_content_type():
    """Verify that non-HTML content types (e.g., PDF, JSON, binaries) are rejected."""
    mock_resp = make_mock_http_response(b"%PDF-1.4 ...", content_type="application/pdf")

    with patch("backend.services.url_extractor.validate_url_security", return_value=(True, None, MagicMock())), \
         patch("urllib.request.build_opener") as mock_opener:
        mock_opener.return_value.open.return_value.__enter__.return_value = mock_resp

        result = extract_job_posting_from_url("https://careers.example.com/job.pdf")
        assert result.status == "unsupported_content_type"
        assert "application/pdf" in result.error_message
        assert result.extracted_text is None


def test_url_extraction_oversized_response():
    """Verify that responses exceeding MAX_RESPONSE_BYTES are aborted."""
    # Chunk larger than 2MB
    huge_chunk = b"A" * (MAX_RESPONSE_BYTES + 1024)
    mock_resp = make_mock_http_response(huge_chunk)

    with patch("backend.services.url_extractor.validate_url_security", return_value=(True, None, MagicMock())), \
         patch("urllib.request.build_opener") as mock_opener:
        mock_opener.return_value.open.return_value.__enter__.return_value = mock_resp

        result = extract_job_posting_from_url("https://careers.example.com/huge-job")
        assert result.status == "oversized"
        assert "exceeds the maximum allowed size" in result.error_message


def test_url_extraction_timeout_handling():
    """Verify graceful handling of connection timeouts."""
    with patch("backend.services.url_extractor.validate_url_security", return_value=(True, None, MagicMock())), \
         patch("urllib.request.build_opener") as mock_opener:
        mock_opener.return_value.open.side_effect = TimeoutError("Connection timed out")

        result = extract_job_posting_from_url("https://careers.example.com/slow-job")
        assert result.status == "timeout"
        assert "timed out" in result.error_message.lower()


def test_url_extraction_blocked_anti_bot_or_403():
    """Verify that HTTP 403 / anti-bot defenses return 'blocked' status."""
    import urllib.error

    http_error = urllib.error.HTTPError(
        url="https://careers.example.com/job/403",
        code=403,
        msg="Forbidden",
        hdrs={},
        fp=None,
    )

    with patch("backend.services.url_extractor.validate_url_security", return_value=(True, None, MagicMock())), \
         patch("urllib.request.build_opener") as mock_opener:
        mock_opener.return_value.open.side_effect = http_error

        result = extract_job_posting_from_url("https://careers.example.com/job/403")
        assert result.status == "blocked"
        assert result.http_status == 403
        assert "restricted by the job board" in result.error_message
        assert "copy and paste" in result.error_message


# --- 4. Pipeline Integration & Backward Compatibility Tests ---

def test_prediction_service_url_only_extraction_flow():
    """Verify that URL-only payload runs extraction and feeds real text to ML model."""
    html_fixture = b"""
    <html>
    <head><title>Machine Learning Infrastructure Specialist</title></head>
    <body>
        <main>
            <h1>Machine Learning Infrastructure Specialist</h1>
            <p>We are seeking an ML engineer to optimize inference clusters and build feature store pipelines.</p>
            <p>Candidate must have solid experience with PyTorch, Kubernetes, and model deployment.</p>
        </main>
    </body>
    </html>
    """
    mock_resp = make_mock_http_response(html_fixture)

    with patch("backend.services.url_extractor.validate_url_security", return_value=(True, None, MagicMock())), \
         patch("urllib.request.build_opener") as mock_opener:
        mock_opener.return_value.open.return_value.__enter__.return_value = mock_resp

        req = JobAnalysisRequest(job_url="https://careers.legit-enterprise.com/jobs/ml-eng")
        response = prediction_service.analyze_job(req)

        # Verify response structure
        assert isinstance(response, JobAnalysisResponse)
        assert response.source_type == "extracted_url"
        assert response.extraction_status == "success"
        assert response.extracted_title == "Machine Learning Infrastructure Specialist"
        assert response.extracted_text_preview is not None
        assert "Machine Learning" in response.extracted_text_preview

        # Model evaluated the extracted text
        assert response.prediction in (0, 1)
        assert 0.0 <= response.fraud_probability <= 1.0
        assert len(response.top_legitimate_signals) > 0 or len(response.top_suspicious_signals) > 0


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
        assert response.extraction_error == "Access was restricted by Cloudflare bot protection."
        # Confirm not classified as fraud
        assert response.prediction == 0
        assert response.fraud_probability == 0.0
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
