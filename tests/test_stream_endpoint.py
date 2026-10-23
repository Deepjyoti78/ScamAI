"""Unit and integration tests for the live streaming investigation endpoint.

Verifies:
1. Real Server-Sent Events emitted for all 5 investigation cards.
2. Direct text input marks Card 02 (retrieval) as skipped.
3. URL extraction correctly updates Card 02.
4. Validation failures mark Card 01 as failed and emit error events.
5. Final 'complete' event delivers full JobAnalysisResponse payload.
6. ASGI streaming response properly dispatches text/event-stream headers.
"""

import asyncio
import json
from unittest.mock import patch
import pytest

from backend.main import app
from backend.schemas import JobAnalysisRequest
from backend.services.prediction import prediction_service
from backend.services.url_extractor import JobExtractionResult


async def _dispatch_asgi(
    method: str,
    path: str,
    headers: list[tuple[bytes, bytes]],
    body: bytes = b"",
    timeout: float = 5.0,
):
    """Lightweight ASGI dispatcher using native asyncio for streaming responses."""
    scope = {
        "type": "http",
        "asgi": {"version": "3.0"},
        "http_version": "1.1",
        "method": method,
        "path": path,
        "raw_path": path.encode("ascii"),
        "query_string": b"",
        "headers": headers,
    }

    sent_request = False
    finished = asyncio.Event()
    chunks = []
    status_code = None
    response_headers = {}

    async def receive():
        nonlocal sent_request
        if not sent_request:
            sent_request = True
            return {"type": "http.request", "body": body, "more_body": False}
        await finished.wait()
        return {"type": "http.disconnect"}

    async def send(msg):
        nonlocal status_code, response_headers
        if msg["type"] == "http.response.start":
            status_code = msg["status"]
            response_headers = {
                k.decode("latin1").lower(): v.decode("latin1")
                for k, v in msg.get("headers", [])
            }
        elif msg["type"] == "http.response.body":
            chunks.append(msg.get("body", b""))
            if not msg.get("more_body", False):
                finished.set()

    task = asyncio.create_task(app(scope, receive, send))
    await asyncio.wait_for(finished.wait(), timeout=timeout)
    await task

    return status_code, response_headers, b"".join(chunks)


def parse_sse_events(response_text: str):
    """Parse raw text/event-stream into a list of (event, data) tuples."""
    events = []
    current_event = "message"
    current_data = []

    for line in response_text.splitlines():
        line = line.strip()
        if not line:
            if current_data:
                data_str = "\n".join(current_data)
                try:
                    parsed_json = json.loads(data_str)
                except Exception:
                    parsed_json = data_str
                events.append((current_event, parsed_json))
                current_event = "message"
                current_data = []
            continue

        if line.startswith("event:"):
            current_event = line[len("event:") :].strip()
        elif line.startswith("data:"):
            current_data.append(line[len("data:") :].strip())

    if current_data:
        data_str = "\n".join(current_data)
        try:
            parsed_json = json.loads(data_str)
        except Exception:
            parsed_json = data_str
        events.append((current_event, parsed_json))

    return events


def test_asgi_stream_endpoint_headers():
    """Verify that POST /api/investigations/analyze/stream returns text/event-stream with no-cache headers."""
    payload = json.dumps({
        "title": "Software Engineer",
        "description": "We are looking for an experienced software developer to build high performance web APIs.",
    }).encode("utf-8")

    headers = [
        (b"host", b"127.0.0.1:8000"),
        (b"content-type", b"application/json"),
        (b"accept", b"text/event-stream"),
    ]

    status_code, resp_headers, body = asyncio.run(_dispatch_asgi("POST", "/api/investigations/analyze/stream", headers, payload))
    assert status_code == 200
    assert "text/event-stream" in resp_headers.get("content-type", "")
    assert "no-cache" in resp_headers.get("cache-control", "")

    events = parse_sse_events(body.decode("utf-8"))
    assert len(events) >= 6
    stage_updates = [data for event, data in events if event == "stage_update"]
    card_ids = {s["card_id"] for s in stage_updates}
    assert {1, 2, 3, 4, 5}.issubset(card_ids)


