from pathlib import Path
import sys

# Ensure project root is in sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

import pytest
from pydantic import ValidationError

from backend.schemas import JobAnalysisRequest
from backend.services.prediction import ModelNotTrainedError, PredictionService
from ml.preprocess import clean_text, extract_combined_text_from_dict


def test_clean_text_handles_null_and_empty():
    """Verify that clean_text handles None, floats, and empty strings safely."""
    assert clean_text(None) == ""
    assert clean_text("") == ""
    assert clean_text(float("nan")) == ""


def test_clean_text_strips_html_and_normalizes():
    """Verify that basic HTML tags and multiple spaces are stripped."""
    raw = "<p>Urgent <b>hiring</b>!   Please apply now.</p>"
    cleaned = clean_text(raw)
    assert "<p>" not in cleaned
    assert "<b>" not in cleaned
    assert "  " not in cleaned
    assert "urgent hiring! please apply now." == cleaned


def test_extract_combined_text_from_dict_handles_missing_fields():
    """Verify that extracting text from a partial or empty dict does not raise exceptions."""
    sample = {"title": "Software Engineer"}
    text = extract_combined_text_from_dict(sample)
    assert "title: software engineer" in text

    empty_sample = {}
    fallback_text = extract_combined_text_from_dict(empty_sample)
    assert fallback_text == "unspecified job opportunity"


def test_job_analysis_request_validation():
    """Verify that Pydantic enforces minimum length for description."""
    # Valid request
    valid_req = JobAnalysisRequest(description="This is a sufficiently long job description for validation.")
    assert valid_req.description is not None

    # Invalid: description too short (<10 chars)
    with pytest.raises(ValidationError):
        JobAnalysisRequest(description="Short")


def test_prediction_service_reports_missing_model():
    """Verify that PredictionService reports unavailable when model does not exist."""
    fake_path = Path("models") / "non_existent_model_test_12345.joblib"
    service = PredictionService(model_path=fake_path)

    assert service.is_available() is False
    status = service.get_status()
    assert status["model_available"] is False

    with pytest.raises(ModelNotTrainedError):
        service.get_pipeline()
