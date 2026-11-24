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
function useStepInView(threshold = 0.12, rootMargin = '0px 0px -80px 0px') {
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
        rootMargin,
      }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return [ref, isInView] as const;
}

/* ── SMOOTH TYPEWRITER ANIMATION HOOK ── */
function useTypewriter(fullText: string, shouldStart: boolean, speed = 32, delayMs = 120) {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!shouldStart) {
      setDisplayedText('');
      setIsComplete(false);
      return;
    }

    let intervalId: any;
    const timeoutId = setTimeout(() => {
      let idx = 0;
      intervalId = setInterval(() => {
        idx += 1;
        setDisplayedText(fullText.slice(0, idx));
        if (idx >= fullText.length) {
          clearInterval(intervalId);
          setIsComplete(true);
        }
      }, speed);
    }, delayMs);

    return () => {
      clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, [fullText, shouldStart, speed, delayMs]);

  return { displayedText, isComplete };
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
      className={`relative overflow-hidden bg-[#FAF9F6] border border-[#E2DFD7] rounded-none p-4 sm:p-5 transition-all duration-300 ${
        isApplyActive
          ? 'shadow-[0_8px_26px_-4px_rgba(20,20,19,0.09),0_2px_6px_-1px_rgba(20,20,19,0.03),inset_0_1px_0_0_#FFFFFF]'
          : 'shadow-[0_8px_24px_-4px_rgba(20,20,19,0.06),0_2px_6px_-1px_rgba(20,20,19,0.02),inset_0_1px_0_0_#FFFFFF]'
      } ${className}`}
    >
      {/* Elevated top specular white highlight line matching Product Designer card */}
      <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-white pointer-events-none z-10 shadow-[0_1px_2px_rgba(255,255,255,0.9)]" />

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
  const [headerRef, headerInView] = useStepInView(0.1, '0px 0px -60px 0px');
  const [step1Ref, step1InView] = useStepInView(0.12, '0px 0px -80px 0px');
  const [step2Ref, step2InView] = useStepInView(0.12, '0px 0px -80px 0px');
  const [step3Ref, step3InView] = useStepInView(0.12, '0px 0px -80px 0px');
  const [step4Ref, step4InView] = useStepInView(0.08, '0px 0px 80px 0px');
  const [step5Ref, step5InView] = useStepInView(0.05, '0px 0px 180px 0px');

  /* ── TYPEWRITER ANIMATIONS FOR STEP 01 & 02 META HEADINGS ── */
  const s1Title = useTypewriter('Submit a job posting', step1InView, 32, 100);
  const s1Desc = useTypewriter(
    'Paste a job URL to turn it into readable, structured job content.',
    s1Title.isComplete,
    14,
    30
  );

  const s2Title = useTypewriter('Extract signals', step2InView, 36, 100);
  const s2Desc = useTypewriter(
    'Analyze the job posting and extract key signals that help assess risk.',
    s2Title.isComplete,
    14,
    30
  );

  /* ── SMOOTH SCROLL-DRIVEN TIMELINE SPINE LINE (DOT 01 TO DOT 05) ── */
  const activeSpineRef = useRef<HTMLDivElement | null>(null);
  const trackSpineRef = useRef<HTMLDivElement | null>(null);
  const [timelineProgress, setTimelineProgress] = useState(0);

  useEffect(() => {
    let ticking = false;

    const updateSpine = () => {
      const s1 = step1Ref.current;
      const s5 = step5Ref.current;
      if (!s1 || !s5) return;

      const r1 = s1.getBoundingClientRect();
      const r5 = s5.getBoundingClientRect();

      // Dot 1 center Y relative to viewport
      const dot1Y = r1.top + 34;
      // Dot 5 center Y relative to viewport
      const dot5Y = r5.top + 34;
      // Viewport trigger line (68% down the screen)
      const triggerY = window.innerHeight * 0.68;

      const totalHeight = dot5Y - dot1Y;
      if (totalHeight <= 0) return;

      if (trackSpineRef.current) {
        trackSpineRef.current.style.height = `${totalHeight}px`;
      }

      let currentHeight = 0;
      if (dot1Y >= triggerY) {
        currentHeight = 0;
      } else if (dot5Y <= triggerY) {
        currentHeight = totalHeight;
      } else {
        const scrolled = triggerY - dot1Y;
        currentHeight = Math.max(0, Math.min(totalHeight, scrolled));
      }

      if (activeSpineRef.current) {
        activeSpineRef.current.style.height = `${currentHeight}px`;
      }

      const p = currentHeight / totalHeight;
      setTimelineProgress(p);
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateSpine);
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    updateSpine();

    const timer = setTimeout(updateSpine, 300);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      clearTimeout(timer);
    };
  }, []);

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

  /* ── STEP 03 CHOREOGRAPHED ANIMATION STATE ── */
  const [s3PillsCount, setS3PillsCount] = useState(0);
  const [s3LinesActive, setS3LinesActive] = useState(false);
  const [s3JunctionActive, setS3JunctionActive] = useState(false);
  const [s3LineToCircleActive, setS3LineToCircleActive] = useState(false);
  const [s3RingActive, setS3RingActive] = useState(false);
  const [s3BrainActive, setS3BrainActive] = useState(false);
  const [s3SatellitesStep, setS3SatellitesStep] = useState(0);
  const [s3BottomDotActive, setS3BottomDotActive] = useState(false);

  useEffect(() => {
    if (!step3InView) return;

    const timers: any[] = [];

    // 1. 6 pills reveal one by one with subtle stagger
    for (let i = 1; i <= 6; i++) {
      timers.push(
        setTimeout(() => {
          setS3PillsCount(i);
        }, 120 + i * 130)
      );
    }

    // 2. After all cards appear: dotted lines from each card animate out toward central junction (76, 139)
    timers.push(setTimeout(() => setS3LinesActive(true), 1050));

    // 3. Lines meet at common junction point (76, 139) -> junction dot illuminates
    timers.push(setTimeout(() => setS3JunctionActive(true), 1800));

    // 4. Line extends from junction point to circular orbit edge (133.4, 139)
    timers.push(setTimeout(() => setS3LineToCircleActive(true), 2050));

    // 5. Circular orbit ring forms 360 degrees around ScamShield brain
    timers.push(setTimeout(() => setS3RingActive(true), 2350));

    // 6. From that circle, ScamShield brain illustration and title emerge slowly
    timers.push(setTimeout(() => setS3BrainActive(true), 3200));

    // 7. After the brain emerges properly: 4 satellite badges & connectors appear one by one
    timers.push(setTimeout(() => setS3SatellitesStep(1), 4450)); // 1. Pattern scoring
    timers.push(setTimeout(() => setS3SatellitesStep(2), 4850)); // 2. Text analysis
    timers.push(setTimeout(() => setS3SatellitesStep(3), 5250)); // 3. Feature explanation
    timers.push(setTimeout(() => setS3SatellitesStep(4), 5650)); // 4. Risk synthesis

    // 8. Bottom docking dot at (225.4, 231) activates, ready to stream down
    timers.push(setTimeout(() => setS3BottomDotActive(true), 6050));

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [step3InView]);

  /* ── STEP 04 & 05 CHOREOGRAPHED ANIMATION PIPELINE ── */
  const [s4FeederActive, setS4FeederActive] = useState(false);
  const [s4JunctionActive, setS4JunctionActive] = useState(false);
  const [s4BusActive, setS4BusActive] = useState(false);
  const [s4CardsCount, setS4CardsCount] = useState(0);

  const [s5ExitLinesActive, setS5ExitLinesActive] = useState(false);
  const [s5GatherBusActive, setS5GatherBusActive] = useState(false);
  const [s5ConvergenceDotActive, setS5ConvergenceDotActive] = useState(false);
  const [s5TrunkActive, setS5TrunkActive] = useState(false);
  const [s5CardRevealed, setS5CardRevealed] = useState(false);
  const [s5Score, setS5Score] = useState(0);

  const isStep5Visible = step4InView || step5InView;

  useEffect(() => {
    if (!step4InView && !step5InView) return;

    const timers: any[] = [];
    let scoreInterval: any = null;

    // 1. Feeder line streams down from Section 03 circle to junction point (y=52, 62.73%)
    timers.push(setTimeout(() => setS4FeederActive(true), 120));

    // 2. Junction dot pops in at junction point
    timers.push(setTimeout(() => setS4JunctionActive(true), 550));

    // 3. Feeder line divides into 4 parts (horizontal distribution bus branches out & 4 drop lines stream down)
    timers.push(setTimeout(() => setS4BusActive(true), 700));

    // 4. From that four-part division, all 4 evidence cards reveal sequentially
    timers.push(setTimeout(() => setS4CardsCount(1), 900));
    timers.push(setTimeout(() => setS4CardsCount(2), 1150));
    timers.push(setTimeout(() => setS4CardsCount(3), 1400));
    timers.push(setTimeout(() => setS4CardsCount(4), 1650));

    // 5. AFTER completing Section 4: all 4 cards from bottom animate lines getting out (y=0 down to y=64)
    timers.push(setTimeout(() => setS5ExitLinesActive(true), 2100));

    // 6. Exit lines gather together along the horizontal bus toward central convergence junction (50%, 64)
    timers.push(setTimeout(() => setS5GatherBusActive(true), 2550));

    // 7. Convergence junction dot appears and pulses
    timers.push(setTimeout(() => setS5ConvergenceDotActive(true), 2850));

    // 8. From convergence junction point, single vertical trunk dotted line generates downward (y=64 to y=120)
    timers.push(setTimeout(() => setS5TrunkActive(true), 3050));

    // 9. Dotted trunk generates the High Risk verdict card in Step 05
    timers.push(
      setTimeout(() => {
        setS5CardRevealed(true);

        // 10. Model score counts up smoothly to 94
        let curScore = 0;
        scoreInterval = setInterval(() => {
          curScore += 3;
          if (curScore >= 94) {
            curScore = 94;
            clearInterval(scoreInterval);
          }
          setS5Score(curScore);
        }, 25);
      }, 3400)
    );

    return () => {
      timers.forEach(clearTimeout);
      if (scoreInterval) clearInterval(scoreInterval);
    };
  }, [step4InView, step5InView]);

  return (
    <section
      id="workflow"
      className="w-full border-t border-[#E0DED4] px-4 sm:px-6 lg:px-10 py-16 sm:py-20 md:py-24 bg-[#FAF9F5] relative overflow-hidden"
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
        @keyframes busExpand {
          from {
            transform: scaleX(0);
            opacity: 0;
          }
          to {
            transform: scaleX(1);
            opacity: 1;
          }
        }
        @keyframes busGather {
          from {
            transform: scaleX(0.7);
            opacity: 0;
          }
          to {
            transform: scaleX(1);
            opacity: 1;
          }
        }
        @keyframes circleForm {
          from {
            transform: scale(0.65);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        @keyframes dropStream {
          from {
            opacity: 0;
            transform: translateY(-6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      <div className="max-w-[1140px] mx-auto">

        {/* ── SECTION HEADER (CENTERED, CLEAN & EDITORIAL) ── */}
        <div
          ref={headerRef}
          className={`text-center max-w-xl mx-auto mb-12 sm:mb-16 transition-all duration-700 ease-out ${
            headerInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
          }`}
        >
          <h2 className="text-[32px] sm:text-[40px] md:text-[44px] font-serif font-normal text-[#141413] tracking-tight leading-[1.1] mb-2.5">
            How It Works
          </h2>
          <p className="text-[12.5px] sm:text-[13.5px] text-[#625F58] font-normal leading-relaxed max-w-md mx-auto">
            From pasted job text to model output and separate rule observations. The walkthrough below is illustrative, not a live employer check.
          </p>
        </div>

        {/* ── TIMELINE VERTICAL STACK (STEPS 01 - 05) ── */}
        <div className="relative flex flex-col gap-12 sm:gap-14 md:gap-16">

          {/* Single Unified Left Spine Line (anchored strictly from Dot 01 to Dot 05, NO line below Dot 05) */}
          <div className="hidden md:block absolute left-[9.5px] top-[34px] pointer-events-none z-10">
            {/* Base track ending exactly at Dot 05 */}
            <div
              ref={trackSpineRef}
              className="w-[1.5px] bg-[#E0DED4] opacity-50"
              style={{ height: '0px' }}
            />
            {/* Active smooth black line tracking scroll down to Dot 05 */}
            <div
              ref={activeSpineRef}
              className="absolute top-0 left-0 w-[1.5px] bg-[#141413]"
              style={{ height: '0px' }}
            />
          </div>

          {/* ══════════════════════════════════════════════════════════════
              STEP 01: SUBMIT A JOB POSTING
              (Scroll-Triggered: text appears -> URL entered -> Search clicked -> Arrow emerges -> Product Designer card appears)
          ══════════════════════════════════════════════════════════════ */}
          <div
            id="step-01"
            ref={step1Ref}
            className={`relative flex flex-col md:flex-row items-stretch gap-6 md:gap-10 transition-all duration-700 ease-out ${
              step1InView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12 pointer-events-none'
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
              <div className="mb-3">
                <span className="px-2 py-0.5 rounded-none border border-[#D0CDC2] bg-[#FAF9F6] font-mono text-[11px] font-bold text-[#141413]">
                  01
                </span>
              </div>
              <h3 className="text-[23px] sm:text-[26px] font-serif font-normal text-[#141413] tracking-tight leading-snug mb-2 min-h-[34px] flex items-center">
                <span>{s1Title.displayedText}</span>
                {step1InView && !s1Title.isComplete && (
                  <span className="inline-block w-[2px] h-[1em] bg-[#141413] ml-0.5 animate-pulse" />
                )}
              </h3>
              <p className="text-[13px] sm:text-[13.5px] text-[#55524B] leading-relaxed mb-4 min-h-[44px]">
                <span>{s1Desc.displayedText}</span>
                {s1Title.isComplete && !s1Desc.isComplete && (
                  <span className="inline-block w-[1.5px] h-[0.9em] bg-[#55524B] ml-0.5 animate-pulse" />
                )}
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

            {/* Step Right Visual Card: Warm Porcelain Background matching Product Designer style */}
            <div className="flex-1 bg-[#FAF9F6] border border-[#E2DFD7] rounded-none p-5 sm:p-7 shadow-[0_8px_26px_-4px_rgba(20,20,19,0.06),0_2px_6px_-1px_rgba(20,20,19,0.03),inset_0_1px_0_0_#FFFFFF] relative overflow-hidden transition-all duration-500">
              {/* Elevated specular hairline at top edge */}
              <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-white pointer-events-none z-10 shadow-[0_1px_2px_rgba(255,255,255,0.9)]" />

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

                        {/* Dotted Arrow emerging directly from Search Button center towards Apply Now (Landing Page Style) */}
                        {s1ArrowVisible && (
                          <svg
                            className="hidden lg:block absolute left-[calc(100%+2px)] top-[12px] w-[180px] h-[130px] pointer-events-none z-30 overflow-visible"
                            viewBox="0 0 180 130"
                            fill="none"
                          >
                            <defs>
                              <marker
                                id="s1-arrowhead-flow"
                                markerWidth="6"
                                markerHeight="6"
                                refX="4"
                                refY="3"
                                orient="auto"
                              >
                                <polygon points="0,1 4.5,3 0,5" fill="#A8A29E" />
                              </marker>
                              <linearGradient id="s1-fade-line" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#A8A29E" stopOpacity="0.35" />
                                <stop offset="35%" stopColor="#A8A29E" stopOpacity="0.95" />
                                <stop offset="85%" stopColor="#A8A29E" stopOpacity="0.95" />
                                <stop offset="100%" stopColor="#A8A29E" stopOpacity="0.4" />
                              </linearGradient>
                            </defs>
                            <path
                              d="M 2 0 C 45 0, 72 74, 142 78"
                              stroke="url(#s1-fade-line)"
                              strokeWidth="1"
                              className="flow-dash-line"
                              markerEnd="url(#s1-arrowhead-flow)"
                            />
                            {/* Traveling crimson data pulse matching landing page */}
                            <circle r="2.5" fill="#DC2626" opacity="0">
                              <animateMotion
                                path="M 2 0 C 45 0, 72 74, 142 78"
                                dur="1.4s"
                                repeatCount="indefinite"
                                calcMode="linear"
                              />
                              <animate
                                attributeName="opacity"
                                values="0;1;1;0"
                                keyTimes="0;0.12;0.88;1"
                                dur="1.4s"
                                repeatCount="indefinite"
                              />
                            </circle>
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
            className={`relative flex flex-col md:flex-row items-stretch gap-6 md:gap-10 transition-all duration-700 ease-out ${
              step2InView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12 pointer-events-none'
            }`}
          >
            {/* Timeline node dot (md+) */}
            <div className={`hidden md:flex absolute left-0 top-[24px] w-5 h-5 -translate-x-[0px] rounded-full border bg-[#FAF9F5] items-center justify-center z-10 flex-shrink-0 transition-all duration-300 ${
              timelineProgress >= 0.22 || step2InView
                ? 'border-[#141413] shadow-xs'
                : 'border-[#D0CDC2]'
            }`}>
              <span className={`w-2 h-2 rounded-full transition-all duration-300 ${
                timelineProgress >= 0.22 || step2InView
                  ? 'bg-[#141413] scale-125'
                  : 'bg-[#99968E]'
              }`} />
            </div>

            {/* Step Left Meta Column with Typewriter Effect */}
            <div className="md:w-[280px] lg:w-[310px] md:pl-9 flex-shrink-0">
              <div className="mb-3">
                <span className="px-2 py-0.5 rounded-none border border-[#D0CDC2] bg-[#FAF9F6] font-mono text-[11px] font-bold text-[#141413]">
                  02
                </span>
              </div>
              <h3 className="text-[23px] sm:text-[26px] font-serif font-normal text-[#141413] tracking-tight leading-snug mb-2 min-h-[34px] flex items-center">
                <span>{s2Title.displayedText}</span>
                {step2InView && !s2Title.isComplete && (
                  <span className="inline-block w-[2px] h-[1em] bg-[#141413] ml-0.5 animate-pulse" />
                )}
              </h3>
              <p className="text-[13px] sm:text-[13.5px] text-[#55524B] leading-relaxed mb-4 min-h-[44px]">
                <span>{s2Desc.displayedText}</span>
                {s2Title.isComplete && !s2Desc.isComplete && (
                  <span className="inline-block w-[1.5px] h-[0.9em] bg-[#55524B] ml-0.5 animate-pulse" />
                )}
              </p>
            </div>

            {/* Step Right Visual Card: 1-to-6 Junction Network Architecture (Warm Porcelain Product Designer style) */}
            <div className="flex-1 bg-[#FAF9F6] border border-[#E2DFD7] rounded-none p-5 sm:p-7 shadow-[0_8px_26px_-4px_rgba(20,20,19,0.06),0_2px_6px_-1px_rgba(20,20,19,0.03),inset_0_1px_0_0_#FFFFFF] relative overflow-hidden transition-all duration-500">
              {/* Elevated specular hairline at top edge */}
              <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-white pointer-events-none z-10 shadow-[0_1px_2px_rgba(255,255,255,0.9)]" />

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

                  {/* Node dot on the right boundary in exact vertical middle matching Section 03 style */}
                  <div className={`hidden lg:flex absolute -right-[5px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-[#141413] border border-white items-center justify-center z-30 shadow-xs transition-transform duration-300 ${
                    s2DotActive ? 'scale-110' : ''
                  }`} />
                </div>

                {/* Center: 1-to-6 Junction SVG Network (Structured Corner Architecture matching Section 03) */}
                <div className="hidden lg:block w-[96px] h-[276px] relative flex-shrink-0 -mx-[1px]">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 96 276" fill="none">
                    {/* Step 1: Single Horizontal Trunk from Card Middle Dot (x=1, y=138) to Junction (x=36, y=138) */}
                    {s2DotActive && (
                      <>
                        <line
                          x1="1"
                          y1="138"
                          x2="36"
                          y2="138"
                          stroke="#A8A29E"
                          strokeWidth="1"
                          className="flow-dash-line"
                        />
                        {/* Central Junction Node Dot */}
                        <circle cx="36" cy="138" r="2.5" fill="#141413" />
                        <circle cx="36" cy="138" r="1" fill="#FAF9F5" />
                      </>
                    )}

                    {/* Step 2: 6 Corner-Turn Branch Lines departing from Junction Node and terminating directly on each Pill Dot */}
                    {[
                      { y: 24, path: 'M 36 138 L 42 138 Q 48 138 48 128 L 48 34 Q 48 24 58 24 L 96 24' },
                      { y: 70, path: 'M 36 138 L 42 138 Q 48 138 48 128 L 48 80 Q 48 70 58 70 L 96 70' },
                      { y: 115, path: 'M 36 138 L 42 138 Q 48 138 48 132 L 48 123 Q 48 115 56 115 L 96 115' },
                      { y: 161, path: 'M 36 138 L 42 138 Q 48 138 48 144 L 48 153 Q 48 161 56 161 L 96 161' },
                      { y: 206, path: 'M 36 138 L 42 138 Q 48 138 48 146 L 48 196 Q 48 206 58 206 L 96 206' },
                      { y: 252, path: 'M 36 138 L 42 138 Q 48 138 48 146 L 48 242 Q 48 252 58 252 L 96 252' },
                    ].map((branch, i) => {
                      const isLineActive = s2RevealedCount > i;
                      return (
                        <g key={i}>
                          {isLineActive && (
                            <>
                              <path
                                d={branch.path}
                                stroke="#A8A29E"
                                strokeWidth="1"
                                className="flow-dash-line"
                                fill="none"
                              />
                              {/* Terminal docking node dot touching the pill boundary dot */}
                              <circle cx="96" cy={branch.y} r="2" fill="#141413" />
                              {/* Traveling crimson data pulse */}
                              <circle r="2" fill="#DC2626" opacity="0">
                                <animateMotion
                                  path={branch.path}
                                  dur="2.4s"
                                  begin={`${i * 0.35}s`}
                                  repeatCount="indefinite"
                                  calcMode="linear"
                                />
                                <animate
                                  attributeName="opacity"
                                  values="0;0.9;0.9;0"
                                  keyTimes="0;0.12;0.85;1"
                                  dur="2.4s"
                                  begin={`${i * 0.35}s`}
                                  repeatCount="indefinite"
                                />
                              </circle>
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
                        className={`bg-[#FAF9F6] border rounded-none px-3.5 py-2 flex items-center justify-between transition-all duration-500 relative ${
                          isRevealed
                            ? 'opacity-100 translate-x-0 border-[#E2DFD7] shadow-[0_2px_8px_rgba(20,20,19,0.04),inset_0_1px_0_0_#FFFFFF]'
                            : 'opacity-0 translate-x-3 pointer-events-none border-dashed border-[#E2DFD7]'
                        }`}
                      >
                        {/* Node dot on left boundary touching the incoming dotted line */}
                        <div className="hidden lg:flex absolute -left-[4.5px] top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#141413] border border-white items-center justify-center z-30 shadow-xs" />
                        <div className="flex items-center gap-2.5">
                          <span className="flex items-center justify-center text-[#141413] flex-shrink-0">
                            {sig.icon}
                          </span>
                          <span className="w-[1px] h-3.5 bg-[#E2DFD7] flex-shrink-0" />
                          <span className="text-[12.5px] font-medium text-[#141413]">
                            {sig.title}
                          </span>
                        </div>
                        {isRevealed && (
                          <span className="text-[9px] font-mono text-[#55524B] bg-[#F5F4EE] border border-[#E2DFD7] px-1.5 py-0.5 font-semibold uppercase tracking-wider">
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
            className={`relative flex flex-col md:flex-row items-stretch gap-6 md:gap-10 transition-all duration-700 ease-out ${
              step3InView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12 pointer-events-none'
            }`}
          >
            {/* Timeline node dot (md+) */}
            <div className="hidden md:flex absolute left-0 top-[24px] w-5 h-5 -translate-x-[0px] rounded-full border border-[#D0CDC2] bg-[#FAF9F5] items-center justify-center z-10 flex-shrink-0">
              <span className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                s3SatellitesStep >= 4 ? 'bg-[#141413] scale-125' : 'bg-[#141413]'
              }`} />
            </div>

            {/* Step Left Meta Column */}
            <div className="md:w-[280px] lg:w-[310px] md:pl-9 flex-shrink-0">
              <div className="mb-3">
                <span className="px-2 py-0.5 rounded-none border border-[#D0CDC2] bg-[#FAF9F6] font-mono text-[11px] font-bold text-[#141413]">
                  03
                </span>
              </div>
              <h3 className="text-[23px] sm:text-[26px] font-serif font-normal text-[#141413] tracking-tight leading-snug mb-2">
                Analyze with ScamShield AI
              </h3>
              <p className="text-[13px] sm:text-[13.5px] text-[#55524B] leading-relaxed">
                Use ML analysis and trust checks to assess the signals and estimate recruitment fraud risk.
              </p>
            </div>

            {/* Step Right Visual Card: Warm Porcelain Product Designer style with Centered Brain & Continuous Exit Pipeline */}
            <div className="flex-1 bg-[#FAF9F6] border border-[#E2DFD7] rounded-none p-5 sm:p-7 shadow-[0_8px_26px_-4px_rgba(20,20,19,0.06),0_2px_6px_-1px_rgba(20,20,19,0.03),inset_0_1px_0_0_#FFFFFF] relative overflow-hidden lg:overflow-visible transition-all duration-500">
              {/* Elevated specular hairline at top edge */}
              <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-white pointer-events-none z-10 shadow-[0_1px_2px_rgba(255,255,255,0.9)]" />

              <div className="flex flex-col lg:flex-row items-center relative">

                {/* Left: 6 Input Feature Pills appearing one by one with protruding black node dots */}
                <div className="w-full lg:w-[205px] space-y-2.5 flex-shrink-0 relative z-20">
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
                        className={`bg-[#FAF9F6] border rounded-none px-3.5 h-[38px] flex items-center justify-between transition-all duration-300 relative ${
                          isVisible
                            ? 'opacity-100 translate-x-0 border-[#E2DFD7] shadow-[0_2px_6px_rgba(20,20,19,0.03),inset_0_1px_0_0_#FFFFFF]'
                            : 'opacity-0 -translate-x-2 border-dashed border-[#E2DFD7]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 pr-2">
                          <span className="text-[#141413] flex-shrink-0">{sig.icon}</span>
                          <span className="w-[1px] h-3 bg-[#E2DFD7] flex-shrink-0" />
                          <span className="text-[11.5px] font-medium text-[#141413] truncate">
                            {sig.title}
                          </span>
                        </div>

                        {/* PROMINENT BLACK DOT ON THE RIGHT BOUNDARY OF THE PILL CARD */}
                        <div className="hidden lg:flex absolute -right-[4.5px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-[#141413] border border-white items-center justify-center z-30 shadow-xs" />
                      </div>
                    );
                  })}
                </div>

                {/* Center & Right: Unified Canvas with Landing Page Flow Lines, Centered Brain & Staggered Satellites */}
                <div className="hidden lg:block flex-1 relative w-full h-[280px]">
                  <svg className="w-full h-full absolute inset-0 overflow-visible" viewBox="0 0 460 280" fill="none">
                    <defs>
                      <linearGradient id="s3-fade-entry" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#A8A29E" stopOpacity="0.35" />
                        <stop offset="35%" stopColor="#A8A29E" stopOpacity="0.95" />
                        <stop offset="100%" stopColor="#A8A29E" stopOpacity="0.95" />
                      </linearGradient>
                      <linearGradient id="s3-fade-down" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#A8A29E" stopOpacity="0.95" />
                        <stop offset="80%" stopColor="#A8A29E" stopOpacity="0.9" />
                        <stop offset="100%" stopColor="#A8A29E" stopOpacity="0.4" />
                      </linearGradient>

                      {/* Line drawing masks for each of the 6 incoming corner paths */}
                      {[
                        { d: 'M -12 19 L 42 19 Q 54 19 54 31 L 54 127 Q 54 139 64 139 L 76 139' },
                        { d: 'M -12 67 L 42 67 Q 54 67 54 79 L 54 127 Q 54 139 64 139 L 76 139' },
                        { d: 'M -12 115 L 44 115 Q 54 115 54 125 L 54 129 Q 54 139 64 139 L 76 139' },
                        { d: 'M -12 163 L 44 163 Q 54 163 54 153 L 54 149 Q 54 139 64 139 L 76 139' },
                        { d: 'M -12 211 L 42 211 Q 54 211 54 199 L 54 151 Q 54 139 64 139 L 76 139' },
                        { d: 'M -12 259 L 42 259 Q 54 259 54 247 L 54 151 Q 54 139 64 139 L 76 139' },
                      ].map((p, i) => (
                        <mask key={i} id={`s3-line-mask-${i}`}>
                          <path
                            d={p.d}
                            stroke="white"
                            strokeWidth="16"
                            strokeLinecap="round"
                            fill="none"
                            pathLength="100"
                            strokeDasharray="100"
                            strokeDashoffset={s3LinesActive ? 0 : 100}
                            style={{
                              transition: `stroke-dashoffset 0.75s cubic-bezier(0.2, 0.9, 0.3, 1) ${i * 60}ms`,
                            }}
                          />
                        </mask>
                      ))}

                      {/* Line drawing mask from junction (76, 139) to circular orbit edge (133.4, 139) */}
                      <mask id="s3-junction-to-circle-mask">
                        <line
                          x1="76"
                          y1="139"
                          x2="133.4"
                          y2="139"
                          stroke="white"
                          strokeWidth="16"
                          strokeLinecap="round"
                          pathLength="100"
                          strokeDasharray="100"
                          strokeDashoffset={s3LineToCircleActive ? 0 : 100}
                          style={{
                            transition: 'stroke-dashoffset 0.32s cubic-bezier(0.2, 0.9, 0.3, 1)',
                          }}
                        />
                      </mask>

                      {/* Circle drawing mask forming the 360-degree orbit ring */}
                      <mask id="s3-circle-mask">
                        <path
                          d="M 133.4 139 A 92 92 0 1 1 133.4 138.9"
                          stroke="white"
                          strokeWidth="16"
                          strokeLinecap="round"
                          fill="none"
                          pathLength="100"
                          strokeDasharray="100"
                          strokeDashoffset={s3RingActive ? 0 : 100}
                          style={{
                            transition: 'stroke-dashoffset 0.85s cubic-bezier(0.22, 1, 0.36, 1)',
                          }}
                        />
                      </mask>
                    </defs>

                    {/* 6 Dotted lines arising directly from pill dots, turning with corners, and drawing into central junction (76, 139) */}
                    {[
                      { y: 19, d: 'M -12 19 L 42 19 Q 54 19 54 31 L 54 127 Q 54 139 64 139 L 76 139' },
                      { y: 67, d: 'M -12 67 L 42 67 Q 54 67 54 79 L 54 127 Q 54 139 64 139 L 76 139' },
                      { y: 115, d: 'M -12 115 L 44 115 Q 54 115 54 125 L 54 129 Q 54 139 64 139 L 76 139' },
                      { y: 163, d: 'M -12 163 L 44 163 Q 54 163 54 153 L 54 149 Q 54 139 64 139 L 76 139' },
                      { y: 211, d: 'M -12 211 L 42 211 Q 54 211 54 199 L 54 151 Q 54 139 64 139 L 76 139' },
                      { y: 259, d: 'M -12 259 L 42 259 Q 54 259 54 247 L 54 151 Q 54 139 64 139 L 76 139' },
                    ].map((branch, i) => (
                      <g key={i}>
                        <path
                          d={branch.d}
                          stroke="url(#s3-fade-entry)"
                          strokeWidth="1"
                          className="flow-dash-line"
                          mask={`url(#s3-line-mask-${i})`}
                        />
                        {/* Crimson data pulse traveling along the line once active */}
                        {s3LinesActive && (
                          <circle r="2" fill="#DC2626" opacity="0">
                            <animateMotion
                              path={branch.d}
                              dur="2.2s"
                              begin={`${0.4 + i * 0.15}s`}
                              repeatCount="indefinite"
                              calcMode="linear"
                            />
                            <animate
                              attributeName="opacity"
                              values="0;0.9;0.9;0"
                              keyTimes="0;0.12;0.85;1"
                              dur="2.2s"
                              begin={`${0.4 + i * 0.15}s`}
                              repeatCount="indefinite"
                            />
                          </circle>
                        )}
                      </g>
                    ))}

                    {/* Central junction point dot where all lines meet */}
                    <g
                      className={`transition-all duration-300 ${
                        s3JunctionActive ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
                      }`}
                      style={{ transformOrigin: '76px 139px' }}
                    >
                      <circle cx="76" cy="139" r="3.5" fill="#141413" />
                      <circle cx="76" cy="139" r="1.2" fill="#FAF9F5" />
                    </g>

                    {/* Horizontal dotted line into the circular ring at x=133.4 (225.4 - 92) */}
                    {s3LineToCircleActive && (
                      <>
                        <line
                          x1="76"
                          y1="139"
                          x2="133.4"
                          y2="139"
                          stroke="#A8A29E"
                          strokeWidth="1"
                          className="flow-dash-line"
                          style={{
                            animation: 'dropStream 0.3s ease-out forwards',
                          }}
                        />
                        <circle cx="133.4" cy="139" r="2" fill="#141413" className="transition-opacity duration-300" />
                      </>
                    )}

                    {/* Circular Orbit Ring around Brain forming 360 degrees (cx=225.4, cy=139, r=92) */}
                    {s3RingActive && (
                      <circle
                        cx="225.4"
                        cy="139"
                        r="92"
                        stroke="#A8A29E"
                        strokeWidth="1"
                        className="flow-dash-line"
                        fill="none"
                        style={{
                          animation: 'circleForm 0.75s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                          transformOrigin: '225.4px 139px',
                        }}
                      />
                    )}

                    {/* 4 Satellite Connectors appearing one by one */}
                    {/* 1. Pattern scoring connector */}
                    {s3SatellitesStep >= 1 && (
                      <g className="transition-all duration-400 ease-out">
                        <line x1="160.4" y1="74" x2="121.4" y2="44" stroke="#A8A29E" strokeWidth="1" className="flow-dash-line" />
                        <circle cx="121.4" cy="44" r="2" fill="#141413" />
                      </g>
                    )}

                    {/* 2. Text analysis connector */}
                    {s3SatellitesStep >= 2 && (
                      <g className="transition-all duration-400 ease-out">
                        <line x1="225.4" y1="47" x2="225.4" y2="22" stroke="#A8A29E" strokeWidth="1" className="flow-dash-line" />
                        <circle cx="225.4" cy="22" r="2" fill="#141413" />
                      </g>
                    )}

                    {/* 3. Feature explanation connector */}
                    {s3SatellitesStep >= 3 && (
                      <g className="transition-all duration-400 ease-out">
                        <line x1="290.4" y1="74" x2="329.4" y2="44" stroke="#A8A29E" strokeWidth="1" className="flow-dash-line" />
                        <circle cx="329.4" cy="44" r="2" fill="#141413" />
                      </g>
                    )}

                    {/* 4. Risk synthesis connector */}
                    {s3SatellitesStep >= 4 && (
                      <g className="transition-all duration-400 ease-out">
                        <line x1="317.4" y1="139" x2="353.4" y2="139" stroke="#A8A29E" strokeWidth="1" className="flow-dash-line" />
                        <circle cx="353.4" cy="139" r="2" fill="#DC2626" />
                      </g>
                    )}

                    {/* Docking dot at bottom boundary of circular brain orbit (cx=225.4, cy=231) directly vertically collinear with Web Corroboration */}
                    <g
                      className={`transition-all duration-300 ${
                        s3BottomDotActive ? 'opacity-100 scale-125' : 'opacity-60 scale-100'
                      }`}
                      style={{ transformOrigin: '225.4px 231px' }}
                    >
                      <circle cx="225.4" cy="231" r="2.5" fill="#141413" />
                      <circle cx="225.4" cy="231" r="1" fill="#FAF9F5" />
                    </g>

                    {/* SVG foreignObject: Perfectly centered Brain illustration & ScamShield Engine typography emerging slowly */}
                    <foreignObject
                      x="135.4"
                      y="55"
                      width="180"
                      height="168"
                      className="overflow-visible pointer-events-none"
                    >
                      <div
                        className={`w-full h-full flex flex-col items-center justify-center text-center select-none transition-all duration-1000 ease-out ${
                          s3BrainActive
                            ? 'opacity-100 scale-100 blur-0 translate-y-0'
                            : 'opacity-0 scale-[0.6] blur-[6px] translate-y-2'
                        }`}
                      >
                        <div className="relative w-[116px] h-[72px] flex items-center justify-center">
                          <img
                            src="/Detailed Ivory Brain Illustration.png"
                            alt="ScamShield Analysis Engine"
                            className="w-full h-full object-contain mix-blend-multiply select-none pointer-events-none drop-shadow-[0_8px_18px_rgba(20,20,19,0.12)]"
                          />
                        </div>
                        <span className="font-serif font-bold text-[13px] sm:text-[14px] text-[#141413] tracking-tight mt-1 text-center leading-tight">
                          ScamShield<br />Analysis Engine
                        </span>
                      </div>
                    </foreignObject>

                    {/* Satellite Badges rendered directly inside SVG coordinate space */}
                    {/* Badge 1: Pattern scoring */}
                    <foreignObject
                      x="28"
                      y="24"
                      width="120"
                      height="34"
                      className="overflow-visible pointer-events-none"
                    >
                      <div
                        className={`transition-all duration-500 ease-out ${
                          s3SatellitesStep >= 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
                        }`}
                      >
                        <span className="inline-flex items-center px-2 py-0.5 rounded-none border border-[#141413] bg-[#FAF9F6] text-[10.5px] font-mono font-medium shadow-[0_2px_6px_rgba(20,20,19,0.06),inset_0_1px_0_0_#FFFFFF]">
                          Pattern scoring
                        </span>
                      </div>
                    </foreignObject>

                    {/* Badge 2: Text analysis */}
                    <foreignObject
                      x="171"
                      y="0"
                      width="110"
                      height="34"
                      className="overflow-visible pointer-events-none"
                    >
                      <div
                        className={`flex justify-center transition-all duration-500 ease-out ${
                          s3SatellitesStep >= 2 ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
                        }`}
                      >
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-none border border-[#141413] bg-[#FAF9F6] text-[10.5px] font-mono font-medium shadow-[0_2px_6px_rgba(20,20,19,0.06),inset_0_1px_0_0_#FFFFFF]">
                          Text analysis
                        </span>
                      </div>
                    </foreignObject>

                    {/* Badge 3: Feature explanation */}
                    <foreignObject
                      x="308"
                      y="24"
                      width="138"
                      height="34"
                      className="overflow-visible pointer-events-none"
                    >
                      <div
                        className={`transition-all duration-500 ease-out ${
                          s3SatellitesStep >= 3 ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
                        }`}
                      >
                        <span className="inline-flex items-center px-2 py-0.5 rounded-none border border-[#141413] bg-[#FAF9F6] text-[10.5px] font-mono font-medium shadow-[0_2px_6px_rgba(20,20,19,0.06),inset_0_1px_0_0_#FFFFFF]">
                          Feature explanation
                        </span>
                      </div>
                    </foreignObject>

                    {/* Badge 4: Risk synthesis */}
                    <foreignObject
                      x="356"
                      y="122"
                      width="100"
                      height="34"
                      className="overflow-visible pointer-events-none"
                    >
                      <div
                        className={`transition-all duration-500 ease-out ${
                          s3SatellitesStep >= 4 ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
                        }`}
                      >
                        <span className="inline-flex items-center px-2 py-0.5 rounded-none border border-[#DC2626] text-[#DC2626] bg-[#FAF9F6] text-[10.5px] font-mono font-medium shadow-[0_2px_6px_rgba(220,38,38,0.06),inset_0_1px_0_0_#FFFFFF]">
                          Risk synthesis
                        </span>
                      </div>
                    </foreignObject>
                  </svg>
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
            className={`relative flex flex-col md:flex-row items-stretch gap-6 md:gap-10 mt-10 sm:mt-12 md:mt-14 transition-all duration-700 ease-out ${
              step4InView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12 pointer-events-none'
            }`}
          >
            {/* ══════════════════════════════════════════════════════════════
                INTER-SECTION PIPELINE CONNECTOR (SECTION 03 -> SECTION 04)
                (Seamlessly bridges Step 03 bottom into the 4 evidence cards)
            ══════════════════════════════════════════════════════════════ */}
            <div className={`hidden lg:block absolute -top-[120px] left-0 right-0 h-[120px] pointer-events-none z-20 transition-all duration-700 ease-out ${
              step4InView ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
            }`}>
              <div className="flex items-stretch gap-6 md:gap-10 h-full">
                {/* Spacer matching left meta column */}
                <div className="md:w-[280px] lg:w-[310px] md:pl-9 flex-shrink-0" />
                {/* Connector canvas matching right visual column (Pure SVG with exact flow-dash-line styling) */}
                <div className="flex-1 relative h-full">
                  <svg className="w-full h-full absolute inset-0 overflow-visible" fill="none">
                    {/* Continuous feeder line connecting the Section 03 circle bottom dot directly to Section 04 junction dot (100% straight vertical) */}
                    {s4FeederActive && (
                      <line
                        x1="62.73%"
                        y1="-78"
                        x2="62.73%"
                        y2="52"
                        stroke="#A8A29E"
                        strokeWidth="1"
                        className="flow-dash-line"
                        style={{
                          animation: 'dropStream 0.45s ease-out forwards',
                        }}
                      />
                    )}

                    {/* Single central junction node dot */}
                    {s4JunctionActive && (
                      <g
                        className="transition-all duration-300 animate-scale-pop"
                        style={{ transformOrigin: '62.73% 52px' }}
                      >
                        <circle cx="62.73%" cy="52" r="2.5" fill="#141413" />
                        <circle cx="62.73%" cy="52" r="1" fill="#FAF9F5" />
                      </g>
                    )}

                    {/* Horizontal distribution bus lines branching out from junction dot */}
                    {s4BusActive && (
                      <line
                        x1="11.82%"
                        y1="52"
                        x2="88.18%"
                        y2="52"
                        stroke="#A8A29E"
                        strokeWidth="1"
                        className="flow-dash-line"
                        style={{
                          animation: 'busExpand 0.4s ease-out forwards',
                          transformOrigin: '62.73% 52px',
                        }}
                      />
                    )}

                    {/* 4 Straight Dotted Drop Lines into the 4 evidence cards below */}
                    {[
                      { x: '11.82%', colIdx: 0 },
                      { x: '37.27%', colIdx: 1 },
                      { x: '62.73%', colIdx: 2 },
                      { x: '88.18%', colIdx: 3 },
                    ].map((drop) => {
                      const isActive = s4CardsCount > drop.colIdx;
                      return isActive ? (
                        <line
                          key={drop.colIdx}
                          x1={drop.x}
                          y1="52"
                          x2={drop.x}
                          y2="120"
                          stroke="#A8A29E"
                          strokeWidth="1"
                          className="flow-dash-line"
                          style={{
                            animation: 'dropStream 0.35s ease-out forwards',
                          }}
                        />
                      ) : null;
                    })}
                  </svg>
                </div>
              </div>
            </div>
            {/* Timeline node dot (md+) */}
            <div className="hidden md:flex absolute left-0 top-[24px] w-5 h-5 -translate-x-[0px] rounded-full border border-[#D0CDC2] bg-[#FAF9F5] items-center justify-center z-10 flex-shrink-0">
              <span className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                s4CardsCount >= 4 ? 'bg-[#141413] scale-125' : 'bg-[#141413]'
              }`} />
            </div>

            {/* Step Left Meta Column */}
            <div className="md:w-[280px] lg:w-[310px] md:pl-9 flex-shrink-0">
              <div className="mb-3">
                <span className="px-2 py-0.5 rounded-none border border-[#D0CDC2] bg-[#FAF9F6] font-mono text-[11px] font-bold text-[#141413]">
                  04
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
            <div className="flex-1 relative transition-all duration-500">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">

                {/* Card 1: Domain consistency (Warm Porcelain Product Designer Style) */}
                <div className={`relative overflow-hidden bg-[#FAF9F6] border rounded-none p-4 flex flex-col justify-between transition-all duration-500 ${
                  s4CardsCount >= 1 ? 'opacity-100 translate-y-0 border-[#E2DFD7] shadow-[0_8px_24px_-4px_rgba(20,20,19,0.07),0_2px_6px_-1px_rgba(20,20,19,0.03),inset_0_1px_0_0_#FFFFFF]' : 'opacity-0 translate-y-4 pointer-events-none border-[#E2DFD7]'
                }`}>
                  {/* Top specular hairline */}
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-white pointer-events-none z-10 shadow-[0_1px_2px_rgba(255,255,255,0.9)]" />
                  {/* Top docking node */}
                  <div className="hidden lg:flex absolute -top-[4px] left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[#141413] border border-white items-center justify-center z-20 shadow-xs" />
                  {/* Bottom docking node */}
                  <div className="hidden lg:flex absolute -bottom-[4px] left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[#141413] border border-white items-center justify-center z-20 shadow-xs" />

                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-none bg-[#F5F4EE] border border-[#E2DFD7] flex items-center justify-center text-[#141413]">
                          <Globe size={14} />
                        </div>
                        <span className="w-[1px] h-3.5 bg-[#E2DFD7]" />
                      </div>
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-none bg-[#F5F4EE] border border-[#E2DFD7] text-[#141413]">
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
                  <div className="mt-3 pt-2 border-t border-[#E8E6DE]">
                    <span className="text-[9.5px] font-mono text-[#55524B] font-semibold uppercase">
                      Check complete
                    </span>
                  </div>
                </div>

                {/* Card 2: Credential verification (Warm Rose-Porcelain Concern Style) */}
                <div className={`relative overflow-hidden bg-gradient-to-b from-[#FFF2F0] via-[#FEECE8] to-[#FDE4E0] border rounded-none p-4 flex flex-col justify-between transition-all duration-500 ${
                  s4CardsCount >= 2 ? 'opacity-100 translate-y-0 border-[#F6C6BF] shadow-[0_8px_24px_-4px_rgba(180,50,50,0.07),inset_0_1px_0_0_#FFFFFF]' : 'opacity-0 translate-y-4 pointer-events-none border-[#F6C6BF]'
                }`}>
                  {/* Top specular hairline */}
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-white pointer-events-none z-10 shadow-[0_1px_2px_rgba(255,255,255,0.9)]" />
                  {/* Top docking node */}
                  <div className="hidden lg:flex absolute -top-[4px] left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[#141413] border border-white items-center justify-center z-20 shadow-xs" />
                  {/* Bottom docking node */}
                  <div className="hidden lg:flex absolute -bottom-[4px] left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[#141413] border border-white items-center justify-center z-20 shadow-xs" />

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
                  <div className="mt-3 pt-2 border-t border-[#F8D2CC]">
                    <span className="text-[9.5px] font-mono text-rose-700 font-semibold uppercase">
                      Concern found
                    </span>
                  </div>
                </div>

                {/* Card 3: Web corroboration (Warm Porcelain Product Designer Style) */}
                <div className={`relative overflow-hidden bg-[#FAF9F6] border rounded-none p-4 flex flex-col justify-between transition-all duration-500 ${
                  s4CardsCount >= 3 ? 'opacity-100 translate-y-0 border-[#E2DFD7] shadow-[0_8px_24px_-4px_rgba(20,20,19,0.07),0_2px_6px_-1px_rgba(20,20,19,0.03),inset_0_1px_0_0_#FFFFFF]' : 'opacity-0 translate-y-4 pointer-events-none border-[#E2DFD7]'
                }`}>
                  {/* Top specular hairline */}
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-white pointer-events-none z-10 shadow-[0_1px_2px_rgba(255,255,255,0.9)]" />
                  {/* Top docking node */}
                  <div className="hidden lg:flex absolute -top-[4px] left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[#141413] border border-white items-center justify-center z-20 shadow-xs" />
                  {/* Bottom docking node */}
                  <div className="hidden lg:flex absolute -bottom-[4px] left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[#141413] border border-white items-center justify-center z-20 shadow-xs" />

                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-none bg-[#F5F4EE] border border-[#E2DFD7] flex items-center justify-center text-[#141413]">
                          <Layers size={14} />
                        </div>
                        <span className="w-[1px] h-3.5 bg-[#E2DFD7]" />
                      </div>
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-none bg-[#F5F4EE] border border-[#E2DFD7] text-[#141413]">
                        <Check size={12} strokeWidth={2.5} />
                      </span>
                    </div>
                    <h5 className="text-[12.5px] font-bold text-[#141413] mb-1">
                      Web corroboration
                    </h5>
                    <p className="text-[11px] text-[#625F58] leading-relaxed">
                      Illustrative optional search; external research is unavailable in the local demo.
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-[#E8E6DE]">
                    <span className="text-[9.5px] font-mono text-[#55524B] font-semibold uppercase">
                      Check complete
                    </span>
                  </div>
                </div>

                {/* Card 4: Employer legitimacy (Warm Amber-Porcelain Review Style) */}
                <div className={`relative overflow-hidden bg-gradient-to-b from-[#FFFDF7] via-[#FEF9EC] to-[#FDF3DE] border rounded-none p-4 flex flex-col justify-between transition-all duration-500 ${
                  s4CardsCount >= 4 ? 'opacity-100 translate-y-0 border-[#FDE68A] shadow-[0_8px_24px_-4px_rgba(217,119,6,0.07),inset_0_1px_0_0_#FFFFFF]' : 'opacity-0 translate-y-4 pointer-events-none border-[#FDE68A]'
                }`}>
                  {/* Top specular hairline */}
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-white pointer-events-none z-10 shadow-[0_1px_2px_rgba(255,255,255,0.9)]" />
                  {/* Top docking node */}
                  <div className="hidden lg:flex absolute -top-[4px] left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[#141413] border border-white items-center justify-center z-20 shadow-xs" />
                  {/* Bottom docking node */}
                  <div className="hidden lg:flex absolute -bottom-[4px] left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[#141413] border border-white items-center justify-center z-20 shadow-xs" />

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
                  <div className="mt-3 pt-2 border-t border-[#FDE68A]/60">
                    <span className="text-[9.5px] font-mono text-amber-700 font-semibold uppercase">
                      Needs review
                    </span>
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
            className={`relative flex flex-col md:flex-row items-stretch gap-6 md:gap-10 mt-10 sm:mt-12 md:mt-14 transition-all duration-700 ease-out ${
              isStep5Visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            {/* ══════════════════════════════════════════════════════════════
                INTER-SECTION GATHERING PIPELINE (SECTION 04 -> SECTION 05)
                (All 4 cards drop lines down into gathering bus and join into Step 05)
            ══════════════════════════════════════════════════════════════ */}
            <div className={`hidden lg:block absolute -top-[120px] left-0 right-0 h-[120px] pointer-events-none z-20 transition-all duration-700 ease-out ${
              isStep5Visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
            }`}>
              <div className="flex items-stretch gap-6 md:gap-10 h-full">
                {/* Spacer matching left meta column */}
                <div className="md:w-[280px] lg:w-[310px] md:pl-9 flex-shrink-0" />
                {/* Gathering canvas matching right visual column (Pure SVG with exact flow-dash-line styling) */}
                <div className="flex-1 relative h-full">
                  <svg className="w-full h-full absolute inset-0 overflow-visible" fill="none">
                    {/* 4 Straight Dotted Exit Lines from the 4 evidence cards above (y=0 down to y=64) */}
                    {s5ExitLinesActive && (
                      <>
                        {[
                          { x: '11.82%', colIdx: 0 },
                          { x: '37.27%', colIdx: 1 },
                          { x: '62.73%', colIdx: 2 },
                          { x: '88.18%', colIdx: 3 },
                        ].map((exit) => (
                          <line
                            key={exit.colIdx}
                            x1={exit.x}
                            y1="0"
                            x2={exit.x}
                            y2="64"
                            stroke="#A8A29E"
                            strokeWidth="1"
                            className="flow-dash-line"
                            style={{
                              animation: 'dropStream 0.4s ease-out forwards',
                            }}
                          />
                        ))}
                      </>
                    )}

                    {/* Horizontal gathering bus lines converging into center at y=64 */}
                    {s5GatherBusActive && (
                      <line
                        x1="11.82%"
                        y1="64"
                        x2="88.18%"
                        y2="64"
                        stroke="#A8A29E"
                        strokeWidth="1"
                        className="flow-dash-line"
                        style={{
                          animation: 'busGather 0.4s ease-out forwards',
                          transformOrigin: '50% 64px',
                        }}
                      />
                    )}

                    {/* Central convergence node dot at y=64, left: 50% */}
                    {s5ConvergenceDotActive && (
                      <g
                        className="transition-all duration-300 animate-scale-pop"
                        style={{ transformOrigin: '50% 64px' }}
                      >
                        <circle cx="50%" cy="64" r="2.5" fill="#141413" />
                        <circle cx="50%" cy="64" r="1" fill="#FAF9F5" />
                      </g>
                    )}

                    {/* Vertical trunk line feeding into Step 05 (from y=64 down to y=120) */}
                    {s5TrunkActive && (
                      <line
                        x1="50%"
                        y1="64"
                        x2="50%"
                        y2="120"
                        stroke="#A8A29E"
                        strokeWidth="1"
                        className="flow-dash-line"
                        style={{
                          animation: 'dropStream 0.35s ease-out forwards',
                        }}
                      />
                    )}
                  </svg>
                </div>
              </div>
            </div>
            {/* Timeline node dot (md+) */}
            <div className="hidden md:flex absolute left-0 top-[24px] w-5 h-5 -translate-x-[0px] rounded-full border border-[#F4B2A8] bg-[#FEECE8] items-center justify-center z-10 flex-shrink-0">
              <span className="w-2 h-2 rounded-full transition-colors bg-[#DC2626]" />
            </div>

            {/* Step Left Meta Column */}
            <div className="md:w-[280px] lg:w-[310px] md:pl-9 flex-shrink-0">
              <div className="mb-3">
                <span className="px-2 py-0.5 rounded-none border border-[#F4B2A8] bg-[#FEECE8] font-mono text-[11px] font-bold text-[#DC2626]">
                  05
                </span>
              </div>
              <h3 className="text-[23px] sm:text-[26px] font-serif font-normal text-[#141413] tracking-tight leading-snug mb-2">
                Receive an explainable verdict
              </h3>
              <p className="text-[13px] sm:text-[13.5px] text-[#55524B] leading-relaxed">
                Get a clear risk assessment, key reasons, and an easy way to review the full evidence.
              </p>
            </div>

            {/* Step Right Visual Card: Warm Rose-Porcelain Verdict Card (Generated from convergence junction) */}
            <div className={`flex-1 bg-gradient-to-b from-[#FFF2F0] via-[#FEECE8] to-[#FDE4E0] border rounded-none p-5 sm:p-7 border-[#DC2626] ring-1 ring-[#DC2626]/20 relative overflow-hidden transition-all duration-700 ease-out ${
              s5CardRevealed
                ? 'opacity-100 translate-y-0 scale-100 shadow-[0_8px_30px_rgba(220,38,38,0.12),inset_0_1px_0_0_#FFFFFF]'
                : 'opacity-0 translate-y-8 scale-95 pointer-events-none'
            }`}>
              {/* Receiver node dot where gathering trunk plugs into Section 05 */}
              <span className={`hidden lg:block absolute -top-[4px] left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[#141413] border border-white shadow-xs z-20 transition-all duration-300 ${
                s5CardRevealed ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
              }`} />

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
