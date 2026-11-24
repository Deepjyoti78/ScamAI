import { useState, useEffect, useRef } from 'react';
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
  MapPin,
  Briefcase,
  Coins,
  Sparkles,
} from 'lucide-react';

/* ── INTERSECTION OBSERVER HOOK FOR SCROLL-DRIVEN TRIGGERING ── */
function useStepInView(threshold = 0.2) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        }
      },
      {
        threshold,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, isInView] as const;
}

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
      className={`bg-[#FFFFFF] border border-[#E0DED4] rounded-none p-4 sm:p-5 relative transition-all duration-300 ${
        isApplyActive
          ? 'shadow-[0_8px_24px_rgba(20,20,19,0.07)]'
          : 'shadow-[0_2px_12px_rgba(20,20,19,0.03),inset_0_1px_0_0_#FFFFFF]'
      } ${className}`}
    >
      {/* Specular top highlight */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-white pointer-events-none z-10" />

      {/* Header with avatar */}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-9 h-9 rounded-none bg-[#F5F4EE] border border-[#E0DED4] flex items-center justify-center font-bold text-[14px] text-[#141413] flex-shrink-0 shadow-sm">
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

      {/* Action button: Apply Now in signature obsidian black */}
      <div className="relative">
        <button
          type="button"
          onClick={onApplyClick || (() => navigate('/investigate'))}
          className={`w-full inline-flex items-center justify-center gap-2 h-[34px] px-3 rounded-none text-[12px] font-semibold tracking-wide transition-all duration-300 cursor-pointer ${
            isApplyActive
              ? 'bg-[#141413] text-[#FAF9F5] shadow-[0_4px_14px_rgba(20,20,19,0.25)] ring-1 ring-[#141413]'
              : 'bg-[#141413] text-[#FAF9F5] hover:bg-[#262523] active:scale-[0.99]'
          }`}
        >
          <span>Apply Now</span>
          <ArrowRight size={13} className={isApplyActive ? 'translate-x-1 transition-transform' : ''} />
        </button>
      </div>
    </div>
  );
}

