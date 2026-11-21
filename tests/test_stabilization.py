"""Offline adversarial transport and truthful-result regression tests. No model fits."""
import asyncio
from email.message import Message
import io
import json
from pathlib import Path
import socket
import ssl
import time
from unittest.mock import Mock, patch

import pytest

from backend.schemas import JobAnalysisRequest
from backend.services import url_extractor as url
from backend.services.prediction import PredictionService
from backend.services.trust_chain import check_payment_demands, check_credential_requests, execute_trust_chain_investigation


@pytest.fixture(autouse=True)
def offline(monkeypatch):
    monkeypatch.setenv("SCAMSHIELD_ENABLE_URL_FETCH", "true")
    monkeypatch.delenv("TAVILY_API_KEY", raising=False)
    monkeypatch.delenv("BRAVE_SEARCH_API_KEY", raising=False)
    monkeypatch.setattr(socket, "create_connection", Mock(side_effect=AssertionError("Hostname re-resolution/network forbidden")))
    monkeypatch.setattr(socket, "getaddrinfo", Mock(side_effect=AssertionError("Unmocked DNS forbidden")))


def dns(address="8.8.8.8"):
    family = socket.AF_INET6 if ":" in address else socket.AF_INET
    return [(family, socket.SOCK_STREAM, 6, "", (address, 443))]


class FakeSocket:
    def __init__(self, body):
        self.body = body
        self.connected = None
        self.request = b""
        self.closed = False
    def settimeout(self, timeout):
        assert 0 < timeout <= 8
    def connect(self, address):
        self.connected = address
    def sendall(self, data):
        self.request += data
    def makefile(self, *args, **kwargs):
        return io.BytesIO(self.body)
    def do_handshake(self):
        pass
    def shutdown(self, how):
        self.closed = True
    def close(self):
        self.closed = True


def html_response(body=None, headers="", status="200 OK"):
    content = body if body is not None else b"<html><title>Engineer</title><input><main>We are hiring an experienced engineer to build maintainable distributed applications.</main></html>"
    return f"HTTP/1.1 {status}\r\nContent-Type: text/html; charset=utf-8\r\n{headers}Connection: close\r\n\r\n".encode() + content


def transport(monkeypatch, responses, addresses=None):
    socks = [FakeSocket(response) for response in responses]
    factory = Mock(side_effect=socks)
    resolver = Mock(side_effect=addresses or [dns()])
    monkeypatch.setattr(socket, "socket", factory)
    monkeypatch.setattr(socket, "getaddrinfo", resolver)
    context = ssl.create_default_context()
    assert context.check_hostname and context.verify_mode == ssl.CERT_REQUIRED
    context.wrap_socket = Mock(side_effect=lambda sock, **kwargs: sock)
    monkeypatch.setattr(ssl, "create_default_context", lambda: context)
    return socks, factory, resolver, context


@pytest.mark.parametrize("target", [
    "http://127.0.0.1", "http://10.0.0.1", "http://169.254.169.254/latest/meta-data", "http://0.0.0.0", "http://224.0.0.1",
    "http://[::1]", "http://[fc00::1]", "http://[fe80::1]", "http://[::ffff:127.0.0.1]", "http://[64:ff9b::7f00:1]",
    "http://localhost", "https://metadata.google.internal", "ftp://public.example/job", "https://user:secret@public.example/job",
    "https://public.example:8080/job", "https://public.example:99999/job", "https://public.example%2f@127.0.0.1", "https://public.example/%0d%0afoo",
    "https://public.example\\@127.0.0.1", "https://public.example/%zz", "https://public.example:0/job",
])
def test_forbidden_url(target):
    assert url.extract_job_posting_from_url(target).status == "security_violation"


