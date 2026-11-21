import type {
  BackendJobAnalysisRequest,
  BackendJobAnalysisResponse,
  EvidenceSignal,
  HealthResponse,
  Investigation,
  InvestigationStageState,
  InvestigationStageUpdate,
  ModelStatusResponse,
} from '../types/investigation';

// Resolve API base URL from Vite environment variables (matching current window hostname if on loopback)
function resolveApiBaseUrl(): string {
  const envUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
  if (typeof window !== 'undefined' && window.location) {
    const currentHost = window.location.hostname;
    try {
      const parsed = new URL(envUrl);
      if (
        (parsed.hostname === '127.0.0.1' || parsed.hostname === 'localhost') &&
        (currentHost === '127.0.0.1' || currentHost === 'localhost')
      ) {
        parsed.hostname = currentHost;
        return parsed.origin.replace(/\/+$/, '');
      }
    } catch {
      // fallback to envUrl
    }
  }
  return envUrl.replace(/\/+$/, '');
}

export const API_BASE_URL = resolveApiBaseUrl();

export class ApiError extends Error {
  statusCode?: number;
  code?: string;
  detail?: string;
  isRetryable: boolean;

  constructor(
    message: string,
    options?: {
      statusCode?: number;
      code?: string;
      detail?: string;
      isRetryable?: boolean;
    }
  ) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = options?.statusCode;
    this.code = options?.code;
    this.detail = options?.detail;
    this.isRetryable = options?.isRetryable ?? true;
  }
}

/**
 * Check backend connection status via GET /health.
 * Returns true if the service is reachable and responding with status "ok".
 */
export async function checkApiHealth(): Promise<{
  isConnected: boolean;
  data?: HealthResponse;
  error?: string;
}> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      return {
        isConnected: false,
        error: `Backend responded with HTTP ${response.status}`,
      };
    }

    const data: HealthResponse = await response.json();
    return {
      isConnected: data.status === 'ok',
      data,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Connection failed';
    return {
      isConnected: false,
      error: message,
    };
  }
}

/**
 * Fetch trained model availability and metrics via GET /model/status.
 */
