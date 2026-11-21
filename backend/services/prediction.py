"""One workflow for synchronous and streamed analysis; no fitting."""
import asyncio
import json
import math
import os
from pathlib import Path
import time
from typing import Any, AsyncGenerator, Dict, Optional
import joblib
from backend.schemas import JobAnalysisRequest, JobAnalysisResponse, SignalAttribution
from backend.services.trust_chain import execute_trust_chain_investigation
from backend.services.url_extractor import extract_job_posting_from_url
from backend.services.web_research import execute_web_research
from ml.explain import explain_prediction
from ml.preprocess import build_model_input, clean_text

DEFAULT_MODEL_PATH = Path("models") / "baseline_model.joblib"
METRICS_REPORT_PATH = Path("reports") / "baseline_training_metrics.json"

class ModelNotTrainedError(Exception):
    pass

class PredictionService:
    def __init__(self, model_path: Optional[Path] = None):
        self.model_path = model_path or Path(os.getenv("MODEL_PATH", str(DEFAULT_MODEL_PATH)))
        self._pipeline = None

    def is_available(self):
        return self.model_path.exists()

    def get_pipeline(self):
        if not self.is_available():
            raise ModelNotTrainedError("The ML model is unavailable. Please retry later.")
        if self._pipeline is None:
            self._pipeline = joblib.load(self.model_path)
        return self._pipeline

    def get_status(self):
        available = self.is_available()
        return {"model_available": available, "model_path": self.model_path.name,
                "model_name": "TF-IDF + Logistic Regression (Balanced)", "evaluation_metrics": None,
                "message": "Model available; scores are uncalibrated." if available else "Model unavailable. Please retry later."}

    @staticmethod
    def _stage(card, status, detail):
        keys = ("validation", "extraction", "ml_analysis", "warning_signals", "trust_chain")
        titles = ("Validating submitted information", "Retrieving and extracting job details", "Analyzing content with ML model", "Checking scam warning signals", "Checking employer and domain consistency")
        return "stage_update", {"card_id": card, "key": keys[card-1], "title": titles[card-1], "description": titles[card-1], "status": status, "detail": detail}

    def _failure(self, code, message, metadata, start, extraction=False):
        return JobAnalysisResponse(analysis_status="unable_to_assess" if extraction else "not_scored",
            scoring_status="not_scored", error_code=code, prediction=None, label=None,
            risk_level="unknown", model_score=None, fraud_probability=None, confidence=None,
            review_decision="review_recommended", decision_rationale=message,
            assessment_summary=message, inference_time_ms=round((time.perf_counter()-start)*1000, 2), **metadata)

    def _run(self, req):
        start = time.perf_counter()
        meta = {"source_type": "pasted_text", "extraction_status": "not_applicable", "final_url": None}
        yield self._stage(1, "completed", "Input format validated.")
        description, title = req.description or "", req.title
        if not description.strip() and req.job_url:
            meta["source_type"] = "extracted_url"
            yield self._stage(2, "in_progress", "Retrieving job text under the server URL policy.")
            try:
                extracted = extract_job_posting_from_url(req.job_url)
            except Exception:
                extracted = None
            if extracted is None or extracted.status != "success" or len((extracted.extracted_text or "").strip()) < 40:
                status = extracted.status if extracted is not None else "failed"
                if status == "success":
                    status = "insufficient_content"
                meta["extraction_status"] = status
                message = "Unable to assess this URL: " + status.replace("_", " ") + ". Retry or paste the job description. No ML score was produced."
                meta["extraction_error"] = message
                yield self._stage(2, "failed", message)
                for card in (3, 4, 5):
                    yield self._stage(card, "skipped", "Not assessed: job text unavailable.")
                yield "complete", self._failure("EXTRACTION_" + status.upper(), message, meta, start, extraction=True)
                return
            description, title = extracted.extracted_text, title or extracted.title
            meta.update(extraction_status="success", final_url=extracted.final_url, extracted_title=extracted.title, extracted_text_preview=description[:280])
            yield self._stage(2, "completed", "Readable job text extracted.")
        else:
            yield self._stage(2, "skipped", "Direct text provided; retrieval skipped.")
        if not any(character.isalnum() for character in clean_text(description)):
            message = "No usable job text was provided. Paste a readable job description."
            for card in (3, 4, 5):
                yield self._stage(card, "skipped", message)
            yield "complete", self._failure("EMPTY_CONTENT", message, meta, start)
            return
        yield self._stage(3, "in_progress", "Computing an uncalibrated ML model score.")
        try:
            pipeline = self.get_pipeline()
            combined = build_model_input({"description": description, "title": title,
                "company_profile": req.company_profile, "requirements": req.requirements, "benefits": req.benefits})
            scores = pipeline.predict_proba([combined])[0]
            score = float(scores[1])
            if len(scores) != 2 or not all(math.isfinite(float(v)) and 0 <= float(v) <= 1 for v in scores) or abs(float(sum(scores))-1) > 1e-6:
                raise ValueError("Invalid classifier output")
            explanation = explain_prediction(pipeline, combined, top_k=5)
            def signals(key):
                return [SignalAttribution(term=item["term"], impact=round(float(item["impact"]), 4),
                    tfidf_score=round(float(item.get("tfidf_score", 0)), 4), coefficient=round(float(item.get("coefficient", 0)), 4)) for item in explanation.get(key, [])]
            suspicious, legitimate = signals("top_suspicious_features"), signals("top_legitimate_features")
        except Exception as error:
            code = "MODEL_UNAVAILABLE" if isinstance(error, ModelNotTrainedError) else "INFERENCE_FAILED"
            message = ("The ML model is unavailable." if code == "MODEL_UNAVAILABLE" else "The ML analysis could not finish.") + " No score or safety verdict was produced. Please retry later."
            yield self._stage(3, "failed", message)
            for card in (4, 5):
                yield self._stage(card, "skipped", "Investigation did not finish.")
            yield "complete", self._failure(code, message, meta, start)
            return
        prediction = int(score >= .50)
        risk = "high" if score >= .60 else "medium" if score >= .30 else "low"
        decision = "flagged_suspicious" if risk == "high" else "review_recommended" if risk == "medium" else "auto_cleared"
        rationale = f"ML score {score:.4f} uses fixed operational thresholds (0.30/0.60); it is not a verified probability of fraud."
        yield self._stage(3, "completed", f"ML model score {score:.4f}; not a verified fraud probability.")
        yield self._stage(4, "in_progress", "Inspecting text for fee and credential indicators.")
        try:
            trust = execute_trust_chain_investigation(description=description, title=title,
                company_profile=req.company_profile, requirements=req.requirements, benefits=req.benefits,
                employer_name=req.employer_name, company_website=req.company_website, recruiter_email=req.recruiter_email,
                application_url=req.application_url or meta.get("final_url") or req.job_url, recruiter_message=req.recruiter_message)
        except Exception:
            message = "Evidence checks could not finish. No final assessment was produced. Please retry."
            yield self._stage(4, "failed", message)
            yield self._stage(5, "skipped", "Investigation did not finish.")
            yield "complete", self._failure("EVIDENCE_FAILED", message, meta, start)
            return
        findings = trust["trust_chain_findings"]
        concerns = [f for f in findings if f["status"] == "concern_observed"]
        if any(f["severity"] == "critical" for f in concerns):
            risk, decision = "high", "flagged_suspicious"
        elif any(f["severity"] == "warning" for f in concerns) and risk == "low":
            risk, decision = "medium", "review_recommended"
        if concerns:
            rationale += " Rule indicators: " + ", ".join(f["title"] for f in concerns) + ". Indicators are not independently verified fraud findings."
        yield self._stage(4, "completed", "Text indicators checked; see individual observations and limitations.")
        yield self._stage(5, "in_progress", "Checking supplied domains and optional search evidence.")
        try:
            web_findings, web_summary = execute_web_research(employer_name=req.employer_name, job_title=title,
                company_website=req.company_website, recruiter_email=req.recruiter_email, application_url=req.application_url)
        except Exception:
            web_findings, web_summary = [], {"status": "search_unavailable", "overall_evidence_assessment": "Optional web search could not finish.", "limitations_disclaimer": "No positive or negative fraud inference follows from search failure."}
        if not isinstance(web_summary, dict):
            web_findings, web_summary = [], {"status": "search_unavailable", "overall_evidence_assessment": "Optional web search is unavailable.", "limitations_disclaimer": "No fraud inference follows from unavailable search."}
        if any(f.get("evidence_status") == "potential_domain_inconsistency" for f in web_findings) and risk == "low":
            risk, decision = "medium", "review_recommended"
            rationale += " Search returned a potential domain inconsistency; verify it independently."
        yield self._stage(5, "completed", "Available domain checks finished. Optional search: " + web_summary["status"] + ". Missing checks are not negative evidence.")
        yield "complete", JobAnalysisResponse(analysis_status="completed", scoring_status="scored", prediction=prediction,
            label="Fraudulent" if prediction else "Legitimate", risk_level=risk, review_decision=decision,
            decision_rationale=rationale, model_score=round(score, 4), fraud_probability=round(score, 4), confidence=round(float(max(scores)), 4),
            assessment_summary=rationale + " Verify the employer independently before sharing money or sensitive information.",
            top_suspicious_signals=suspicious, top_legitimate_signals=legitimate, trust_chain_findings=findings,
            trust_chain_summary=trust["trust_chain_summary"], web_research_findings=web_findings, web_research_summary=web_summary,
            inference_time_ms=round((time.perf_counter()-start)*1000, 2), **meta)

    def analyze_job(self, req: JobAnalysisRequest) -> JobAnalysisResponse:
        for event, data in self._run(req):
            if event == "complete":
                return data
        raise RuntimeError("Analysis did not produce a result")

    async def stream_analyze_job(self, req: JobAnalysisRequest) -> AsyncGenerator[str, None]:
        iterator = self._run(req)
        while True:
            item = await asyncio.to_thread(next, iterator, None)
            if item is None:
                return
            event, data = item
            if isinstance(data, JobAnalysisResponse):
                data = data.model_dump()
            yield f"event: {event}\ndata: {json.dumps(data)}\n\n"

prediction_service = PredictionService()