export default function WorkflowSection() {
  const navigate = useNavigate();

  /* ── SECTION REFS FOR SCROLL-DRIVEN OBSERVATION ── */
  const [step1Ref, step1InView] = useStepInView(0.2);
  const [step2Ref, step2InView] = useStepInView(0.2);
  const [step3Ref, step3InView] = useStepInView(0.2);
  const [step4Ref, step4InView] = useStepInView(0.2);
  const [step5Ref, step5InView] = useStepInView(0.2);

  /* ── STEP 01 ANIMATION STATE ── */
  const FULL_URL = 'careers-rapidtech.com/jobs/product-designer';
  const [typedUrl, setTypedUrl] = useState('');
  const [s1BoxEntered, setS1BoxEntered] = useState(false);
  const [s1SearchClicked, setS1SearchClicked] = useState(false);
  const [s1ArrowVisible, setS1ArrowVisible] = useState(false);
  const [s1CardRevealed, setS1CardRevealed] = useState(false);

  useEffect(() => {
    if (!step1InView) return;

    // 1. Box enters with subtle slide
    const tBox = setTimeout(() => setS1BoxEntered(true), 250);

    // 2. Typing animation
    let charIdx = 0;
    const tTypeStart = setTimeout(() => {
      const typeInterval = setInterval(() => {
        charIdx += 2;
        if (charIdx > FULL_URL.length) charIdx = FULL_URL.length;
        setTypedUrl(FULL_URL.slice(0, charIdx));
        if (charIdx >= FULL_URL.length) {
          clearInterval(typeInterval);
          // 3. Search button clicks
          setTimeout(() => setS1SearchClicked(true), 200);
          // 4. Arrow emerges from search button
          setTimeout(() => setS1ArrowVisible(true), 400);
          // 5. Product Designer card smoothly appears from arrow
          setTimeout(() => setS1CardRevealed(true), 600);
        }
      }, 25);
    }, 250);

    return () => {
      clearTimeout(tBox);
      clearTimeout(tTypeStart);
    };
  }, [step1InView]);

  /* ── STEP 02 ANIMATION STATE ── */
  const [s2ApplyClicked, setS2ApplyClicked] = useState(false);
  const [s2DotActive, setS2DotActive] = useState(false);
  const [s2RevealedCount, setS2RevealedCount] = useState(0);

  useEffect(() => {
    if (!step2InView) return;

    // 1. Apply button clicks
    const tApply = setTimeout(() => {
      setS2ApplyClicked(true);
      // 2. Dot appears on the right boundary of the Product Designer card
      setTimeout(() => setS2DotActive(true), 300);
      // 3. 6 lines arise one by one and reveal the pills
      for (let i = 1; i <= 6; i++) {
        setTimeout(() => {
          setS2RevealedCount(i);
        }, 500 + i * 220);
      }
    }, 400);

    return () => clearTimeout(tApply);
  }, [step2InView]);

  /* ── STEP 03 ANIMATION STATE ── */
  const [s3PillsCount, setS3PillsCount] = useState(0);
  const [s3Converged, setS3Converged] = useState(false);
  const [s3RingActive, setS3RingActive] = useState(false);
  const [s3SatellitesActive, setS3SatellitesActive] = useState(false);

  useEffect(() => {
    if (!step3InView) return;

    // 1. 6 pills reveal one by one
    for (let i = 1; i <= 6; i++) {
      setTimeout(() => {
        setS3PillsCount(i);
      }, 150 + i * 140);
    }

    // 2. Converge lines to central junction dot
    const tConv = setTimeout(() => setS3Converged(true), 1150);

    // 3. Circular ring and ScamShield brain appear
    const tRing = setTimeout(() => setS3RingActive(true), 1550);

    // 4. 4 satellite badges and connectors appear
    const tSat = setTimeout(() => setS3SatellitesActive(true), 2000);

    return () => {
      clearTimeout(tConv);
      clearTimeout(tRing);
      clearTimeout(tSat);
    };
  }, [step3InView]);

  /* ── STEP 04 ANIMATION STATE ── */
  const [s4FeederActive, setS4FeederActive] = useState(false);
  const [s4CardsCount, setS4CardsCount] = useState(0);

  useEffect(() => {
    if (!step4InView) return;

    // 1. Dotted line streams down from brain and branches into 4 lines
    const tFeed = setTimeout(() => setS4FeederActive(true), 250);

    // 2. 4 evidence cards reveal in sequence
    for (let i = 1; i <= 4; i++) {
      setTimeout(() => {
        setS4CardsCount(i);
      }, 500 + i * 180);
    }

    return () => clearTimeout(tFeed);
  }, [step4InView]);

  /* ── STEP 05 ANIMATION STATE ── */
  const [s5GatherActive, setS5GatherActive] = useState(false);
  const [s5CardRevealed, setS5CardRevealed] = useState(false);
  const [s5Score, setS5Score] = useState(0);

  useEffect(() => {
    if (!step5InView) return;

    // 1. Gathering lines drop down and merge
    const tGather = setTimeout(() => setS5GatherActive(true), 250);

    // 2. Section 05 card forms and reveals
    const tCard = setTimeout(() => {
      setS5CardRevealed(true);

      // 3. Score counts up smoothly from 0 to 94
      let curScore = 0;
      const scoreInterval = setInterval(() => {
        curScore += 3;
        if (curScore >= 94) {
          curScore = 94;
          clearInterval(scoreInterval);
        }
        setS5Score(curScore);
      }, 35);
    }, 600);

    return () => {
      clearTimeout(tGather);
      clearTimeout(tCard);
    };
  }, [step5InView]);

  return (
    <section
      id="workflow"
      className="w-full border-t border-[#E0DED4] px-4 sm:px-6 lg:px-10 py-16 sm:py-20 md:py-24 bg-[#F5F3EA] relative overflow-hidden"
    >
      {/* Visual texture styles & animations */}
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
        .bg-grid-parchment {
          background-image: radial-gradient(rgba(20, 20, 19, 0.055) 1px, transparent 1px);
          background-size: 16px 16px;
        }
      `}</style>

      <div className="max-w-[1140px] mx-auto">

        {/* ── SECTION HEADER (CENTERED, CLEAN & EDITORIAL) ── */}
        <div className="text-center max-w-xl mx-auto mb-12 sm:mb-16">
          <h2 className="text-[32px] sm:text-[40px] md:text-[44px] font-serif font-normal text-[#141413] tracking-tight leading-[1.1] mb-2.5">
            How It Works
          </h2>
          <p className="text-[12.5px] sm:text-[13.5px] text-[#625F58] font-normal leading-relaxed max-w-md mx-auto">
            From job posting to informed decision through connected, explainable AI verification.
          </p>
        </div>

        {/* ── TIMELINE VERTICAL STACK (STEPS 01 - 05) ── */}
        <div className="relative flex flex-col gap-12 sm:gap-14 md:gap-16">

          {/* Continuous Left Spine Line (visible on md+) */}
          <div className="hidden md:block absolute left-[10px] top-[24px] bottom-[30px] w-[1px] bg-[#E0DED4] pointer-events-none" />

          {/* ══════════════════════════════════════════════════════════════
              STEP 01: SUBMIT A JOB POSTING
              (Scroll-Triggered: text appears -> URL entered -> Search clicked -> Arrow emerges -> Product Designer card appears)
          ══════════════════════════════════════════════════════════════ */}
          <div
            ref={step1Ref}
            className={`relative flex flex-col md:flex-row items-stretch gap-6 md:gap-10 transition-all duration-700 ${
              step1InView ? 'opacity-100 translate-y-0' : 'opacity-40 translate-y-4'
            }`}
          >
            {/* Timeline node dot (md+) */}
            <div className="hidden md:flex absolute left-0 top-[24px] w-5 h-5 -translate-x-[0px] rounded-full border border-[#D0CDC2] bg-[#FAF9F5] items-center justify-center z-10 flex-shrink-0">
              <span className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                s1CardRevealed ? 'bg-[#141413] scale-125' : 'bg-[#141413]'
              }`} />
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
              <h3 className="text-[23px] sm:text-[26px] font-serif font-normal text-[#141413] tracking-tight leading-snug mb-2">
                Submit a job posting
              </h3>
              <p className="text-[13px] sm:text-[13.5px] text-[#55524B] leading-relaxed mb-4">
                Paste a job URL to turn it into readable, structured job content.
              </p>
              {/* 4-dash pagination indicator */}
              <div className="flex items-center gap-1.5 pt-1">
                <span className={`w-4 h-[3px] rounded-none transition-colors duration-300 ${
                  s1CardRevealed ? 'bg-[#141413]' : 'bg-[#141413]'
                }`} />
                <span className="w-4 h-[3px] bg-[#E0DED4] rounded-none" />
                <span className="w-4 h-[3px] bg-[#E0DED4] rounded-none" />
                <span className="w-4 h-[3px] bg-[#E0DED4] rounded-none" />
              </div>
            </div>

            {/* Step Right Visual Card: Enhanced Pure Porcelain Background with Soft Neutral Border */}
            <div className="flex-1 bg-[#FFFFFF] border border-[#E0DED4] rounded-none p-5 sm:p-7 shadow-[0_8px_30px_rgba(20,20,19,0.05),0_1px_3px_rgba(20,20,19,0.02)] relative overflow-hidden transition-all duration-500">
              {/* Specular hairline at top edge */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-white pointer-events-none z-10 shadow-[0_1px_2px_rgba(255,255,255,0.9)]" />

              <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-6 items-center relative min-h-[250px]">
                {/* Left: 3D Minimal Laptop Mockup with Floating URL Input Box */}
                <div className="relative flex flex-col items-center justify-center py-2 w-full">
                  <div className="relative w-full max-w-[420px] flex items-center justify-center">
                    {/* Minimalist obsidian speed bursts */}
                    <div className="absolute -top-3 right-6 sm:right-10 flex items-end gap-1.5 pointer-events-none select-none z-20">
                      <span className="w-[2px] h-3.5 bg-[#141413] transform -rotate-[30deg] origin-bottom rounded-none" />
                      <span className="w-[2px] h-4.5 bg-[#141413] transform -translate-y-0.5 rounded-none" />
                      <span className="w-[2px] h-3.5 bg-[#141413] transform rotate-[30deg] origin-bottom rounded-none" />
                    </div>

                    <img
                      src="/Monochrome Laptop UI Render.png"
                      alt="Job Posting Input"
                      className="w-full h-auto max-h-[250px] scale-110 sm:scale-115 object-contain drop-shadow-[0_12px_28px_rgba(20,20,19,0.08)] mix-blend-multiply select-none pointer-events-none transition-transform duration-500"
                    />

                    {/* Floating URL Pill Box with paste & typing animation */}
                    <div
                      className={`absolute top-[48%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[92%] max-w-[320px] bg-[#FFFFFF] border-2 rounded-none p-1.5 shadow-[0_8px_24px_rgba(20,20,19,0.14)] z-20 flex items-center gap-2 transition-all duration-500 ${
                        s1BoxEntered ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                      } ${
                        s1SearchClicked ? 'border-[#141413] ring-1 ring-[#141413]/20' : 'border-[#141413]'
                      }`}
                    >
                      <LinkIcon size={13} className="flex-shrink-0 ml-1 text-[#141413]" />
                      <div className="text-[10px] sm:text-[10.5px] font-mono text-[#141413] truncate font-semibold flex-1 flex items-center">
                        <span>{typedUrl || <span className="text-[#99968E] font-normal italic">Paste job URL...</span>}</span>
                        {step1InView && !s1SearchClicked && (
                          <span className="w-[2px] h-3.5 bg-[#141413] ml-0.5 animate-pulse inline-block" />
                        )}
                      </div>
                      
                      {/* Search Button & Directly Anchored Arrow */}
                      <div className="relative flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setTypedUrl(FULL_URL);
                            setS1SearchClicked(true);
                            setS1ArrowVisible(true);
                            setS1CardRevealed(true);
                          }}
                          className={`w-6 h-6 flex items-center justify-center rounded-none transition-all cursor-pointer ${
                            s1SearchClicked
                              ? 'bg-[#141413] text-[#FAF9F5] scale-105 shadow-sm'
                              : 'bg-[#141413] text-[#FAF9F5] hover:bg-[#262523]'
                          }`}
                          title="Click to search"
                        >
                          <Search size={11} />
                        </button>

                        {/* Dotted Arrow emerging directly from Search Button center towards Apply Now */}
                        {s1ArrowVisible && (
                          <svg
                            className="hidden lg:block absolute left-[calc(100%+2px)] top-[12px] w-[180px] h-[130px] pointer-events-none z-30 overflow-visible text-[#141413]"
                            viewBox="0 0 180 130"
                            fill="none"
                          >
                            <defs>
                              <marker
                                id="s1-arrowhead-black"
                                markerWidth="6"
                                markerHeight="6"
                                refX="4"
                                refY="3"
                                orient="auto"
                              >
                                <polygon points="0,0.5 5,3 0,5.5" fill="#141413" />
                              </marker>
                            </defs>
                            <path
                              d="M 2 0 C 45 0, 72 74, 142 78"
                              stroke="#141413"
                              strokeWidth="1.75"
                              strokeDasharray="4 4"
                              className="animate-flow-dash"
                              markerEnd="url(#s1-arrowhead-black)"
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Extracted Job Card (Smoothly revealed when search button is clicked) */}
                <div className={`flex justify-center lg:justify-end transition-all duration-700 ${
                  s1CardRevealed
                    ? 'opacity-100 translate-x-0 scale-100'
                    : 'opacity-0 translate-x-4 scale-95 pointer-events-none'
                }`}>
                  <JobPostingCard
                    className="w-full max-w-[290px]"
                    isApplyActive={s1CardRevealed}
                    onApplyClick={() => {
                      const el = document.getElementById('step-02');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  />
                </div>
              </div>
            </div>
          </div>


          {/* ══════════════════════════════════════════════════════════════
              STEP 02: EXTRACT SIGNALS
              (Apply Now clicks -> Node dot in middle of right boundary -> 1 trunk to junction -> 6 branching lines -> 6 pills reveal)
          ══════════════════════════════════════════════════════════════ */}
          <div
            id="step-02"
            ref={step2Ref}
            className={`relative flex flex-col md:flex-row items-stretch gap-6 md:gap-10 transition-all duration-700 ${
              step2InView ? 'opacity-100 translate-y-0' : 'opacity-40 translate-y-4'
            }`}
          >
            {/* Timeline node dot (md+) */}
            <div className="hidden md:flex absolute left-0 top-[24px] w-5 h-5 -translate-x-[0px] rounded-full border border-[#D0CDC2] bg-[#FAF9F5] items-center justify-center z-10 flex-shrink-0">
              <span className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                s2RevealedCount >= 6 ? 'bg-[#141413] scale-125' : 'bg-[#141413]'
              }`} />
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
              <h3 className="text-[23px] sm:text-[26px] font-serif font-normal text-[#141413] tracking-tight leading-snug mb-2">
                Extract signals
              </h3>
              <p className="text-[13px] sm:text-[13.5px] text-[#55524B] leading-relaxed mb-4">
                Analyze the job posting and extract key signals that help assess risk.
              </p>
            </div>

            {/* Step Right Visual Card: 1-to-6 Junction Network Architecture */}
            <div className="flex-1 bg-[#FFFFFF] border border-[#E0DED4] rounded-none p-5 sm:p-7 shadow-[0_8px_30px_rgba(20,20,19,0.05),0_1px_3px_rgba(20,20,19,0.02)] relative overflow-hidden transition-all duration-500">
              {/* Specular hairline at top edge */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-white pointer-events-none z-10 shadow-[0_1px_2px_rgba(255,255,255,0.9)]" />

              <div className="flex flex-col lg:flex-row items-center relative">

                {/* Left: Product Designer Card with prominent node dot in the exact vertical middle */}
                <div className="w-full lg:w-[280px] flex-shrink-0 relative">
                  <JobPostingCard
                    isApplyActive={s2ApplyClicked}
                    onApplyClick={() => {
                      setS2ApplyClicked(true);
                      setS2DotActive(true);
                      setS2RevealedCount(6);
                    }}
                  />

                  {/* PROMINENT NODE DOT ON THE RIGHT BOUNDARY IN EXACT VERTICAL MIDDLE */}
                  <div className={`hidden lg:flex absolute -right-[7px] top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full border-2 border-white items-center justify-center z-30 shadow transition-all duration-300 ${
                    s2DotActive ? 'bg-[#141413] ring-2 ring-[#141413]/25 scale-110' : 'bg-[#141413]'
                  }`}>
                    <span className="w-1 h-1 rounded-full bg-[#FAF9F5]" />
                  </div>
                </div>

                {/* Center: 1-to-6 Junction SVG Network (Hero Pattern) */}
                <div className="hidden lg:block w-[96px] h-[276px] relative flex-shrink-0 -mx-[1px]">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 96 276" fill="none">
                    {/* Step 1: Single Horizontal Trunk from Card Middle Dot (x=0, y=138) to Junction (x=40, y=138) */}
                    {s2DotActive && (
                      <>
                        <line
                          x1="0"
                          y1="138"
                          x2="40"
                          y2="138"
                          stroke="#141413"
                          strokeWidth="1.5"
                          strokeDasharray="3 3"
                          className="animate-flow-dash"
                        />
                        {/* Central Junction Node Dot */}
                        <circle cx="40" cy="138" r="3.5" fill="#141413" />
                        <circle cx="40" cy="138" r="1.5" fill="#FAF9F5" />
                      </>
                    )}

                    {/* Step 2: 6 S-Curved Branch Lines departing from Junction Node into each Pill */}
                    {[19, 65, 111, 165, 211, 257].map((yTarget, i) => {
                      const isLineActive = s2RevealedCount > i;
                      return (
                        <g key={i}>
                          {isLineActive && (
                            <>
                              <path
                                d={`M 40 138 C 62 138, 74 ${yTarget}, 96 ${yTarget}`}
                                stroke="#141413"
                                strokeWidth="1.5"
                                strokeDasharray="3 3"
                                className="animate-flow-dash"
                                fill="none"
                              />
                              {/* Docking dot touching the left edge of each pill */}
                              <circle
                                cx="96"
                                cy={yTarget}
                                r="2.5"
                                fill="#141413"
                                className="transition-all duration-300"
                              />
                            </>
                          )}
                        </g>
                      );
                    })}
                  </svg>
                </div>

                {/* Right: 6 Feature Pills that appear one by one as each dotted branch arrives */}
                <div className="w-full lg:flex-1 space-y-2 relative">
                  {[
                    { icon: <FileText size={13} className="text-[#141413]" />, title: 'Job content' },
                    { icon: <LinkIcon size={13} className="text-[#141413]" />, title: 'Domain & URL' },
                    { icon: <Mail size={13} className="text-[#DC2626]" />, title: 'Recruiter email' },
                    { icon: <MousePointer size={13} className="text-[#141413]" />, title: 'Application destination' },
                    { icon: <Coins size={13} className="text-[#DC2626]" />, title: 'Payment request' },
                    { icon: <Layers size={13} className="text-[#141413]" />, title: 'Employer & web evidence' },
                  ].map((sig, i) => {
                    const isRevealed = s2RevealedCount > i;
                    return (
                      <div
                        key={i}
                        className={`bg-[#FFFFFF] border rounded-none px-3.5 py-2 flex items-center justify-between shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition-all duration-500 relative ${
                          isRevealed
                            ? 'opacity-100 translate-x-0 border-[#E0DED4] shadow-[0_2px_8px_rgba(20,20,19,0.04)]'
                            : 'opacity-20 translate-x-2 border-dashed border-[#E0DED4]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="flex items-center justify-center text-[#141413] flex-shrink-0">
                            {sig.icon}
                          </span>
                          <span className="w-[1px] h-3.5 bg-[#E0DED4] flex-shrink-0" />
                          <span className="text-[12.5px] font-medium text-[#141413]">
                            {sig.title}
                          </span>
                        </div>
                        {isRevealed && (
                          <span className="text-[9px] font-mono text-[#55524B] bg-[#F5F4EE] border border-[#E0DED4] px-1.5 py-0.5 font-semibold uppercase tracking-wider">
                            Extracted
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
              STEP 03: ANALYZE WITH SCAMSHIELD AI
              (Pills appear 1-by-1 -> Lines converge to point -> Smaller circular ring with brain & title -> 4 satellite tags appear)
          ══════════════════════════════════════════════════════════════ */}
          <div
            id="step-03"
            ref={step3Ref}
            className={`relative flex flex-col md:flex-row items-stretch gap-6 md:gap-10 transition-all duration-700 ${
              step3InView ? 'opacity-100 translate-y-0' : 'opacity-40 translate-y-4'
            }`}
          >
            {/* Timeline node dot (md+) */}
            <div className="hidden md:flex absolute left-0 top-[24px] w-5 h-5 -translate-x-[0px] rounded-full border border-[#D0CDC2] bg-[#FAF9F5] items-center justify-center z-10 flex-shrink-0">
              <span className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                s3SatellitesActive ? 'bg-[#141413] scale-125' : 'bg-[#141413]'
              }`} />
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
              <h3 className="text-[23px] sm:text-[26px] font-serif font-normal text-[#141413] tracking-tight leading-snug mb-2">
                Analyze with ScamShield AI
              </h3>
              <p className="text-[13px] sm:text-[13.5px] text-[#55524B] leading-relaxed">
                Use ML analysis and trust checks to assess the signals and estimate recruitment fraud risk.
              </p>
            </div>

            {/* Step Right Visual Card: Unified Canvas with Smaller Circular Ring */}
            <div className="flex-1 bg-[#FFFFFF] border border-[#E0DED4] rounded-none p-5 sm:p-7 shadow-[0_8px_30px_rgba(20,20,19,0.05),0_1px_3px_rgba(20,20,19,0.02)] relative overflow-hidden transition-all duration-500">
              {/* Specular hairline at top edge */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-white pointer-events-none z-10 shadow-[0_1px_2px_rgba(255,255,255,0.9)]" />

              <div className="flex flex-col lg:flex-row items-center gap-4 lg:gap-6 relative">

                {/* Left: 6 Input Feature Pills appearing one by one */}
                <div className="w-full lg:w-[200px] space-y-2 flex-shrink-0">
                  {[
                    { icon: <FileText size={12} />, title: 'Job content' },
                    { icon: <LinkIcon size={12} />, title: 'Domain & URL' },
                    { icon: <Mail size={12} className="text-[#DC2626]" />, title: 'Recruiter email' },
                    { icon: <MousePointer size={12} />, title: 'Application destination' },
                    { icon: <Coins size={12} className="text-[#DC2626]" />, title: 'Payment request' },
                    { icon: <Layers size={12} />, title: 'Employer & web evidence' },
                  ].map((sig, i) => {
                    const isVisible = s3PillsCount > i;
                    return (
                      <div
                        key={i}
                        className={`bg-[#FFFFFF] border rounded-none px-3 py-2 flex items-center justify-between shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-all duration-300 relative ${
                          isVisible
                            ? 'opacity-100 translate-x-0 border-[#E0DED4]'
                            : 'opacity-0 -translate-x-2'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-[#141413] flex-shrink-0">{sig.icon}</span>
                          <span className="w-[1px] h-3 bg-[#E0DED4] flex-shrink-0" />
                          <span className="text-[11.5px] font-medium text-[#141413] truncate">
                            {sig.title}
                          </span>
                        </div>
                        {/* Right connection dot */}
                        <span className={`w-2 h-2 rounded-full transition-colors ${
                          s3Converged ? 'bg-[#141413]' : 'bg-[#141413]'
                        }`} />
                      </div>
                    );
                  })}
                </div>

                {/* Center & Right: Unified Canvas with Straight Lines, Smaller Circular Ring & Satellites */}
                <div className="flex-1 relative w-full h-[280px] flex items-center">
                  <svg className="w-full h-full absolute inset-0 overflow-visible" viewBox="0 0 440 280" fill="none">
                    {/* 6 Straight dotted lines from pills (x=0) to central junction node (x=55, y=140) */}
                    {s3Converged && [19, 67, 115, 163, 211, 259].map((yOrigin, i) => (
                      <g key={i}>
                        <line
                          x1="0"
                          y1={yOrigin}
                          x2="55"
                          y2="140"
                          stroke="#141413"
                          strokeWidth="1.5"
                          strokeDasharray="4 4"
                          className="animate-flow-dash"
                        />
                        <circle cx="0" cy={yOrigin} r="2.5" fill="#141413" />
                      </g>
                    ))}

                    {/* Central junction point dot */}
                    {s3Converged && (
                      <circle cx="55" cy="140" r="4" fill="#141413" className="animate-pulse" />
                    )}

                    {/* Horizontal dotted line into the circular ring at x=95 (180 - 85) */}
                    {s3RingActive && (
                      <line
                        x1="55"
                        y1="140"
                        x2="95"
                        y2="140"
                        stroke="#141413"
                        strokeWidth="1.5"
                        strokeDasharray="4 4"
                        className="animate-flow-dash"
                      />
                    )}

                    {/* SMALLER Circular Orbit Ring around Brain (cx=180, cy=140, r=85) */}
                    {s3RingActive && (
                      <circle
                        cx="180"
                        cy="140"
                        r="85"
                        stroke="#141413"
                        strokeWidth="1.75"
                        strokeDasharray="4 4"
                        className="animate-flow-dash transition-all duration-500"
                        fill="none"
                      />
                    )}

                    {/* 4 Satellite Connectors */}
                    {s3SatellitesActive && (
                      <>
                        {/* 1. Pattern scoring */}
                        <line x1="100" y1="52" x2="122" y2="80" stroke="#77746C" strokeWidth="1.2" strokeDasharray="3 3" />
                        <circle cx="100" cy="52" r="2.5" fill="#141413" />

                        {/* 2. Text analysis */}
                        <line x1="180" y1="18" x2="180" y2="55" stroke="#77746C" strokeWidth="1.2" strokeDasharray="3 3" />
                        <circle cx="180" cy="18" r="2.5" fill="#141413" />

                        {/* 3. Feature explanation */}
                        <line x1="238" y1="80" x2="260" y2="52" stroke="#77746C" strokeWidth="1.2" strokeDasharray="3 3" />
                        <circle cx="260" cy="52" r="2.5" fill="#141413" />

                        {/* 4. Risk synthesis */}
                        <line x1="265" y1="140" x2="295" y2="140" stroke="#77746C" strokeWidth="1.2" strokeDasharray="3 3" />
                        <circle cx="295" cy="140" r="2.5" fill="#141413" />

                        {/* Downward Straight Dotted Line from bottom of brain orbit into Section 04 */}
                        <line
                          x1="180"
                          y1="225"
                          x2="180"
                          y2="300"
                          stroke="#141413"
                          strokeWidth="2"
                          strokeDasharray="4 4"
                          className="animate-flow-dash"
                        />
                        <circle cx="180" cy="225" r="3" fill="#141413" />
                      </>
                    )}
                  </svg>

                  {/* HTML Overlay: Brain illustration, title and satellite badges */}
                  <div className="absolute inset-0 pointer-events-none">
                    {/* Badge 1: Pattern scoring */}
                    {s3SatellitesActive && (
                      <div className="absolute left-[10px] top-[40px] transition-all duration-300">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-none border border-[#141413] bg-[#FFFFFF] text-[10.5px] font-mono font-medium shadow-sm">
                          Pattern scoring
                        </span>
                      </div>
                    )}

                    {/* Badge 2: Text analysis */}
                    {s3SatellitesActive && (
                      <div className="absolute left-[180px] -translate-x-1/2 top-[2px] transition-all duration-300">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-none border border-[#141413] bg-[#FFFFFF] text-[10.5px] font-mono font-medium shadow-sm">
                          Text analysis
                        </span>
                      </div>
                    )}

                    {/* Badge 3: Feature explanation */}
                    {s3SatellitesActive && (
                      <div className="absolute right-[20px] top-[40px] transition-all duration-300">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-none border border-[#141413] bg-[#FFFFFF] text-[10.5px] font-mono font-medium shadow-sm">
                          Feature explanation
                        </span>
                      </div>
                    )}

                    {/* Badge 4: Risk synthesis */}
                    {s3SatellitesActive && (
                      <div className="absolute right-[8px] top-[128px] transition-all duration-300">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-none border border-[#DC2626] text-[#DC2626] bg-[#FFFFFF] text-[10.5px] font-mono font-medium shadow-sm">
                          Risk synthesis
                        </span>
                      </div>
                    )}

                    {/* Center Brain Engine Block inside the Smaller Ring */}
                    {s3RingActive && (
                      <div className="absolute left-[180px] top-[138px] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center transition-all duration-500">
                        <div className="relative w-[105px] sm:w-[115px] h-[70px] sm:h-[78px] flex items-center justify-center">
                          <img
                            src="/Detailed Ivory Brain Illustration.png"
                            alt="ScamShield Analysis Engine"
                            className="w-full h-full object-contain mix-blend-multiply select-none pointer-events-none drop-shadow-[0_6px_14px_rgba(20,20,19,0.1)]"
                          />
                        </div>
                        <span className="font-serif font-bold text-[12.5px] sm:text-[13.5px] text-[#141413] tracking-tight mt-0.5 text-center leading-tight">
                          ScamShield<br />Analysis Engine
                        </span>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          </div>


          {/* ══════════════════════════════════════════════════════════════
              INTER-SECTION PIPELINE CONNECTOR (SECTION 03 -> SECTION 04)
              (Bottom line of brain connects down and branches into all 4 cards below)
          ══════════════════════════════════════════════════════════════ */}
          <div className="hidden lg:block relative -my-9 z-20">
            <div className="flex items-center">
              <div className="w-[280px] lg:w-[310px] pl-9 flex-shrink-0" />
              <div className="flex-1 px-5 sm:px-7">
                <div className="w-full relative py-1">
                  {/* Top Feeder line from brain */}
                  <div className="grid grid-cols-4 gap-3.5 w-full relative">
                    <div className="col-start-3 flex justify-center h-4">
                      <div className={`w-[2px] h-full border-l-2 border-dashed transition-colors duration-300 ${
                        s4FeederActive ? 'border-[#141413]' : 'border-[#141413]'
                      }`} />
                    </div>
                  </div>

                  {/* Horizontal distribution bus line spanning across the 4 cards */}
                  <div className="relative w-full h-[2px]">
                    <div className="grid grid-cols-4 gap-3.5 w-full h-full">
                      <div className="col-span-4 relative flex items-center">
                        <div className={`w-[75%] mx-auto border-t-2 border-dashed transition-colors duration-300 ${
                          s4FeederActive ? 'border-[#141413]' : 'border-[#141413]'
                        }`} />
                      </div>
                    </div>
                  </div>

                  {/* 4 Straight Dotted Drop Lines into the 4 evidence cards below */}
                  <div className="grid grid-cols-4 gap-3.5 w-full pt-0.5">
                    {[0, 1, 2, 3].map((colIdx) => {
                      const isActive = s4CardsCount > colIdx;
                      return (
                        <div key={colIdx} className="flex flex-col items-center">
                          <div className={`w-2 h-2 rounded-full mb-0.5 transition-colors duration-300 ${
                            isActive ? 'bg-[#141413]' : 'bg-[#141413]'
                          }`} />
                          <div className={`w-[2px] h-5 border-l-2 border-dashed transition-colors duration-300 ${
                            isActive ? 'border-[#141413]' : 'border-[#141413]'
                          }`} />
                          <div className={`w-0 h-0 border-l-[3.5px] border-l-transparent border-r-[3.5px] border-r-transparent border-t-[5px] transition-colors duration-300 ${
                            isActive ? 'border-t-[#141413]' : 'border-t-[#141413]'
                          }`} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>


          {/* ══════════════════════════════════════════════════════════════
              STEP 04: CROSS-CHECK EVIDENCE
              (4 evidence cards appear as feeder lines arrive)
          ══════════════════════════════════════════════════════════════ */}
          <div
            id="step-04"
            ref={step4Ref}
            className={`relative flex flex-col md:flex-row items-stretch gap-6 md:gap-10 transition-all duration-700 ${
              step4InView ? 'opacity-100 translate-y-0' : 'opacity-40 translate-y-4'
            }`}
          >
            {/* Timeline node dot (md+) */}
            <div className="hidden md:flex absolute left-0 top-[24px] w-5 h-5 -translate-x-[0px] rounded-full border border-[#D0CDC2] bg-[#FAF9F5] items-center justify-center z-10 flex-shrink-0">
              <span className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                s4CardsCount >= 4 ? 'bg-[#141413] scale-125' : 'bg-[#141413]'
              }`} />
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
              <h3 className="text-[23px] sm:text-[26px] font-serif font-normal text-[#141413] tracking-tight leading-snug mb-2">
                Cross-check evidence
              </h3>
              <p className="text-[13px] sm:text-[13.5px] text-[#55524B] leading-relaxed">
                Verify the analysis with specific evidence checks to build a clearer risk picture.
              </p>
            </div>

            {/* Step Right Visual Card: 4-Column Evidence Cards */}
            <div className="flex-1 bg-[#FFFFFF] border border-[#E0DED4] rounded-none p-5 sm:p-7 shadow-[0_8px_30px_rgba(20,20,19,0.05),0_1px_3px_rgba(20,20,19,0.02)] relative overflow-hidden transition-all duration-500">
              {/* Specular hairline at top edge */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-white pointer-events-none z-10 shadow-[0_1px_2px_rgba(255,255,255,0.9)]" />

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">

                {/* Card 1: Domain consistency */}
                <div className={`bg-[#FFFFFF] border rounded-none p-3.5 flex flex-col justify-between shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition-all duration-500 relative ${
                  s4CardsCount >= 1 ? 'opacity-100 translate-y-0 border-[#E0DED4] shadow-[0_2px_8px_rgba(20,20,19,0.04)]' : 'opacity-20 translate-y-2 border-[#E0DED4]'
                }`}>
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-none bg-[#F5F4EE] border border-[#E0DED4] flex items-center justify-center text-[#141413]">
                          <Globe size={14} />
                        </div>
                        <span className="w-[1px] h-3.5 bg-[#E0DED4]" />
                      </div>
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-none bg-[#F5F4EE] border border-[#E0DED4] text-[#141413]">
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
                    <span className="text-[9.5px] font-mono text-[#55524B] font-semibold uppercase">
                      Check complete
                    </span>
                  </div>
                </div>

                {/* Card 2: Credential verification (Concern) */}
                <div className={`bg-[#FFFFFF] border rounded-none p-3.5 flex flex-col justify-between shadow-[0_1px_3px_rgba(220,38,38,0.03)] transition-all duration-500 relative ${
                  s4CardsCount >= 2 ? 'opacity-100 translate-y-0 border-[#DC2626] ring-1 ring-[#DC2626]/25 bg-[#FFF5F4]' : 'opacity-20 translate-y-2 border-[#F6C6BF]'
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

                {/* Card 3: Web corroboration */}
                <div className={`bg-[#FFFFFF] border rounded-none p-3.5 flex flex-col justify-between shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition-all duration-500 relative ${
                  s4CardsCount >= 3 ? 'opacity-100 translate-y-0 border-[#E0DED4] shadow-[0_2px_8px_rgba(20,20,19,0.04)]' : 'opacity-20 translate-y-2 border-[#E0DED4]'
                }`}>
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-none bg-[#F5F4EE] border border-[#E0DED4] flex items-center justify-center text-[#141413]">
                          <Layers size={14} />
                        </div>
                        <span className="w-[1px] h-3.5 bg-[#E0DED4]" />
                      </div>
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-none bg-[#F5F4EE] border border-[#E0DED4] text-[#141413]">
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
                    <span className="text-[9.5px] font-mono text-[#55524B] font-semibold uppercase">
                      Check complete
                    </span>
                  </div>
                </div>

                {/* Card 4: Employer legitimacy (Warning) */}
                <div className={`bg-[#FFFFFF] border rounded-none p-3.5 flex flex-col justify-between shadow-[0_1px_3px_rgba(217,119,6,0.03)] transition-all duration-500 relative ${
                  s4CardsCount >= 4 ? 'opacity-100 translate-y-0 border-[#D97706] ring-1 ring-[#D97706]/25 bg-[#FFFBEB]' : 'opacity-20 translate-y-2 border-[#FDE68A]'
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
              (All 4 cards drop lines down into gathering bus and join to form Section 05)
          ══════════════════════════════════════════════════════════════ */}
          <div className="hidden lg:block relative -my-9 z-20">
            <div className="flex items-center">
              <div className="w-[280px] lg:w-[310px] pl-9 flex-shrink-0" />
              <div className="flex-1 px-5 sm:px-7">
                <div className="w-full relative py-1">
                  {/* 4 Straight Dotted Exit Lines from the 4 evidence cards above */}
                  <div className="grid grid-cols-4 gap-3.5 w-full pb-0.5">
                    {[0, 1, 2, 3].map((colIdx) => (
                      <div key={colIdx} className="flex flex-col items-center">
                        <div className={`w-[2px] h-5 border-l-2 border-dashed transition-colors duration-300 ${
                          s5GatherActive ? 'border-[#DC2626]' : 'border-[#141413]'
                        }`} />
                        <div className={`w-2 h-2 rounded-full mt-0.5 transition-colors duration-300 ${
                          s5GatherActive ? 'bg-[#DC2626]' : 'bg-[#141413]'
                        }`} />
                      </div>
                    ))}
                  </div>

                  {/* Horizontal gathering bus line joining all 4 lines together */}
                  <div className="relative w-full h-[2px]">
                    <div className="grid grid-cols-4 gap-3.5 w-full h-full">
                      <div className="col-span-4 relative flex items-center">
                        <div className={`w-[75%] mx-auto border-t-2 border-dashed transition-colors duration-300 ${
                          s5GatherActive ? 'border-[#DC2626]' : 'border-[#141413]'
                        }`} />
                      </div>
                    </div>
                  </div>

                  {/* Central convergence node and vertical trunk line feeding into Section 05 */}
                  <div className="flex flex-col items-center pt-0.5">
                    <div className={`w-2.5 h-2.5 rounded-full transition-colors duration-300 ${
                      s5GatherActive ? 'bg-[#DC2626]' : 'bg-[#141413]'
                    }`} />
                    <div className={`w-[2px] h-6 border-l-2 border-dashed transition-colors duration-300 ${
                      s5GatherActive ? 'border-[#DC2626]' : 'border-[#141413]'
                    }`} />
                    <div className={`w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[6px] transition-colors duration-300 ${
                      s5GatherActive ? 'border-t-[#DC2626]' : 'border-t-[#141413]'
                    }`} />
                  </div>
                </div>
              </div>
            </div>
          </div>


          {/* ══════════════════════════════════════════════════════════════
              STEP 05: RECEIVE AN EXPLAINABLE VERDICT
              (Formed from the 4 converged evidence cards, with live score count up)
          ══════════════════════════════════════════════════════════════ */}
          <div
            id="step-05"
            ref={step5Ref}
            className={`relative flex flex-col md:flex-row items-stretch gap-6 md:gap-10 transition-all duration-700 ${
              step5InView ? 'opacity-100 translate-y-0' : 'opacity-40 translate-y-4'
            }`}
          >
            {/* Timeline node dot (md+) */}
            <div className="hidden md:flex absolute left-0 top-[24px] w-5 h-5 -translate-x-[0px] rounded-full border border-[#F4B2A8] bg-[#FEECE8] items-center justify-center z-10 flex-shrink-0">
              <span className={`w-2 h-2 rounded-full transition-colors ${
                s5CardRevealed ? 'bg-[#DC2626] scale-125' : 'bg-[#DC2626]'
              }`} />
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
              <h3 className="text-[23px] sm:text-[26px] font-serif font-normal text-[#141413] tracking-tight leading-snug mb-2">
                Receive an explainable verdict
              </h3>
              <p className="text-[13px] sm:text-[13.5px] text-[#55524B] leading-relaxed">
                Get a clear risk assessment, key reasons, and an easy way to review the full evidence.
              </p>
            </div>

            {/* Step Right Visual Card: Warm Rose-Porcelain Verdict Card */}
            <div className={`flex-1 bg-gradient-to-b from-[#FFF2F0] via-[#FEECE8] to-[#FDE4E0] border rounded-none p-5 sm:p-7 shadow-[0_4px_24px_rgba(220,38,38,0.06),inset_0_1px_0_0_rgba(255,255,255,0.85)] relative overflow-hidden transition-all duration-700 ${
              s5CardRevealed
                ? 'opacity-100 scale-100 border-[#DC2626] ring-2 ring-[#DC2626]/20 shadow-[0_8px_30px_rgba(220,38,38,0.12)]'
                : 'opacity-40 scale-95 border-[#F6C6BF]'
            }`}>
              {/* Receiver node dot where gathering trunk plugs into Section 05 */}
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
                    <div className={`w-5 h-5 rounded-none bg-[#DC2626] text-white flex items-center justify-center flex-shrink-0 transition-transform duration-300 ${
                      s5CardRevealed ? 'scale-110 shadow-sm' : ''
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
                    <span className={`text-[22px] sm:text-[25px] font-bold leading-none transition-colors duration-300 ${
                      s5Score >= 80 ? 'text-[#DC2626]' : 'text-[#141413]'
                    }`}>
                      {s5Score}
                    </span>
                    <span className="text-[12px] text-[#77746C] font-semibold">
                      /100
                    </span>
                  </div>
                </div>

                {/* Col 3: Key Risk Factors */}
                <div className="sm:border-l sm:border-[#F4B2A8]/60 sm:pl-4">
                  <span className="text-[9.5px] font-mono font-bold uppercase tracking-wider text-[#991B1B]">
                    TOP RISK FACTORS
                  </span>
                  <ul className="mt-1 space-y-0.5 text-[11px] text-[#7F1D1D] font-medium leading-tight">
                    <li className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-[#DC2626] rounded-none flex-shrink-0" />
                      Domain mismatch
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-[#DC2626] rounded-none flex-shrink-0" />
                      Upfront registration fee
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-[#DC2626] rounded-none flex-shrink-0" />
                      Unverified employer
                    </li>
                  </ul>
                </div>
              </div>

              {/* Explanatory Body */}
              <div className="pt-4 pb-4">
                <p className="text-[12px] sm:text-[12.5px] text-[#7F1D1D] leading-relaxed font-normal">
                  <strong className="font-semibold text-[#661010]">Likely a recruitment scam.</strong> The posting shows multiple warning signs, including a mismatched company domain, a request for an upfront fee, and an unverified employer.
                </p>
              </div>

              {/* Action row with Open detailed report button */}
              <div className="pt-3 border-t border-[#F4B2A8]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => navigate('/investigate')}
                  className="inline-flex items-center gap-2 h-[34px] px-4 rounded-none text-[#FAF9F5] text-[12px] font-semibold tracking-[-0.01em] border border-[#3E3D38] shadow-[0_2px_8px_rgba(20,20,19,0.2)] bg-[#141413] hover:bg-[#262523] active:scale-[0.99] transition-all cursor-pointer"
                >
                  <Sparkles size={12} className={s5CardRevealed ? 'animate-spin' : ''} />
                  <span>Open detailed report</span>
                  <ArrowRight size={13} />
                </button>

                <div className="flex items-center gap-1.5 text-[10.5px] text-[#77746C] font-mono">
                  <span>Illustrative analysis demo data</span>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