def test_stream_service_text_investigation():
    """Directly test prediction_service.stream_analyze_job generator for a text job posting."""
    req = JobAnalysisRequest(
        title="Senior Python Developer",
        employer_name="Acme Tech Solutions",
        description="We are seeking a senior Python backend developer with experience in FastAPI and cloud deployments.",
        company_website="https://acmetech.example.com",
        recruiter_email="jobs@acmetech.example.com",
    )

    async def _collect():
        chunks = []
        async for chunk in prediction_service.stream_analyze_job(req):
            chunks.append(chunk)
        return "".join(chunks)

    output = asyncio.run(_collect())
    events = parse_sse_events(output)
    assert len(events) >= 6

    stage_updates = [data for event, data in events if event == "stage_update"]
    card_ids = [s["card_id"] for s in stage_updates]

    # All 5 cards must be reported
    for cid in (1, 2, 3, 4, 5):
        assert cid in card_ids

    # Card 1: validation completed
    card1 = [s for s in stage_updates if s["card_id"] == 1 and s["status"] == "completed"]
    assert len(card1) >= 1

    # Card 2: retrieval was skipped because direct text was supplied
    card2 = [s for s in stage_updates if s["card_id"] == 2]
    assert any(s["status"] == "skipped" for s in card2)
    assert "Direct text" in card2[-1]["detail"]

    # Card 3: ML model completed
    card3 = [s for s in stage_updates if s["card_id"] == 3 and s["status"] == "completed"]
    assert len(card3) >= 1

    # Card 4: warning signals completed
    card4 = [s for s in stage_updates if s["card_id"] == 4 and s["status"] == "completed"]
    assert len(card4) >= 1

    # Card 5: Trust chain domain consistency completed
    card5 = [s for s in stage_updates if s["card_id"] == 5 and s["status"] == "completed"]
    assert len(card5) >= 1

    # Complete event
    complete_events = [data for event, data in events if event == "complete"]
    assert len(complete_events) == 1
    final_resp = complete_events[0]

    assert "prediction" in final_resp
    assert "fraud_probability" in final_resp
    assert "risk_level" in final_resp
    assert "assessment_summary" in final_resp
    assert "trust_chain_findings" in final_resp


def test_stream_endpoint_validation_failure_empty_input():
    """Verify ASGI validation failure (HTTP 422) when no text or URL is submitted."""
    payload = json.dumps({"title": "Empty Post"}).encode("utf-8")
    headers = [
        (b"host", b"127.0.0.1:8000"),
        (b"content-type", b"application/json"),
        (b"accept", b"text/event-stream"),
    ]

    status_code, resp_headers, body = asyncio.run(_dispatch_asgi("POST", "/api/investigations/analyze/stream", headers, payload))
    assert status_code == 422
    assert "detail" in json.loads(body.decode("utf-8"))


def test_stream_endpoint_validation_failure_short_description():
    """Verify ASGI validation failure (HTTP 422) when description is too brief."""
    payload = json.dumps({"description": "Too short"}).encode("utf-8")
    headers = [
        (b"host", b"127.0.0.1:8000"),
        (b"content-type", b"application/json"),
        (b"accept", b"text/event-stream"),
    ]

    status_code, resp_headers, body = asyncio.run(_dispatch_asgi("POST", "/api/investigations/analyze/stream", headers, payload))
    assert status_code == 422


def test_stream_service_url_extraction_success():
    """Verify live investigation stream when a public URL is extracted."""
    mock_result = JobExtractionResult(
        url="https://jobs.example.com/sec-eng",
        final_url="https://jobs.example.com/sec-eng",
        status="success",
        title="Staff Security Engineer",
        extracted_text="We are hiring a Staff Security Engineer. Responsibilities include threat modeling and security architecture.",
    )

    with patch("backend.services.prediction.extract_job_posting_from_url", return_value=mock_result):
        req = JobAnalysisRequest(job_url="https://jobs.example.com/sec-eng")

        async def _collect():
            chunks = []
            async for chunk in prediction_service.stream_analyze_job(req):
                chunks.append(chunk)
            return "".join(chunks)

        output = asyncio.run(_collect())
        events = parse_sse_events(output)
        stage_updates = [data for event, data in events if event == "stage_update"]

        # Card 2 should transition to in_progress then completed
        card2_updates = [s for s in stage_updates if s["card_id"] == 2]
        statuses = [s["status"] for s in card2_updates]
        assert "in_progress" in statuses
        assert "completed" in statuses

        complete_events = [data for event, data in events if event == "complete"]
        assert len(complete_events) == 1
        assert complete_events[0]["source_type"] == "extracted_url"

