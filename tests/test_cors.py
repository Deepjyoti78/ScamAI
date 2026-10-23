"""Tests for FastAPI CORS configuration.

Verifies that production and preview Vercel origins, as well as local development
origins, receive proper Access-Control-Allow-Origin headers on standard requests
and preflight OPTIONS requests, while unauthorized arbitrary origins are rejected.
"""

import asyncio
import pytest
from backend.main import app


async def _dispatch_asgi(
    method: str,
    path: str,
    headers: list[tuple[bytes, bytes]],
    body: bytes = b"",
):
    """Lightweight ASGI dispatcher using native asyncio without external client dependencies."""
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

    messages = []

    async def receive():
        return {"type": "http.request", "body": body, "more_body": False}

    async def send(msg):
        messages.append(msg)

    await app(scope, receive, send)

    status_code = None
    response_headers = {}
    response_body = b""

    for msg in messages:
        if msg["type"] == "http.response.start":
            status_code = msg["status"]
            response_headers = {
                k.decode("latin1").lower(): v.decode("latin1")
                for k, v in msg.get("headers", [])
            }
        elif msg["type"] == "http.response.body":
            response_body += msg.get("body", b"")

    return status_code, response_headers, response_body


def test_cors_preflight_options_exact_vercel_origin():
    """Verify that the exact production Vercel frontend receives valid preflight CORS headers."""
    origin = "https://scamai-mljh22p4w-deepjyotis-projects-29b71e0c.vercel.app"
    headers = [
        (b"origin", origin.encode()),
        (b"access-control-request-method", b"POST"),
        (b"access-control-request-headers", b"content-type"),
    ]

    status, resp_headers, _ = asyncio.run(
        _dispatch_asgi("OPTIONS", "/api/investigations/analyze", headers)
    )

    assert status == 200
    assert resp_headers.get("access-control-allow-origin") == origin
    allowed_methods = resp_headers.get("access-control-allow-methods", "")
    assert "POST" in allowed_methods
    assert "OPTIONS" in allowed_methods
    # Credentials should remain disabled
    assert resp_headers.get("access-control-allow-credentials") is None or resp_headers.get("access-control-allow-credentials") == "false"


def test_cors_preflight_options_canonical_vercel_domain():
    """Verify that the canonical production Vercel domain receives preflight approval."""
    origin = "https://scamai.vercel.app"
    headers = [
        (b"origin", origin.encode()),
        (b"access-control-request-method", b"GET"),
    ]

    status, resp_headers, _ = asyncio.run(
        _dispatch_asgi("OPTIONS", "/health", headers)
    )

    assert status == 200
    assert resp_headers.get("access-control-allow-origin") == origin


def test_cors_preflight_options_preview_branch_deployment():
    """Verify that narrowly-scoped Vercel preview HTTPS deployments match the origin regex."""
    preview_origin = "https://scamai-git-main-deepjyotis-projects-29b71e0c.vercel.app"
    headers = [
        (b"origin", preview_origin.encode()),
        (b"access-control-request-method", b"POST"),
        (b"access-control-request-headers", b"content-type"),
    ]

    status, resp_headers, _ = asyncio.run(
        _dispatch_asgi("OPTIONS", "/api/investigations/analyze", headers)
    )

    assert status == 200
    assert resp_headers.get("access-control-allow-origin") == preview_origin


def test_cors_get_health_with_allowed_vercel_origin():
    """Verify that GET /health returns Access-Control-Allow-Origin to the Vercel frontend."""
    origin = "https://scamai-mljh22p4w-deepjyotis-projects-29b71e0c.vercel.app"
    headers = [
        (b"origin", origin.encode()),
    ]

    status, resp_headers, body = asyncio.run(
        _dispatch_asgi("GET", "/health", headers)
    )

    assert status == 200
    assert resp_headers.get("access-control-allow-origin") == origin
    assert b"ok" in body


def test_cors_local_development_origins():
    """Verify that local development origins on port 5173 and 3000 are permitted."""
    for local_origin in ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"]:
        headers = [
            (b"origin", local_origin.encode()),
            (b"access-control-request-method", b"GET"),
        ]
        status, resp_headers, _ = asyncio.run(
            _dispatch_asgi("OPTIONS", "/health", headers)
        )
        assert status == 200, f"Failed preflight for {local_origin}"
        assert resp_headers.get("access-control-allow-origin") == local_origin


def test_cors_disallowed_origin_rejected():
    """Verify that arbitrary third-party origins are rejected with 400 Bad Request on preflight."""
    unauthorized_origin = "https://malicious-job-scam-hub.com"
    headers = [
        (b"origin", unauthorized_origin.encode()),
        (b"access-control-request-method", b"GET"),
    ]

    status, resp_headers, _ = asyncio.run(
        _dispatch_asgi("OPTIONS", "/health", headers)
    )

    assert status == 400
    assert "access-control-allow-origin" not in resp_headers
