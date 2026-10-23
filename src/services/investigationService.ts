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
export async function analyzeJobPosting(
  requestData: BackendJobAnalysisRequest
): Promise<BackendJobAnalysisResponse> {
  // Input validation
  const trimmedDescription = (requestData.description || '').trim();
  const trimmedUrl = (requestData.job_url || '').trim();

  if (!trimmedDescription && !trimmedUrl) {
    throw new ApiError('Please provide either a job posting URL or paste the job description text.', {
      code: 'EMPTY_INPUT',
      isRetryable: true,
    });
  }

  if (trimmedDescription && trimmedDescription.length < 10) {
    throw new ApiError(
      'Job description is too brief for analysis. Please provide at least 10 characters of posting content.',
      {
        code: 'DESCRIPTION_TOO_SHORT',
        statusCode: 422,
        isRetryable: true,
      }
    );
  }

  if (!trimmedDescription && trimmedUrl) {
    if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
      throw new ApiError('Job URL must begin with http:// or https://.', {
        code: 'INVALID_URL_SCHEME',
        isRetryable: true,
      });
    }
  }

  // Construct valid backend payload matching Pydantic schema
  const payload: BackendJobAnalysisRequest = {
    description: trimmedDescription || undefined,
    job_url: trimmedUrl || undefined,
    title: requestData.title?.trim() || undefined,
    employer_name: requestData.employer_name?.trim() || undefined,
    company_profile: requestData.company_profile?.trim() || undefined,
    requirements: requestData.requirements?.trim() || undefined,
    benefits: requestData.benefits?.trim() || undefined,
    employment_type: requestData.employment_type?.trim() || undefined,
    company_website: requestData.company_website?.trim() || undefined,
    recruiter_email: requestData.recruiter_email?.trim() || undefined,
    application_url: requestData.application_url?.trim() || undefined,
    recruiter_message: requestData.recruiter_message?.trim() || undefined,
  };

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/api/investigations/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    });
  } catch (networkErr: unknown) {
    const msg = networkErr instanceof Error ? networkErr.message : 'Network error';
    throw new ApiError(
      `Cannot connect to ScamShield AI API at ${API_BASE_URL}. Please verify that the backend server is running (uvicorn backend.main:app).`,
      {
        code: 'API_UNAVAILABLE',
        detail: msg,
        isRetryable: true,
      }
    );
  }

  // Parse response
  let rawJson: unknown;
  try {
    rawJson = await response.json();
  } catch {
    throw new ApiError(
      `The server returned an invalid or non-JSON response (HTTP ${response.status}).`,
      {
        statusCode: response.status,
        code: 'INVALID_JSON',
        isRetryable: true,
      }
    );
  }

  // Handle non-200 responses
  if (!response.ok) {
    const errorBody = rawJson as { detail?: string | { error?: string; message?: string } };
    let detailMessage = 'An unexpected error occurred during analysis.';

    if (typeof errorBody?.detail === 'string') {
      detailMessage = errorBody.detail;
    } else if (typeof errorBody?.detail === 'object' && errorBody.detail?.message) {
      detailMessage = errorBody.detail.message;
    }

    if (response.status === 503) {
      throw new ApiError(
        'Machine learning model is currently unavailable on the backend. Please train the baseline model by running "python ml/train.py".',
        {
          statusCode: 503,
          code: 'MODEL_NOT_TRAINED',
          detail: detailMessage,
          isRetryable: true,
        }
      );
    }

    if (response.status === 422) {
      throw new ApiError(
        `Validation failed: ${detailMessage || 'Please verify the job posting text format.'}`,
        {
          statusCode: 422,
          code: 'VALIDATION_ERROR',
          detail: detailMessage,
          isRetryable: true,
        }
      );
    }

    throw new ApiError(`Analysis request failed: ${detailMessage}`, {
      statusCode: response.status,
      code: `HTTP_${response.status}`,
      detail: detailMessage,
      isRetryable: true,
    });
  }

  // Verify expected response fields
  const data = rawJson as BackendJobAnalysisResponse;
  if (
    typeof data.prediction !== 'number' ||
    typeof data.fraud_probability !== 'number' ||
    !data.risk_level ||
    !data.assessment_summary
  ) {
    throw new ApiError('The backend response did not contain the expected analysis fields.', {
      code: 'MALFORMED_RESPONSE',
      isRetryable: false,
    });
  }

  return data;
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
  const trimmedDescription = (requestData.description || '').trim();
  const trimmedUrl = (requestData.job_url || '').trim();

  // Local pre-validation
  if (!trimmedDescription && !trimmedUrl) {
    onStageUpdate({
      card_id: 1,
      key: 'validation',
      title: 'Validating submitted information',
      description: 'Checking input format, required fields, and URL safety.',
      status: 'failed',
      detail: 'Please provide either a job posting URL or paste the job description text.',
      error: 'Empty input',
    });
    throw new ApiError('Please provide either a job posting URL or paste the job description text.', {
      code: 'EMPTY_INPUT',
      isRetryable: true,
    });
  }

  if (trimmedDescription && trimmedDescription.length < 10) {
    onStageUpdate({
      card_id: 1,
      key: 'validation',
      title: 'Validating submitted information',
      description: 'Checking input format, required fields, and URL safety.',
      status: 'failed',
      detail: 'Job description is too brief (minimum 10 characters required).',
      error: 'Description too short',
    });
    throw new ApiError(
      'Job description is too brief for analysis. Please provide at least 10 characters of posting content.',
      {
        code: 'DESCRIPTION_TOO_SHORT',
        statusCode: 422,
        isRetryable: true,
      }
    );
  }

  if (!trimmedDescription && trimmedUrl) {
    if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
      onStageUpdate({
        card_id: 1,
        key: 'validation',
        title: 'Validating submitted information',
        description: 'Checking input format, required fields, and URL safety.',
        status: 'failed',
        detail: 'Job URL must begin with http:// or https://.',
        error: 'Invalid URL scheme',
      });
      throw new ApiError('Job URL must begin with http:// or https://.', {
        code: 'INVALID_URL_SCHEME',
        isRetryable: true,
      });
    }
  }

  onStageUpdate({
    card_id: 1,
    key: 'validation',
    title: 'Validating submitted information',
    description: 'Checking input format, required fields, and URL safety.',
    status: 'in_progress',
    detail: 'Connecting to analysis engine and verifying payload parameters...',
  });

  const payload: BackendJobAnalysisRequest = {
    description: trimmedDescription || undefined,
    job_url: trimmedUrl || undefined,
    title: requestData.title?.trim() || undefined,
    employer_name: requestData.employer_name?.trim() || undefined,
    company_profile: requestData.company_profile?.trim() || undefined,
    requirements: requestData.requirements?.trim() || undefined,
    benefits: requestData.benefits?.trim() || undefined,
    employment_type: requestData.employment_type?.trim() || undefined,
    company_website: requestData.company_website?.trim() || undefined,
    recruiter_email: requestData.recruiter_email?.trim() || undefined,
    application_url: requestData.application_url?.trim() || undefined,
    recruiter_message: requestData.recruiter_message?.trim() || undefined,
  };

  // Attempt Server-Sent Events stream first
  let streamResponse: Response | null = null;
  let useFallback = false;

  try {
    streamResponse = await fetch(`${API_BASE_URL}/api/investigations/analyze/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
      },
      body: JSON.stringify(payload),
      signal: abortSignal,
    });

    if (streamResponse.status === 404) {
      useFallback = true;
    } else if (!streamResponse.ok) {
      let errorDetail = `HTTP ${streamResponse.status}`;
      try {
        const errJson = await streamResponse.json();
        if (errJson?.detail) {
          errorDetail = typeof errJson.detail === 'string' ? errJson.detail : JSON.stringify(errJson.detail);
        }
      } catch {
        // use default errorDetail
      }

      onStageUpdate({
        card_id: 1,
        key: 'validation',
        title: 'Validating submitted information',
        description: 'Checking input format, required fields, and URL safety.',
        status: 'failed',
        detail: errorDetail,
        error: errorDetail,
      });

      throw new ApiError(`Analysis request failed: ${errorDetail}`, {
        statusCode: streamResponse.status,
        code: `HTTP_${streamResponse.status}`,
        detail: errorDetail,
      });
    }
  } catch (netErr: unknown) {
    if (abortSignal?.aborted) {
      throw new ApiError('Investigation was safely dismissed.', { code: 'ABORTED', isRetryable: false });
    }
    if (netErr instanceof ApiError) {
      throw netErr;
    }
    useFallback = true;
  }

  // If streaming response is active, consume SSE stream
  if (streamResponse && streamResponse.ok && streamResponse.body && !useFallback) {
    const reader = streamResponse.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';
    let finalResult: BackendJobAnalysisResponse | null = null;
    let streamError: ApiError | null = null;

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const messages = buffer.split('\n\n');
        buffer = messages.pop() || '';

        for (const rawMessage of messages) {
          const lines = rawMessage.split('\n');
          let eventName = 'message';
          const dataLines: string[] = [];

          for (const line of lines) {
            if (line.startsWith('event:')) {
              eventName = line.substring(6).trim();
            } else if (line.startsWith('data:')) {
              dataLines.push(line.substring(5).trim());
            }
          }

          if (dataLines.length > 0) {
            const dataStr = dataLines.join('\n');
            let parsedData: unknown;
            try {
              parsedData = JSON.parse(dataStr);
            } catch {
              parsedData = dataStr;
            }

            if (eventName === 'stage_update') {
              onStageUpdate(parsedData as InvestigationStageUpdate);
            } else if (eventName === 'complete') {
              finalResult = parsedData as BackendJobAnalysisResponse;
            } else if (eventName === 'error') {
              const errPayload = parsedData as { message?: string; code?: string; detail?: string };
              streamError = new ApiError(errPayload.message || 'Stage processing failed', {
                code: errPayload.code || 'STAGE_ERROR',
                detail: errPayload.detail,
              });
            }
          }
        }
      }
    } catch (readErr: unknown) {
      if (abortSignal?.aborted) {
        throw new ApiError('Investigation dismissed.', { code: 'ABORTED', isRetryable: false });
      }
      console.warn('SSE stream read interrupted:', readErr);
    }

    if (streamError) {
      throw streamError;
    }

    if (finalResult) {
      return finalResult;
    }
  }

  // Fallback path: standard HTTP call with sequential card updates
  onStageUpdate({
    card_id: 1,
    key: 'validation',
    title: 'Validating submitted information',
    description: 'Checking input format, required fields, and URL safety.',
    status: 'completed',
    detail: 'Input format validated.',
  });

  if (trimmedUrl && !trimmedDescription) {
    onStageUpdate({
      card_id: 2,
      key: 'extraction',
      title: 'Retrieving and extracting job details',
      description: 'Fetching the job posting and extracting relevant content.',
      status: 'in_progress',
      detail: `Fetching public job posting from ${trimmedUrl.slice(0, 45)}...`,
    });
  } else {
    onStageUpdate({
      card_id: 2,
      key: 'extraction',
      title: 'Retrieving and extracting job details',
      description: 'Fetching the job posting and extracting relevant content.',
      status: 'skipped',
      detail: 'Direct text description provided. Web retrieval bypassed.',
    });
  }

  onStageUpdate({
    card_id: 3,
    key: 'ml_analysis',
    title: 'Analyzing content with ML model',
    description: 'Running the extracted text through our trained model.',
    status: 'in_progress',
    detail: 'Evaluating content with TF-IDF and trained ML classifier...',
  });

  const response = await analyzeJobPosting(payload);

  if (trimmedUrl && !trimmedDescription) {
    if (response.extraction_status === 'success') {
      onStageUpdate({
        card_id: 2,
        key: 'extraction',
        title: 'Retrieving and extracting job details',
        description: 'Fetching the job posting and extracting relevant content.',
        status: 'completed',
        detail: `Successfully extracted ${response.extracted_title || 'job text'}.`,
      });
    } else {
      onStageUpdate({
        card_id: 2,
        key: 'extraction',
        title: 'Retrieving and extracting job details',
        description: 'Fetching the job posting and extracting relevant content.',
        status: 'failed',
        detail: `Extraction incomplete: ${response.extraction_error || response.extraction_status}`,
        error: response.extraction_error || undefined,
      });
    }
  }

  onStageUpdate({
    card_id: 3,
    key: 'ml_analysis',
    title: 'Analyzing content with ML model',
    description: 'Running the extracted text through our trained model.',
    status: 'completed',
    detail: `Model evaluated: ${(response.fraud_probability * 100).toFixed(1)}% estimated probability (${response.label}).`,
  });

  onStageUpdate({
    card_id: 4,
    key: 'warning_signals',
    title: 'Checking scam warning signals',
    description: 'Detecting payment requests, credential demands, and other red flags.',
    status: 'completed',
    detail: 'Deterministic payment and credential warning signals evaluated.',
  });

  onStageUpdate({
    card_id: 5,
    key: 'trust_chain',
    title: 'Verifying employer and domain consistency',
    description: 'Comparing employer, recruiter, and application details.',
    status: 'completed',
    detail: 'Trust Chain consistency audit completed with available information.',
  });

  return response;
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

  let assessmentLabel = 'Lower Risk';
  if (response.review_decision === 'flagged_suspicious' || isHighRisk) {
    assessmentLabel = 'Suspicious';
  } else if (response.review_decision === 'review_recommended' || isMediumRisk) {
    assessmentLabel = 'Review Recommended';
  } else {
    assessmentLabel = 'Lower Risk';
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
  } catch (err) {
    console.warn('Failed to persist investigation in sessionStorage:', err);
  }
}

/**
 * Retrieve an investigation by ID from sessionStorage.
 */
export function getStoredInvestigation(id: string): Investigation | undefined {
  try {
    // Check specific id
    const specific = sessionStorage.getItem(`investigation_${id}`);
    if (specific) return JSON.parse(specific);

    // Check latest
    const latest = sessionStorage.getItem(STORAGE_KEY_LATEST);
    if (latest) {
      const parsed: Investigation = JSON.parse(latest);
      if (parsed.id === id) return parsed;
    }

    // Check history list
    const historyJson = sessionStorage.getItem(STORAGE_KEY_HISTORY);
    if (historyJson) {
      const list: Investigation[] = JSON.parse(historyJson);
      const match = list.find((item) => item.id === id);
      if (match) return match;
    }
  } catch (err) {
    console.warn('Error reading investigation from sessionStorage:', err);
  }
  return undefined;
}
