"""Pydantic schemas for ScamShield AI FastAPI backend."""

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


class JobAnalysisRequest(BaseModel):
    """Input payload for job posting fraud analysis. Supports either a description or a job URL."""

    model_config = ConfigDict(populate_by_name=True, extra="ignore")

    description: Optional[str] = Field(
        default=None,
        description="The main job posting text or description.",
        json_schema_extra={"example": "We are seeking an entry-level Data Entry clerk. High pay, wire transfer required."},
    )
    title: Optional[str] = Field(
        default=None,
        description="Job title.",
        json_schema_extra={"example": "Data Entry Specialist"},
    )
    company_profile: Optional[str] = Field(
        default=None,
        description="Information about the hiring organization.",
    )
    requirements: Optional[str] = Field(
        default=None,
        description="Job requirements or qualifications.",
    )
    benefits: Optional[str] = Field(
        default=None,
        description="Offered perks, compensation, or benefits.",
    )
    employment_type: Optional[str] = Field(
        default=None,
        description="E.g., Full-time, Part-time, Contract.",
    )

    # Trust Chain & URL Extraction Fields
    job_url: Optional[str] = Field(
        default=None,
        description="Public job posting URL to analyze or extract content from.",
    )
    employer_name: Optional[str] = Field(
        default=None,
        description="Claimed employer or organization name.",
    )
    company_website: Optional[str] = Field(
        default=None,
        description="Official company website or careers portal URL.",
    )
    recruiter_email: Optional[str] = Field(
        default=None,
        description="Recruiter's contact email address.",
    )
    application_url: Optional[str] = Field(
        default=None,
        description="Application destination URL.",
    )
    recruiter_message: Optional[str] = Field(
        default=None,
        description="Recruiter message, email body, or additional context.",
    )

    @model_validator(mode="before")
    @classmethod
    def resolve_aliases(cls, data: Any) -> Any:
        """Map alternative field aliases seamlessly."""
        if isinstance(data, dict):
            # Job posting URL
            if "job_posting_url" in data and not data.get("job_url"):
                data["job_url"] = data.get("job_posting_url")
            # Claimed employer
            if "claimed_employer" in data and not data.get("employer_name"):
                data["employer_name"] = data.get("claimed_employer")
            # Official company URL
            if "official_company_url" in data and not data.get("company_website"):
                data["company_website"] = data.get("official_company_url")
            # Application destination URL
            if "application_destination_url" in data and not data.get("application_url"):
                data["application_url"] = data.get("application_destination_url")
            # Recruiter message or additional context
            if "additional_context" in data and not data.get("recruiter_message"):
                data["recruiter_message"] = data.get("additional_context")
        return data

    @model_validator(mode="after")
    def validate_input_present(self) -> "JobAnalysisRequest":
        """Ensure that either a job description or a job URL is provided."""
        has_desc_field = self.description is not None
        desc = (self.description or "").strip()
        url = (self.job_url or "").strip()

        if has_desc_field:
            if not desc:
                raise ValueError("Job description cannot be empty or purely whitespace.")
            if len(desc) < 10:
                raise ValueError("Job description is too brief. Please provide at least 10 non-whitespace characters.")
            self.description = desc

        if not desc and not url:
            raise ValueError("Either a job description (at least 10 characters) or a public job posting URL must be provided.")

        if url:
            self.job_url = url

        return self


class SignalAttribution(BaseModel):
    """Individual text token attribution score from the ML model."""

    term: str
    impact: float
    tfidf_score: Optional[float] = None
    coefficient: Optional[float] = None


class TrustChainFinding(BaseModel):
    """Structured result for a deterministic evidence check."""

    check_id: str = Field(description="Unique check identifier.")
    title: str = Field(description="Human-readable title of the check.")
    status: str = Field(description="'concern_observed', 'no_mismatch_observed', 'not_checked', or 'unable_to_determine'.")
    severity: str = Field(description="'critical', 'warning', 'informational', or 'neutral'.")
    observation: str = Field(description="Objective factual observation made during the check.")
    explanation: str = Field(description="Why this observation matters in the context of recruitment security.")
    recommended_action: str = Field(description="Actionable next step for the job seeker.")
    evidence_source: str = Field(description="Source of data inspected for this check.")


class TrustChainSummary(BaseModel):
    """Summary of deterministic trust chain checks."""

    total_checks: int
    executed_checks: int
    concerns_count: int
    no_mismatch_count: int
    unable_to_determine_count: int
    not_checked_count: int
    overall_trust_recommendation: str


class JobAnalysisResponse(BaseModel):
    """Response returned after ML inference and Trust Chain investigation."""

    prediction: int = Field(description="0 for Legitimate, 1 for Fraudulent based on 0.50 threshold.")
    label: str = Field(description="'Legitimate' or 'Fraudulent'.")
    risk_level: str = Field(description="'low', 'medium', or 'high'.")
    review_decision: str = Field(description="'auto_cleared', 'review_recommended', or 'flagged_suspicious'.")
    decision_rationale: str = Field(description="Explicit reasoning for review tier and risk rating.")
    fraud_probability: float = Field(description="Model-estimated posterior probability of fraud (0.0 to 1.0).")
    confidence: float = Field(description="Confidence score of the winning prediction class (0.5 to 1.0).")
    assessment_summary: str = Field(description="Contextual, evidence-grounded assessment summary.")
    top_suspicious_signals: List[SignalAttribution] = Field(default_factory=list)
    top_legitimate_signals: List[SignalAttribution] = Field(default_factory=list)
    inference_time_ms: Optional[float] = Field(
        default=None,
        description="Model execution latency in milliseconds on host machine.",
    )

    # URL Ingestion & Extraction metadata
    source_type: str = Field(
        default="pasted_text",
        description="'pasted_text' or 'extracted_url'",
    )
    extraction_status: Optional[str] = Field(
        default=None,
        description="'success', 'failed', 'blocked', 'unreachable', 'timeout', 'oversized', 'unsupported_content_type', 'security_violation', 'insufficient_content', or 'not_applicable'",
    )
    extracted_title: Optional[str] = Field(
        default=None,
        description="Page title extracted from the job URL.",
    )
    extracted_text_preview: Optional[str] = Field(
        default=None,
        description="Snippet preview of extracted job text.",
    )
    extraction_error: Optional[str] = Field(
        default=None,
        description="Detailed, safe explanation if URL extraction failed or was blocked.",
    )
    final_url: Optional[str] = Field(
        default=None,
        description="Final destination URL after any followed redirects.",
    )

    # Trust Chain Evidence Checks
    trust_chain_findings: List[TrustChainFinding] = Field(
        default_factory=list,
        description="Individual deterministic evidence check findings.",
    )
    trust_chain_summary: Optional[TrustChainSummary] = Field(
        default=None,
        description="Summary metrics and recommendations across all trust chain checks.",
    )


class ModelStatusResponse(BaseModel):
    """Response indicating the availability and metadata of the trained model."""

    model_available: bool
    model_path: str
    model_name: Optional[str] = None
    evaluation_metrics: Optional[Dict[str, Any]] = None
    message: str


class HealthResponse(BaseModel):
    """Basic health check response."""

    status: str
    app: str
    version: str
