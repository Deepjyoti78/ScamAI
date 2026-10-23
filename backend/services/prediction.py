"""Model inference service for ScamShield AI.

Manages model lifecycle, artifact loading, inference execution, and explanation generation.
Ensures zero hardcoded or fabricated predictions.
"""

import json
import os
from pathlib import Path
from typing import Any, Dict, Optional
import time

import joblib

from backend.schemas import JobAnalysisRequest, JobAnalysisResponse, SignalAttribution
from backend.services.trust_chain import execute_trust_chain_investigation
from backend.services.url_extractor import extract_job_posting_from_url
from ml.explain import explain_prediction
from ml.preprocess import extract_combined_text_from_dict


DEFAULT_MODEL_PATH = Path("models") / "baseline_model.joblib"
METRICS_REPORT_PATH = Path("reports") / "baseline_training_metrics.json"


class ModelNotTrainedError(Exception):
    """Raised when an inference request is received but no model artifact exists."""

    pass


class PredictionService:
    """Singleton service to manage ML inference."""

    def __init__(self, model_path: Optional[Path] = None):
        self.model_path = model_path or Path(
            os.getenv("MODEL_PATH", str(DEFAULT_MODEL_PATH))
        )
        self._pipeline = None

    def is_available(self) -> bool:
        """Check whether the model file exists on disk."""
        return self.model_path.exists()

    def get_pipeline(self) -> Any:
        """Get or lazily load the trained scikit-learn pipeline."""
        if not self.is_available():
            raise ModelNotTrainedError(
                f"Model artifact not found at '{self.model_path.resolve()}'. "
                "Please run 'python ml/train.py' first."
            )
        if self._pipeline is None:
            self._pipeline = joblib.load(self.model_path)
        return self._pipeline

    def get_status(self) -> Dict[str, Any]:
        """Return model metadata and training evaluation metrics if available."""
        available = self.is_available()
        metrics = None
        if available and METRICS_REPORT_PATH.exists():
            try:
                with open(METRICS_REPORT_PATH, "r", encoding="utf-8") as f:
                    metrics = json.load(f)
            except Exception:
                pass

        return {
            "model_available": available,
            "model_path": str(self.model_path.resolve()),
            "model_name": "TF-IDF + Logistic Regression (Balanced)",
            "evaluation_metrics": metrics,
            "message": (
                "Model ready for inference."
                if available
                else "Model has not been trained yet. Place CSV in data/ and run 'python ml/train.py'."
            ),
        }

    def analyze_job(self, req: JobAnalysisRequest) -> JobAnalysisResponse:
        """Execute model inference and return genuine risk probabilities."""
        start_time = time.perf_counter()
        pipeline = self.get_pipeline()

        # 1. Determine whether input is pasted text or a public job URL
        has_description = bool(req.description and req.description.strip())
        source_type = "pasted_text"
        extraction_status = "not_applicable"
        extracted_title = None
        extracted_text_preview = None
        extraction_error = None
        final_url = req.job_url

        effective_description = req.description or ""
        effective_title = req.title

        if not has_description and req.job_url:
            source_type = "extracted_url"
            extraction_result = extract_job_posting_from_url(req.job_url)
            extraction_status = extraction_result.status
            extracted_title = extraction_result.title
            final_url = extraction_result.final_url or req.job_url

            if extraction_result.status != "success":
                extraction_error = extraction_result.error_message
                inference_time_ms = round((time.perf_counter() - start_time) * 1000, 2)

                # Execute Trust Chain with available metadata (no extracted text)
                trust_chain_result = execute_trust_chain_investigation(
                    description="",
                    title=effective_title or extracted_title,
                    company_profile=req.company_profile,
                    requirements=req.requirements,
                    benefits=req.benefits,
                    employer_name=req.employer_name,
                    company_website=req.company_website,
                    recruiter_email=req.recruiter_email,
                    application_url=req.application_url or req.job_url,
                    recruiter_message=req.recruiter_message,
                )

                return JobAnalysisResponse(
                    prediction=0,
                    label="Legitimate",
                    risk_level="low",
                    review_decision="review_recommended",
                    decision_rationale=(
                        f"Automated content extraction could not retrieve readable text from the target URL ({extraction_error}). "
                        "Without job description text, statistical ML fraud scoring cannot be performed. "
                        "This extraction limitation does not constitute evidence of fraud."
                    ),
                    fraud_probability=0.0,
                    confidence=0.5,
                    assessment_summary=(
                        f"Extraction incomplete ({extraction_status}): {extraction_error} "
                        "Please copy and paste the job description text manually to perform full ML fraud and language analysis."
                    ),
                    top_suspicious_signals=[],
                    top_legitimate_signals=[],
                    inference_time_ms=inference_time_ms,
                    source_type=source_type,
                    extraction_status=extraction_status,
                    extracted_title=extracted_title,
                    extracted_text_preview=None,
                    extraction_error=extraction_error,
                    final_url=final_url,
                    trust_chain_findings=trust_chain_result["trust_chain_findings"],
                    trust_chain_summary=trust_chain_result["trust_chain_summary"],
                )

            # Successful URL extraction: use extracted text for model and trust chain
            effective_description = extraction_result.extracted_text or ""
            if not effective_title and extracted_title:
                effective_title = extracted_title
            snippet = effective_description[:280]
            extracted_text_preview = snippet + ("..." if len(effective_description) > 280 else "")

        # Convert request to dictionary matching training feature fields
        sample = {
            "description": effective_description,
            "title": effective_title,
            "company_profile": req.company_profile,
            "requirements": req.requirements,
            "benefits": req.benefits,
            "employment_type": req.employment_type,
        }

        # Exactly parallel the training text combination pipeline
        combined_text = extract_combined_text_from_dict(sample)

        # Probabilities: class 0 = Legit, class 1 = Fraud
        probas = pipeline.predict_proba([combined_text])[0]
        fraud_prob = float(probas[1])
        prediction = int(fraud_prob >= 0.50)

        # 1. Explain prediction with token attribution first so summary can reference actual evidence
        explanation = explain_prediction(pipeline, combined_text, top_k=5)

        suspicious_signals = [
            SignalAttribution(
                term=item["term"],
                impact=round(float(item["impact"]), 4),
                tfidf_score=round(float(item.get("tfidf_score", 0.0)), 4),
                coefficient=round(float(item.get("coefficient", 0.0)), 4),
            )
            for item in explanation.get("top_suspicious_features", [])
        ]
        legitimate_signals = [
            SignalAttribution(
                term=item["term"],
                impact=round(float(item["impact"]), 4),
                tfidf_score=round(float(item.get("tfidf_score", 0.0)), 4),
                coefficient=round(float(item.get("coefficient", 0.0)), 4),
            )
            for item in explanation.get("top_legitimate_features", [])
        ]

        # 2. Binary Model Decision
        label = "Fraudulent" if prediction == 1 else "Legitimate"
        confidence = float(max(probas))
        pct_str = f"{fraud_prob * 100:.1f}%"

        # Identify prominent predictive associations
        prominent_suspicious = [f'"{s.term}"' for s in suspicious_signals if s.impact >= 0.35][:3]
        prominent_legit = [f'"{s.term}"' for s in legitimate_signals if abs(s.impact) >= 0.20][:3]

        # 3. Application Risk Tier & Review Decision
        # Thresholds:
        # High Risk: P >= 0.60
        # Medium Risk / Review Recommended: 0.30 <= P < 0.60
        # Low Risk / Auto-cleared: P < 0.30
        if fraud_prob >= 0.60:
            risk_level = "high"
            review_decision = "flagged_suspicious"
            decision_rationale = (
                f"The model evaluated this posting with a high estimated fraud probability ({pct_str}), "
                "well above the 60% high-risk threshold. Strong statistical patterns associated with fraudulent listings were identified."
            )
            if prominent_suspicious:
                summary = (
                    f"Elevated fraud indicators detected ({pct_str} estimated probability). "
                    f"Text patterns such as {', '.join(prominent_suspicious)} show strong positive association with recruitment scam listings in the EMSCAD benchmark. "
                    "Exercise high caution and verify the employer through official external channels."
                )
            else:
                summary = (
                    f"Elevated cumulative text patterns associated with recruitment fraud were identified ({pct_str} estimated probability). "
                    "Exercise caution and avoid sending payment, sensitive credentials, or deposit fees."
                )

        elif fraud_prob >= 0.30:
            risk_level = "medium"
            review_decision = "review_recommended"
            if prediction == 1:
                decision_rationale = (
                    f"The model classifies this posting as Fraudulent based on the 50% cutoff ({pct_str} probability), "
                    "but prediction confidence is moderate. Manual review is recommended to inspect specific claims before concluding."
                )
                summary = (
                    f"The model leans toward Fraudulent ({pct_str} probability), but operates with moderate confidence. "
                    "Human review is recommended to inspect specific offer details and verify employer legitimacy directly."
                )
            else:
                decision_rationale = (
                    f"The model's primary classification is Legitimate ({pct_str} fraud probability), but review is recommended "
                    "because the probability is noticeably elevated above the low-risk baseline (<30%), indicating mixed linguistic signals."
                )
                if prominent_suspicious:
                    summary = (
                        f"The model classifies this posting as Legitimate, but human review is recommended due to an elevated fraud probability ({pct_str}). "
                        f"Mild risk associations were observed around {', '.join(prominent_suspicious)}, mixed with legitimate terminology. "
                        "Verify recruiter identity and job offer details before proceeding."
                    )
                else:
                    summary = (
                        f"The model classifies this posting as Legitimate, but manual review is advised because the estimated probability ({pct_str}) "
                        "lies in the borderline review zone. Exercise standard prudence and confirm employer contact details."
                    )
        else:
            risk_level = "low"
            review_decision = "auto_cleared"
            decision_rationale = (
                f"The posting displays low statistical indicators of fraud ({pct_str} probability) "
                "and stays well below the 30% review threshold."
            )
            if prominent_legit:
                summary = (
                    f"Low probability of fraud detected ({pct_str}). "
                    f"Text patterns strongly align with legitimate job listings in the benchmark (e.g., {', '.join(prominent_legit)}). "
                    "Standard career due diligence is always advised."
                )
            else:
                summary = (
                    f"Low probability of fraud detected ({pct_str}). "
                    "Text patterns align with legitimate job postings without significant scam indicators. "
                    "Continue standard career diligence."
                )

        # 4. Execute Deterministic Trust Chain Investigation
        trust_chain_result = execute_trust_chain_investigation(
            description=effective_description,
            title=effective_title,
            company_profile=req.company_profile,
            requirements=req.requirements,
            benefits=req.benefits,
            employer_name=req.employer_name,
            company_website=req.company_website,
            recruiter_email=req.recruiter_email,
            application_url=req.application_url or (req.job_url if source_type == "pasted_text" else None),
            recruiter_message=req.recruiter_message,
        )

        # Reconcile Trust Chain findings with application review decision without altering the ML model's prediction
        trust_findings = trust_chain_result["trust_chain_findings"]
        trust_summary = trust_chain_result["trust_chain_summary"]

        critical_trust_concerns = [
            f for f in trust_findings if f["status"] == "concern_observed" and f["severity"] == "critical"
        ]
        warning_trust_concerns = [
            f for f in trust_findings if f["status"] == "concern_observed" and f["severity"] == "warning"
        ]

        if critical_trust_concerns and review_decision != "flagged_suspicious":
            # Model prediction remains unchanged (e.g., 0 Legitimate), but review decision is escalated
            review_decision = "flagged_suspicious"
            risk_level = "high"
            concerned_titles = ", ".join([c["title"] for c in critical_trust_concerns])
            decision_rationale = (
                f"While the ML model evaluated the textual description as {label} ({pct_str} fraud probability), "
                f"an independent deterministic Trust Chain check detected critical concern(s): {concerned_titles}. "
                "Immediate caution is warranted regardless of statistical model scoring."
            )
            summary = (
                f"High-risk factual demand detected ({concerned_titles}). Even though NLP textual patterns yielded a {pct_str} "
                f"fraud score ({label}), direct requests for upfront payment or credentials violate safety standards. Do not comply with these requests."
            )
        elif warning_trust_concerns and review_decision == "auto_cleared":
            review_decision = "review_recommended"
            risk_level = "medium"
            concerned_titles = ", ".join([w["title"] for w in warning_trust_concerns])
            decision_rationale = (
                f"The ML text model evaluated the description as Legitimate ({pct_str} fraud probability), "
                f"but an independent Trust Chain check observed cross-source domain inconsistency ({concerned_titles}). "
                "Manual identity verification is recommended before sharing applicant details."
            )

        # Calculate exact model compute time in milliseconds
        inference_time_ms = round((time.perf_counter() - start_time) * 1000, 2)

        return JobAnalysisResponse(
            prediction=prediction,
            label=label,
            risk_level=risk_level,
            review_decision=review_decision,
            decision_rationale=decision_rationale,
            fraud_probability=round(fraud_prob, 4),
            confidence=round(confidence, 4),
            assessment_summary=summary,
            top_suspicious_signals=suspicious_signals,
            top_legitimate_signals=legitimate_signals,
            inference_time_ms=inference_time_ms,
            source_type=source_type,
            extraction_status=extraction_status,
            extracted_title=extracted_title,
            extracted_text_preview=extracted_text_preview,
            extraction_error=extraction_error,
            final_url=final_url,
            trust_chain_findings=trust_findings,
            trust_chain_summary=trust_summary,
        )


# Global service instance
prediction_service = PredictionService()
