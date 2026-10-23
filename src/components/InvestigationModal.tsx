import { useEffect, useRef } from 'react';
import {
  Shield,
  Check,
  Loader2,
  Clock,
  AlertCircle,
  X,
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

export interface InvestigationModalProps {
  isOpen: boolean;
  onClose: () => void;
  stages: InvestigationStageState[];
  currentStageId?: number;
  isComplete: boolean;
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-[3px] animate-backdrop-fade"
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
        className="bg-white rounded-none shadow-[0_20px_60px_-15px_rgba(0,0,0,0.25)] border border-[#e4e4e0] w-full max-h-[88vh] overflow-hidden flex flex-col focus:outline-none animate-modal-enter"
        style={{ width: 'min(760px, calc(100vw - 32px))' }}
      >
        {/* Modal Header */}
        <div className="px-6 md:px-8 pt-6 pb-5 border-b border-[#e4e4e0] flex items-start justify-between gap-4 bg-white sticky top-0 z-20">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 md:w-12 md:h-12 rounded-none bg-[#f7f7f6] border border-[#e4e4e0] flex items-center justify-center flex-shrink-0 text-[#111110]">
              <Shield size={21} className="stroke-[1.8]" />
            </div>
            <div>
              <h2
                id="investigation-modal-title"
                className="font-serif text-[23px] md:text-[27px] font-normal tracking-[-0.01em] text-[#111110] leading-tight"
              >
                Running Investigation
              </h2>
              <p className="text-[12px] md:text-[13px] text-[#6b6b6b] mt-0.5">
                Please wait while we analyze this job posting.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0 pt-1">
            <span className="text-[11px] font-mono text-[#9a9a9a] hidden sm:inline-block">
              ~ 20–60 seconds
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Dismiss investigation overlay"
              className="p-1.5 text-[#9a9a9a] hover:text-[#111110] hover:bg-[#f7f7f6] rounded-none transition-colors cursor-pointer"
            >
              <X size={17} />
            </button>
          </div>
        </div>

        {/* 5-Card Progress Timeline List */}
        <div className="px-6 md:px-8 py-5 overflow-y-auto flex-1 flex flex-col gap-0 divide-y-0">
          {stages.map((stage, index) => {
            const isLast = index === stages.length - 1;
            const isCompleted = stage.status === 'completed';
            const isInProgress = stage.status === 'in_progress';
            const isSkipped = stage.status === 'skipped';
            const isFailed = stage.status === 'failed';
            const isPending = stage.status === 'pending';
            const nextStage = stages[index + 1];

            // Box container styling (sharp square)
            let circleStyle = 'bg-[#fafaf9] text-[#767672] border-[#e4e4e0]';
            if (isCompleted) {
              circleStyle = 'bg-[#e6f4ea] text-[#137333] border-[#ceead6] animate-check-pop';
            } else if (isInProgress) {
              circleStyle = 'bg-[#e8f0fe] text-[#1a73e8] border-[#1a73e8] ring-2 ring-[#e8f0fe] animate-active-pulse';
            } else if (isSkipped) {
              circleStyle = 'bg-[#f0efed] text-[#9a9a9a] border-[#e4e4e0]';
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
                    <div className="absolute inset-0 bg-[#e4e4e0]" />

                    {/* Filled progress track */}
                    <div
                      className={`absolute top-0 left-0 w-full transition-all duration-500 ease-out ${
                        isBothCompleted
                          ? 'h-full bg-[#137333]'
                          : isFlowingToNext
                          ? 'h-full bg-gradient-to-b from-[#137333] via-[#1a73e8] to-[#1a73e8]'
                          : isLineActive
                          ? 'h-full bg-[#137333]'
                          : 'h-0'
                      }`}
                    />

                    {/* Animated downward arrow going from this step to the next in-progress step */}
                    {isFlowingToNext && (
                      <div className="absolute left-1/2 -translate-x-1/2 z-20 flex flex-col items-center animate-arrow-down pointer-events-none">
                        <div className="w-5 h-5 rounded-none bg-[#111110] text-white border border-[#111110] shadow-[0_2px_8px_rgba(0,0,0,0.3)] flex items-center justify-center">
                          <ArrowDown size={11} className="stroke-[2.8]" />
                        </div>
                      </div>
                    )}

                    {/* Subtle static downward chevron when both stages are completed */}
                    {isBothCompleted && (
                      <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
                        <div className="w-4 h-4 rounded-none bg-[#e6f4ea] text-[#137333] border border-[#ceead6] flex items-center justify-center shadow-xs">
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
                      <span className="text-[11px] font-mono text-[#9a9a9a] font-medium">
                        {stage.stepNumber}
                      </span>
                      <h3
                        className={`text-[13px] md:text-[14px] font-semibold tracking-tight transition-colors ${
                          isPending ? 'text-[#767672]' : 'text-[#111110]'
                        }`}
                      >
                        {stage.title}
                      </h3>
                    </div>

                    {/* Status Pill Badge (sharp square) */}
                    <div className="self-start sm:self-auto flex-shrink-0">
                      {isCompleted && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-none text-[11px] font-medium bg-[#e6f4ea] text-[#137333] border border-[#ceead6]">
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
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-none text-[11px] font-medium bg-[#f7f7f6] text-[#767672] border border-[#e4e4e0]">
                          <Clock size={10} />
                          Pending
                        </span>
                      )}
                      {isSkipped && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-none text-[11px] font-medium bg-[#f0efed] text-[#767672] border border-[#e4e4e0]">
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
                  <p className="text-[11px] md:text-[12px] text-[#6b6b6b] leading-relaxed">
                    {stage.description}
                  </p>

                  {/* Active In-Progress Bar (sharp square) */}
                  {isInProgress && (
                    <div className="mt-2.5 flex items-center gap-3 max-w-[480px]">
                      <div className="h-1.5 flex-1 bg-[#f0efed] rounded-none overflow-hidden relative">
                        <div
                          className="h-full bg-[#111110] rounded-none transition-all duration-300 ease-out"
                          style={{
                            width: stage.progress ? `${stage.progress}%` : '60%',
                          }}
                        />
                      </div>
                      <span className="text-[10px] font-mono font-medium text-[#767672]">
                        {stage.progress ? `${stage.progress}%` : '60%'}
                      </span>
                    </div>
                  )}

                  {/* Factual execution details note */}
                  {stage.detail && !isPending && (
                    <p
                      className={`text-[11px] mt-1 font-mono break-words leading-tight ${
                        isFailed ? 'text-[#c5291e]' : 'text-[#767672]'
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
        <div className="px-6 md:px-8 py-4 bg-[#fafaf9] border-t border-[#e4e4e0] flex flex-col sm:flex-row items-center justify-between gap-3">
          {error ? (
            <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-[#c5291e]">
                <AlertCircle size={15} className="flex-shrink-0" />
                <span className="text-[12px] font-medium leading-tight">
                  {error.message}
                </span>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                {onRetry && (
                  <button
                    type="button"
                    onClick={onRetry}
                    className="flex-1 sm:flex-none text-[12px] font-medium bg-[#111110] text-white hover:bg-[#2b2b28] px-3 py-1.5 rounded-none transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw size={12} />
                    Retry investigation
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="text-[12px] text-[#767672] hover:text-[#111110] px-2 py-1.5 transition-colors cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            </div>
          ) : isComplete ? (
            <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-[#137333]">
                <Check size={16} className="stroke-[2.5]" />
                <span className="text-[13px] font-medium">
                  Investigation complete. Navigating to report...
                </span>
              </div>
              {onViewReport && (
                <button
                  type="button"
                  onClick={onViewReport}
                  className="w-full sm:w-auto text-[12px] font-medium bg-[#111110] text-white hover:bg-[#2b2b28] px-4 py-2 rounded-none transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                >
                  View investigation report <ArrowRight size={13} />
                </button>
              )}
            </div>
          ) : (
            <div className="w-full flex items-center justify-between text-[11px] text-[#767672]">
              <span>Real-time evaluation against EMSCAD ML model and Trust Chain</span>
              <button
                type="button"
                onClick={onClose}
                className="text-[#9a9a9a] hover:text-[#111110] underline cursor-pointer"
              >
                Hide overlay (keeps running)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
