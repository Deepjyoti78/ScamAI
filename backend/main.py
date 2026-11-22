"""FastAPI application entry point for ScamShield AI.

Provides health checks, model status inspection, and authentic ML-driven
job posting analysis endpoints.
"""

import sys
import os
import asyncio
import json
from pathlib import Path

# Ensure project root is in sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

try:
    from dotenv import load_dotenv
    load_dotenv(PROJECT_ROOT / ".env")
except ImportError:
    pass

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

from backend.schemas import (
    HealthResponse,
    JobAnalysisRequest,
    JobAnalysisResponse,
    ModelStatusResponse,
)
from backend.services.prediction import (
    ModelNotTrainedError,
    prediction_service,
)

app = FastAPI(
    title="ScamShield AI — Recruitment Fraud Detection API",
    description="Machine learning-powered detection and explanation of recruitment scams.",
    version="1.0.0",
)


class RequestBodyLimit:
    """Bound request buffering before JSON/Pydantic parsing, including chunked input."""
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope["type"] != "http" or scope.get("method") != "POST":
            return await self.app(scope, receive, send)
        body = bytearray()
        try:
            async with asyncio.timeout(5):
                while True:
                    message = await receive()
                    if message["type"] == "http.disconnect":
                        return
                    body.extend(message.get("body", b""))
                    if len(body) > 128 * 1024:
                        raise ValueError("Request too large")
                    if not message.get("more_body", False):
                        break
        except (ValueError, TimeoutError) as error:
            status_code = 413 if isinstance(error, ValueError) else 408
            payload = json.dumps({"detail": "Request is too large or timed out. Shorten the input and retry."}).encode()
            await send({"type": "http.response.start", "status": status_code, "headers": [(b"content-type", b"application/json")]})
            return await send({"type": "http.response.body", "body": payload})
        delivered = False
        async def replay():
            nonlocal delivered
            if not delivered:
                delivered = True
                return {"type": "http.request", "body": bytes(body), "more_body": False}
            return await receive()
        return await self.app(scope, replay, send)


app.add_middleware(RequestBodyLimit)

# Enable CORS for React frontend (Vercel production/preview deployments & local development)
ALLOWED_ORIGINS = [
    # Production and preview Vercel deployments
    "https://scamai.vercel.app",
    "https://scamai-mljh22p4w-deepjyotis-projects-29b71e0c.vercel.app",
    "https://scam-shield-ai.vercel.app",
    # Local development origins
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
]

# Narrowly scoped regex for Vercel HTTPS preview domains (scamai-*.vercel.app) and local development
CORS_ORIGIN_REGEX = (
    r"^(https:\/\/(scamai|scamai-[a-zA-Z0-9_-]+)\.vercel\.app|"
    r"http:\/\/(localhost|127\.0\.0\.1)(:[0-9]+)?)$"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_origin_regex=CORS_ORIGIN_REGEX,
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS", "HEAD"],
    allow_headers=["*"],
)


@app.get(
    "/health",
    response_model=HealthResponse,
    tags=["System"],
    summary="Application health check",
)
def get_health() -> HealthResponse:
    """Verify that the FastAPI service is running."""
    return HealthResponse(
        status="ok",
        app="ScamShield AI API",
        version="1.0.0",
        url_fetch_enabled=os.getenv("SCAMSHIELD_ENABLE_URL_FETCH", "false").lower() == "true",
    )


@app.get(
    "/model/status",
    response_model=ModelStatusResponse,
    tags=["Model"],
    summary="Check model availability and training metrics",
)
def get_model_status() -> ModelStatusResponse:
    """Check if the trained ML model is available on disk and inspect its metrics."""
    status_dict = prediction_service.get_status()
    return ModelStatusResponse(**status_dict)


@app.post(
    "/api/investigations/analyze",
    response_model=JobAnalysisResponse,
    tags=["Investigation"],
    summary="Analyze a job posting for recruitment fraud",
)
def analyze_job_posting(payload: JobAnalysisRequest) -> JobAnalysisResponse:
    """Analyze job posting text using the trained baseline ML model.

    Returns an uncalibrated model score, separate triage and explicit assessment state.
    Model/extraction unavailability returns HTTP 200 with an explicit non-completed analysis_status and null scores; malformed input returns HTTP 422.
    """
    try:
        response = prediction_service.analyze_job(payload)
        return response
    except ModelNotTrainedError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={
                "error": "MODEL_NOT_TRAINED",
                "message": str(e),
                "resolution": "Place the EMSCAD CSV in data/ and run 'python ml/train.py'.",
            },
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Analysis could not finish. Please retry later.",
        )


@app.post(
    "/api/investigations/analyze/stream",
    tags=["Investigation"],
    summary="Analyze a job posting with live Server-Sent Events progress updates",
)
async def analyze_job_posting_stream(payload: JobAnalysisRequest):
    """Execute job investigation and stream stage transitions for live progress cards.

    Emits SSE events:
    - 'stage_update' with card_id (1-5), status, and stage progress details
    - 'complete' with final JobAnalysisResponse
    - 'error' with error details
    """
    return StreamingResponse(
        prediction_service.stream_analyze_job(payload),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )

