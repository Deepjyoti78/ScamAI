// Investigation types — connected with ScamShield AI FastAPI backend and Trust Chain Engine

export type RiskLevel = 'low' | 'medium' | 'high' | 'unknown';

export type TrustChainStatus =
  | 'concern_observed'
  | 'no_mismatch_observed'
  | 'not_checked'
  | 'unable_to_determine';

export type TrustChainSeverity = 'critical' | 'warning' | 'informational' | 'neutral';

export interface TrustChainFinding {
  check_id: string;
  title: string;
  status: TrustChainStatus;
  severity: TrustChainSeverity;
  observation: string;
  explanation: string;
  recommended_action: string;
  evidence_source: string;
}

export interface TrustChainSummary {
  total_checks: number;
  executed_checks: number;
  concerns_count: number;
  no_mismatch_count: number;
  unable_to_determine_count: number;
  not_checked_count: number;
  overall_trust_recommendation: string;
}

export interface SignalAttribution {
  term: string;
  impact: number;
  tfidf_score?: number;
  coefficient?: number;
}

export interface BackendJobAnalysisRequest {
  description?: string;
  title?: string;
  company_profile?: string;
  requirements?: string;
  benefits?: string;
  employment_type?: string;

  // Trust Chain & URL Ingestion Inputs
  job_url?: string;
  employer_name?: string;
  company_website?: string;
  recruiter_email?: string;
  application_url?: string;
  recruiter_message?: string;
}

export interface BackendJobAnalysisResponse {
  prediction: number;
  label: string;
  risk_level: RiskLevel;
  review_decision?: string;
  decision_rationale?: string;
  fraud_probability: number;
  confidence: number;
  assessment_summary: string;
  top_suspicious_signals: SignalAttribution[];
  top_legitimate_signals: SignalAttribution[];
  inference_time_ms?: number;

  // URL Ingestion & Extraction metadata
  source_type?: 'pasted_text' | 'extracted_url';
  extraction_status?: string;
  extracted_title?: string;
  extracted_text_preview?: string;
  extraction_error?: string;
  final_url?: string;

  // Trust Chain Evidence Checks
  trust_chain_findings?: TrustChainFinding[];
  trust_chain_summary?: TrustChainSummary;
}

export interface EvidenceSignal {
  id: string;
  label: string;
  description: string;
  weight: number; // 0–1 or impact score
  impact?: number;
  tfidfScore?: number;
  coefficient?: number;
  flagged: boolean;
}

export interface Investigation {
  id: string;
  jobTitle: string;
  employer: string;
  location: string;
  employmentType: string;
  salaryRange?: string;
  sourceUrl?: string;
  sourceDescription?: string;
  submittedAt: string;
  riskLevel: RiskLevel;
  assessmentLabel: string;
  assessmentSummary: string;
  signals: EvidenceSignal[];

  // URL Ingestion & Extraction metadata
  sourceType?: 'pasted_text' | 'extracted_url';
  extractionStatus?: string;
  extractedTitle?: string;
  extractedTextPreview?: string;
  extractionError?: string;
  finalUrl?: string;

  // Trust Chain metadata
  companyWebsite?: string;
  recruiterEmail?: string;
  applicationUrl?: string;
  recruiterMessage?: string;
  trustChainFindings?: TrustChainFinding[];
  trustChainSummary?: TrustChainSummary;

  // Real ML inference metadata
  isRealAnalysis?: boolean;
  prediction?: number;
  reviewDecision?: string;
  decisionRationale?: string;
  fraudProbability?: number; // 0.0 to 1.0 (e.g. 0.9822 for 98.22%)
  confidence?: number;
  inferenceTimeMs?: number;
  topSuspiciousSignals?: SignalAttribution[];
  topLegitimateSignals?: SignalAttribution[];
}

export interface InvestigationFormData {
  jobUrl?: string;
  jobTitle?: string;
  employer?: string;
  companyWebsite?: string;
  recruiterEmail?: string;
  applicationUrl?: string;
  recruiterMessage?: string;
  employmentType?: string;
  jobDescription: string;
}

export interface HealthResponse {
  status: string;
  app: string;
  version: string;
}

export interface ModelStatusResponse {
  model_available: boolean;
  model_path: string;
  model_name?: string;
  evaluation_metrics?: Record<string, unknown>;
  message: string;
}
