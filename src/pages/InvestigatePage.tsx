import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link2, FileText, ArrowRight, Loader2, AlertCircle, RefreshCw, Eye, ChevronDown } from 'lucide-react';
import Header from '../components/Header';
import InvestigationModal from '../components/InvestigationModal';
import {
  analyzeJobPostingWithStream,
  getInitialInvestigationStages,
  buildInvestigationRecord,
  persistInvestigation,
  ApiError,
} from '../services/investigationService';
import type { InvestigationStageState } from '../types/investigation';

type InputMode = 'text' | 'url';

export default function InvestigatePage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<InputMode>('text');
  const [jobUrl, setJobUrl] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [employer, setEmployer] = useState('');
  const [employmentType, setEmploymentType] = useState('Full-time');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [recruiterEmail, setRecruiterEmail] = useState('');
  const [applicationUrl, setApplicationUrl] = useState('');
  const [recruiterMessage, setRecruiterMessage] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorDetail, setErrorDetail] = useState<string | null>(null);

  // Five-Card Live Investigation Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [stages, setStages] = useState<InvestigationStageState[]>(getInitialInvestigationStages());
  const [isComplete, setIsComplete] = useState(false);
  const [modalError, setModalError] = useState<{
    message: string;
    detail?: string;
    failedCardId?: number;
    canRetry?: boolean;
  } | null>(null);
  const [completedRecordId, setCompletedRecordId] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  const executeInvestigation = async () => {
    // Prevent duplicate submissions
    if (loading) return;

    setError(null);
    setErrorDetail(null);
    setModalError(null);
    setIsComplete(false);
    setCompletedRecordId(null);

    const trimmedDescription = jobDescription.trim();
    const trimmedUrl = jobUrl.trim();

    // 1. Validate submitted form
    if (mode === 'url') {
      if (!trimmedUrl) {
        setError('Please enter a public job posting URL (e.g. https://careers.example.com/job/123).');
        return;
      }
      if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
        setError('Job URL must begin with https:// or http://.');
        return;
      }
    } else {
      if (!trimmedDescription) {
        setError('Please provide the job posting description.');
        return;
      }
      if (trimmedDescription.length < 10) {
        setError('Job description is too brief. Please enter at least 10 characters.');
        return;
      }
    }

    // Initialize clean 5 cards with Card 01 in progress
    const initialStages = getInitialInvestigationStages();
    initialStages[0].status = 'in_progress';
    initialStages[0].detail = 'Validating submitted fields and security parameters...';
    setStages(initialStages);

    // Open modal immediately
    setIsModalOpen(true);
    setLoading(true);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      const response = await analyzeJobPostingWithStream(
        {
          description: trimmedDescription || undefined,
          title: jobTitle.trim() || undefined,
          employer_name: employer.trim() || undefined,
          company_profile: employer.trim() || undefined,
          employment_type: employmentType || undefined,
          job_url: trimmedUrl || undefined,
          company_website: companyWebsite.trim() || undefined,
          recruiter_email: recruiterEmail.trim() || undefined,
          application_url: applicationUrl.trim() || undefined,
          recruiter_message: recruiterMessage.trim() || undefined,
        },
        (stageUpdate) => {
          setStages((prevStages) =>
            prevStages.map((stage) => {
              if (stage.id === stageUpdate.card_id) {
                return {
                  ...stage,
                  status: stageUpdate.status,
                  detail: stageUpdate.detail ?? stage.detail,
                  progress: stageUpdate.progress !== undefined ? stageUpdate.progress : stage.progress,
                  error: stageUpdate.error,
                };
              }
              // Automatically mark previous pending stages completed when advancing
              if (stage.id < stageUpdate.card_id && stage.status === 'pending') {
                return { ...stage, status: 'completed' };
              }
              return stage;
            })
          );
        },
        abortController.signal
      );

      // 2. Build full investigation record with real inference results
      const investigationRecord = buildInvestigationRecord(
        {
          jobTitle: jobTitle.trim() || undefined,
          employer: employer.trim() || undefined,
          employmentType,
          sourceUrl: trimmedUrl || undefined,
          companyWebsite: companyWebsite.trim() || undefined,
          recruiterEmail: recruiterEmail.trim() || undefined,
          applicationUrl: applicationUrl.trim() || undefined,
          recruiterMessage: recruiterMessage.trim() || undefined,
          sourceDescription: trimmedDescription,
        },
        response
      );

      // 3. Persist record in application state
      persistInvestigation(investigationRecord);
      setCompletedRecordId(investigationRecord.id);
      setIsComplete(true);

      // Ensure all applicable cards are marked completed
      setStages((prev) =>
        prev.map((s) => ({
          ...s,
          status: s.status === 'skipped' ? 'skipped' : 'completed',
        }))
      );

      // 4. Briefly show completion state and navigate to existing report
      setTimeout(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        navigate(`/investigations/${investigationRecord.id}`);
      }, 1200);
    } catch (err: unknown) {
      if (abortController.signal.aborted) {
        // Safe dismissal without error
        return;
      }

      let errMsg = 'An unexpected error occurred during investigation.';
      let errDetail: string | undefined = undefined;

      if (err instanceof ApiError) {
        errMsg = err.message;
        errDetail = err.detail;
      } else if (err instanceof Error) {
        errMsg = err.message;
      }

      setModalError({
        message: errMsg,
        detail: errDetail,
        canRetry: true,
      });
      setError(errMsg);
      setErrorDetail(errDetail || null);

      // Update failed card if active
      setStages((prev) => {
        const activeIdx = prev.findIndex((s) => s.status === 'in_progress');
        if (activeIdx !== -1) {
          const next = [...prev];
          next[activeIdx] = { ...next[activeIdx], status: 'failed', error: errMsg };
          return next;
        }
        return prev;
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeInvestigation();
  };

  const handleRetry = () => {
    executeInvestigation();
  };

  const handleViewReport = () => {
    if (completedRecordId) {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      navigate(`/investigations/${completedRecordId}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f8f7]">
      <Header />
      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 pt-3 sm:pt-4 md:pt-5 pb-10 flex justify-center">
        <div className="w-full max-w-[720px] bg-white border border-[#e4e4e0] rounded-none p-6 sm:p-8 md:px-9 md:py-7 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
          {/* Back button */}
          <button
            onClick={() => navigate(-1)}
            className="text-[12px] text-[#767672] hover:text-[#111110] transition-colors mb-3 flex items-center gap-1 cursor-pointer font-medium"
          >
            ← Back
          </button>

          {/* Heading */}
          <p className="text-[10px] font-semibold tracking-[0.16em] uppercase text-[#767672] mb-2">
            ML & TRUST CHAIN INVESTIGATION
          </p>
          <h1 className="font-serif text-[34px] sm:text-[40px] leading-[1.1] tracking-[-0.02em] text-[#111110] mb-3">
            Investigate a job posting.
          </h1>
          <p className="text-[13.5px] text-[#6b6b67] leading-relaxed mb-6 max-w-[600px]">
            Submit a job description or a job URL to evaluate recruitment fraud probabilities and run cross-source Trust Chain checks.
          </p>

          {/* Input mode toggle */}
          <div className="inline-flex border border-[#e4e4e0] rounded-none p-[3px] bg-[#f5f5f3] mb-6 gap-1">
            <button
              type="button"
              onClick={() => {
                setMode('text');
                setError(null);
              }}
              className={`flex items-center gap-1.5 text-[12px] font-medium px-3.5 py-1.5 rounded-none transition-all cursor-pointer ${
                mode === 'text'
                  ? 'bg-[#141413] text-white shadow-sm'
                  : 'bg-transparent text-[#6b6b67] hover:text-[#111110]'
              }`}
            >
              <FileText size={13} />
              Paste text
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('url');
                setError(null);
              }}
              className={`flex items-center gap-1.5 text-[12px] font-medium px-3.5 py-1.5 rounded-none transition-all cursor-pointer ${
                mode === 'url'
                  ? 'bg-[#141413] text-white shadow-sm'
                  : 'bg-transparent text-[#6b6b67] hover:text-[#111110]'
              }`}
            >
              <Link2 size={13} />
              Job URL
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* If URL Mode is active, render the Job URL field above */}
            {mode === 'url' && (
              <div className="border border-[#e4e4e0] rounded-none p-4 bg-[#fafaf9]">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-[11px] font-semibold text-[#555552] uppercase tracking-[0.06em]">
                    JOB POSTING URL <span className="text-[#c5291e]">*</span>
                  </label>
                  <span className="text-[10px] text-[#767672]">Public web link</span>
                </div>
                <input
                  type="url"
                  value={jobUrl}
                  onChange={(e) => setJobUrl(e.target.value)}
                  placeholder="https://boards.greenhouse.io/... or https://company.com/careers/..."
                  className="w-full border border-[#e4e4e0] rounded-none px-3.5 py-2.5 text-[13px] font-mono text-[#111110] placeholder:text-[#a8a8a4] focus:outline-none focus:border-[#111110] focus:ring-1 focus:ring-[#111110] transition-colors bg-white mb-2"
                />
                <p className="text-[11px] text-[#767672] leading-relaxed">
                  ✦ ScamShield AI will fetch and extract readable job text for analysis. If the listing requires login or bot verification, paste the description below.
                </p>
              </div>
            )}

            {/* 1. Job Description (Textarea first, matching mockup) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-[11px] font-semibold text-[#555552] uppercase tracking-[0.06em]">
                  {mode === 'url' ? (
                    <>
                       JOB POSTING CONTENT <span className="text-[#8e8e89] font-normal lowercase">(optional fallback)</span>
                    </>
                  ) : (
                    <>
                      JOB POSTING CONTENT <span className="text-[#c5291e]">*</span>
                    </>
                  )}
                </label>
              </div>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the full job posting description, requirements, benefits, or recruiter message here..."
                rows={mode === 'url' ? 4 : 5}
                required={mode === 'text'}
                className="w-full border border-[#e4e4e0] rounded-none px-4 py-3 text-[13px] text-[#111110] placeholder:text-[#a8a8a4] focus:outline-none focus:border-[#111110] focus:ring-1 focus:ring-[#111110] transition-colors bg-white resize-y leading-relaxed font-sans"
              />
              <div className="text-right text-[11px] text-[#8e8e89] mt-1 font-mono">
                {jobDescription.length} / 5000
              </div>
            </div>

            {/* 2. Optional Metadata Row: Title & Company */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-[#555552] uppercase tracking-[0.06em] mb-2">
                  JOB TITLE <span className="text-[#8e8e89] font-normal lowercase">(optional)</span>
                </label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g. Data Entry Specialist"
                  className="w-full border border-[#e4e4e0] rounded-none px-3.5 py-2.5 text-[13px] text-[#111110] placeholder:text-[#a8a8a4] focus:outline-none focus:border-[#111110] focus:ring-1 focus:ring-[#111110] transition-colors bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#555552] uppercase tracking-[0.06em] mb-2">
                  EMPLOYER / COMPANY <span className="text-[#8e8e89] font-normal lowercase">(optional)</span>
                </label>
                <input
                  type="text"
                  value={employer}
                  onChange={(e) => setEmployer(e.target.value)}
                  placeholder="e.g. Acme Logistics LLC"
                  className="w-full border border-[#e4e4e0] rounded-none px-3.5 py-2.5 text-[13px] text-[#111110] placeholder:text-[#a8a8a4] focus:outline-none focus:border-[#111110] focus:ring-1 focus:ring-[#111110] transition-colors bg-white"
                />
              </div>
            </div>

            {/* 3. Employment Type */}
            <div>
              <label className="block text-[11px] font-semibold text-[#555552] uppercase tracking-[0.06em] mb-2">
                EMPLOYMENT TYPE <span className="text-[#8e8e89] font-normal lowercase">(optional)</span>
              </label>
              <div className="relative">
                <select
                  value={employmentType}
                  onChange={(e) => setEmploymentType(e.target.value)}
                  className="w-full border border-[#e4e4e0] rounded-none px-3.5 py-2.5 pr-10 text-[13px] text-[#111110] focus:outline-none focus:border-[#111110] focus:ring-1 focus:ring-[#111110] transition-colors bg-white appearance-none cursor-pointer"
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Temporary">Temporary</option>
                  <option value="Internship">Internship</option>
                  <option value="Other">Other / Unspecified</option>
                </select>
                <ChevronDown size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#767672] pointer-events-none" />
              </div>
            </div>

            {/* 4. Trust Chain Cross-Check Fields (Optional) */}
            <div className="border border-[#e4e4e0] rounded-none p-4 sm:p-5 bg-[#fafaf9] flex flex-col gap-3.5">
              <div className="flex items-center justify-between pb-1">
                <p className="text-[11px] font-bold text-[#111110] uppercase tracking-[0.06em]">
                  TRUST CHAIN CROSS-CHECK <span className="text-[#8e8e89] font-normal lowercase">(optional)</span>
                </p>
                <span className="text-[11px] text-[#767672]">
                  Help verify employer and recruiter details
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-medium text-[#444441] mb-1.5">
                    Official company website
                  </label>
                  <input
                    type="url"
                    value={companyWebsite}
                    onChange={(e) => setCompanyWebsite(e.target.value)}
                    placeholder="https://acmecorp.com"
                    className="w-full border border-[#e4e4e0] rounded-none px-3 py-2 text-[12px] font-mono text-[#111110] placeholder:text-[#a8a8a4] focus:outline-none focus:border-[#111110] focus:ring-1 focus:ring-[#111110] transition-colors bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#444441] mb-1.5">
                    Recruiter email address
                  </label>
                  <input
                    type="email"
                    value={recruiterEmail}
                    onChange={(e) => setRecruiterEmail(e.target.value)}
                    placeholder="recruitment@acmecorp.com"
                    className="w-full border border-[#e4e4e0] rounded-none px-3 py-2 text-[12px] font-mono text-[#111110] placeholder:text-[#a8a8a4] focus:outline-none focus:border-[#111110] focus:ring-1 focus:ring-[#111110] transition-colors bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-medium text-[#444441] mb-1.5">
                    Application destination URL
                  </label>
                  <input
                    type="url"
                    value={applicationUrl}
                    onChange={(e) => setApplicationUrl(e.target.value)}
                    placeholder="https://boards.greenhouse.io/acme/..."
                    className="w-full border border-[#e4e4e0] rounded-none px-3 py-2 text-[12px] font-mono text-[#111110] placeholder:text-[#a8a8a4] focus:outline-none focus:border-[#111110] focus:ring-1 focus:ring-[#111110] transition-colors bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#444441] mb-1.5">
                    Recruiter message / InMail context
                  </label>
                  <input
                    type="text"
                    value={recruiterMessage}
                    onChange={(e) => setRecruiterMessage(e.target.value)}
                    placeholder="Optional context..."
                    className="w-full border border-[#e4e4e0] rounded-none px-3 py-2 text-[12px] text-[#111110] placeholder:text-[#a8a8a4] focus:outline-none focus:border-[#111110] focus:ring-1 focus:ring-[#111110] transition-colors bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Error Message Banner */}
            {error && (
              <div className="border border-[#fcc9c6] bg-[#fef2f2] rounded-none p-4 flex flex-col gap-2">
                <div className="flex items-start gap-2.5">
                  <AlertCircle size={15} className="text-[#c5291e] mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold text-[#c5291e] leading-snug">{error}</p>
                    {errorDetail && (
                      <p className="text-[11px] text-[#6b6b6b] mt-1 font-mono break-all">{errorDetail}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 pt-1 border-t border-[#fcc9c6]/50">
                  <button
                    type="submit"
                    disabled={loading}
                    className="text-[11px] font-medium text-[#c5291e] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw size={11} /> Retry submission
                  </button>
                  <button
                    type="button"
                    onClick={() => setError(null)}
                    className="text-[11px] text-[#767672] hover:text-[#111110] cursor-pointer"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}

            {/* Running in background notice (if modal overlay was hidden) */}
            {loading && !isModalOpen && (
              <div className="border border-[#e4e4e0] bg-[#fafaf9] rounded-none p-3.5 flex items-center justify-between gap-3 animate-in fade-in duration-200">
                <div className="flex items-center gap-2 text-[12px] text-[#111110]">
                  <Loader2 size={13} className="animate-spin text-[#111110] flex-shrink-0" />
                  <span className="font-medium">Investigation running in background...</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="text-[11px] font-medium text-[#111110] underline flex items-center gap-1 cursor-pointer flex-shrink-0 hover:text-[#555552]"
                >
                  <Eye size={12} />
                  Reopen progress modal
                </button>
              </div>
            )}

            {/* 5. Submit CTA (Full width matching mockup: "Run investigation →") */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#111110] hover:bg-[#252522] active:bg-[#000000] text-white font-medium text-[13px] py-3.5 rounded-none flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Investigation running...
                </>
              ) : (
                <>
                  {mode === 'url' ? 'Fetch & run investigation' : 'Run investigation'} <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>
        </div>
      </main>

      {/* Five-Card Live Investigation Modal Overlay */}
      <InvestigationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        stages={stages}
        isComplete={isComplete}
        error={modalError}
        onRetry={handleRetry}
        onViewReport={handleViewReport}
        isSubmitting={loading}
      />
    </div>
  );
}