export async function getModelStatus(): Promise<ModelStatusResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/model/status`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      throw new ApiError(`Model status returned HTTP ${response.status}`, {
        statusCode: response.status,
      });
    }

    return await response.json();
  } catch (err: unknown) {
    if (err instanceof ApiError) throw err;
    throw new ApiError('Unable to connect to model status service.', {
      code: 'NETWORK_ERROR',
    });
  }
}

/**
 * Send job description and metadata to FastAPI for genuine ML fraud inference.
 * Endpoint: POST /api/investigations/analyze
 */
export function validateAnalysisResponse(raw: unknown): BackendJobAnalysisResponse {
  if (!raw || typeof raw !== 'object') throw new ApiError('Invalid analysis response.');
  const data = raw as BackendJobAnalysisResponse;
  const validScore = typeof data.fraud_probability === 'number' && Number.isFinite(data.fraud_probability) && data.fraud_probability >= 0 && data.fraud_probability <= 1;
  if (!['completed', 'unable_to_assess', 'not_scored'].includes(data.analysis_status) || !data.assessment_summary) throw new ApiError('The server did not provide a valid assessment state.');
  if (data.analysis_status === 'completed') {
    if (data.scoring_status !== 'scored' || !validScore || data.model_score !== data.fraud_probability || !data.label || ![0, 1].includes(data.prediction as number) || !['low', 'medium', 'high'].includes(data.risk_level)) throw new ApiError('The completed analysis is missing a valid model score.');
  } else if (data.scoring_status !== 'not_scored' || data.fraud_probability !== null || data.model_score !== null || data.confidence !== null || data.prediction !== null || data.risk_level !== 'unknown' || data.label !== null) {
    throw new ApiError('An unavailable analysis contained an invalid score or verdict.');
  }
  return data;
}

export async function analyzeJobPosting(requestData: BackendJobAnalysisRequest): Promise<BackendJobAnalysisResponse> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 45000);
  try {
    const response = await fetch(`${API_BASE_URL}/api/investigations/analyze`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestData), signal: controller.signal,
    });
    if (!response.ok) throw new ApiError(`Analysis could not finish (HTTP ${response.status}). Please retry.`, { statusCode: response.status });
    return validateAnalysisResponse(await response.json());
  } finally { clearTimeout(timer); }
}

/**
 * Initial 5-card stages matching the design specification and reference layout.
 */
export function getInitialInvestigationStages(): InvestigationStageState[] {
  return [
    {
      id: 1,
      key: 'validation',
      stepNumber: '01',
      title: 'Validating submitted information',
      description: 'Checking input format, required fields, and URL safety.',
      status: 'pending',
    },
    {
      id: 2,
      key: 'extraction',
      stepNumber: '02',
      title: 'Retrieving and extracting job details',
      description: 'Fetching the job posting and extracting relevant content.',
      status: 'pending',
    },
    {
      id: 3,
      key: 'ml_analysis',
      stepNumber: '03',
      title: 'Analyzing content with ML model',
      description: 'Running the extracted text through our trained model.',
      status: 'pending',
    },
    {
      id: 4,
      key: 'warning_signals',
      stepNumber: '04',
      title: 'Checking scam warning signals',
      description: 'Detecting payment requests, credential demands, and other red flags.',
      status: 'pending',
    },
    {
      id: 5,
      key: 'trust_chain',
      stepNumber: '05',
      title: 'Verifying employer and domain consistency',
      description: 'Comparing employer, recruiter, and application details.',
      status: 'pending',
    },
  ];
}

/**
 * Executes the 5-stage job investigation via Server-Sent Events (SSE) streaming.
 * Provides genuine, real-time card updates as the backend executes each stage:
 * 1. Validation
 * 2. URL Retrieval & Extraction
 * 3. ML Model Inference
 * 4. Scam Warning Signals
 * 5. Trust Chain Consistency
 *
 * If streaming is not supported by the network or reverse proxy, falls back
 * transparently to the standard analyzeJobPosting API while updating cards.
 */
export async function analyzeJobPostingWithStream(
  requestData: BackendJobAnalysisRequest,
  onStageUpdate: (update: InvestigationStageUpdate) => void,
  abortSignal?: AbortSignal
): Promise<BackendJobAnalysisResponse> {
  const controller = new AbortController();
  const abort = () => controller.abort();
  abortSignal?.addEventListener('abort', abort, { once: true });
  if (abortSignal?.aborted) controller.abort();
  const timer = setTimeout(abort, 45000);
  let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
  try {
    const response = await fetch(`${API_BASE_URL}/api/investigations/analyze/stream`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
      body: JSON.stringify(requestData), signal: controller.signal,
    });
    if (!response.ok) throw new ApiError(`Analysis could not start (HTTP ${response.status}). Check your input and retry.`, { statusCode: response.status });
    if (!response.body || !response.headers.get('content-type')?.includes('text/event-stream')) throw new ApiError('The live connection is unavailable. Please retry.');
    reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let result: BackendJobAnalysisResponse | undefined;
    while (true) {
      const { done, value } = await reader.read();
      buffer += done ? decoder.decode() : decoder.decode(value, { stream: true });
      if (buffer.length > 262144) throw new ApiError('The live response exceeded its limit.');
      let boundary: RegExpExecArray | null;
      while ((boundary = /\r?\n\r?\n/.exec(buffer))) {
        if (buffer.length > 262144) throw new ApiError('The investigation response exceeded its supported size.');
        const frame = buffer.slice(0, boundary.index);
        buffer = buffer.slice(boundary.index + boundary[0].length);
        const lines = frame.split(/\r?\n/);
        const event = lines.find(line => line.startsWith('event:'))?.slice(6).trim();
        const body = lines.filter(line => line.startsWith('data:')).map(line => line.slice(5).trimStart()).join('\n');
        if (!body) continue;
        const data: unknown = JSON.parse(body);
        if (event === 'error') throw new ApiError('The investigation could not finish. Please retry.');
        if (event === 'stage_update') onStageUpdate(data as InvestigationStageUpdate);
        if (event === 'complete') {
          if (result) throw new ApiError('Duplicate final response.');
          result = validateAnalysisResponse(data);
        }
      }
      if (buffer.length > 262144) throw new ApiError('The investigation response exceeded its supported size.');
      if (done) break;
    }
    if (controller.signal.aborted) throw new ApiError('Investigation cancelled or timed out.');
    if (!result || buffer.trim()) throw new ApiError('Connection ended before the investigation finished. Please retry; no result was saved.');
    return result;
  } catch (error) {
    if (abortSignal?.aborted) throw new ApiError('Investigation cancelled.', { code: 'ABORTED', isRetryable: false });
    if (controller.signal.aborted) throw new ApiError('Investigation timed out. Please retry.');
    if (error instanceof ApiError) throw error;
    throw new ApiError('The live investigation was interrupted. Please retry; no result was saved.');
  } finally {
    clearTimeout(timer);
    abortSignal?.removeEventListener('abort', abort);
    await reader?.cancel().catch(() => undefined);
  }
}

/**
 * Transforms the real backend response into a full typed Investigation record
 * for consistent rendering in the results view.
 */
export function buildInvestigationRecord(
  input: {
    jobTitle?: string;
    employer?: string;
    location?: string;
    employmentType?: string;
    salaryRange?: string;
    sourceUrl?: string;
    companyWebsite?: string;
    recruiterEmail?: string;
    applicationUrl?: string;
    recruiterMessage?: string;
    sourceDescription: string;
  },
  response: BackendJobAnalysisResponse
): Investigation {
  const isHighRisk = response.risk_level === 'high';
  const isMediumRisk = response.risk_level === 'medium';

  let assessmentLabel = response.analysis_status === 'completed' ? 'Lower model score' : 'Unable to assess';
  if (response.analysis_status !== 'completed') {
    assessmentLabel = 'Unable to assess';
  } else if (response.review_decision === 'flagged_suspicious' || isHighRisk) {
    assessmentLabel = 'Suspicious';
  } else if (response.review_decision === 'review_recommended' || isMediumRisk) {
    assessmentLabel = 'Review Recommended';
  } else {
    assessmentLabel = 'Lower model score';
  }

  // Find max absolute impact for relative weight scaling
  const allImpacts = [
    ...(response.top_suspicious_signals || []).map((s) => Math.abs(s.impact)),
    ...(response.top_legitimate_signals || []).map((s) => Math.abs(s.impact)),
  ];
  const maxImpact = Math.max(...allImpacts, 1.0);

  // Convert suspicious terms into evidence signals
  const suspiciousEvidence: EvidenceSignal[] = (response.top_suspicious_signals || []).map(
    (signal, index) => {
      const normalizedWeight = Math.min(1.0, Math.max(0.05, Math.abs(signal.impact) / maxImpact));
      return {
        id: `sig-susp-${index + 1}`,
        label: `"${signal.term}"`,
        description: `Statistical association with recruitment fraud in training data (predictive impact: +${signal.impact.toFixed(
          2
        )}). Represents textual correlation, not factual proof.`,
        weight: normalizedWeight,
        impact: signal.impact,
        tfidfScore: signal.tfidf_score,
        coefficient: signal.coefficient,
        flagged: true,
      };
    }
  );

  // Convert legitimate terms into evidence signals
  const legitimateEvidence: EvidenceSignal[] = (response.top_legitimate_signals || []).map(
    (signal, index) => {
      const normalizedWeight = Math.min(1.0, Math.max(0.05, Math.abs(signal.impact) / maxImpact));
      return {
        id: `sig-legit-${index + 1}`,
        label: `"${signal.term}"`,
        description: `Statistical association with legitimate benchmark postings (predictive impact: ${signal.impact.toFixed(
          2
        )}).`,
        weight: normalizedWeight,
        impact: signal.impact,
        tfidfScore: signal.tfidf_score,
        coefficient: signal.coefficient,
        flagged: false,
      };
    }
  );

  const combinedSignals = [...suspiciousEvidence, ...legitimateEvidence];

  const investigation: Investigation = {
    id: `inv-real-${Date.now()}`,
    jobTitle: input.jobTitle?.trim() || response.extracted_title?.trim() || 'Analyzed Job Posting',
    employer: input.employer?.trim() || 'Submitted Posting (Text)',
    location: input.location?.trim() || 'Unspecified Location',
    employmentType: input.employmentType?.trim() || 'Unspecified Type',
    salaryRange: input.salaryRange?.trim() || undefined,
    sourceUrl: response.final_url || input.sourceUrl?.trim() || undefined,
    companyWebsite: input.companyWebsite?.trim() || undefined,
    recruiterEmail: input.recruiterEmail?.trim() || undefined,
    applicationUrl: input.applicationUrl?.trim() || undefined,
    recruiterMessage: input.recruiterMessage?.trim() || undefined,
    sourceDescription: input.sourceDescription?.trim() || response.extracted_text_preview || response.assessment_summary,
    submittedAt: new Date().toISOString(),
    riskLevel: response.risk_level,
    assessmentLabel,
    assessmentSummary: response.assessment_summary,
    signals: combinedSignals,

    // URL Ingestion & Extraction metadata
    sourceType: response.source_type || (input.sourceUrl ? 'extracted_url' : 'pasted_text'),
    extractionStatus: response.extraction_status,
    extractedTitle: response.extracted_title,
    extractedTextPreview: response.extracted_text_preview,
    extractionError: response.extraction_error,
    finalUrl: response.final_url || input.sourceUrl,

    // Trust Chain Evidence Checks
    trustChainFindings: response.trust_chain_findings,
    trustChainSummary: response.trust_chain_summary,

    // External Web Research Evidence
    webResearchFindings: response.web_research_findings,
    webResearchSummary: response.web_research_summary,

    // Real ML model fields
    analysisStatus: response.analysis_status,
    errorCode: response.error_code,
    isRealAnalysis: true,
    prediction: response.prediction,
    reviewDecision: response.review_decision,
    decisionRationale: response.decision_rationale,
    fraudProbability: response.fraud_probability,
    confidence: response.confidence,
    inferenceTimeMs: response.inference_time_ms,
    topSuspiciousSignals: response.top_suspicious_signals,
    topLegitimateSignals: response.top_legitimate_signals,
  };

  return investigation;
}

function normalizeStored(record: Investigation): Investigation | undefined {
  if (!record || typeof record.id !== 'string' || typeof record.jobTitle !== 'string' || !Array.isArray(record.signals) || !['low','medium','high','unknown'].includes(record.riskLevel) || typeof record.assessmentLabel !== 'string') return undefined;
  if (record.isRealAnalysis && (!record.analysisStatus || record.extractionStatus && !['success', 'not_applicable'].includes(record.extractionStatus))) {
    return { ...record, analysisStatus: 'unable_to_assess', riskLevel: 'unknown', assessmentLabel: 'Unable to assess',
      fraudProbability: null, confidence: null, prediction: null, reviewDecision: 'review_recommended',
      assessmentSummary: 'This older result does not include a verified assessment state. Run the analysis again.', signals: [] };
  }
  return record;
}

const STORAGE_KEY_LATEST = 'latestInvestigation';
const STORAGE_KEY_HISTORY = 'scamshield_real_investigations';

/**
 * Persists an investigation record in sessionStorage.
 */
export function persistInvestigation(record: Investigation): void {
  try {
    sessionStorage.setItem(STORAGE_KEY_LATEST, JSON.stringify(record));
    sessionStorage.setItem(`investigation_${record.id}`, JSON.stringify(record));

    // Also append to history list
    const historyJson = sessionStorage.getItem(STORAGE_KEY_HISTORY);
    const history: Investigation[] = historyJson ? JSON.parse(historyJson) : [];
    const filtered = history.filter((item) => item.id !== record.id);
    filtered.unshift(record);
    // Keep last 20
    sessionStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(filtered.slice(0, 20)));
  } catch {
    console.warn('Investigation could not be saved in this browser session.');
  }
}

/**
 * Retrieve an investigation by ID from sessionStorage.
 */
export function getStoredInvestigation(id: string): Investigation | undefined {
  try {
    // Check specific id
    const specific = sessionStorage.getItem(`investigation_${id}`);
    if (specific) return normalizeStored(JSON.parse(specific));

    // Check latest
    const latest = sessionStorage.getItem(STORAGE_KEY_LATEST);
    if (latest) {
      const parsed: Investigation = JSON.parse(latest);
      if (parsed.id === id) return normalizeStored(parsed);
    }

    // Check history list
    const historyJson = sessionStorage.getItem(STORAGE_KEY_HISTORY);
    if (historyJson) {
      const list: Investigation[] = JSON.parse(historyJson);
      const match = list.find((item) => item.id === id);
      if (match) return normalizeStored(match);
    }
  } catch {
    console.warn('Stored investigation could not be read.');
  }
  return undefined;
}