@pytest.mark.parametrize("address", ["8.8.8.8", "2606:4700:4700::1111"])
def test_connection_pins_dns_and_preserves_host_tls(monkeypatch, address):
    socks, factory, resolver, context = transport(monkeypatch, [html_response()], [dns(address)])
    monkeypatch.setenv("HTTPS_PROXY", "http://127.0.0.1:8888")
    result = url.extract_job_posting_from_url("https://jobs.example/job?token=private")
    assert result.status == "success"
    assert socks[0].connected[0] == address
    assert resolver.call_count == 1  # no resolution between approval and connect
    assert b"Host: jobs.example" in socks[0].request
    assert context.wrap_socket.call_args.kwargs == {"server_hostname": "jobs.example", "do_handshake_on_connect": False}
    assert result.final_url == "https://jobs.example/job"
    assert "experienced engineer" in result.extracted_text


def test_rebinding_redirect_gets_new_validation(monkeypatch):
    socks, factory, resolver, _ = transport(monkeypatch, [html_response(headers="Location: /next\r\n", status="302 Found")], [dns(), dns("127.0.0.1")])
    result = url.extract_job_posting_from_url("https://jobs.example/job")
    assert result.status == "security_violation"
    assert factory.call_count == 1
    assert resolver.call_count == 2


def test_mixed_dual_stack_fails_before_connect(monkeypatch):
    socks, factory, _, _ = transport(monkeypatch, [], [dns() + dns("::1")])
    assert url.extract_job_posting_from_url("https://jobs.example/job").status == "security_violation"
    factory.assert_not_called()


@pytest.mark.parametrize("location", ["http://jobs.example/next", "https://127.0.0.1/private", "https://evil.example/%0a"])
def test_redirect_policy(monkeypatch, location):
    _, factory, _, _ = transport(monkeypatch, [html_response(headers=f"Location: {location}\r\n", status="302 Found")])
    assert url.extract_job_posting_from_url("https://jobs.example/job").status == "security_violation"
    assert factory.call_count == 1


def test_redirect_limit(monkeypatch):
    transport(monkeypatch, [html_response(headers="Location: /next\r\n", status="302 Found")] * 4, [dns()] * 4)
    assert url.extract_job_posting_from_url("https://jobs.example/job").status == "security_violation"


@pytest.mark.parametrize("payload,headers,status", [
    (b"a" * (2*1024*1024+1), "", "oversized"),
    (b"", "Content-Length: 9000000\r\n", "oversized"),
    (b"compressed bytes", "Content-Encoding: gzip\r\n", "unsupported_encoding"),
    (b"<p>tiny</p>", "", "insufficient_content"),
    (b"<p>"+b"a"*15001+b"</p>", "", "oversized"),
], ids=["body_cap", "length_cap", "compressed", "empty", "text_cap"])
def test_content_limits(monkeypatch, payload, headers, status):
    transport(monkeypatch, [html_response(payload, headers)])
    assert url.extract_job_posting_from_url("https://jobs.example/job").status == status


def test_timeout_and_default_disabled(monkeypatch):
    monkeypatch.setattr(url, "_fetch_html", Mock(side_effect=TimeoutError()))
    assert url.extract_job_posting_from_url("https://jobs.example/job").status == "timeout"
    monkeypatch.delenv("SCAMSHIELD_ENABLE_URL_FETCH")
    assert url.extract_job_posting_from_url("https://jobs.example/job").status == "unavailable"


def test_tls_validation_failure_is_not_bypassed(monkeypatch):
    _, factory, _, context = transport(monkeypatch, [html_response()])
    context.wrap_socket.side_effect = ssl.SSLCertVerificationError("invalid cert")
    assert url.extract_job_posting_from_url("https://jobs.example/job").status == "unreachable"
    assert factory.call_count == 1


@pytest.mark.parametrize("status", ["timeout", "blocked", "unsupported_content_type", "unavailable", "success"])
def test_failed_or_empty_extraction_never_scores(monkeypatch, status):
    service = PredictionService()
    monkeypatch.setattr("backend.services.prediction.extract_job_posting_from_url", lambda _: url.JobExtractionResult(url="", status=status, extracted_text=""))
    service.get_pipeline = Mock(side_effect=AssertionError("Must not infer without content"))
    result = service.analyze_job(JobAnalysisRequest(job_url="https://jobs.example/job"))
    assert result.analysis_status == "unable_to_assess"
    assert result.prediction is result.fraud_probability is result.model_score is result.confidence is result.label is None
    assert result.risk_level == "unknown"
    service.get_pipeline.assert_not_called()


