"""FastAPI application entry point for ScamShield AI.

Provides health checks, model status inspection, and authentic ML-driven
job posting analysis endpoints.
"""

import sys
from pathlib import Path

# Ensure project root is in sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware

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

# Enable CORS for React frontend (Vite default is http://localhost:5173 or http://127.0.0.1:5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
    ],
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1)(:[0-9]+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    allow_private_network=True,
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

    Returns risk probability, risk level, and token attribution signals.
    Returns HTTP 503 if the model has not been trained yet.
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
            detail=f"Inference error: {str(e)}",
        )
