import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Shield,
  Check,
  Loader2,
  Clock,
  AlertCircle,
  Globe,
  BrainCircuit,
  AlertTriangle,
  Link as LinkIcon,
  CheckSquare,
  ArrowRight,
  RefreshCw,
  ArrowDown,
  ChevronDown,
} from 'lucide-react';
import type { InvestigationStageState } from '../types/investigation';

export interface InvestigationModalResult {
  id?: string;
  fraudProbability: number;
  riskLevel: 'low' | 'medium' | 'high' | 'unknown';
  label: string;
  assessmentSummary: string;
  topSuspiciousSignals?: string[];
  topLegitimateSignals?: string[];
}

export interface InvestigationModalProps {
  isOpen: boolean;
  onClose: () => void;
  stages: InvestigationStageState[];
  currentStageId?: number;
  isComplete: boolean;
  result?: InvestigationModalResult | null;
  error: {
    message: string;
    detail?: string;
    failedCardId?: number;
    canRetry?: boolean;
  } | null;
  onRetry?: () => void;
  onViewReport?: () => void;
  isSubmitting?: boolean;
}

export default function InvestigationModal({
  isOpen,
  onClose,
  stages,
  isComplete,
  result,
  error,
  onRetry,
  onViewReport,
}: InvestigationModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Scroll locking on body while open
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  // Keyboard navigation & Escape key handling
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // Safe dismissal: hides overlay while background task completes safely
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Focus modal container on open
  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Icon mapping for each of the 5 cards
  const getCardIcon = (cardId: number, status: string) => {
    if (status === 'completed') {
      return <Check size={17} className="stroke-[2.6]" />;
    }
    if (status === 'failed') {
      return <AlertCircle size={17} className="stroke-[2]" />;
    }

    switch (cardId) {
      case 1:
        return <CheckSquare size={17} className="stroke-[1.8]" />;
      case 2:
        return <Globe size={17} className="stroke-[1.8]" />;
      case 3:
        return <BrainCircuit size={17} className="stroke-[1.8]" />;
      case 4:
        return <AlertTriangle size={17} className="stroke-[1.8]" />;
      case 5:
        return <LinkIcon size={17} className="stroke-[1.8]" />;
      default:
        return <Shield size={17} className="stroke-[1.8]" />;
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-2.5 sm:p-5 bg-black/55 backdrop-blur-[4px] animate-backdrop-fade overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="investigation-modal-title"
      onClick={(e) => {
        // Safe dismissal on backdrop click
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className="bg-[#FAF9F5] rounded-none shadow-[0_24px_70px_-15px_rgba(0,0,0,0.35)] border border-[#E0DED4] w-full max-h-[88vh] overflow-hidden flex flex-col focus:outline-none animate-modal-enter my-auto flex-shrink-0"
        style={{ width: 'min(760px, calc(100vw - 20px))' }}
      >
        {/* Modal Header */}
        <div className="px-4 sm:px-6 md:px-8 pt-4 md:pt-6 pb-3.5 md:pb-5 border-b border-[#E0DED4] flex items-start justify-between gap-3 sm:gap-4 bg-[#FAF9F5] flex-shrink-0 z-20">
          <div className="flex items-start gap-3 sm:gap-3.5">
            <div
              className={`w-10 h-10 md:w-12 md:h-12 rounded-none border flex items-center justify-center flex-shrink-0 transition-colors ${
                isComplete
                  ? 'bg-[#141413] text-[#FAF9F5] border-[#141413]'
                  : 'bg-[#F0EEE6] text-[#141413] border-[#E0DED4]'
              }`}
            >
              {isComplete ? <Check size={20} className="stroke-[2.5]" /> : <Shield size={19} className="stroke-[1.8]" />}
            </div>
            <div>
              <h2
                id="investigation-modal-title"
                className="font-serif text-[20px] sm:text-[23px] md:text-[27px] font-normal tracking-[-0.01em] text-[#141413] leading-tight"
              >
                {isComplete ? 'Investigation Complete' : 'Running Investigation'}
              </h2>
              <p className="text-[12.5px] sm:text-[12px] md:text-[13px] text-[#625F58] mt-0.5">
                {isComplete
                  ? 'Analysis finished • Risk score and evidence dossier compiled.'
                  : 'Please wait while we analyze this job posting.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0 pt-1">
            {isComplete ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-none text-[11px] font-medium bg-[#F0EEE6] text-[#141413] border border-[#D7D4C9]">
                <Check size={11} className="stroke-[2.5]" />
                Completed
              </span>
            ) : (
              <span className="text-[11px] font-mono text-[#77746C] hidden sm:inline-block">
                ~ 20–60 seconds
              </span>
            )}
          </div>
        </div>

        {/* 5-Card Progress Timeline List & Results */}
        <div className="px-4 sm:px-6 md:px-8 py-4 sm:py-5 overflow-y-auto flex-1 flex flex-col gap-0 divide-y-0">
          {/* Result Summary Box when complete */}
          {isComplete && result && (
            <div className="mb-6 p-4 sm:p-5 border rounded-none bg-[#F0EEE6] border-[#E0DED4] animate-page-enter">
              <div className="pb-4 border-b border-[#E0DED4]">
                <div className="flex items-center gap-2 mb-2">
                  {result.riskLevel === 'high' ? (
                    <span className="px-2.5 py-0.5 rounded-none text-[11px] font-semibold tracking-wider uppercase bg-[#fef2f2] text-[#c5291e] border border-[#fcc9c6]">
                      High Risk Listing
                    </span>
                  ) : result.riskLevel === 'medium' ? (
                    <span className="px-2.5 py-0.5 rounded-none text-[11px] font-semibold tracking-wider uppercase bg-[#fffbeb] text-[#b45309] border border-[#fed7aa]">
                      Review Recommended
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-none text-[11px] font-semibold tracking-wider uppercase bg-[#F0EEE6] text-[#141413] border border-[#D7D4C9]">
                      Low Risk Listing
                    </span>
                  )}
                  <span className="text-[12px] font-mono text-[#77746C]">
                    Verdict: <strong className="text-[#141413] font-semibold">{result.label}</strong>
                  </span>
                </div>
                <div className="flex items-baseline gap-2.5">
                  <span
                    className={`font-serif text-[34px] sm:text-[38px] font-normal leading-none ${
                      result.riskLevel === 'high'
                        ? 'text-[#c5291e]'
                        : result.riskLevel === 'medium'
                        ? 'text-[#b45309]'
                        : 'text-[#141413]'
                    }`}
                  >
                    {(result.fraudProbability * 100).toFixed(1)}%
                  </span>
                  <span className="text-[13px] text-[#625F58]">
                    Estimated Fraud Probability
                  </span>
                </div>
              </div>

              {/* Assessment Summary / Info */}
              <div className="pt-3.5">
                <p className="text-[13px] sm:text-[13px] text-[#625F58] leading-relaxed">
                  {result.assessmentSummary}
                </p>

                {/* Detected Signals Pills */}
                {result.topSuspiciousSignals && result.topSuspiciousSignals.length > 0 && (
                  <div className="mt-3.5 flex flex-wrap items-center gap-1.5">
                    <span className="text-[11.5px] sm:text-[11px] font-mono font-medium text-[#77746C] mr-1">
                      Key warning indicators:
                    </span>
                    {result.topSuspiciousSignals.slice(0, 4).map((signal, idx) => (
                      <span
                        key={idx}
                        className="text-[11.5px] sm:text-[11px] font-mono px-2 py-0.5 bg-[#FFFFFF] border border-[#E0DED4] text-[#141413] rounded-none shadow-2xs"
                      >
                        ⚠ {signal}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {isComplete && (
            <div className="flex items-center gap-2 pb-3 mb-2 border-b border-[#E0DED4]">
              <span className="text-[11px] font-mono font-medium text-[#77746C] uppercase tracking-wider">
                Completed Verification Stages
              </span>
            </div>
          )}
          {stages.map((stage, index) => {
            const isLast = index === stages.length - 1;
            const isCompleted = stage.status === 'completed';
            const isInProgress = stage.status === 'in_progress';
            const isSkipped = stage.status === 'skipped';
            const isFailed = stage.status === 'failed';
            const isPending = stage.status === 'pending';
            const nextStage = stages[index + 1];

            // Box container styling (sharp square)
            let circleStyle = 'bg-[#F0EEE6] text-[#77746C] border-[#E0DED4]';
            if (isCompleted) {
              circleStyle = 'bg-[#141413] text-[#FAF9F5] border-[#141413] animate-check-pop';
            } else if (isInProgress) {
              circleStyle = 'bg-[#FAF9F5] text-[#141413] border-[#141413] ring-2 ring-[#E0DED4] animate-active-pulse';
            } else if (isSkipped) {
              circleStyle = 'bg-[#F0EEE6] text-[#77746C] border-[#E0DED4]';
            } else if (isFailed) {
              circleStyle = 'bg-[#fef2f2] text-[#c5291e] border-[#fcc9c6]';
            }

            const isLineActive = isCompleted || isSkipped;
            const isFlowingToNext = isLineActive && nextStage?.status === 'in_progress';
            const isBothCompleted = isLineActive && nextStage && (nextStage.status === 'completed' || nextStage.status === 'skipped');

            return (
              <div key={stage.id} className="relative flex items-start gap-4 py-3.5 group">
                {/* Vertical timeline connecting line */}
                {!isLast && (
                  <div className="absolute left-[19px] md:left-[21px] top-[44px] bottom-[-2px] w-[2px] z-0">
                    {/* Background track line */}
                    <div className="absolute inset-0 bg-[#E0DED4]" />

                    {/* Filled progress track */}
                    <div
                      className={`absolute top-0 left-0 w-full transition-all duration-500 ease-out ${
                        isBothCompleted
                          ? 'h-full bg-[#141413]'
                          : isFlowingToNext
                          ? 'h-full bg-[#141413]'
                          : isLineActive
                          ? 'h-full bg-[#141413]'
                          : 'h-0'
                      }`}
                    />

                    {/* Animated downward arrow going from this step to the next in-progress step */}
                    {isFlowingToNext && (
                      <div className="absolute left-1/2 -translate-x-1/2 z-20 flex flex-col items-center animate-arrow-down pointer-events-none">
                        <div className="w-5 h-5 rounded-none bg-[#141413] text-[#FAF9F5] border border-[#141413] shadow-[0_2px_8px_rgba(0,0,0,0.3)] flex items-center justify-center">
                          <ArrowDown size={11} className="stroke-[2.8]" />
                        </div>
                      </div>
                    )}

                    {/* Subtle static downward chevron when both stages are completed */}
                    {isBothCompleted && (
                      <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
                        <div className="w-4 h-4 rounded-none bg-[#FAF9F5] text-[#141413] border border-[#D7D4C9] flex items-center justify-center shadow-xs">
                          <ChevronDown size={10} className="stroke-[2.5]" />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Square Stage Icon */}
                <div
                  className={`relative z-10 w-10 h-10 md:w-11 md:h-11 rounded-none border flex items-center justify-center flex-shrink-0 transition-all duration-200 ${circleStyle}`}
                >
                  {getCardIcon(stage.id, stage.status)}
                </div>

                {/* Card Content */}
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 mb-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] sm:text-[11px] font-mono text-[#77746C] font-medium">
                        {stage.stepNumber}
                      </span>
                      <h3
                        className={`text-[14px] md:text-[14px] font-semibold tracking-tight transition-colors ${
                          isPending ? 'text-[#77746C]' : 'text-[#141413]'
                        }`}
                      >
                        {stage.title}
                      </h3>
                    </div>

                    {/* Status Pill Badge (sharp square) */}
                    <div className="self-start sm:self-auto flex-shrink-0">
                      {isCompleted && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-none text-[11px] font-medium bg-[#F0EEE6] text-[#141413] border border-[#D7D4C9]">
                          <Check size={11} className="stroke-[2.5]" />
                          Completed
                        </span>
                      )}
                      {isInProgress && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-none text-[11px] font-medium bg-[#e8f0fe] text-[#1a73e8] border border-[#d2e3fc]">
                          <Loader2 size={11} className="animate-spin text-[#1a73e8]" />
                          In progress
                        </span>
                      )}
                      {isPending && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-none text-[11px] font-medium bg-[#F0EEE6] text-[#77746C] border border-[#E0DED4]">
                          <Clock size={10} />
                          Pending
                        </span>
                      )}
                      {isSkipped && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-none text-[11px] font-medium bg-[#F0EEE6] text-[#77746C] border border-[#E0DED4]">
                          Skipped
                        </span>
                      )}
                      {isFailed && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-none text-[11px] font-medium bg-[#fef2f2] text-[#c5291e] border border-[#fcc9c6]">
                          <AlertCircle size={11} />
                          Failed
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-[12.5px] sm:text-[11.5px] md:text-[12px] text-[#625F58] leading-relaxed">
                    {stage.description}
                  </p>

                  {/* Active In-Progress Bar (sharp square) */}
                  {isInProgress && (
                    <div className="mt-2.5 flex items-center gap-3 max-w-[480px]">
                      <div className="h-1.5 flex-1 bg-[#E0DED4] rounded-none overflow-hidden relative">
                        <div
                          className="h-full bg-[#141413] rounded-none transition-all duration-300 ease-out"
                          style={{
                            width: stage.progress ? `${stage.progress}%` : '60%',
                          }}
                        />
                      </div>
                      <span className="text-[11px] sm:text-[10px] font-mono font-medium text-[#77746C]">
                        {stage.progress ? `${stage.progress}%` : '60%'}
                      </span>
                    </div>
                  )}

                  {/* Factual execution details note */}
                  {stage.detail && !isPending && (
                    <p
                      className={`text-[12px] sm:text-[11px] mt-1.5 font-mono break-words leading-tight ${
                        isFailed ? 'text-[#c5291e]' : 'text-[#77746C]'
                      }`}
                    >
                      ✦ {stage.detail}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer / Completion & Error States */}
        <div className="px-4 sm:px-6 md:px-8 py-3.5 sm:py-4 bg-[#FAF9F5] border-t border-[#E0DED4] flex flex-col sm:flex-row items-center justify-between gap-3 flex-shrink-0">
          {error ? (
            <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-[#c5291e]">
                <AlertCircle size={15} className="flex-shrink-0" />
                <span className="text-[12.5px] font-medium leading-tight">
                  {error.message}
                </span>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                {onRetry && (
                  <button
                    type="button"
                    onClick={onRetry}
                    className="flex-1 sm:flex-none text-[13px] sm:text-[12px] font-medium bg-[#141413] text-[#FAF9F5] hover:bg-[#30302D] px-4 py-2 sm:px-3 sm:py-1.5 rounded-none transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw size={12} />
                    Retry investigation
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="text-[13px] sm:text-[12px] text-[#77746C] hover:text-[#141413] px-3 py-2 sm:py-1.5 transition-colors cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            </div>
          ) : isComplete ? (
            <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-[#141413]">
                <Check size={16} className="stroke-[2.5] flex-shrink-0" />
                <span className="text-[13px] font-medium leading-tight">
                  {result
                    ? `Analysis complete • ${(result.fraudProbability * 100).toFixed(1)}% estimated fraud probability`
                    : 'Investigation complete. Ready to view report.'}
                </span>
              </div>
              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                {onViewReport && (
                  <button
                    type="button"
                    onClick={onViewReport}
                    className="w-full sm:w-auto text-[14px] sm:text-[13px] font-medium bg-[#141413] text-[#FAF9F5] hover:bg-[#30302D] px-5 py-3 sm:py-2.5 rounded-none transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    Show full investigation <ArrowRight size={14} />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1.5 text-[12px] sm:text-[11px] text-[#77746C]">
              <span>Real-time evaluation against EMSCAD ML model and Trust Chain</span>
              <button
                type="button"
                onClick={onClose}
                className="text-[#77746C] hover:text-[#141413] underline cursor-pointer py-0.5"
              >
                Hide overlay (keeps running)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