def collect(service, req):
    async def run():
        return "".join([chunk async for chunk in service.stream_analyze_job(req)])
    frames = asyncio.run(run()).strip().split("\n\n")
    return [(frame.splitlines()[0][7:], json.loads(frame.splitlines()[1][6:])) for frame in frames]


@pytest.mark.parametrize("failure", ["missing", "inference"])
def test_model_failure_sync_stream_parity(monkeypatch, tmp_path, failure):
    service = PredictionService(tmp_path / "missing.joblib")
    if failure == "inference":
        service.get_pipeline = Mock(side_effect=RuntimeError("SECRET INPUT MUST NOT LEAK"))
    req = JobAnalysisRequest(description="An experienced developer is needed to build maintainable APIs.")
    sync = service.analyze_job(req).model_dump()
    events = collect(service, req)
    stream = [data for name, data in events if name == "complete"][0]
    sync.pop("inference_time_ms"); stream.pop("inference_time_ms")
    assert sync == stream
    assert stream["analysis_status"] == "not_scored"
    assert stream["fraud_probability"] is None
    assert "SECRET" not in json.dumps(events)
    assert any(data.get("card_id") == 3 and data.get("status") == "failed" for _, data in events)


def test_success_sync_stream_same_score_and_unknown_evidence():
    service = PredictionService()
    req = JobAnalysisRequest(description="We seek an experienced developer to build and maintain Python services.")
    sync = service.analyze_job(req).model_dump()
    stream = [data for name, data in collect(service, req) if name == "complete"][0]
    sync.pop("inference_time_ms"); stream.pop("inference_time_ms")
    assert sync == stream
    assert stream["analysis_status"] == "completed"
    assert stream["model_score"] == stream["fraud_probability"]
    assert stream["web_research_summary"]["status"] == "not_configured"
    assert any(f["check_id"] == "recruiter_email_domain" and f["status"] == "not_checked" for f in stream["trust_chain_findings"])


@pytest.mark.parametrize("function", [check_payment_demands, check_credential_requests])
def test_empty_text_is_not_checked(function):
    assert function("")["status"] == "not_checked"


@pytest.mark.parametrize("text", ["Do not send your OTP.", "Never provide your password.", "We will never ask you to share your OTP."])
def test_credential_negations(text):
    assert check_credential_requests(text)["status"] != "concern_observed"


@pytest.mark.parametrize("text", ["We never charge fees, but you must pay a registration fee.", "Never send money; pay a registration fee to proceed."])
def test_disclaimer_does_not_mask_separate_payment_demand(text):
    assert check_payment_demands(text)["status"] == "concern_observed"


def test_negated_fee_and_unfamiliar_vendor_are_not_proof():
    assert check_payment_demands("We do not charge registration fees.")["status"] != "concern_observed"
    result = execute_trust_chain_investigation(description="Experienced engineers are invited to apply.", company_website="https://employer.example", application_url="https://unknown-vendor.example/apply")
    item = next(f for f in result["trust_chain_findings"] if f["check_id"] == "application_destination")
    assert item["severity"] != "critical"
    assert "not proof" in item["explanation"]


def test_actual_deadline_shutdown_interrupts_slow_body(monkeypatch):
    import threading
    closed = threading.Event()
    class SlowResponse:
        status = 200
        def getheader(self, name, default=None):
            return "text/html" if name == "Content-Type" else default
        def read(self, count):
            assert closed.wait(1), "Deadline failed to close the socket"
            return b""
        def close(self):
            pass
    class Connection:
        sock = None
        def __init__(self, *args, **kwargs):
            self._deadline_socket = Mock()
            self._deadline_socket.shutdown.side_effect = lambda _: closed.set()
        def request(self, *a, **kw):
            pass
        def getresponse(self):
            return SlowResponse()
        def close(self):
            pass
    monkeypatch.setattr(url, "_resolve", lambda *a: dns())
    monkeypatch.setattr(url.http.client, "HTTPConnection", Connection)
    started = time.monotonic()
    with pytest.raises(TimeoutError):
        url._fetch_html("https://jobs.example/job", time.monotonic() + .05)
    assert time.monotonic() - started < 1


