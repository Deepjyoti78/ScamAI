import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Link as LinkIcon,
  Mail,
  MousePointer,
  Layers,
  Globe,
  ShieldAlert,
  Users,
  Check,
  X,
  AlertTriangle,
  Search,
  ArrowRight,
  Info,
  MapPin,
  Briefcase,
  Coins,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

/* ── REUSABLE CRISP JOB POSTING CARD ── */
function JobPostingCard({
  className = '',
  isApplyActive = false,
  onApplyClick,
}: {
  className?: string;
  isApplyActive?: boolean;
  onApplyClick?: () => void;
}) {
  const navigate = useNavigate();

  return (
    <div
      className={`bg-[#FFFFFF] border border-[#E0DED4] rounded-none p-4 sm:p-5 shadow-[0_2px_12px_rgba(20,20,19,0.04),inset_0_1px_0_0_#FFFFFF] relative transition-all duration-300 ${
        isApplyActive ? 'border-[#141413] ring-1 ring-[#141413]/20 shadow-[0_4px_20px_rgba(20,20,19,0.08)]' : ''
      } ${className}`}
    >
      {/* Specular top highlight */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-white pointer-events-none z-10" />

      {/* Header with avatar */}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-9 h-9 rounded-none bg-[#F5F4EE] border border-[#E0DED4] flex items-center justify-center font-bold text-[14px] text-[#141413] flex-shrink-0">
          R
        </div>
        <div className="min-w-0">
          <h4 className="text-[14.5px] font-bold text-[#141413] leading-tight truncate">
            Product Designer
          </h4>
          <p className="text-[11.5px] text-[#77746C] leading-tight mt-0.5">
            RapidTech Solutions
          </p>
        </div>
      </div>

      {/* Meta tags matching Image 2 */}
      <div className="flex items-center gap-2 mb-3">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-none bg-[#F5F4EE] border border-[#E0DED4] text-[10px] font-mono text-[#55524B]">
          <MapPin size={11} className="text-[#55524B]" />
          Remote
        </span>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-none bg-[#F5F4EE] border border-[#E0DED4] text-[10px] font-mono text-[#55524B]">
          <Briefcase size={11} className="text-[#55524B]" />
          Full-time
        </span>
      </div>

      {/* Excerpt */}
      <p className="text-[11.5px] text-[#55524B] leading-relaxed mb-4">
        Join our product team to design intuitive, user-centric experiences and drive growth.
      </p>

      {/* Action button: Apply Now with pulsing / highlighted state */}
      <div className="relative">
        <button
          type="button"
          onClick={onApplyClick || (() => navigate('/investigate'))}
          className={`w-full inline-flex items-center justify-center gap-2 h-[34px] px-3 rounded-none text-[12px] font-semibold tracking-wide transition-all duration-300 cursor-pointer ${
            isApplyActive
              ? 'bg-[#16A34A] text-white ring-2 ring-[#16A34A] ring-offset-2 scale-[1.02] shadow-[0_0_18px_rgba(22,163,74,0.4)]'
              : 'bg-[#141413] text-[#FAF9F5] hover:bg-[#262523] active:scale-[0.99]'
          }`}
        >
          <span>Apply Now</span>
          <ArrowRight size={13} className={isApplyActive ? 'translate-x-1 transition-transform' : ''} />
        </button>

        {isApplyActive && (
          <span className="absolute -top-2.5 right-2 px-1.5 py-0.5 bg-[#16A34A] text-white font-mono text-[9px] font-bold rounded-none shadow uppercase animate-bounce">
            Triggered
          </span>
        )}
      </div>
    </div>
  );
}

/* ── STEP 01: LAPTOP SCREEN WITH FLOATING URL BAR & DOTTED ARROW (IMAGE 2) ── */
function LaptopInputMockup({
  typedUrl,
  isInputActive,
  isArrowActive,
  onSearchClick,
}: {
  typedUrl: string;
  isInputActive: boolean;
  isArrowActive: boolean;
  onSearchClick: () => void;
}) {
  return (
    <div className="relative flex flex-col items-center justify-center py-2 w-full">
      {/* 3D Monochrome Laptop Render from public directory */}
      <div className="relative w-full max-w-[340px] flex items-center justify-center">
        {/* Decorative olive-green speed burst lines (matching Image 2) */}
        <div className="absolute -top-3.5 right-8 sm:right-12 flex items-end gap-1.5 pointer-events-none select-none z-20">
          <span className="w-[2px] h-3.5 bg-[#4A6B3E] transform -rotate-[30deg] origin-bottom rounded-none" />
          <span className="w-[2px] h-4.5 bg-[#4A6B3E] transform -translate-y-0.5 rounded-none" />
          <span className="w-[2px] h-3.5 bg-[#4A6B3E] transform rotate-[30deg] origin-bottom rounded-none" />
        </div>

        <img
          src="/Monochrome Laptop UI Render.png"
          alt="Job Posting on Laptop"
          className="w-full h-auto max-h-[220px] object-contain drop-shadow-[0_8px_24px_rgba(20,20,19,0.09)] mix-blend-multiply select-none pointer-events-none"
        />

        {/* Floating URL Pill Overlay with typing animation (matching Image 2) */}
        <div
          className={`absolute top-[46%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[94%] max-w-[330px] bg-[#FFFFFF] border-2 rounded-none p-1.5 shadow-[0_8px_24px_rgba(20,20,19,0.18)] z-10 flex items-center gap-2 transition-all duration-300 ${
            isInputActive
              ? 'border-[#16A34A] ring-2 ring-[#16A34A]/30 shadow-[0_0_20px_rgba(22,163,74,0.2)]'
              : 'border-[#141413]'
          }`}
        >
          <LinkIcon size={13} className={`flex-shrink-0 ml-1 transition-colors ${isInputActive ? 'text-[#16A34A]' : 'text-[#4A6B3E]'}`} />
          <div className="text-[10px] sm:text-[10.5px] font-mono text-[#141413] truncate font-semibold flex-1 flex items-center">
            <span>{typedUrl}</span>
            {isInputActive && (
              <span className="w-[2px] h-3.5 bg-[#16A34A] ml-0.5 animate-pulse inline-block" />
            )}
          </div>
          <button
            type="button"
            onClick={onSearchClick}
            className={`w-6 h-6 flex items-center justify-center rounded-none flex-shrink-0 transition-colors cursor-pointer ${
              isInputActive ? 'bg-[#16A34A] text-white scale-105' : 'bg-[#141413] text-white hover:bg-[#262523]'
            }`}
            title="Analyze this URL"
          >
            <Search size={11} />
          </button>
        </div>

        {/* Directed Dotted Flow Arrow connecting URL search bar down towards the Apply Now button (matching User Request 1) */}
        <svg
          className="hidden lg:block absolute -right-16 top-[46%] w-32 h-24 pointer-events-none z-20 overflow-visible text-[#4A6B3E]"
          viewBox="0 0 128 96"
          fill="none"
        >
          <defs>
            <marker
              id="dot-arrowhead"
              markerWidth="7"
              markerHeight="7"
              refX="5"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0,1 6,3.5 0,6" fill={isArrowActive ? '#16A34A' : '#4A6B3E'} />
            </marker>
          </defs>
          <path
            d="M 4 8 C 24 8, 32 76, 122 76"
            stroke={isArrowActive ? '#16A34A' : '#4A6B3E'}
            strokeWidth="1.75"
            strokeDasharray="4 4"
            className={isArrowActive ? 'animate-flow-dash' : ''}
            markerEnd="url(#dot-arrowhead)"
          />
        </svg>
      </div>
    </div>
  );
}

export default function WorkflowSection() {
  const navigate = useNavigate();

  /* ── ANIMATION TIMELINE STATE (Phases 0 through 5) ── */
  const [animPhase, setAnimPhase] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [typedUrl, setTypedUrl] = useState<string>('careers-rapidtech.com/jobs/product-designer');
  const [modelScore, setModelScore] = useState<number>(94);

  const FULL_URL = 'careers-rapidtech.com/jobs/product-designer';

  /* Auto-advancing timeline loop */
  useEffect(() => {
    if (!isPlaying) return;

    let timeoutId: ReturnType<typeof setTimeout>;

    if (animPhase === 0) {
      // Phase 0: Type URL (0 - 2.8s)
      let charIndex = 0;
      setTypedUrl('');
      const typeInterval = setInterval(() => {
        charIndex++;
        setTypedUrl(FULL_URL.slice(0, charIndex));
        if (charIndex >= FULL_URL.length) {
          clearInterval(typeInterval);
        }
      }, 45);

      timeoutId = setTimeout(() => {
        clearInterval(typeInterval);
        setTypedUrl(FULL_URL);
        setAnimPhase(1);
      }, 2800);

      return () => {
        clearInterval(typeInterval);
        clearTimeout(timeoutId);
      };
    } else if (animPhase === 1) {
      // Phase 1: Dotted arrow travels to Apply Now button (2.8s - 5.0s)
      timeoutId = setTimeout(() => {
        setAnimPhase(2);
      }, 2200);
      return () => clearTimeout(timeoutId);
    } else if (animPhase === 2) {
      // Phase 2: Extract signals to 6 pills (5.0s - 8.0s)
      timeoutId = setTimeout(() => {
        setAnimPhase(3);
      }, 3000);
      return () => clearTimeout(timeoutId);
    } else if (animPhase === 3) {
      // Phase 3: Straight dotted lines to AI brain analysis engine (8.0s - 11.2s)
      timeoutId = setTimeout(() => {
        setAnimPhase(4);
      }, 3200);
      return () => clearTimeout(timeoutId);
    } else if (animPhase === 4) {
      // Phase 4: Bottom line connects to 4 evidence cards below (11.2s - 14.5s)
      timeoutId = setTimeout(() => {
        setAnimPhase(5);
      }, 3300);
      return () => clearTimeout(timeoutId);
    } else if (animPhase === 5) {
      // Phase 5: 4 cards join together into final verdict (14.5s - 19.0s)
      let currentScore = 0;
      setModelScore(0);
      const scoreInterval = setInterval(() => {
        currentScore += 3;
        if (currentScore >= 94) {
          currentScore = 94;
          clearInterval(scoreInterval);
        }
        setModelScore(currentScore);
      }, 30);

      timeoutId = setTimeout(() => {
        clearInterval(scoreInterval);
        setModelScore(94);
        setAnimPhase(0); // loop back
      }, 4500);

      return () => {
        clearInterval(scoreInterval);
        clearTimeout(timeoutId);
      };
    }
  }, [animPhase, isPlaying]);

  return (
    <section id="workflow" className="w-full border-t border-[#E0DED4] px-4 sm:px-6 lg:px-10 py-12 sm:py-16 md:py-20 bg-[#FAF9F5] relative">
      {/* Inline styles for animated stroke-dashoffset */}
      <style>{`
        @keyframes dash-flow {
          from {
            stroke-dashoffset: 24;
          }
          to {
            stroke-dashoffset: 0;
          }
        }
        .animate-flow-dash {
          animation: dash-flow 0.8s linear infinite;
        }
        .animate-flow-dash-fast {
          animation: dash-flow 0.5s linear infinite;
        }
      `}</style>

      <div className="max-w-[1140px] mx-auto">

        {/* ── SECTION HEADER & LIVE PLAYBACK CONTROLS ── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 sm:mb-14">
          <div>
            <div className="flex items-center gap-3 mb-2 animate-text-reveal">
              <div className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-none bg-[#262523] text-[#FAF9F5] font-mono text-[11px] font-bold tracking-widest uppercase">
                04
              </div>
              <span className="text-[#D0CDC2] font-mono text-[16px]">|</span>
              <h2 className="text-[28px] sm:text-[36px] md:text-[40px] font-serif font-normal text-[#141413] tracking-tight leading-[1.1]">
                How It Works
              </h2>
            </div>
            <p className="text-[14px] sm:text-[15px] text-[#625F58] font-normal max-w-xl pl-0 sm:pl-1">
              From job posting to informed decision through connected, explainable AI verification.
            </p>
          </div>

          {/* Interactive Playback Control Bar */}
          <div className="flex items-center gap-2 bg-[#FFFFFF] border border-[#E0DED4] p-1.5 rounded-none shadow-sm flex-shrink-0">
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#141413] text-[#FAF9F5] text-[11px] font-mono font-medium rounded-none hover:bg-[#262523] transition-colors cursor-pointer"
              title={isPlaying ? 'Pause animation walkthrough' : 'Resume animation walkthrough'}
            >
              {isPlaying ? (
                <>
                  <Pause size={11} />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play size={11} />
                  <span>Play</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setAnimPhase(0);
                setTypedUrl('');
                setIsPlaying(true);
              }}
              className="p-1.5 text-[#55524B] hover:text-[#141413] border border-transparent hover:border-[#E0DED4] rounded-none transition-colors cursor-pointer"
              title="Restart animation walkthrough"
            >
              <RotateCcw size={12} />
            </button>

            <div className="h-4 w-[1px] bg-[#E0DED4]" />

            {/* Step Jump Pills */}
            <div className="flex items-center gap-1">
              {[
                { step: 1, label: '01' },
                { step: 2, label: '02' },
                { step: 3, label: '03' },
                { step: 4, label: '04' },
                { step: 5, label: '05' },
              ].map((s) => {
                const isActive = animPhase === s.step || (s.step === 1 && animPhase === 0);
                return (
                  <button
                    key={s.step}
                    type="button"
                    onClick={() => {
                      setAnimPhase(s.step);
                      setTypedUrl(FULL_URL);
                    }}
                    className={`px-2 py-0.5 font-mono text-[10px] font-semibold rounded-none transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#141413] text-white shadow-sm'
                        : 'text-[#77746C] hover:bg-[#F5F4EE] hover:text-[#141413]'
                    }`}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── TIMELINE VERTICAL STACK (STEPS 01 - 05) ── */}
        <div className="relative flex flex-col gap-10 sm:gap-12 md:gap-14">

          {/* Continuous Left Spine Line (visible on md+) */}
          <div className="hidden md:block absolute left-[10px] top-[24px] bottom-[30px] w-[1px] bg-[#E0DED4] pointer-events-none" />

          {/* ══════════════════════════════════════════════════════════════
              STEP 01: SUBMIT A JOB POSTING (IMAGE 2)
          ══════════════════════════════════════════════════════════════ */}
          <div className="relative flex flex-col md:flex-row items-stretch gap-6 md:gap-10">
            {/* Timeline node dot (md+) */}
            <div className="hidden md:flex absolute left-0 top-[24px] w-5 h-5 -translate-x-[0px] rounded-full border border-[#D0CDC2] bg-[#FAF9F5] items-center justify-center z-10 flex-shrink-0">
              <span className={`w-2 h-2 rounded-full transition-colors ${animPhase <= 1 ? 'bg-[#16A34A] scale-125' : 'bg-[#141413]'}`} />
            </div>

            {/* Step Left Meta Column */}
            <div className="md:w-[280px] lg:w-[310px] md:pl-9 flex-shrink-0">
              <div className="inline-flex items-center gap-2 mb-3">
                <span className="px-2 py-0.5 rounded-none border border-[#D0CDC2] bg-[#FAF9F6] font-mono text-[11px] font-bold text-[#141413]">
                  01
                </span>
                <span className="px-2 py-0.5 rounded-none bg-[#F0EEE6] border border-[#E2DFD7] font-mono text-[9.5px] uppercase tracking-wider text-[#625F58] font-semibold">
                  Job Input
                </span>
              </div>
              <h3 className="text-[22px] sm:text-[25px] font-serif font-normal text-[#141413] tracking-tight leading-snug mb-2">
                Submit a job posting
              </h3>
              <p className="text-[13px] sm:text-[13.5px] text-[#55524B] leading-relaxed mb-4">
                Paste a job URL to turn it into readable, structured job content.
              </p>
              {/* 4-dash pagination indicator matching Image 2 */}
              <div className="flex items-center gap-1.5 pt-1">
                <span className={`w-4 h-[3px] rounded-none transition-colors ${animPhase <= 1 ? 'bg-[#16A34A]' : 'bg-[#141413]'}`} />
                <span className="w-4 h-[3px] bg-[#E0DED4] rounded-none" />
                <span className="w-4 h-[3px] bg-[#E0DED4] rounded-none" />
                <span className="w-4 h-[3px] bg-[#E0DED4] rounded-none" />
              </div>
            </div>

            {/* Step Right Visual Card */}
            <div className={`flex-1 bg-[#FAF9F6] border rounded-none p-5 sm:p-6 shadow-[0_2px_12px_rgba(20,20,19,0.02)] relative overflow-hidden transition-all duration-500 ${
              animPhase <= 1 ? 'border-[#141413] ring-1 ring-[#141413]/10' : 'border-[#E0DED4]'
            }`}>
              <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-6 items-center relative">
                {/* Left: 3D Laptop Mockup with Floating URL Bar & Olive Burst lines */}
                <LaptopInputMockup
                  typedUrl={typedUrl}
                  isInputActive={animPhase === 0}
                  isArrowActive={animPhase === 1}
                  onSearchClick={() => setAnimPhase(1)}
                />

                {/* Right: Extracted Job Card with Apply Now button connection */}
                <div className="flex justify-center lg:justify-end">
                  <JobPostingCard
                    className="w-full max-w-[290px]"
                    isApplyActive={animPhase === 1}
                    onApplyClick={() => setAnimPhase(2)}
                  />
                </div>
              </div>
            </div>
          </div>


          {/* ══════════════════════════════════════════════════════════════
              STEP 02: EXTRACT SIGNALS (IMAGE 3 - STRAIGHT DOTTED LINES)
          ══════════════════════════════════════════════════════════════ */}
          <div className="relative flex flex-col md:flex-row items-stretch gap-6 md:gap-10">
            {/* Timeline node dot (md+) */}
            <div className="hidden md:flex absolute left-0 top-[24px] w-5 h-5 -translate-x-[0px] rounded-full border border-[#D0CDC2] bg-[#FAF9F5] items-center justify-center z-10 flex-shrink-0">
              <span className={`w-2 h-2 rounded-full transition-colors ${animPhase === 2 ? 'bg-[#16A34A] scale-125' : 'bg-[#141413]'}`} />
            </div>

            {/* Step Left Meta Column */}
            <div className="md:w-[280px] lg:w-[310px] md:pl-9 flex-shrink-0">
              <div className="inline-flex items-center gap-2 mb-3">
                <span className="px-2 py-0.5 rounded-none border border-[#D0CDC2] bg-[#FAF9F6] font-mono text-[11px] font-bold text-[#141413]">
                  02
                </span>
                <span className="px-2 py-0.5 rounded-none bg-[#F0EEE6] border border-[#E2DFD7] font-mono text-[9.5px] uppercase tracking-wider text-[#625F58] font-semibold">
                  Extract Signals
                </span>
              </div>
              <h3 className="text-[22px] sm:text-[25px] font-serif font-normal text-[#141413] tracking-tight leading-snug mb-2">
                Extract signals
              </h3>
              <p className="text-[13px] sm:text-[13.5px] text-[#55524B] leading-relaxed">
                Analyze the job posting and extract key signals that help assess risk.
              </p>
            </div>

            {/* Step Right Visual Card */}
            <div className={`flex-1 bg-[#FAF9F6] border rounded-none p-5 sm:p-6 shadow-[0_2px_12px_rgba(20,20,19,0.02)] relative overflow-hidden transition-all duration-500 ${
              animPhase === 2 ? 'border-[#141413] ring-1 ring-[#141413]/10' : 'border-[#E0DED4]'
            }`}>
              <div className="flex flex-col lg:flex-row items-center justify-between gap-6 relative">

                {/* Left: Parsed Job Card */}
                <div className="w-full lg:w-[260px] flex-shrink-0">
                  <JobPostingCard />
                </div>

                {/* Center: STRAIGHT DOTTED Branching Lines (Matching User Request 2) */}
                <div className="hidden lg:block w-[70px] h-[264px] relative flex-shrink-0">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 70 264" fill="none">
                    {/* Origin point dot on left edge (touching right edge of Job card) */}
                    <circle cx="0" cy="132" r="3.5" fill="#141413" />

                    {/* 6 STRAIGHT DOTTED lines fanning out to the 6 feature pills */}
                    {[18, 62, 108, 154, 200, 246].map((yTarget, i) => (
                      <g key={i}>
                        <line
                          x1="0"
                          y1="132"
                          x2="70"
                          y2={yTarget}
                          stroke={animPhase === 2 ? '#16A34A' : '#141413'}
                          strokeWidth="1.5"
                          strokeDasharray="4 4"
                          className={animPhase === 2 ? 'animate-flow-dash' : ''}
                        />
                        <circle
                          cx="70"
                          cy={yTarget}
                          r={animPhase === 2 ? 3 : 2.5}
                          fill={animPhase === 2 ? '#16A34A' : '#141413'}
                          className="transition-colors duration-300"
                        />
                      </g>
                    ))}
                  </svg>
                </div>

                {/* Right: 6 Signal Feature Pills with Sequential Illumination */}
                <div className="w-full lg:flex-1 space-y-2">
                  {[
                    { icon: <FileText size={13} className="text-[#141413]" />, title: 'Job content' },
                    { icon: <LinkIcon size={13} className="text-[#141413]" />, title: 'Domain & URL' },
                    { icon: <Mail size={13} className="text-[#DC2626]" />, title: 'Recruiter email' },
                    { icon: <MousePointer size={13} className="text-[#141413]" />, title: 'Application destination' },
                    { icon: <Coins size={13} className="text-[#DC2626]" />, title: 'Payment request' },
                    { icon: <Layers size={13} className="text-[#141413]" />, title: 'Employer & web evidence' },
                  ].map((sig, i) => {
                    const isPillActive = animPhase === 2;
                    return (
                      <div
                        key={i}
                        className={`bg-[#FFFFFF] border rounded-none px-3.5 py-2 flex items-center justify-between shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition-all duration-300 relative ${
                          isPillActive
                            ? 'border-[#141413] ring-1 ring-[#141413]/15 shadow-[0_2px_10px_rgba(20,20,19,0.08)] translate-x-1'
                            : 'border-[#E0DED4] hover:border-[#141413]/40'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="flex items-center justify-center text-[#141413] flex-shrink-0">
                            {sig.icon}
                          </span>
                          {/* Vertical dividing rule matching Image 3 */}
                          <span className="w-[1px] h-3.5 bg-[#E0DED4] flex-shrink-0" />
                          <span className="text-[12.5px] font-medium text-[#141413]">
                            {sig.title}
                          </span>
                        </div>
                        {isPillActive && (
                          <span className="text-[9.5px] font-mono text-[#16A34A] font-semibold uppercase animate-pulse">
                            Captured
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>


          {/* ══════════════════════════════════════════════════════════════
              STEP 03: ANALYZE WITH SCAMSHIELD AI (STRAIGHT DOTTED LINES)
          ══════════════════════════════════════════════════════════════ */}
          <div className="relative flex flex-col md:flex-row items-stretch gap-6 md:gap-10">
            {/* Timeline node dot (md+) */}
            <div className="hidden md:flex absolute left-0 top-[24px] w-5 h-5 -translate-x-[0px] rounded-full border border-[#D0CDC2] bg-[#FAF9F5] items-center justify-center z-10 flex-shrink-0">
              <span className={`w-2 h-2 rounded-full transition-colors ${animPhase === 3 ? 'bg-[#16A34A] scale-125' : 'bg-[#141413]'}`} />
            </div>

            {/* Step Left Meta Column */}
            <div className="md:w-[280px] lg:w-[310px] md:pl-9 flex-shrink-0">
              <div className="inline-flex items-center gap-2 mb-3">
                <span className="px-2 py-0.5 rounded-none border border-[#D0CDC2] bg-[#FAF9F6] font-mono text-[11px] font-bold text-[#141413]">
                  03
                </span>
                <span className="px-2 py-0.5 rounded-none bg-[#F0EEE6] border border-[#E2DFD7] font-mono text-[9.5px] uppercase tracking-wider text-[#625F58] font-semibold">
                  Analysis Engine
                </span>
              </div>
              <h3 className="text-[22px] sm:text-[25px] font-serif font-normal text-[#141413] tracking-tight leading-snug mb-2">
                Analyze with ScamShield AI
              </h3>
              <p className="text-[13px] sm:text-[13.5px] text-[#55524B] leading-relaxed">
                Use ML analysis and trust checks to assess the signals and estimate recruitment fraud risk.
              </p>
            </div>

            {/* Step Right Visual Card */}
            <div className={`flex-1 bg-[#FAF9F6] border rounded-none p-5 sm:p-6 shadow-[0_2px_12px_rgba(20,20,19,0.02)] relative overflow-hidden transition-all duration-500 ${
              animPhase === 3 ? 'border-[#141413] ring-1 ring-[#141413]/10' : 'border-[#E0DED4]'
            }`}>
              <div className="flex flex-col lg:flex-row items-center gap-4 lg:gap-6 relative">

                {/* Left: 6 Input Feature Pills with right connection dots */}
                <div className="w-full lg:w-[210px] space-y-2 flex-shrink-0">
                  {[
                    { icon: <FileText size={12} />, title: 'Job content' },
                    { icon: <LinkIcon size={12} />, title: 'Domain & URL' },
                    { icon: <Mail size={12} className="text-[#DC2626]" />, title: 'Recruiter email' },
                    { icon: <MousePointer size={12} />, title: 'Application destination' },
                    { icon: <Coins size={12} className="text-[#DC2626]" />, title: 'Payment request' },
                    { icon: <Layers size={12} />, title: 'Employer & web evidence' },
                  ].map((sig, i) => (
                    <div
                      key={i}
                      className="bg-[#FFFFFF] border border-[#E0DED4] rounded-none px-3 py-2 flex items-center justify-between shadow-[0_1px_2px_rgba(0,0,0,0.02)] relative"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-[#141413] flex-shrink-0">{sig.icon}</span>
                        <span className="w-[1px] h-3 bg-[#E0DED4] flex-shrink-0" />
                        <span className="text-[11.5px] font-medium text-[#141413] truncate">
                          {sig.title}
                        </span>
                      </div>
                      {/* Connection node dot on right edge */}
                      <span className={`w-2 h-2 rounded-full transition-colors ${animPhase === 3 ? 'bg-[#16A34A]' : 'bg-[#141413]'}`} />
                    </div>
                  ))}
                </div>

                {/* Center & Right: Unified Canvas with STRAIGHT DOTTED lines converging into the Orbit (Matching User Request 3) */}
                <div className="flex-1 relative w-full h-[280px] flex items-center">
                  <svg className="w-full h-full absolute inset-0 overflow-visible" viewBox="0 0 490 280" fill="none">
                    {/* 6 STRAIGHT DOTTED lines from left pills (x=0) to central junction node (x=60, y=140) */}
                    {[19, 67, 115, 163, 211, 259].map((yOrigin, i) => (
                      <g key={i}>
                        <line
                          x1="0"
                          y1={yOrigin}
                          x2="60"
                          y2="140"
                          stroke={animPhase === 3 ? '#16A34A' : '#141413'}
                          strokeWidth="1.5"
                          strokeDasharray="4 4"
                          className={animPhase === 3 ? 'animate-flow-dash' : ''}
                        />
                        <circle
                          cx="0"
                          cy={yOrigin}
                          r={animPhase === 3 ? 3 : 2.5}
                          fill={animPhase === 3 ? '#16A34A' : '#141413'}
                        />
                      </g>
                    ))}

                    {/* Central convergence node dot */}
                    <circle cx="60" cy="140" r="4" fill={animPhase === 3 ? '#16A34A' : '#141413'} />

                    {/* Straight Dotted Horizontal line touching the circular orbit edge directly at x=88 (218 - 130) */}
                    <line
                      x1="60"
                      y1="140"
                      x2="88"
                      y2="140"
                      stroke={animPhase === 3 ? '#16A34A' : '#141413'}
                      strokeWidth="1.5"
                      strokeDasharray="4 4"
                      className={animPhase === 3 ? 'animate-flow-dash' : ''}
                    />

                    {/* Dashed Circular Orbit Ring (cx=218, cy=140, r=130) */}
                    <circle
                      cx="218"
                      cy="140"
                      r="130"
                      stroke={animPhase === 3 ? '#16A34A' : '#C8C5B9'}
                      strokeWidth={animPhase === 3 ? '1.75' : '1.2'}
                      strokeDasharray="4 4"
                      className={animPhase === 3 ? 'animate-flow-dash transition-colors duration-500' : ''}
                      fill="none"
                    />

                    {/* 1. Straight Dotted connector to Pattern scoring (x=80, y=34) */}
                    <line x1="80" y1="34" x2="126" y2="48" stroke="#77746C" strokeWidth="1.2" strokeDasharray="3 3" />
                    <circle cx="80" cy="34" r="2.5" fill="#141413" />

                    {/* 2. Straight Dotted connector to Text analysis (cx=218, y=-2) */}
                    <line x1="218" y1="2" x2="218" y2="10" stroke="#77746C" strokeWidth="1.2" strokeDasharray="3 3" />
                    <circle cx="218" cy="2" r="2.5" fill="#141413" />

                    {/* 3. Straight Dotted connector to Feature explanation (x=355, y=34) */}
                    <line x1="310" y1="48" x2="355" y2="34" stroke="#77746C" strokeWidth="1.2" strokeDasharray="3 3" />
                    <circle cx="355" cy="34" r="2.5" fill="#141413" />

                    {/* 4. Straight Dotted connector to Risk synthesis (x=385, y=140) */}
                    <line x1="348" y1="140" x2="385" y2="140" stroke="#77746C" strokeWidth="1.2" strokeDasharray="3 3" />
                    <circle cx="385" cy="140" r="2.5" fill="#141413" />

                    {/* 5. Downward Straight Dotted Line from bottom of brain orbit */}
                    <line
                      x1="218"
                      y1="270"
                      x2="218"
                      y2="300"
                      stroke={animPhase >= 4 ? '#16A34A' : '#141413'}
                      strokeWidth="2"
                      strokeDasharray="4 4"
                      className={animPhase >= 4 ? 'animate-flow-dash' : ''}
                    />
                    <circle cx="218" cy="270" r="3" fill={animPhase >= 4 ? '#16A34A' : '#141413'} />
                  </svg>

                  {/* Satellite Badges Layer (HTML for sharp borders & crisp text) */}
                  <div className="absolute inset-0 pointer-events-none">
                    {/* Badge 1: Pattern scoring */}
                    <div className="absolute left-[2px] sm:left-[8px] top-[18px]">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-none border text-[11px] font-mono font-medium transition-all duration-300 ${
                        animPhase === 3 ? 'bg-[#FFFFFF] border-[#141413] shadow-md scale-105' : 'bg-[#FFFFFF] border-[#E0DED4] text-[#141413]'
                      }`}>
                        Pattern scoring
                      </span>
                    </div>

                    {/* Badge 2: Text analysis */}
                    <div className="absolute left-[218px] -translate-x-1/2 -top-[16px]">
                      <span className={`inline-flex items-center px-3 py-1 rounded-none border text-[11px] font-mono font-medium transition-all duration-300 ${
                        animPhase === 3 ? 'bg-[#FFFFFF] border-[#141413] shadow-md scale-105' : 'bg-[#FFFFFF] border-[#E0DED4] text-[#141413]'
                      }`}>
                        Text analysis
                      </span>
                    </div>

                    {/* Badge 3: Feature explanation */}
                    <div className="absolute right-[24px] sm:right-[36px] top-[18px]">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-none border text-[11px] font-mono font-medium transition-all duration-300 ${
                        animPhase === 3 ? 'bg-[#FFFFFF] border-[#141413] shadow-md scale-105' : 'bg-[#FFFFFF] border-[#E0DED4] text-[#141413]'
                      }`}>
                        Feature explanation
                      </span>
                    </div>

                    {/* Badge 4: Risk synthesis */}
                    <div className="absolute right-[6px] sm:right-[14px] top-[125px]">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-none border text-[11px] font-mono font-medium transition-all duration-300 ${
                        animPhase === 3 ? 'bg-[#FFFFFF] border-[#DC2626] text-[#DC2626] shadow-md scale-105' : 'bg-[#FFFFFF] border-[#E0DED4] text-[#141413]'
                      }`}>
                        Risk synthesis
                      </span>
                    </div>

                    {/* Center Brain Engine Block inside the Dashed Orbit */}
                    <div className="absolute left-[218px] top-[140px] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center">
                      <div className={`relative w-[150px] sm:w-[175px] h-[105px] sm:h-[120px] flex items-center justify-center transition-all duration-500 ${
                        animPhase === 3 ? 'scale-105 filter drop-shadow-[0_12px_28px_rgba(20,20,19,0.22)]' : ''
                      }`}>
                        <img
                          src="/Detailed Ivory Brain Illustration.png"
                          alt="ScamShield Analysis Engine"
                          className="w-full h-full object-contain mix-blend-multiply select-none pointer-events-none"
                        />
                      </div>
                      <span className="font-serif font-bold text-[14.5px] sm:text-[16px] text-[#141413] tracking-tight mt-0.5 text-center leading-snug">
                        ScamShield<br />Analysis Engine
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>


          {/* ══════════════════════════════════════════════════════════════
              INTER-SECTION PIPELINE CONNECTOR (SECTION 03 -> SECTION 04)
              (Matching User Request: Bottom line of brain connects all 4 cards below)
          ══════════════════════════════════════════════════════════════ */}
          <div className="hidden lg:block relative -my-9 z-20">
            <div className="flex items-center">
              {/* Left spacer matching meta column width */}
              <div className="w-[280px] lg:w-[310px] pl-9 flex-shrink-0" />

              {/* Connector Area over the right visual card width */}
              <div className="flex-1 px-5 sm:px-6">
                <div className="w-full relative py-1">
                  {/* Vertical feed line coming down from brain (in col 3, matching brain position) */}
                  <div className="grid grid-cols-4 gap-3.5 w-full relative">
                    {/* Feeder line positioned at col 3 */}
                    <div className="col-start-3 flex justify-center h-4">
                      <div className={`w-[2px] h-full border-l-2 border-dashed transition-colors duration-300 ${
                        animPhase >= 4 ? 'border-[#16A34A]' : 'border-[#141413]'
                      }`} />
                    </div>
                  </div>

                  {/* Horizontal distribution bus line spanning from col 1 center (12.5%) to col 4 center (87.5%) */}
                  <div className="relative w-full h-[2px]">
                    <div className="grid grid-cols-4 gap-3.5 w-full h-full">
                      <div className="col-span-4 relative flex items-center">
                        <div className={`w-[75%] mx-auto border-t-2 border-dashed transition-colors duration-300 ${
                          animPhase >= 4 ? 'border-[#16A34A]' : 'border-[#141413]'
                        }`} />
                      </div>
                    </div>
                  </div>

                  {/* 4 Straight Dotted Drop Lines into the 4 evidence cards below */}
                  <div className="grid grid-cols-4 gap-3.5 w-full pt-0.5">
                    {[0, 1, 2, 3].map((colIdx) => (
                      <div key={colIdx} className="flex flex-col items-center">
                        <div className={`w-2 h-2 rounded-full mb-0.5 transition-colors duration-300 ${
                          animPhase >= 4 ? 'bg-[#16A34A]' : 'bg-[#141413]'
                        }`} />
                        <div className={`w-[2px] h-5 border-l-2 border-dashed transition-colors duration-300 ${
                          animPhase >= 4 ? 'border-[#16A34A]' : 'border-[#141413]'
                        }`} />
                        <div className={`w-0 h-0 border-l-[3.5px] border-l-transparent border-r-[3.5px] border-r-transparent border-t-[5px] transition-colors duration-300 ${
                          animPhase >= 4 ? 'border-t-[#16A34A]' : 'border-t-[#141413]'
                        }`} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>


          {/* ══════════════════════════════════════════════════════════════
              STEP 04: CROSS-CHECK EVIDENCE (4 CARDS)
          ══════════════════════════════════════════════════════════════ */}
          <div className="relative flex flex-col md:flex-row items-stretch gap-6 md:gap-10">
            {/* Timeline node dot (md+) */}
            <div className="hidden md:flex absolute left-0 top-[24px] w-5 h-5 -translate-x-[0px] rounded-full border border-[#D0CDC2] bg-[#FAF9F5] items-center justify-center z-10 flex-shrink-0">
              <span className={`w-2 h-2 rounded-full transition-colors ${animPhase === 4 ? 'bg-[#16A34A] scale-125' : 'bg-[#141413]'}`} />
            </div>

            {/* Step Left Meta Column */}
            <div className="md:w-[280px] lg:w-[310px] md:pl-9 flex-shrink-0">
              <div className="inline-flex items-center gap-2 mb-3">
                <span className="px-2 py-0.5 rounded-none border border-[#D0CDC2] bg-[#FAF9F6] font-mono text-[11px] font-bold text-[#141413]">
                  04
                </span>
                <span className="px-2 py-0.5 rounded-none bg-[#F0EEE6] border border-[#E2DFD7] font-mono text-[9.5px] uppercase tracking-wider text-[#625F58] font-semibold">
                  Cross-Check Evidence
                </span>
              </div>
              <h3 className="text-[22px] sm:text-[25px] font-serif font-normal text-[#141413] tracking-tight leading-snug mb-2">
                Cross-check evidence
              </h3>
              <p className="text-[13px] sm:text-[13.5px] text-[#55524B] leading-relaxed">
                Verify the analysis with specific evidence checks to build a clearer risk picture.
              </p>
            </div>

            {/* Step Right Visual Card: 4-Column Evidence Cards */}
            <div className={`flex-1 bg-[#FAF9F6] border rounded-none p-5 sm:p-6 shadow-[0_2px_12px_rgba(20,20,19,0.02)] relative overflow-hidden transition-all duration-500 ${
              animPhase === 4 ? 'border-[#141413] ring-1 ring-[#141413]/10' : 'border-[#E0DED4]'
            }`}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">

                {/* Card 1: Domain consistency (Pass) */}
                <div className={`bg-[#FFFFFF] border rounded-none p-3.5 flex flex-col justify-between shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition-all duration-300 relative ${
                  animPhase === 4 ? 'border-[#16A34A] ring-1 ring-[#16A34A]/30 shadow-md' : 'border-[#E0DED4]'
                }`}>
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-none bg-[#F5F4EE] border border-[#E0DED4] flex items-center justify-center text-[#141413]">
                          <Globe size={14} />
                        </div>
                        <span className="w-[1px] h-3.5 bg-[#E0DED4]" />
                      </div>
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-none bg-emerald-50 border border-emerald-200 text-emerald-700">
                        <Check size={12} strokeWidth={2.5} />
                      </span>
                    </div>
                    <h5 className="text-[12.5px] font-bold text-[#141413] mb-1">
                      Domain consistency
                    </h5>
                    <p className="text-[11px] text-[#625F58] leading-relaxed">
                      Recruiter domain matched against certified ICANN DNS records.
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-[#F0EEE6]">
                    <span className="text-[9.5px] font-mono text-emerald-700 font-semibold uppercase">
                      Check complete
                    </span>
                  </div>
                </div>

                {/* Card 2: Credential verification (Concern) */}
                <div className={`bg-[#FFFFFF] border rounded-none p-3.5 flex flex-col justify-between shadow-[0_1px_3px_rgba(220,38,38,0.03)] transition-all duration-300 relative ${
                  animPhase === 4 ? 'border-[#DC2626] ring-1 ring-[#DC2626]/30 shadow-md bg-[#FFF5F4]' : 'border-[#F6C6BF]'
                }`}>
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-none bg-[#FEECE8] border border-[#F6C6BF] flex items-center justify-center text-[#DC2626]">
                          <ShieldAlert size={14} />
                        </div>
                        <span className="w-[1px] h-3.5 bg-[#F6C6BF]" />
                      </div>
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-none bg-rose-50 border border-rose-200 text-rose-700">
                        <X size={12} strokeWidth={2.5} />
                      </span>
                    </div>
                    <h5 className="text-[12.5px] font-bold text-[#7F1D1D] mb-1">
                      Credential verification
                    </h5>
                    <p className="text-[11px] text-[#7F1D1D]/80 leading-relaxed">
                      Free Gmail address used instead of company domain; registration fee cited.
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-[#FEECE8]">
                    <span className="text-[9.5px] font-mono text-rose-700 font-semibold uppercase">
                      Concern found
                    </span>
                  </div>
                </div>

                {/* Card 3: Web corroboration (Pass) */}
                <div className={`bg-[#FFFFFF] border rounded-none p-3.5 flex flex-col justify-between shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition-all duration-300 relative ${
                  animPhase === 4 ? 'border-[#16A34A] ring-1 ring-[#16A34A]/30 shadow-md' : 'border-[#E0DED4]'
                }`}>
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-none bg-[#F5F4EE] border border-[#E0DED4] flex items-center justify-center text-[#141413]">
                          <Layers size={14} />
                        </div>
                        <span className="w-[1px] h-3.5 bg-[#E0DED4]" />
                      </div>
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-none bg-emerald-50 border border-emerald-200 text-emerald-700">
                        <Check size={12} strokeWidth={2.5} />
                      </span>
                    </div>
                    <h5 className="text-[12.5px] font-bold text-[#141413] mb-1">
                      Web corroboration
                    </h5>
                    <p className="text-[11px] text-[#625F58] leading-relaxed">
                      Cross-referenced against verified company career pages.
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-[#F0EEE6]">
                    <span className="text-[9.5px] font-mono text-emerald-700 font-semibold uppercase">
                      Check complete
                    </span>
                  </div>
                </div>

                {/* Card 4: Employer legitimacy (Warning) */}
                <div className={`bg-[#FFFFFF] border rounded-none p-3.5 flex flex-col justify-between shadow-[0_1px_3px_rgba(217,119,6,0.03)] transition-all duration-300 relative ${
                  animPhase === 4 ? 'border-[#D97706] ring-1 ring-[#D97706]/30 shadow-md bg-[#FFFBEB]' : 'border-[#FDE68A]'
                }`}>
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-none bg-[#FEF3C7] border border-[#FDE68A] flex items-center justify-center text-[#D97706]">
                          <Users size={14} />
                        </div>
                        <span className="w-[1px] h-3.5 bg-[#FDE68A]" />
                      </div>
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-none bg-amber-50 border border-amber-200 text-amber-700">
                        <AlertTriangle size={12} strokeWidth={2.5} />
                      </span>
                    </div>
                    <h5 className="text-[12.5px] font-bold text-[#92400E] mb-1">
                      Employer legitimacy
                    </h5>
                    <p className="text-[11px] text-[#92400E]/80 leading-relaxed">
                      Recent corporate incorporation; recruitment identity unverified.
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-[#FEF3C7]">
                    <span className="text-[9.5px] font-mono text-amber-700 font-semibold uppercase">
                      Needs review
                    </span>
                  </div>
                </div>

              </div>
            </div>
          </div>


          {/* ══════════════════════════════════════════════════════════════
              INTER-SECTION GATHERING PIPELINE (SECTION 04 -> SECTION 05)
              (Matching User Request: All 4 cards join together in the bottom to form Section 05 card)
          ══════════════════════════════════════════════════════════════ */}
          <div className="hidden lg:block relative -my-9 z-20">
            <div className="flex items-center">
              {/* Left spacer matching meta column width */}
              <div className="w-[280px] lg:w-[310px] pl-9 flex-shrink-0" />

              {/* Connector Area over the right visual card width */}
              <div className="flex-1 px-5 sm:px-6">
                <div className="w-full relative py-1">
                  {/* 4 Straight Dotted Exit Lines from the 4 evidence cards above */}
                  <div className="grid grid-cols-4 gap-3.5 w-full pb-0.5">
                    {[0, 1, 2, 3].map((colIdx) => (
                      <div key={colIdx} className="flex flex-col items-center">
                        <div className={`w-[2px] h-5 border-l-2 border-dashed transition-colors duration-300 ${
                          animPhase >= 5 ? 'border-[#DC2626]' : 'border-[#141413]'
                        }`} />
                        <div className={`w-2 h-2 rounded-full mt-0.5 transition-colors duration-300 ${
                          animPhase >= 5 ? 'bg-[#DC2626]' : 'bg-[#141413]'
                        }`} />
                      </div>
                    ))}
                  </div>

                  {/* Horizontal gathering bus line joining all 4 lines together */}
                  <div className="relative w-full h-[2px]">
                    <div className="grid grid-cols-4 gap-3.5 w-full h-full">
                      <div className="col-span-4 relative flex items-center">
                        <div className={`w-[75%] mx-auto border-t-2 border-dashed transition-colors duration-300 ${
                          animPhase >= 5 ? 'border-[#DC2626]' : 'border-[#141413]'
                        }`} />
                      </div>
                    </div>
                  </div>

                  {/* Central convergence node and vertical trunk line feeding into Section 05 */}
                  <div className="flex flex-col items-center pt-0.5">
                    <div className={`w-2.5 h-2.5 rounded-full transition-colors duration-300 ${
                      animPhase >= 5 ? 'bg-[#DC2626]' : 'bg-[#141413]'
                    }`} />
                    <div className={`w-[2px] h-6 border-l-2 border-dashed transition-colors duration-300 ${
                      animPhase >= 5 ? 'border-[#DC2626]' : 'border-[#141413]'
                    }`} />
                    <div className={`w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[6px] transition-colors duration-300 ${
                      animPhase >= 5 ? 'border-t-[#DC2626]' : 'border-t-[#141413]'
                    }`} />
                  </div>
                </div>
              </div>
            </div>
          </div>


          {/* ══════════════════════════════════════════════════════════════
              STEP 05: RECEIVE AN EXPLAINABLE VERDICT (FORMED FROM 4 CARDS)
          ══════════════════════════════════════════════════════════════ */}
          <div className="relative flex flex-col md:flex-row items-stretch gap-6 md:gap-10">
            {/* Timeline node dot (md+) */}
            <div className="hidden md:flex absolute left-0 top-[24px] w-5 h-5 -translate-x-[0px] rounded-full border border-[#F4B2A8] bg-[#FEECE8] items-center justify-center z-10 flex-shrink-0">
              <span className={`w-2 h-2 rounded-full transition-colors ${animPhase === 5 ? 'bg-[#DC2626] scale-125' : 'bg-[#DC2626]'}`} />
            </div>

            {/* Step Left Meta Column */}
            <div className="md:w-[280px] lg:w-[310px] md:pl-9 flex-shrink-0">
              <div className="inline-flex items-center gap-2 mb-3">
                <span className="px-2 py-0.5 rounded-none border border-[#F4B2A8] bg-[#FEECE8] font-mono text-[11px] font-bold text-[#DC2626]">
                  05
                </span>
                <span className="px-2 py-0.5 rounded-none bg-[#FEECE8] border border-[#F6C6BF] font-mono text-[9.5px] uppercase tracking-wider text-[#991B1B] font-semibold">
                  Final Verdict
                </span>
              </div>
              <h3 className="text-[22px] sm:text-[25px] font-serif font-normal text-[#141413] tracking-tight leading-snug mb-2">
                Receive an explainable verdict
              </h3>
              <p className="text-[13px] sm:text-[13.5px] text-[#55524B] leading-relaxed">
                Get a clear risk assessment, key reasons, and an easy way to review the full evidence.
              </p>
            </div>

            {/* Step Right Visual Card: Warm Rose-Porcelain Verdict Card (Formed by the 4 Converged Evidence Cards) */}
            <div className={`flex-1 bg-gradient-to-b from-[#FFF2F0] via-[#FEECE8] to-[#FDE4E0] border rounded-none p-5 sm:p-6 shadow-[0_4px_20px_rgba(220,38,38,0.06),inset_0_1px_0_0_rgba(255,255,255,0.85)] relative overflow-hidden transition-all duration-500 ${
              animPhase === 5
                ? 'border-[#DC2626] ring-2 ring-[#DC2626]/20 shadow-[0_8px_30px_rgba(220,38,38,0.12)] scale-[1.01]'
                : 'border-[#F6C6BF]'
            }`}>
              {/* Receiver node dot where the gathering trunk plugs into Section 05 */}
              <span className="hidden lg:block absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-[#DC2626] border-2 border-white shadow z-20" />

              {/* Elevated specular highlight line */}
              <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-white pointer-events-none z-10 shadow-[0_1px_2px_rgba(255,255,255,0.9)]" />

              {/* 3-Column Metric Header Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-4 border-b border-[#F4B2A8]/60">
                {/* Col 1: Assessment */}
                <div>
                  <span className="text-[9.5px] font-mono font-bold uppercase tracking-wider text-[#991B1B]">
                    ASSESSMENT
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <div className={`w-5 h-5 rounded-none bg-[#DC2626] text-white flex items-center justify-center flex-shrink-0 transition-transform ${
                      animPhase === 5 ? 'scale-110' : ''
                    }`}>
                      <ShieldAlert size={12} strokeWidth={2.2} />
                    </div>
                    <span className="text-[20px] sm:text-[22px] font-serif font-bold text-[#7F1D1D] leading-tight">
                      High Risk
                    </span>
                  </div>
                </div>

                {/* Col 2: Model Score with Live Counting Animation */}
                <div className="sm:border-l sm:border-[#F4B2A8]/60 sm:pl-4">
                  <span className="text-[9.5px] font-mono font-bold uppercase tracking-wider text-[#991B1B]">
                    MODEL SCORE
                  </span>
                  <div className="flex items-baseline gap-1 mt-1 font-mono">
                    <span className={`text-[22px] sm:text-[24px] font-bold text-[#141413] leading-none transition-colors ${
                      animPhase === 5 ? 'text-[#DC2626]' : ''
                    }`}>
                      {modelScore}
                    </span>
                    <span className="text-[12px] text-[#77746C] font-semibold">
                      /100
                    </span>
                  </div>
                </div>

                {/* Col 3: Top Risk Factors */}
                <div className="sm:border-l sm:border-[#F4B2A8]/60 sm:pl-4">
                  <span className="text-[9.5px] font-mono font-bold uppercase tracking-wider text-[#991B1B]">
                    TOP RISK FACTORS
                  </span>
                  <ul className="mt-1 space-y-0.5 text-[10.5px] font-medium text-[#7F1D1D]">
                    <li className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-none bg-[#DC2626] flex-shrink-0" />
                      <span>Domain mismatch</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-none bg-[#EA580C] flex-shrink-0" />
                      <span>Upfront registration fee</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-none bg-[#D97706] flex-shrink-0" />
                      <span>Unverified employer</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Narrative description */}
              <p className="text-[12px] sm:text-[12.5px] text-[#7F1D1D]/90 leading-relaxed mt-4 mb-4">
                Likely a recruitment scam. The posting shows multiple warning signs, including a mismatched company domain, a request for an upfront fee, and an unverified employer.
              </p>

              {/* Actions & Footnote */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => navigate('/investigate')}
                  className={`inline-flex items-center gap-2 h-[34px] px-4 rounded-none text-[#FAF9F5] text-[12px] font-semibold tracking-[-0.01em] border border-[#3E3D38] shadow-[0_2px_8px_rgba(20,20,19,0.2)] transition-all cursor-pointer ${
                    animPhase === 5 ? 'bg-[#DC2626] hover:bg-[#B91C1C] scale-105' : 'bg-[#141413] hover:bg-[#262523]'
                  }`}
                >
                  <Sparkles size={12} className={animPhase === 5 ? 'animate-spin' : ''} />
                  <span>Open detailed report</span>
                  <ArrowRight size={13} />
                </button>
                <div className="flex items-center gap-1 text-[10px] font-mono text-[#991B1B]/80">
                  <Info size={11} className="flex-shrink-0" />
                  <span>The score is illustrative and not a verified probability.</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
