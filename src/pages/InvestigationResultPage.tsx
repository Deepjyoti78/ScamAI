import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Info,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  Link2,
  FileText,
  Globe,
  ExternalLink,
  Search,
} from 'lucide-react';
import Header from '../components/Header';
import Button from '../components/Button';
import { demoInvestigations } from '../data/demoInvestigations';
import { getStoredInvestigation } from '../services/investigationService';
import type {
  Investigation,
  RiskLevel,
  TrustChainStatus,
  WebResearchStatus,
} from '../types/investigation';

function TrustChainStatusBadge({ status }: { status: TrustChainStatus }) {
  switch (status) {
    case 'concern_observed':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-none border border-[#fcc9c6] bg-[#fef2f2] text-[#c5291e] text-[11px] font-medium uppercase tracking-wider">
          <AlertTriangle size={11} strokeWidth={2} />
          Concern Observed
        </span>
      );
    case 'no_mismatch_observed':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-none border border-[#c8e6c9] bg-[#f1f8f1] text-[#2e7d32] text-[11px] font-medium uppercase tracking-wider">
          <CheckCircle size={11} strokeWidth={2} />
          No Mismatch Observed
        </span>
      );
    case 'unable_to_determine':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-none border border-[#f5d5a0] bg-[#fdf3e7] text-[#b5640c] text-[11px] font-medium uppercase tracking-wider">
          <Info size={11} strokeWidth={2} />
          Unable To Determine
        </span>
      );
    case 'not_checked':
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-none border border-[#E0DED4] bg-[#F0EEE6] text-[#77746C] text-[11px] font-medium uppercase tracking-wider">
          <Info size={11} strokeWidth={2} />
          Not Checked
        </span>
      );
  }
}

function WebResearchStatusBadge({ status }: { status: WebResearchStatus }) {
  switch (status) {
    case 'exact_vacancy_match_found':
    case 'official_vacancy_match_found':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-none border border-[#c8e6c9] bg-[#f1f8f1] text-[#2e7d32] text-[11px] font-medium uppercase tracking-wider">
          <CheckCircle size={11} strokeWidth={2} />
          Exact Vacancy Match
        </span>
      );
    case 'related_role_found':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-none border border-[#d2e3fc] bg-[#e8f0fe] text-[#1a73e8] text-[11px] font-medium uppercase tracking-wider">
          <Search size={11} strokeWidth={2} />
          Related Role Found
        </span>
      );
    case 'employer_official_presence_found':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-none border border-[#e1bee7] bg-[#f3e5f5] text-[#7b1fa2] text-[11px] font-medium uppercase tracking-wider">
          <CheckCircle size={11} strokeWidth={2} />
          Official Presence Confirmed
        </span>
      );
    case 'possible_vacancy_match':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-none border border-[#d2e3fc] bg-[#e8f0fe] text-[#1a73e8] text-[11px] font-medium uppercase tracking-wider">
          <Search size={11} strokeWidth={2} />
          Possible Vacancy Match
        </span>
      );
    case 'potential_domain_inconsistency':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-none border border-[#fcc9c6] bg-[#fef2f2] text-[#c5291e] text-[11px] font-medium uppercase tracking-wider">
          <AlertTriangle size={11} strokeWidth={2} />
          Potential Domain Inconsistency
        </span>
      );
    case 'no_matching_vacancy_found_in_search':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-none border border-[#E0DED4] bg-[#F0EEE6] text-[#77746C] text-[11px] font-medium uppercase tracking-wider">
          <Info size={11} strokeWidth={2} />
          No Vacancy Match In Search
        </span>
      );
    case 'not_configured':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-none border border-[#f5d5a0] bg-[#fdf3e7] text-[#b5640c] text-[11px] font-medium uppercase tracking-wider">
          <AlertCircle size={11} strokeWidth={2} />
          Search Not Configured
        </span>
      );
    case 'search_unavailable':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-none border border-[#f5d5a0] bg-[#fdf3e7] text-[#b5640c] text-[11px] font-medium uppercase tracking-wider">
          <AlertCircle size={11} strokeWidth={2} />
          Search Unavailable
        </span>
      );
    case 'insufficient_evidence':
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-none border border-[#E0DED4] bg-[#F0EEE6] text-[#77746C] text-[11px] font-medium uppercase tracking-wider">
          <Info size={11} strokeWidth={2} />
          Insufficient Details for Search
        </span>
      );
  }
}