def test_dns_timeout_is_bounded(monkeypatch):
    def slow_dns(*args):
        time.sleep(.1)
        return dns()
    monkeypatch.setattr(socket, "getaddrinfo", slow_dns)
    started = time.monotonic()
    with pytest.raises(TimeoutError):
        url._resolve("jobs.example", 443, started + .01)
    assert time.monotonic() - started < .1


def test_provider_decompression_bomb_is_unavailable(monkeypatch):
    import gzip
    from backend.services import web_research as web
    response = Mock()
    response.read.return_value = gzip.compress(b"a" * (2*1024*1024))
    response.info.return_value = {"Content-Encoding":"gzip"}
    manager = Mock()
    manager.__enter__ = Mock(return_value=response)
    manager.__exit__ = Mock(return_value=False)
    monkeypatch.setattr(web, "_provider_open", lambda *a, **k: manager)
    findings, summary = web.execute_web_research(employer_name="Example Employer", api_key="offline-test-key")
    assert summary["status"] == "search_unavailable"
    assert "offline-test-key" not in json.dumps(summary)


def test_provider_proxy_and_redirect_policy(monkeypatch):
    from backend.services import web_research as web
    import urllib.request
    import urllib.error
    opener = Mock()
    build = Mock(return_value=opener)
    monkeypatch.setattr(urllib.request, "build_opener", build)
    web._provider_open(urllib.request.Request("https://api.search.brave.com/res/v1/web/search"), 1)
    assert build.call_args.args[0].proxies == {}
    with pytest.raises(urllib.error.URLError):
        build.call_args.args[1].redirect_request(None, None, 302, "", {}, "http://127.0.0.1")


def test_api_sync_stream_failed_state_consistency():
    import importlib.util
    spec = importlib.util.spec_from_file_location('offline_stream_helpers', Path(__file__).with_name('test_stream_endpoint.py'))
    helpers = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(helpers)
    _dispatch_asgi, parse_sse_events = helpers._dispatch_asgi, helpers.parse_sse_events
    payload = json.dumps({"job_url":"https://jobs.example/job"}).encode()
    headers = [(b"host", b"localhost"), (b"content-type", b"application/json")]
    with patch("backend.services.prediction.extract_job_posting_from_url", return_value=url.JobExtractionResult(url="",status="timeout")):
        sync_status, _, sync_body = asyncio.run(_dispatch_asgi("POST", "/api/investigations/analyze", headers, payload))
        stream_status, _, stream_body = asyncio.run(_dispatch_asgi("POST", "/api/investigations/analyze/stream", headers, payload))
    assert sync_status == stream_status == 200
    sync = json.loads(sync_body)
    stream = [data for event, data in parse_sse_events(stream_body.decode()) if event == "complete"][0]
    sync.pop("inference_time_ms"); stream.pop("inference_time_ms")
    assert sync == stream
    assert sync["analysis_status"] == "unable_to_assess"
    assert sync["model_score"] is None


@pytest.mark.parametrize("text", ["You must not pay a registration fee.", "No upfront fee is required."])
def test_explicit_payment_negation(text):
    assert check_payment_demands(text)["status"] != "concern_observed"


def test_must_not_share_credentials():
    assert check_credential_requests("You must not share your OTP.")["status"] != "concern_observed"


def test_oversized_api_body_is_rejected_without_echo():
    import importlib.util
    spec = importlib.util.spec_from_file_location('body_limit_helpers', Path(__file__).with_name('test_stream_endpoint.py'))
    helpers = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(helpers)
    status, _, body = asyncio.run(helpers._dispatch_asgi("POST", "/api/investigations/analyze", [(b"host",b"localhost"),(b"content-type",b"application/json")], json.dumps({"description":"sensitive"*20000}).encode()))
    assert status == 413
    assert b"sensitive" not in body
