import { useState, useEffect } from 'react';
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
  BarChart3,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Layers,
  LayoutDashboard,
} from 'lucide-react';
import Header from '../components/Header';
import Button from '../components/Button';
import RiskGauge from '../components/RiskGauge';
import SecurityPillars from '../components/SecurityPillars';
import AttributionBarChart from '../components/AttributionBarChart';
import ActionGuide from '../components/ActionGuide';
import { demoInvestigations } from '../data/demoInvestigations';
import { getStoredInvestigation } from '../services/investigationService';
import type {
  Investigation,
  RiskLevel,
  TrustChainStatus,
  WebResearchStatus,
} from '../types/investigation';

type TabType = 'overview' | 'chart' | 'rules' | 'web' | 'all';

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

  // Navigation tab state: 'overview' | 'chart' | 'rules' | 'web' | 'all'
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // Interactive accordion state for Trust Chain checks
  const [expandedChecks, setExpandedChecks] = useState<Record<string, boolean>>({});

  // Collapsible source text state
  const [isSourceTextExpanded, setIsSourceTextExpanded] = useState<boolean>(false);
  const [hasCopiedSource, setHasCopiedSource] = useState<boolean>(false);

  // Toggle check details
  const toggleCheck = (checkId: string) => {
    setExpandedChecks((prev) => ({
      ...prev,
      [checkId]: !prev[checkId],
    }));
  };

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
  const notAssessed = isReal && inv.analysisStatus !== 'completed';
  const flaggedSignals = inv.signals.filter((s) => s.flagged);
  const cleanSignals = inv.signals.filter((s) => !s.flagged);

  // Copy source text handler
  const handleCopySourceText = () => {
    if (inv.sourceDescription) {
      navigator.clipboard.writeText(inv.sourceDescription);
      setHasCopiedSource(true);
      setTimeout(() => setHasCopiedSource(false), 2000);
    }
  };

  // Summary counts for tabs
  const trustChainCount = inv.trustChainFindings?.length || 0;
  const webFindingsCount = inv.webResearchFindings?.length || 0;
  const signalsCount = inv.signals?.length || 0;

  return (
    <div className="min-h-screen bg-[#FAF9F5]">
      <Header />
      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-10 pt-5 pb-14 md:pt-6 md:pb-18 border-x border-[#E0DED4] bg-[#FAF9F5] min-h-[calc(100vh-60px)]">
        {/* Nav breadcrumb */}
        <button
          onClick={() => navigate(-1)}
          className="text-[13px] sm:text-[12px] text-[#77746C] hover:text-[#141413] transition-colors mb-5 flex items-center gap-1 cursor-pointer py-1 font-medium"
        >
          ← All investigations
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_330px] gap-8 lg:gap-12 items-start">
          {/* Main Content Area */}
          <div className="min-w-0">
            {notAssessed && (
              <div
                role="alert"
                className="border border-[#E0DED4] bg-[#F0EEE6] p-5 mb-5 animate-card-entrance"
              >
                <h2 className="text-lg font-medium text-[#141413]">Unable to assess — not scored</h2>
                <p className="text-sm text-[#625F58] mt-1 mb-3">
                  No fraud score or safety verdict is available. Retry or paste the job description manually.
                </p>
                <Button onClick={() => navigate('/investigate')}>Start another analysis</Button>
              </div>
            )}

            {/* Header badges row: Eyebrow + Mode badge + Source badge */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3 animate-text-reveal stagger-1">
              <p className="text-[10px] font-medium tracking-[0.18em] uppercase text-[#77746C]">
                Investigation Dossier
              </p>

              <div className="flex flex-wrap items-center gap-2">
                {/* Source Type Badge */}
                {inv.sourceType === 'extracted_url' || inv.sourceUrl ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-none border border-[#E0DED4] bg-[#F0EEE6] text-[#141413] text-[11px] font-mono">
                    <Link2 size={11} />
                    Extracted from URL
                    {inv.extractionStatus === 'success' && (
                      <span className="text-[#2e7d32] font-sans font-medium text-[10px] ml-1">
                        Text retrieved
                      </span>
                    )}
                    {inv.extractionStatus === 'failed' && (
                      <span className="text-[#c5291e] font-sans font-medium text-[10px] ml-1">
                        ⚠ Incomplete
                      </span>
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
            <h1 className="font-serif text-[28px] sm:text-[34px] md:text-[40px] leading-[1.12] tracking-[-0.02em] text-[#141413] mb-2 animate-text-reveal stagger-2">
              {inv.jobTitle}
            </h1>
            <p className="text-[14.5px] sm:text-[14px] text-[#625F58] mb-5 animate-text-reveal stagger-3">
              {inv.employer} · {inv.location}
            </p>

            {/* Extracted page title note if different */}
            {inv.extractedTitle && inv.extractedTitle !== inv.jobTitle && (
              <p className="text-[11px] text-[#77746C] mb-4 font-mono">
                Extracted HTML &lt;title&gt;: &ldquo;{inv.extractedTitle}&rdquo;
              </p>
            )}

            {/* Extraction Failure Warning Banner */}
            {(inv.extractionStatus === 'failed' ||
              (inv.extractionError && inv.extractionStatus !== 'success')) && (
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

            {/* ── Visual Navigation Tab Bar (Clean, Minimal, Zero Clunky Scrollbar) ── */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 mb-6 border-b border-[#E0DED4] no-scrollbar">
              <button
                onClick={() => setActiveTab('overview')}
                className={`flex items-center gap-2 px-3.5 py-2.5 text-[12px] font-medium border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'overview'
                    ? 'border-[#141413] text-[#141413] font-semibold bg-[#F0EEE6]'
                    : 'border-transparent text-[#77746C] hover:text-[#141413] hover:bg-[#F0EEE6]/50'
                }`}
              >
                <LayoutDashboard size={14} />
                Overview &amp; Visual Dial
              </button>

              <button
                onClick={() => setActiveTab('chart')}
                className={`flex items-center gap-2 px-3.5 py-2.5 text-[12px] font-medium border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'chart'
                    ? 'border-[#141413] text-[#141413] font-semibold bg-[#F0EEE6]'
                    : 'border-transparent text-[#77746C] hover:text-[#141413] hover:bg-[#F0EEE6]/50'
                }`}
              >
                <BarChart3 size={14} />
                Word Impact Bar Chart
                {signalsCount > 0 && (
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-[#E0DED4] text-[#141413]">
                    {signalsCount}
                  </span>
                )}
              </button>

              {trustChainCount > 0 && (
                <button
                  onClick={() => setActiveTab('rules')}
                  className={`flex items-center gap-2 px-3.5 py-2.5 text-[12px] font-medium border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === 'rules'
                      ? 'border-[#141413] text-[#141413] font-semibold bg-[#F0EEE6]'
                      : 'border-transparent text-[#77746C] hover:text-[#141413] hover:bg-[#F0EEE6]/50'
                  }`}
                >
                  <ShieldAlert size={14} />
                  Security Rules Audit
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-[#E0DED4] text-[#141413]">
                    {trustChainCount}
                  </span>
                </button>
              )}

              {(inv.webResearchSummary || webFindingsCount > 0) && (
                <button
                  onClick={() => setActiveTab('web')}
                  className={`flex items-center gap-2 px-3.5 py-2.5 text-[12px] font-medium border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === 'web'
                      ? 'border-[#141413] text-[#141413] font-semibold bg-[#F0EEE6]'
                      : 'border-transparent text-[#77746C] hover:text-[#141413] hover:bg-[#F0EEE6]/50'
                  }`}
                >
                  <Globe size={14} />
                  Web Evidence
                  {webFindingsCount > 0 && (
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-[#E0DED4] text-[#141413]">
                      {webFindingsCount}
                    </span>
                  )}
                </button>
              )}

              <button
                onClick={() => setActiveTab('all')}
                className={`flex items-center gap-2 px-3.5 py-2.5 text-[12px] font-medium border-b-2 transition-all cursor-pointer whitespace-nowrap ml-auto ${
                  activeTab === 'all'
                    ? 'border-[#141413] text-[#141413] font-semibold bg-[#F0EEE6]'
                    : 'border-transparent text-[#77746C] hover:text-[#141413] hover:bg-[#F0EEE6]/50'
                }`}
              >
                <Layers size={14} />
                Full Dossier (All)
              </button>
            </div>

            {/* ══════════════════════════════════════════════════════════
                TAB CONTENT 1: OVERVIEW & VERDICT
            ══════════════════════════════════════════════════════════ */}
            {(activeTab === 'overview' || activeTab === 'all') && (
              <div className="space-y-8 animate-card-entrance">
                {/* 1. HERO VISUAL: Speedometer Gauge Dial with Needle */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[11px] uppercase tracking-widest text-[#77746C] font-semibold flex items-center gap-1.5">
                      <Sparkles size={13} className="text-[#141413]" />
                      ML model score
                    </p>
                    <span className="text-[11px] text-[#77746C] font-mono">
                      Initial bands: 30% / 60%; rules may raise tier
                    </span>
                  </div>
                  <RiskGauge
                    score={inv.fraudProbability ?? null}
                    riskLevel={inv.riskLevel}
                    label={inv.assessmentLabel}
                    prediction={inv.prediction}
                    inferenceTimeMs={inv.inferenceTimeMs}
                  />
                </div>

                {/* 2. 4-PILLAR SECURITY BREAKDOWN MATRIX */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[11px] uppercase tracking-widest text-[#77746C] font-semibold flex items-center gap-1.5">
                      <ShieldCheck size={13} className="text-[#141413]" />
                      Model and rule observations
                    </p>
                    <span className="text-[11px] text-[#77746C]">
                      Classifier, rules and external status
                    </span>
                  </div>
                  <SecurityPillars
                    fraudProbability={inv.fraudProbability ?? null}
                    riskLevel={inv.riskLevel}
                    trustChainFindings={inv.trustChainFindings}
                    webResearchSummary={inv.webResearchSummary}
                    flaggedSignalsCount={flaggedSignals.length}
                    cleanSignalsCount={cleanSignals.length}
                  />
                </div>

                {/* 3. EXECUTIVE VERDICT CALLOUT CARD */}
                <div className="border border-[#E0DED4] bg-[#FAF9F5] rounded-none p-5 sm:p-6 border-l-[4px] border-l-[#141413] shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <span className="text-[10px] font-bold tracking-[0.16em] uppercase text-[#77746C]">
                      Executive Assessment Summary
                    </span>
                    <RiskIndicator level={inv.riskLevel} label={inv.assessmentLabel} />
                  </div>
                  <p className="text-[14px] text-[#141413] leading-relaxed font-sans font-normal">
                    {inv.assessmentSummary}
                  </p>

                  {inv.decisionRationale && inv.decisionRationale !== inv.assessmentSummary && (
                    <div className="mt-3 pt-3 border-t border-[#E0DED4] flex items-start gap-2 text-[12px] text-[#625F58]">
                      <Info size={14} className="text-[#77746C] mt-0.5 flex-shrink-0" />
                      <p className="leading-relaxed">
                        <strong className="text-[#141413]">Review Rationale:</strong>{' '}
                        {inv.decisionRationale}
                      </p>
                    </div>
                  )}

                  {/* Switch to detailed chart button */}
                  {signalsCount > 0 && (
                    <div className="mt-4 pt-3 border-t border-[#E0DED4] flex items-center justify-between">
                      <span className="text-[11px] text-[#77746C]">
                        {flaggedSignals.length} class-1 terms · {cleanSignals.length} class-0 terms
                      </span>
                      <button
                        onClick={() => setActiveTab('chart')}
                        className="text-[12px] font-medium text-[#141413] hover:underline inline-flex items-center gap-1 cursor-pointer"
                      >
                        Inspect Word Impact Bar Chart <ArrowRight size={13} />
                      </button>
                    </div>
                  )}
                </div>

                {/* 4. APPLICANT SAFETY ACTION GUIDE */}
                <ActionGuide riskLevel={inv.riskLevel} />
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════
                TAB CONTENT 2: WORD IMPACT & BAR CHART
            ══════════════════════════════════════════════════════════ */}
            {(activeTab === 'chart' || activeTab === 'all') && (
              <div className="animate-card-entrance">
                {activeTab === 'chart' && (
                  <div className="mb-4">
                    <h2 className="font-serif text-[22px] text-[#141413]">
                      Linguistic Feature Attribution &amp; Impact Analysis
                    </h2>
                    <p className="text-[13px] text-[#625F58] mt-1">
                      Visualizing the statistical contribution of specific words to the ML logistic regression model.
                    </p>
                  </div>
                )}

                {/* Interactive Horizontal Bar Chart */}
                <AttributionBarChart signals={inv.signals} riskLevel={inv.riskLevel} />
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════
                TAB CONTENT 3: TRUST CHAIN SECURITY CHECKS
            ══════════════════════════════════════════════════════════ */}
            {(activeTab === 'rules' || activeTab === 'all') &&
              inv.trustChainFindings &&
              inv.trustChainFindings.length > 0 && (
                <div className="mb-8 border border-[#E0DED4] rounded-none p-5 sm:p-6 bg-[#FAF9F5] animate-card-entrance shadow-[0_2px_12px_rgba(0,0,0,0.03)] card-interactive">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-4 border-b border-[#E0DED4]">
                    <div>
                      <div className="flex items-center gap-2">
                        <ShieldAlert size={16} className="text-[#141413]" />
                        <h2 className="text-[14px] font-semibold text-[#141413] uppercase tracking-wider">
                          Trust Chain &amp; Evidence Consistency Checks
                        </h2>
                      </div>
                      <p className="text-[12px] text-[#77746C] mt-1">
                        Independent deterministic checks evaluating fee requests, credential demands, and domain consistency.
                      </p>
                    </div>

                    {inv.trustChainSummary && (
                      <span className="text-[11px] font-mono text-[#625F58] bg-[#F0EEE6] border border-[#E0DED4] px-2.5 py-1 rounded-none self-start sm:self-auto">
                        {inv.trustChainSummary.executed_checks} of {inv.trustChainSummary.total_checks} executed
                      </span>
                    )}
                  </div>

                  {inv.trustChainSummary && (
                    <div className="mb-5 p-3.5 rounded-none bg-[#F0EEE6] border border-[#E0DED4] text-[12px] flex items-start gap-2.5">
                      <span className="font-bold text-[#141413] uppercase text-[10px] tracking-wider pt-0.5">
                        Recommendation:
                      </span>
                      <span className="text-[#141413] leading-relaxed">
                        {inv.trustChainSummary.overall_trust_recommendation}
                      </span>
                    </div>
                  )}

                  {/* Visual List of Trust Chain Checks with Accordion */}
                  <div className="flex flex-col divide-y divide-[#E0DED4] border border-[#E0DED4] rounded-none overflow-hidden">
                    {inv.trustChainFindings.map((finding) => {
                      const isExpanded = Boolean(expandedChecks[finding.check_id]);
                      return (
                        <div
                          key={finding.check_id}
                          className="p-4 bg-[#FAF9F5] hover:bg-[#F0EEE6]/60 transition-colors"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <h3 className="text-[13px] font-semibold text-[#141413]">
                                {finding.title}
                              </h3>
                            </div>
                            <div className="flex items-center gap-3">
                              <TrustChainStatusBadge status={finding.status} />
                              <button
                                onClick={() => toggleCheck(finding.check_id)}
                                className="text-[11px] text-[#77746C] hover:text-[#141413] inline-flex items-center gap-1 cursor-pointer px-2 py-0.5 rounded border border-[#E0DED4] bg-[#F0EEE6]"
                                aria-label="Toggle details"
                              >
                                {isExpanded ? 'Less' : 'Details'}
                                {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                              </button>
                            </div>
                          </div>

                          <p className="text-[12px] text-[#141413] mt-2 leading-relaxed">
                            <strong className="text-[#141413] font-medium">Observation:</strong>{' '}
                            <span className="text-[#625F58]">{finding.observation}</span>
                          </p>

                          {/* Expandable Technical Audit Details */}
                          {isExpanded && (
                            <div className="mt-3 pt-3 border-t border-[#E0DED4] space-y-2 animate-card-entrance text-[12px]">
                              <p className="text-[#625F58] leading-relaxed">
                                <strong className="text-[#141413]">Detailed Analysis:</strong>{' '}
                                {finding.explanation}
                              </p>
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-[#E0DED4]/60 text-[11px]">
                                <p className="text-[#141413]">
                                  <strong className="text-[#77746C]">Recommended Action:</strong>{' '}
                                  {finding.recommended_action}
                                </p>
                                <span className="text-[#77746C] font-mono flex-shrink-0">
                                  Source: {finding.evidence_source}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            {/* ══════════════════════════════════════════════════════════
                TAB CONTENT 4: WEB EVIDENCE & EMPLOYER SEARCH
            ══════════════════════════════════════════════════════════ */}
            {(activeTab === 'web' || activeTab === 'all') &&
              (inv.webResearchSummary || (inv.webResearchFindings && inv.webResearchFindings.length > 0)) && (
                <div className="mb-8 border border-[#E0DED4] rounded-none p-5 sm:p-6 bg-[#FAF9F5] animate-card-entrance shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-4 border-b border-[#E0DED4]">
                    <div>
                      <div className="flex items-center gap-2">
                        <Globe size={16} className="text-[#141413]" />
                        <h2 className="text-[14px] font-semibold text-[#141413] uppercase tracking-wider">
                          Live Web Research &amp; Employer Evidence
                        </h2>
                      </div>
                      <p className="text-[12px] text-[#77746C] mt-1">
                        Independent external search cross-referencing official employer domains and open vacancies.
                      </p>
                    </div>

                    {inv.webResearchSummary && (
                      <span className="text-[11px] font-mono text-[#625F58] bg-[#F0EEE6] border border-[#E0DED4] px-2.5 py-1 rounded-none self-start sm:self-auto">
                        {inv.webResearchSummary.provider} · {inv.webResearchSummary.total_queries_executed}{' '}
                        {inv.webResearchSummary.total_queries_executed === 1 ? 'query' : 'queries'}
                      </span>
                    )}
                  </div>

                  {/* Overall Evidence Assessment Callout */}
                  {inv.webResearchSummary && (
                    <div className="mb-5 p-4 rounded-none bg-[#F0EEE6] border border-[#E0DED4] text-[12px] flex flex-col gap-2.5">
                      <div className="flex items-start gap-2">
                        <span className="font-bold text-[#141413] uppercase text-[10px] tracking-wider pt-0.5 flex-shrink-0">
                          Assessment:
                        </span>
                        <span className="text-[#141413] leading-snug">
                          {inv.webResearchSummary.overall_evidence_assessment}
                        </span>
                      </div>

                      {/* Breakdown metrics pills */}
                      {(inv.webResearchSummary.exact_matches_count !== undefined ||
                        inv.webResearchSummary.related_roles_count !== undefined) && (
                        <div className="flex items-center gap-2 flex-wrap pt-1 text-[11px]">
                          {inv.webResearchSummary.exact_matches_count !== undefined &&
                            inv.webResearchSummary.exact_matches_count > 0 && (
                              <span className="inline-flex items-center gap-1 font-medium text-[#2e7d32] bg-[#f1f8f1] px-2 py-0.5 rounded-none border border-[#c8e6c9]">
                                Exact matches: {inv.webResearchSummary.exact_matches_count}
                              </span>
                            )}
                          {inv.webResearchSummary.related_roles_count !== undefined &&
                            inv.webResearchSummary.related_roles_count > 0 && (
                              <span className="inline-flex items-center gap-1 font-medium text-[#1a73e8] bg-[#e8f0fe] px-2 py-0.5 rounded-none border border-[#d2e3fc]">
                                Related roles: {inv.webResearchSummary.related_roles_count}
                              </span>
                            )}
                          {inv.webResearchSummary.official_presence_count !== undefined &&
                            inv.webResearchSummary.official_presence_count > 0 && (
                              <span className="inline-flex items-center gap-1 font-medium text-[#7b1fa2] bg-[#f3e5f5] px-2 py-0.5 rounded-none border border-[#e1bee7]">
                                Official presence: {inv.webResearchSummary.official_presence_count}
                              </span>
                            )}
                        </div>
                      )}

                      <p className="text-[11px] text-[#77746C] leading-relaxed pt-2 border-t border-[#E0DED4]">
                        ✦ <strong>Epistemic Separation Notice:</strong>{' '}
                        {inv.webResearchSummary.limitations_disclaimer}
                      </p>
                    </div>
                  )}

                  {/* Findings List */}
                  {inv.webResearchFindings && inv.webResearchFindings.length > 0 ? (
                    <div className="flex flex-col divide-y divide-[#E0DED4] border border-[#E0DED4] rounded-none overflow-hidden">
                      {inv.webResearchFindings.map((finding, idx) => (
                        <div
                          key={idx}
                          className="p-4 bg-[#FAF9F5] hover:bg-[#F0EEE6]/60 transition-colors"
                        >
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
                              </div>
                            </div>
                            <div className="flex-shrink-0">
                              <WebResearchStatusBadge status={finding.evidence_status} />
                            </div>
                          </div>

                          {finding.snippet && (
                            <div className="my-2 p-2.5 rounded-none bg-[#F0EEE6] border border-[#E0DED4] text-[12px] text-[#625F58] font-sans leading-relaxed italic">
                              &ldquo;{finding.snippet}&rdquo;
                            </div>
                          )}

                          <p className="text-[12px] text-[#141413] leading-relaxed">
                            <strong className="text-[#141413] font-medium">Relevance:</strong>{' '}
                            {finding.explanation}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 rounded-none border border-[#E0DED4] bg-[#F0EEE6] text-[12px] text-[#625F58] leading-relaxed">
                      {inv.webResearchSummary?.status === 'not_configured' && (
                        <p>
                          <strong>Optional web search:</strong> Search is not enabled on this server. No external search was performed.
                        </p>
                      )}
                      {inv.webResearchSummary?.status === 'insufficient_evidence' && (
                        <p>
                          <strong>Search Bypassed:</strong> No claimed employer name or official website was provided.
                        </p>
                      )}
                      {inv.webResearchSummary?.status === 'search_unavailable' && (
                        <p>
                          <strong>Provider Temporarily Unavailable:</strong> The web research provider returned a rate limit or timeout.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

            {/* ══════════════════════════════════════════════════════════
                COLLAPSIBLE SOURCE DESCRIPTION DRAWER
            ══════════════════════════════════════════════════════════ */}
            {inv.sourceDescription && (
              <div className="border border-[#E0DED4] bg-[#FAF9F5] rounded-none p-4 mt-6">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <FileText size={15} className="text-[#77746C]" />
                    <span className="text-[12px] font-semibold text-[#141413] uppercase tracking-wider">
                      {inv.sourceType === 'extracted_url'
                        ? 'Extracted Job Description Text'
                        : 'Submitted Job Description Text'}
                    </span>
                    <span className="text-[11px] text-[#77746C] font-mono">
                      ({inv.sourceDescription.length} chars)
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopySourceText}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-mono text-[#625F58] hover:text-[#141413] bg-[#F0EEE6] hover:bg-[#E0DED4] border border-[#E0DED4] transition-colors cursor-pointer"
                      title="Copy source text to clipboard"
                    >
                      {hasCopiedSource ? (
                        <>
                          <Check size={12} className="text-[#2e7d32]" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy size={12} />
                          Copy
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => setIsSourceTextExpanded((prev) => !prev)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-mono text-[#625F58] hover:text-[#141413] bg-[#F0EEE6] hover:bg-[#E0DED4] border border-[#E0DED4] transition-colors cursor-pointer"
                    >
                      {isSourceTextExpanded ? 'Hide text' : 'Show full text'}
                      {isSourceTextExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </button>
                  </div>
                </div>

                {isSourceTextExpanded && (
                  <div className="mt-3 pt-3 border-t border-[#E0DED4] animate-card-entrance">
                    <div className="p-3 bg-[#F0EEE6] border border-[#E0DED4] rounded-none max-h-[300px] overflow-y-auto">
                      <p className="text-[12px] text-[#625F58] leading-relaxed whitespace-pre-wrap font-sans">
                        {inv.sourceDescription}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ══════════════════════════════════════════════════════════
              SIDEBAR SUMMARY CARD
          ══════════════════════════════════════════════════════════ */}
          <div className="lg:sticky lg:top-[76px] flex flex-col gap-4 animate-card-entrance stagger-3">
            {/* Quick Details Box */}
            <div className="border border-[#E0DED4] rounded-none overflow-hidden bg-[#FAF9F5] shadow-[0_2px_12px_rgba(0,0,0,0.03)] card-interactive">
              <div className="px-4 py-3 border-b border-[#E0DED4] bg-[#F0EEE6] flex items-center justify-between">
                <p className="text-[11px] font-semibold text-[#625F58] uppercase tracking-wider">
                  Investigation Details
                </p>
                <span className="text-[10px] text-[#77746C] font-mono">
                  {new Date(inv.submittedAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
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
                          label: 'Analysis elapsed time',
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
                              ? 'Not enabled on this server'
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