function RiskIndicator({ level, label }: { level: RiskLevel; label: string }) {
  const styles: Record<
    RiskLevel,
    { dot: string; text: string; bg: string; border: string; icon: React.ReactNode }
  > = {
    high: {
      dot: 'bg-[#c5291e]',
      text: 'text-[#c5291e]',
      bg: 'bg-[#fef2f2]',
      border: 'border-[#fcc9c6]',
      icon: <AlertTriangle size={14} strokeWidth={1.75} />,
    },
    medium: {
      dot: 'bg-[#b5640c]',
      text: 'text-[#b5640c]',
      bg: 'bg-[#fdf3e7]',
      border: 'border-[#f5d5a0]',
      icon: <Info size={14} strokeWidth={1.75} />,
    },
    low: {
      dot: 'bg-[#2e7d32]',
      text: 'text-[#2e7d32]',
      bg: 'bg-[#f1f8f1]',
      border: 'border-[#c8e6c9]',
      icon: <CheckCircle size={14} strokeWidth={1.75} />,
    },
    unknown: {
      dot: 'bg-[#77746C]',
      text: 'text-[#77746C]',
      bg: 'bg-[#F0EEE6]',
      border: 'border-[#E0DED4]',
      icon: <Info size={14} strokeWidth={1.75} />,
    },
  };

  const s = styles[level] || styles.unknown;

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-none border ${s.bg} ${s.border} ${s.text}`}
    >
      {s.icon}
      <span className="text-[12px] font-semibold uppercase tracking-wider">{label}</span>
    </div>
  );
}

export default function InvestigationResultPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Ensure view resets to top of the page when report opens
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant' as ScrollBehavior,
    });
  }, [id]);

  // Try real stored investigation first, then demo dataset
  let investigation: Investigation | undefined;
  if (id) {
    investigation = getStoredInvestigation(id);
    if (!investigation) {
      investigation = demoInvestigations.find((inv) => inv.id === id);
    }
  }

  if (!investigation) {
    return (
      <div className="min-h-screen bg-[#FAF9F5]">
        <Header />
        <main className="max-w-[1200px] mx-auto px-6 lg:px-10 py-20 text-center border-x border-[#E0DED4] bg-[#FAF9F5] min-h-[calc(100vh-60px)]">
          <p className="text-[#77746C] text-sm mb-4">Investigation not found.</p>
          <Button variant="secondary" size="sm" onClick={() => navigate('/')}>
            ← Back to home
          </Button>
        </main>
      </div>
    );
  }

  const inv = investigation;
  const isReal = Boolean(inv.isRealAnalysis);
  const flaggedSignals = inv.signals.filter((s) => s.flagged);
  const cleanSignals = inv.signals.filter((s) => !s.flagged);

  // Fraud probability percentage formatting
  const fraudProbabilityPct =
    typeof inv.fraudProbability === 'number'
      ? (inv.fraudProbability * 100).toFixed(2)
      : null;

  const confidencePct =
    typeof inv.confidence === 'number' ? (inv.confidence * 100).toFixed(2) : null;

  return (
    <div className="min-h-screen bg-[#FAF9F5]">
      <Header />
      <main className="max-w-[1200px] mx-auto px-6 lg:px-10 pt-5 pb-14 md:pt-6 md:pb-18 border-x border-[#E0DED4] bg-[#FAF9F5] min-h-[calc(100vh-60px)]">
        {/* Nav breadcrumb */}
        <button
          onClick={() => navigate(-1)}
          className="text-[12px] text-[#77746C] hover:text-[#141413] transition-colors mb-5 flex items-center gap-1 cursor-pointer"
        >
          ← All investigations
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_330px] gap-10 lg:gap-12 items-start">
          {/* Main Content Area */}
          <div>
            {/* Header badges row: Eyebrow + Mode badge + Source badge */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <p className="text-[10px] font-medium tracking-[0.18em] uppercase text-[#77746C]">
                Investigation Report
              </p>

              <div className="flex flex-wrap items-center gap-2">
                {/* Source Type Badge */}
                {inv.sourceType === 'extracted_url' || inv.sourceUrl ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-none border border-[#E0DED4] bg-[#F0EEE6] text-[#141413] text-[11px] font-mono">
                    <Link2 size={11} />
                    Extracted from URL
                    {inv.extractionStatus === 'success' && (
                      <span className="text-[#2e7d32] font-sans font-medium text-[10px] ml-1">✓ Verified fetch</span>
                    )}
                    {inv.extractionStatus === 'failed' && (
                      <span className="text-[#c5291e] font-sans font-medium text-[10px] ml-1">⚠ Incomplete</span>
                    )}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-none border border-[#E0DED4] bg-[#F0EEE6] text-[#625F58] text-[11px]">
                    <FileText size={11} />
                    Pasted Description
                  </span>
                )}

                {isReal ? (
                  <>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-none border border-[#c8e6c9] bg-[#f1f8f1] text-[#2e7d32] text-[11px] font-medium">
                      <ShieldCheck size={12} strokeWidth={2} />
                      Real ML Model Prediction
                    </span>
                    {typeof inv.inferenceTimeMs === 'number' && (
                      <span
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-none border border-[#E0DED4] bg-[#F0EEE6] text-[#141413] text-[11px] font-mono"
                        title={`Model executed inference and feature attribution in ${inv.inferenceTimeMs}ms`}
                      >
                        ⚡ {inv.inferenceTimeMs}ms inference
                      </span>
                    )}
                  </>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-none border border-[#E0DED4] bg-[#F0EEE6] text-[#77746C] text-[11px]">
                    <Sparkles size={11} />
                    Illustrative Simulation / Demo Record
                  </span>
                )}
              </div>
            </div>

            {/* Title */}
            <h1 className="font-serif text-[32px] md:text-[40px] leading-[1.12] tracking-[-0.02em] text-[#141413] mb-2">
              {inv.jobTitle}
            </h1>
            <p className="text-[14px] text-[#625F58] mb-4">
              {inv.employer} · {inv.location}
            </p>

            {/* Extracted page title note if different */}
            {inv.extractedTitle && inv.extractedTitle !== inv.jobTitle && (
              <p className="text-[11px] text-[#77746C] mb-4 font-mono">
                Extracted HTML &lt;title&gt;: &ldquo;{inv.extractedTitle}&rdquo;
              </p>
            )}

            {/* Extraction Failure Warning Banner */}
            {(inv.extractionStatus === 'failed' || (inv.extractionError && inv.extractionStatus !== 'success')) && (
              <div className="border border-[#f5d5a0] bg-[#fdf3e7] rounded-none p-4 mb-6">
                <div className="flex items-start gap-2.5">
                  <AlertCircle size={15} className="text-[#b5640c] mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold text-[#b5640c] leading-snug">
                      Automated Public Job URL Extraction Incomplete
                    </p>
                    <p className="text-[12px] text-[#625F58] mt-1 leading-relaxed">
                      {inv.extractionError || 'Unable to retrieve readable text from the submitted URL.'}
                    </p>
                    <p className="text-[11px] text-[#77746C] mt-2 leading-relaxed">
                      ✦ <strong>Note:</strong> Anti-bot protection, JavaScript-heavy single-page applications, and login gates frequently prevent automated web fetching. <strong>An extraction failure does not mean this vacancy is fraudulent.</strong> The ML model cannot perform textual fraud classification without job text.
                    </p>
                    <div className="mt-3">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => navigate('/investigate')}
                        className="text-[11px]"
                      >
                        Paste job description manually →
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Risk Indicator and Probabilities */}
            <div className="flex flex-wrap items-center gap-3 mb-5">
              <div className="flex items-center gap-2">
                <span className="text-[11px] uppercase tracking-wider text-[#77746C] font-medium">Triage:</span>
                <RiskIndicator level={inv.riskLevel} label={inv.assessmentLabel} />
              </div>

              {isReal && inv.prediction !== undefined && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-none border border-[#E0DED4] bg-[#FAF9F5] text-[12px] font-mono">
                  <span className="text-[#77746C]">Model Binary Classification:</span>
                  <span
                    className={`font-semibold ${
                      inv.prediction === 1 ? 'text-[#c5291e]' : 'text-[#2e7d32]'
                    }`}
                  >
                    {inv.prediction === 1 ? 'Fraudulent (Class 1)' : 'Legitimate (Class 0)'}
                  </span>
                </div>
              )}
            </div>

            {/* Application Review Decision Rationale */}
            {isReal && inv.decisionRationale && (
              <div className="border border-[#E0DED4] rounded-none p-4 mb-6 bg-[#FAF9F5] border-l-[3px] border-l-[#141413]">
                <p className="text-[10px] font-semibold tracking-[0.16em] uppercase text-[#77746C] mb-1">
                  Triage Decision & Review Rationale
                </p>
                <p className="text-[13px] text-[#141413] leading-relaxed">
                  {inv.decisionRationale}
                </p>
              </div>
            )}

            {/* Dual Metric Cards: Fraud Probability vs Model Confidence */}
            {isReal && fraudProbabilityPct !== null && (
              <div className="border border-[#E0DED4] rounded-none p-5 mb-8 bg-[#F0EEE6]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4 border-b border-[#E0DED4]">
                  {/* Metric 1: Fraud Probability */}
                  <div className="flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-[10px] font-medium tracking-[0.16em] uppercase text-[#77746C]">
                          Model-Estimated Fraud Probability
                        </p>
                        <span className="text-[11px] font-mono text-[#625F58] uppercase">
                          P(Fraud | Text)
                        </span>
                      </div>
                      <div className="flex items-baseline gap-2 mb-2">
                        <span className="font-serif text-[32px] md:text-[36px] font-semibold text-[#141413] leading-none">
                          {fraudProbabilityPct}%
                        </span>
                        <span className="text-[12px] text-[#77746C]">
                          (tier: <strong className="capitalize text-[#141413]">{inv.riskLevel}</strong>)
                        </span>
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div className="h-2 w-full bg-[#E0DED4] rounded-none overflow-hidden mb-2">
                      <div
                        className={`h-full rounded-none transition-all duration-500 ${
                          inv.riskLevel === 'high'
                            ? 'bg-[#c5291e]'
                            : inv.riskLevel === 'medium'
                            ? 'bg-[#b5640c]'
                            : 'bg-[#2e7d32]'
                        }`}
                        style={{ width: `${Math.min(100, Math.max(0, Number(fraudProbabilityPct)))}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-[#77746C] leading-tight">
                      Probability that job text exhibits vocabulary patterns associated with fraudulent postings in the training corpus.
                    </p>
                  </div>

                  {/* Metric 2: Prediction Confidence */}
                  {confidencePct !== null && (
                    <div className="flex flex-col justify-between border-t md:border-t-0 md:border-l border-[#E0DED4] pt-4 md:pt-0 md:pl-6">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-[10px] font-medium tracking-[0.16em] uppercase text-[#77746C]">
                            Prediction Confidence
                          </p>
                          <span className="text-[11px] font-mono text-[#625F58]">
                            max(P₀, P₁)
                          </span>
                        </div>
                        <div className="flex items-baseline gap-2 mb-2">
                          <span className="font-serif text-[32px] md:text-[36px] font-semibold text-[#141413] leading-none font-mono">
                            {confidencePct}%
                          </span>
                          <span className="text-[12px] text-[#77746C]">
                            (for{' '}
                            <strong className="text-[#141413]">
                              {inv.prediction === 1 ? 'Fraudulent' : 'Legitimate'}
                            </strong>
                            )
                          </span>
                        </div>
                      </div>
                      <div className="h-2 w-full bg-[#E0DED4] rounded-none overflow-hidden mb-2">
                        <div
                          className="h-full bg-[#141413] rounded-none transition-all duration-500"
                          style={{ width: `${Math.min(100, Math.max(0, Number(confidencePct)))}%` }}
                        />
                      </div>
                      <p className="text-[11px] text-[#77746C] leading-tight">
                        Statistical certainty in the winning classification. Near 50% indicates a borderline boundary case.
                      </p>
                    </div>
                  )}
                </div>

                <div className="pt-3">
                  <p className="text-[11px] text-[#77746C] leading-relaxed">
                    ✦ <strong>Evaluation Notice:</strong> Neither probability nor prediction confidence constitutes a definitive real-world guarantee. Values reflect statistical lexical patterns learned from the EMSCAD training dataset.
                  </p>
                </div>
              </div>
            )}

            {/* Assessment Summary */}
            <div className="border border-[#E0DED4] rounded-none p-5 mb-8 bg-[#F0EEE6]">
              <p className="text-[11px] uppercase tracking-widest text-[#77746C] mb-2 font-medium">
                Assessment summary
              </p>
              <p className="text-[14px] text-[#141413] leading-relaxed">{inv.assessmentSummary}</p>
            </div>

            {/* Trust Chain & Evidence Consistency Checks Section */}
            {inv.trustChainFindings && inv.trustChainFindings.length > 0 && (
              <div className="mb-8 border border-[#E0DED4] rounded-none p-5 bg-[#FAF9F5]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-3 border-b border-[#E0DED4]">
                  <div>
                    <div className="flex items-center gap-2">
                      <ShieldAlert size={15} className="text-[#141413]" />
                      <h2 className="text-[13px] font-semibold text-[#141413] uppercase tracking-wider">
                        Trust Chain & Evidence Consistency Checks
                      </h2>
                    </div>
                    <p className="text-[12px] text-[#77746C] mt-0.5">
                      Deterministic verification evaluating payment demands, credentials, and cross-domain alignment.
                    </p>
                  </div>

                  {inv.trustChainSummary && (
                    <span className="text-[11px] font-mono text-[#625F58] bg-[#F0EEE6] border border-[#E0DED4] px-2.5 py-1 rounded-none self-start sm:self-auto">
                      {inv.trustChainSummary.executed_checks} of {inv.trustChainSummary.total_checks} checks executed
                    </span>
                  )}
                </div>

                {inv.trustChainSummary && (
                  <div className="mb-4 p-3 rounded-none bg-[#F0EEE6] border border-[#E0DED4] text-[12px] flex items-start gap-2">
                    <span className="font-semibold text-[#141413] uppercase text-[10px] tracking-wider pt-0.5">
                      Recommendation:
                    </span>
                    <span className="text-[#141413] leading-snug">
                      {inv.trustChainSummary.overall_trust_recommendation}
                    </span>
                  </div>
                )}

                {/* List of Trust Chain Checks */}
                <div className="flex flex-col divide-y divide-[#E0DED4] border border-[#E0DED4] rounded-none overflow-hidden">
                  {inv.trustChainFindings.map((finding) => (
                    <div key={finding.check_id} className="p-4 bg-[#FAF9F5] hover:bg-[#F0EEE6] transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                        <h3 className="text-[13px] font-semibold text-[#141413]">
                          {finding.title}
                        </h3>
                        <TrustChainStatusBadge status={finding.status} />
                      </div>

                      <p className="text-[12px] text-[#141413] mb-1.5 leading-relaxed">
                        <strong className="text-[#141413] font-medium">Observation:</strong>{' '}
                        <span className="text-[#625F58]">{finding.observation}</span>
                      </p>

                      <p className="text-[12px] text-[#625F58] mb-2 leading-relaxed">
                        {finding.explanation}
                      </p>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-[#E0DED4] text-[11px]">
                        <p className="text-[#141413]">
                          <strong className="text-[#77746C]">Action:</strong> {finding.recommended_action}
                        </p>
                        <span className="text-[#77746C] font-mono flex-shrink-0">
                          Source: {finding.evidence_source}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Live Web Research & Employer Evidence Section */}
            {(inv.webResearchSummary || (inv.webResearchFindings && inv.webResearchFindings.length > 0)) && (
              <div className="mb-8 border border-[#E0DED4] rounded-none p-5 bg-[#FAF9F5]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-3 border-b border-[#E0DED4]">
                  <div>
                    <div className="flex items-center gap-2">
                      <Globe size={15} className="text-[#141413]" />
                      <h2 className="text-[13px] font-semibold text-[#141413] uppercase tracking-wider">
                        Live Web Research & Employer Evidence
                      </h2>
                    </div>
                    <p className="text-[12px] text-[#77746C] mt-0.5">
                      Independent web search via {inv.webResearchSummary?.provider || 'external search API'} cross-referencing employer careers pages and vacancies.
                    </p>
                  </div>

                  {inv.webResearchSummary && (
                    <span className="text-[11px] font-mono text-[#625F58] bg-[#F0EEE6] border border-[#E0DED4] px-2.5 py-1 rounded-none self-start sm:self-auto">
                      {inv.webResearchSummary.provider} · {inv.webResearchSummary.total_queries_executed} {inv.webResearchSummary.total_queries_executed === 1 ? 'query' : 'queries'}
                    </span>
                  )}
                </div>

                {/* Overall Evidence Assessment Callout */}
                {inv.webResearchSummary && (
                  <div className="mb-4 p-3.5 rounded-none bg-[#F0EEE6] border border-[#E0DED4] text-[12px] flex flex-col gap-2">
                    <div className="flex items-start gap-2">
                      <span className="font-semibold text-[#141413] uppercase text-[10px] tracking-wider pt-0.5 flex-shrink-0">
                        Assessment:
                      </span>
                      <span className="text-[#141413] leading-snug">
                        {inv.webResearchSummary.overall_evidence_assessment}
                      </span>
                    </div>

                    {/* Breakdown metrics if available */}
                    {(inv.webResearchSummary.exact_matches_count !== undefined || inv.webResearchSummary.related_roles_count !== undefined) && (
                      <div className="flex items-center gap-2 flex-wrap pt-1 text-[11px]">
                        {inv.webResearchSummary.exact_matches_count !== undefined && inv.webResearchSummary.exact_matches_count > 0 && (
                          <span className="inline-flex items-center gap-1 font-medium text-[#2e7d32] bg-[#f1f8f1] px-2 py-0.5 rounded-none border border-[#c8e6c9]">
                            Exact matches: {inv.webResearchSummary.exact_matches_count}
                          </span>
                        )}
                        {inv.webResearchSummary.related_roles_count !== undefined && inv.webResearchSummary.related_roles_count > 0 && (
                          <span className="inline-flex items-center gap-1 font-medium text-[#1a73e8] bg-[#e8f0fe] px-2 py-0.5 rounded-none border border-[#d2e3fc]">
                            Related roles: {inv.webResearchSummary.related_roles_count}
                          </span>
                        )}
                        {inv.webResearchSummary.official_presence_count !== undefined && inv.webResearchSummary.official_presence_count > 0 && (
                          <span className="inline-flex items-center gap-1 font-medium text-[#7b1fa2] bg-[#f3e5f5] px-2 py-0.5 rounded-none border border-[#e1bee7]">
                            Official presence: {inv.webResearchSummary.official_presence_count}
                          </span>
                        )}
                      </div>
                    )}

                    <p className="text-[11px] text-[#77746C] leading-relaxed pt-1.5 border-t border-[#E0DED4]">
                      ✦ <strong>Epistemic Separation Notice:</strong> {inv.webResearchSummary.limitations_disclaimer}
                    </p>
                  </div>
                )}

                {/* Findings List or Status State */}
                {inv.webResearchFindings && inv.webResearchFindings.length > 0 ? (
                  <div className="flex flex-col divide-y divide-[#E0DED4] border border-[#E0DED4] rounded-none overflow-hidden">
                    {inv.webResearchFindings.map((finding, idx) => (
                      <div key={idx} className="p-4 bg-[#FAF9F5] hover:bg-[#F0EEE6] transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h3 className="text-[13px] font-semibold text-[#141413]">
                                {finding.source_title || 'Web Search Result'}
                              </h3>
                              {finding.source_url && (
                                <a
                                  href={finding.source_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-0.5 text-[11px] text-[#1a73e8] hover:underline"
                                  title="Open external source"
                                >
                                  <ExternalLink size={11} />
                                </a>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-1 text-[11px] font-mono text-[#77746C] flex-wrap">
                              {finding.source_type && (
                                <span className="bg-[#E0DED4] text-[#141413] px-1.5 py-0.5 rounded-none text-[10px] font-medium capitalize">
                                  {finding.source_type.replace(/_/g, ' ')}
                                </span>
                              )}
                              {finding.source_domain && (
                                <span className="bg-[#F0EEE6] text-[#141413] px-1.5 py-0.5 rounded-none text-[10px]">
                                  domain: {finding.source_domain}
                                </span>
                              )}
                              {finding.query_performed && (
                                <span className="text-[#77746C] truncate max-w-xs" title={finding.query_performed}>
                                  query: &ldquo;{finding.query_performed}&rdquo;
                                </span>
                              )}
                              {finding.retrieved_at && (
                                <span className="text-[#77746C]">
                                  {new Date(finding.retrieved_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex-shrink-0">
                            <WebResearchStatusBadge status={finding.evidence_status} />
                          </div>
                        </div>

                        {/* Search Result Snippet */}
                        {finding.snippet && (
                          <div className="my-2.5 p-2.5 rounded-none bg-[#F0EEE6] border border-[#E0DED4] text-[12px] text-[#625F58] font-sans leading-relaxed italic">
                            &ldquo;{finding.snippet}&rdquo;
                          </div>
                        )}

                        {/* Relevance & Findings */}
                        <p className="text-[12px] text-[#141413] mb-2 leading-relaxed">
                          <strong className="text-[#141413] font-medium">Observed Relevance:</strong> {finding.explanation}
                        </p>

                        {/* Epistemic Limitations & Guardrails */}
                        {finding.limitations && (
                          <div className="pt-2 border-t border-[#E0DED4] text-[11px] text-[#77746C] leading-relaxed">
                            <strong className="text-[#625F58] font-medium">Scope & Limitations:</strong>{' '}
                            {finding.limitations}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  /* Informational box when no queries executed or search unconfigured */
                  <div className="p-4 rounded-none border border-[#E0DED4] bg-[#F0EEE6] text-[12px] text-[#625F58] leading-relaxed">
                    {inv.webResearchSummary?.status === 'not_configured' && (
                      <p>
                        <strong>Provider Not Configured:</strong> Neither{' '}
                        <code className="text-[11px] font-mono bg-[#FAF9F5] px-1 py-0.5 rounded-none border border-[#E0DED4]">TAVILY_API_KEY</code>{' '}
                        nor{' '}
                        <code className="text-[11px] font-mono bg-[#FAF9F5] px-1 py-0.5 rounded-none border border-[#E0DED4]">BRAVE_SEARCH_API_KEY</code>{' '}
                        is set in the backend environment. Live external corroboration was honestly reported as skipped. No artificial results were generated.
                      </p>
                    )}
                    {inv.webResearchSummary?.status === 'insufficient_evidence' && (
                      <p>
                        <strong>Search Bypassed:</strong> No claimed employer name or official website was provided in the submission. Web search requires an employer name or domain to formulate targeted queries.
                      </p>
                    )}
                    {inv.webResearchSummary?.status === 'search_unavailable' && (
                      <p>
                        <strong>Provider Temporarily Unavailable:</strong> The web research provider returned a rate limit, timeout, or service error. Fraud prediction and Trust Chain rules completed independently.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Evidence Signals */}
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-4">
                <h2 className="text-[13px] font-semibold text-[#141413] uppercase tracking-wider">
                  {isReal ? 'Key Predictive Text Signals' : 'Evidence signals'}
                </h2>
                {isReal && (
                  <span className="text-[11px] text-[#77746C]">
                    Feature Impact = TF-IDF × Model Coefficient
                  </span>
                )}
              </div>

              {isReal && (
                <p className="text-[12px] text-[#77746C] mb-4 leading-relaxed">
                  Attribution scores isolate the specific linear contribution to logistic regression log-odds for this posting. Terms represent statistical correlations in historical training data, not factual evidence of employer wrongdoing.
                </p>
              )}

              {flaggedSignals.length > 0 ? (
                <div className="mb-5">
                  <p
                    className={`text-[11px] font-medium mb-2 uppercase tracking-wider ${
                      inv.riskLevel === 'high'
                        ? 'text-[#c5291e]'
                        : inv.riskLevel === 'medium'
                        ? 'text-[#b5640c]'
                        : 'text-[#77746C]'
                    }`}
                  >
                    {isReal
                      ? inv.riskLevel === 'high'
                        ? 'Top Suspicious Risk Signals'
                        : inv.riskLevel === 'medium'
                        ? 'Mild Risk Associations (Review Advisory)'
                        : 'Minor Risk-Correlated Vocabulary (Low Impact)'
                      : 'Warning signals'}
                  </p>
                  <div className="flex flex-col divide-y divide-[#E0DED4] border border-[#E0DED4] rounded-none overflow-hidden">
                    {flaggedSignals.map((sig) => (
                      <div key={sig.id} className="flex items-start gap-3 p-4 bg-[#FAF9F5]">
                        <AlertTriangle
                          size={13}
                          strokeWidth={1.75}
                          className={`mt-0.5 flex-shrink-0 ${
                            inv.riskLevel === 'high'
                              ? 'text-[#c5291e]'
                              : inv.riskLevel === 'medium'
                              ? 'text-[#b5640c]'
                              : 'text-[#77746C]'
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="text-[13px] font-semibold text-[#141413]">
                              {sig.label}
                            </span>
                            <div className="text-[11px] font-mono text-[#77746C] flex-shrink-0 text-right">
                              {typeof sig.impact === 'number' ? (
                                <span>
                                  impact:{' '}
                                  <strong
                                    className={
                                      inv.riskLevel === 'high'
                                        ? 'text-[#c5291e]'
                                        : inv.riskLevel === 'medium'
                                        ? 'text-[#b5640c]'
                                        : 'text-[#625F58]'
                                    }
                                  >
                                    +{sig.impact.toFixed(2)}
                                  </strong>
                                  {typeof sig.tfidfScore === 'number' && typeof sig.coefficient === 'number' && (
                                    <span className="hidden sm:inline text-[#77746C] text-[10px] ml-1.5">
                                      (tfidf: {sig.tfidfScore.toFixed(3)} · coef: +{sig.coefficient.toFixed(2)})
                                    </span>
                                  )}
                                </span>
                              ) : (
                                `${Math.round(sig.weight * 100)}% contribution`
                              )}
                            </div>
                          </div>
                          <p className="text-[12px] text-[#625F58] leading-relaxed">{sig.description}</p>
                          {/* Weight bar */}
                          <div className="mt-2.5 h-1.5 bg-[#E0DED4] rounded-none overflow-hidden">
                            <div
                              className={`h-full rounded-none ${
                                inv.riskLevel === 'high'
                                  ? 'bg-[#c5291e]'
                                  : inv.riskLevel === 'medium'
                                  ? 'bg-[#b5640c]'
                                  : 'bg-[#77746C]'
                              }`}
                              style={{ width: `${Math.round(sig.weight * 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : isReal ? (
                <div className="mb-5 p-4 rounded-none border border-[#E0DED4] bg-[#F0EEE6] text-[12px] text-[#77746C]">
                  No suspicious risk signals detected above the reporting threshold.
                </div>
              ) : null}

              {cleanSignals.length > 0 && (
                <div>
                  <p className="text-[11px] text-[#2e7d32] font-medium mb-2 uppercase tracking-wider">
                    {isReal ? 'Legitimate Associative Signals' : 'Positive signals'}
                  </p>
                  <div className="flex flex-col divide-y divide-[#E0DED4] border border-[#E0DED4] rounded-none overflow-hidden">
                    {cleanSignals.map((sig) => (
                      <div key={sig.id} className="flex items-start gap-3 p-4 bg-[#FAF9F5]">
                        <CheckCircle
                          size={13}
                          strokeWidth={1.75}
                          className="text-[#2e7d32] mt-0.5 flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="text-[13px] font-semibold text-[#141413]">
                              {sig.label}
                            </span>
                            <div className="text-[11px] font-mono text-[#77746C] flex-shrink-0 text-right">
                              {typeof sig.impact === 'number' ? (
                                <span>
                                  impact: <strong className="text-[#2e7d32]">{sig.impact.toFixed(2)}</strong>
                                  {typeof sig.tfidfScore === 'number' && typeof sig.coefficient === 'number' && (
                                    <span className="hidden sm:inline text-[#77746C] text-[10px] ml-1.5">
                                      (tfidf: {sig.tfidfScore.toFixed(3)} · coef: {sig.coefficient.toFixed(2)})
                                    </span>
                                  )}
                                </span>
                              ) : (
                                'consistent'
                              )}
                            </div>
                          </div>
                          <p className="text-[12px] text-[#625F58] leading-relaxed">{sig.description}</p>
                          {typeof sig.impact === 'number' && (
                            <div className="mt-2.5 h-1.5 bg-[#E0DED4] rounded-none overflow-hidden">
                              <div
                                className="h-full bg-[#2e7d32] rounded-none"
                                style={{ width: `${Math.round(sig.weight * 100)}%` }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Source text submitted */}
            {inv.sourceDescription && (
              <div className="border-t border-[#E0DED4] pt-6">
                <p className="text-[11px] uppercase tracking-widest text-[#77746C] mb-2 font-medium">
                  {inv.sourceType === 'extracted_url'
                    ? 'Extracted Job Posting Text (from URL)'
                    : 'Analyzed Job Posting Text (Pasted)'}
                </p>
                <div className="p-4 bg-[#F0EEE6] border border-[#E0DED4] rounded-none max-h-[220px] overflow-y-auto">
                  <p className="text-[12px] text-[#625F58] leading-relaxed whitespace-pre-wrap font-sans">
                    {inv.sourceDescription}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Summary Card */}
          <div className="lg:sticky lg:top-[76px] flex flex-col gap-4">
            {/* Quick Details Box */}
            <div className="border border-[#E0DED4] rounded-none overflow-hidden bg-[#FAF9F5]">
              <div className="px-4 py-3 border-b border-[#E0DED4] bg-[#F0EEE6] flex items-center justify-between">
                <p className="text-[11px] font-semibold text-[#625F58] uppercase tracking-wider">
                  Investigation Details
                </p>
                <span className="text-[10px] text-[#77746C]">
                  {new Date(inv.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className="px-4 py-4 flex flex-col gap-3">
                {[
                  { label: 'Role / Title', value: inv.jobTitle },
                  { label: 'Reported Employer', value: inv.employer },
                  {
                    label: 'Submission Mode',
                    value: inv.sourceType === 'extracted_url' ? 'Public Job URL' : 'Pasted Text',
                  },
                  ...(inv.finalUrl || inv.sourceUrl
                    ? [{ label: 'Job URL', value: inv.finalUrl || inv.sourceUrl }]
                    : []),
                  ...(inv.extractionStatus && inv.extractionStatus !== 'not_applicable'
                    ? [
                        {
                          label: 'URL Fetch Status',
                          value:
                            inv.extractionStatus === 'success'
                              ? 'Success (Clean text extracted)'
                              : inv.extractionStatus === 'failed'
                              ? 'Incomplete / Failed (Fallback text)'
                              : inv.extractionStatus,
                        },
                      ]
                    : []),
                  { label: 'Employment Type', value: inv.employmentType },
                  ...(inv.location && inv.location !== 'Unspecified Location'
                    ? [{ label: 'Location', value: inv.location }]
                    : []),
                  ...(inv.companyWebsite ? [{ label: 'Company Website', value: inv.companyWebsite }] : []),
                  ...(inv.recruiterEmail ? [{ label: 'Recruiter Email', value: inv.recruiterEmail }] : []),
                  ...(inv.applicationUrl ? [{ label: 'Application URL', value: inv.applicationUrl }] : []),
                  {
                    label: 'Evaluation Source',
                    value: isReal ? 'EMSCAD Trained Baseline Model' : 'Pre-configured Simulation',
                  },
                  ...(isReal && typeof inv.inferenceTimeMs === 'number'
                    ? [
                        {
                          label: 'ML Compute Latency',
                          value: `⚡ ${inv.inferenceTimeMs} ms (${(inv.inferenceTimeMs / 1000).toFixed(3)}s)`,
                        },
                      ]
                    : []),
                  ...(inv.webResearchSummary
                    ? [
                        {
                          label: 'External Web Research',
                          value:
                            inv.webResearchSummary.status === 'completed'
                              ? `Completed (${inv.webResearchSummary.total_queries_executed} queries via ${inv.webResearchSummary.provider})`
                              : inv.webResearchSummary.status === 'not_configured'
                              ? 'Not Configured (TAVILY_API_KEY / BRAVE_SEARCH_API_KEY missing)'
                              : inv.webResearchSummary.status === 'insufficient_evidence'
                              ? 'Bypassed (Insufficient employer data)'
                              : 'Unavailable (Provider error or rate limit)',
                        },
                      ]
                    : []),
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-[10px] uppercase tracking-wider text-[#77746C] mb-0.5">
                      {label}
                    </p>
                    <p className="text-[12px] text-[#141413] font-medium break-all">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate('/investigate')}
              className="w-full justify-center"
            >
              New investigation <ArrowRight size={13} />
            </Button>
            <Button
              variant="secondary"
              size="md"
              onClick={() => navigate('/')}
              className="w-full justify-center"
            >
              ← Back to home
            </Button>

            <p className="text-[10px] text-[#77746C] leading-relaxed pt-2">
              ✦ {isReal
                ? 'Analysis generated directly by ScamShield AI FastAPI ML engine.'
                : 'Illustrative demo data. Not a live investigation result.'}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
