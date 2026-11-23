import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { AlertTriangle, Mail, Building2, Lock } from 'lucide-react';

interface PointCoords {
  xApply: number;
  yApply: number;
  xJ: number;
  yJ: number;
  xMid: number;
  xC1L: number;
  yC1L: number;
  xC2L: number;
  yC2L: number;
  xC3L: number;
  yC3L: number;
  xC1R: number;
  yC1R: number;
  xC2R: number;
  yC2R: number;
  xC3R: number;
  yC3R: number;
  xTrunk: number;
  yTurn: number;
  xB: number;
  yB: number;
  ready: boolean;
}

const annotations = [
  {
    icon: <Mail size={15} strokeWidth={1.75} className="text-[#DC2626]" />,
    label: 'Domain mismatch',
    detail: "Recruiter email doesn't match the company domain.",
  },
  {
    icon: <AlertTriangle size={15} strokeWidth={1.75} className="text-[#DC2626]" />,
    label: 'Upfront payment request',
    detail: 'Mentions an upfront registration fee.',
  },
  {
    icon: <Building2 size={15} strokeWidth={1.75} className="text-[#DC2626]" />,
    label: 'Unverified employer',
    detail: 'Company details could not be verified.',
  },
];

const riskFactors = [
  { label: 'Payment Fee', val: '+0.42', color: '#DC2626', pct: '42%' },
  { label: 'Personal Email', val: '+0.28', color: '#EA580C', pct: '28%' },
  { label: 'Urgent Hiring', val: '+0.18', color: '#D97706', pct: '18%' },
  { label: 'Positive Signals', val: '-0.12', color: '#16A34A', pct: '12%' },
];

function DigitColumn({ digit, delay = 0, active }: { digit: string; delay?: number; active: boolean }) {
  const num = parseInt(digit, 10);
  if (isNaN(num)) {
    return <span className="inline-block h-[1.2em] leading-[1.2em] align-middle">{digit}</span>;
  }

  const digitsArray = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

  return (
    <span className="inline-block overflow-hidden h-[1.2em] leading-[1.2em] align-middle relative">
      <span
        className="block transition-transform duration-[850ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{
          transform: active ? `translateY(-${(10 + num) * 5}%)` : 'translateY(0%)',
          transitionDelay: `${delay}ms`,
        }}
      >
        {digitsArray.map((n, idx) => (
          <span key={idx} className="block h-[1.2em] leading-[1.2em] text-center">
            {n}
          </span>
        ))}
      </span>
    </span>
  );
}

function RollingText({
  text,
  active,
  baseDelay = 0,
}: {
  text: string;
  active: boolean;
  baseDelay?: number;
}) {
  let digitIndex = 0;
  return (
    <span className="inline-flex items-center align-middle">
      {text.split('').map((char, i) => {
        const isDigit = /\d/.test(char);
        const delay = isDigit ? baseDelay + digitIndex++ * 35 : 0;
        return <DigitColumn key={i} digit={char} delay={delay} active={active} />;
      })}
    </span>
  );
}

export default function JobAnalysisMockup() {
  const containerRef = useRef<HTMLDivElement>(null);
  const jobCardRef = useRef<HTMLDivElement>(null);
  const applyBtnRef = useRef<HTMLButtonElement>(null);
  const c1Ref = useRef<HTMLDivElement>(null);
  const c2Ref = useRef<HTMLDivElement>(null);
  const c3Ref = useRef<HTMLDivElement>(null);
  const bottomCardRef = useRef<HTMLDivElement>(null);

  const [telemetryActive, setTelemetryActive] = useState(false);
  const [points, setPoints] = useState<PointCoords>({
    xApply: 0,
    yApply: 0,
    xJ: 0,
    yJ: 0,
    xMid: 0,
    xC1L: 0,
    yC1L: 0,
    xC2L: 0,
    yC2L: 0,
    xC3L: 0,
    yC3L: 0,
    xC1R: 0,
    yC1R: 0,
    xC2R: 0,
    yC2R: 0,
    xC3R: 0,
    yC3R: 0,
    xTrunk: 0,
    yTurn: 0,
    xB: 0,
    yB: 0,
    ready: false,
  });

  const updateCoordinates = () => {
    if (
      !containerRef.current ||
      !jobCardRef.current ||
      !applyBtnRef.current ||
      !c1Ref.current ||
      !c2Ref.current ||
      !c3Ref.current ||
      !bottomCardRef.current
    ) {
      return;
    }

    const container = containerRef.current.getBoundingClientRect();
    const job = jobCardRef.current.getBoundingClientRect();
    const apply = applyBtnRef.current.getBoundingClientRect();
    const c1 = c1Ref.current.getBoundingClientRect();
    const c2 = c2Ref.current.getBoundingClientRect();
    const c3 = c3Ref.current.getBoundingClientRect();
    const bottom = bottomCardRef.current.getBoundingClientRect();

    // Apply button right-edge center
    const xApply = Math.round(apply.right - container.left);
    const yApply = Math.round(apply.top + apply.height / 2 - container.top);

    const xC1L = Math.round(c1.left - container.left);
    const yC1L = Math.round(c1.top + c1.height / 2 - container.top);

    const xC2L = Math.round(c2.left - container.left);
    const yC2L = Math.round(c2.top + c2.height / 2 - container.top);

    const xC3L = Math.round(c3.left - container.left);
    const yC3L = Math.round(c3.top + c3.height / 2 - container.top);

    // Left connection points: perfectly straight horizontal axis aligned with Payment Request (Card 2)
    const xJ = Math.round(job.right - container.left);
    const yJ = yC2L; // Aligned with Card 2 center so junction & card 2 are 100% dead straight horizontal

    const xMid = Math.round(xJ + (xC2L - xJ) * 0.48);

    // Right connection points: right edges of 3 cards to vertical bus line
    const xC1R = Math.round(c1.right - container.left);
    const yC1R = yC1L;

    const xC2R = Math.round(c2.right - container.left);
    const yC2R = yC2L;

    const xC3R = Math.round(c3.right - container.left);
    const yC3R = yC3L;

    const xTrunk = Math.round(Math.max(xC1R, xC2R, xC3R) + 24);

    // Connect cleanly into top edge in the middle of bottom card (shifted right to center)
    const xB = Math.round(bottom.left - container.left + bottom.width * 0.52);
    const yB = Math.round(bottom.top - container.top);

    const yTurn = Math.round(yC3R + (yB - yC3R) * 0.46);

    setPoints({
      xApply,
      yApply,
      xJ,
      yJ,
      xMid,
      xC1L,
      yC1L,
      xC2L,
      yC2L,
      xC3L,
      yC3L,
      xC1R,
      yC1R,
      xC2R,
      yC2R,
      xC3R,
      yC3R,
      xTrunk,
      yTurn,
      xB,
      yB,
      ready: true,
    });
  };

  useLayoutEffect(() => {
    updateCoordinates();
  }, []);

  useEffect(() => {
    updateCoordinates();

    const handleResize = () => {
      updateCoordinates();
    };

    window.addEventListener('resize', handleResize);

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && containerRef.current) {
      resizeObserver = new ResizeObserver(() => {
        updateCoordinates();
      });
      resizeObserver.observe(containerRef.current);
    }

    if (document.fonts) {
      document.fonts.ready.then(updateCoordinates);
    }

    const timer1 = setTimeout(updateCoordinates, 150);
    const timer2 = setTimeout(updateCoordinates, 450);
    const telemetryTimer = setTimeout(() => {
      setTelemetryActive(true);
    }, 6400);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeObserver) resizeObserver.disconnect();
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(telemetryTimer);
    };
  }, []);

  return (
    <div className="w-full overflow-x-auto sm:overflow-x-visible pb-2 select-none no-scrollbar">
      {/* Container with responsive bounds and right margin for bus line and score */}
      <div
        ref={containerRef}
        className="relative min-w-[500px] sm:min-w-0 pr-6 sm:pr-8 pt-1 pb-1 animate-card-entrance stagger-3"
      >
        {/* ── TOP SYSTEM TELEMETRY BAR ── */}
        <div
          className={`flex items-center justify-between text-[10px] sm:text-[10.5px] font-mono mb-3.5 px-1 select-none text-[#77746C] whitespace-nowrap transition-all duration-700 ease-out ${
            telemetryActive ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'
          }`}
        >
          <div className="flex items-center gap-2 sm:gap-3.5">
            <span className="text-[#8C887E]">JOB_839204</span>
            <span className="font-semibold text-[#2563EB]">
              <RollingText text="$2,680.00" active={telemetryActive} baseDelay={0} />
            </span>
            <span className="text-[#8C887E]">SG → BR</span>
            <span className="font-semibold text-[#DC2626]">
              RISK <RollingText text="+0.88" active={telemetryActive} baseDelay={140} />
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-2 sm:gap-3.5">
            <span className="text-[#8C887E]">JOB_839205</span>
            <span className="font-semibold text-[#141413]">
              <RollingText text="$75.30" active={telemetryActive} baseDelay={240} />
            </span>
            <span className="text-[#8C887E]">AE → AE</span>
            <span className="font-semibold text-[#DC2626]">
              <RollingText text="+0.28" active={telemetryActive} baseDelay={340} />
            </span>
          </div>
          <div className="font-mono text-[#8C887E] tracking-wider">
            <RollingText text="22:41:08" active={telemetryActive} baseDelay={420} />
          </div>
        </div>

        {/* ── LAYER 1: BEHIND CARDS (z-0) — Flowing dashed lines & traveling telemetry pulses ── */}
        <svg
          className={`absolute inset-0 w-full h-full pointer-events-none z-0 transition-opacity duration-300 ${
            points.ready ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ overflow: 'visible' }}
          aria-hidden="true"
        >
          {points.ready && (
            <g key={`${points.xJ}-${points.xB}`}>
              {/* Underlying marching dashed lines: segmented and revealed on demand (ZERO lines initially!) */}
              {/* Segment 1: From Apply button to Right Edge Junction (reveals when button is clicked) */}
              <g stroke="#A8A29E" strokeWidth="1" className="flow-dash-line line-anim-apply">
                <path
                  d={`M ${points.xApply} ${points.yApply} L ${points.xJ} ${points.yApply} L ${points.xJ} ${points.yJ} L ${points.xMid} ${points.yJ}`}
                  fill="none"
                />
              </g>

              {/* Segment 2: Left Branch Network (from junction dividing into 3 warning cards) */}
              <g stroke="#A8A29E" strokeWidth="1" className="flow-dash-line line-anim-left-branch">
                <line
                  x1={points.xMid}
                  y1={points.yJ}
                  x2={points.xC2L}
                  y2={points.yC2L}
                />
                <path
                  d={`M ${points.xMid} ${points.yJ} L ${points.xMid} ${points.yC1L} L ${points.xC1L} ${points.yC1L}`}
                  fill="none"
                />
                <path
                  d={`M ${points.xMid} ${points.yJ} L ${points.xMid} ${points.yC3L} L ${points.xC3L} ${points.yC3L}`}
                  fill="none"
                />
              </g>

              {/* Segment 3: Right Bus Network (from 3 cards into vertical bus line and down into bottom card) */}
              <g stroke="#A8A29E" strokeWidth="1" className="flow-dash-line line-anim-right-bus">
                <line
                  x1={points.xC1R}
                  y1={points.yC1R}
                  x2={points.xTrunk}
                  y2={points.yC1R}
                />
                <line
                  x1={points.xC2R}
                  y1={points.yC2R}
                  x2={points.xTrunk}
                  y2={points.yC2R}
                />
                <line
                  x1={points.xC3R}
                  y1={points.yC3R}
                  x2={points.xTrunk}
                  y2={points.yC3R}
                />
                <path
                  d={`M ${points.xTrunk} ${points.yC1R} L ${points.xTrunk} ${points.yTurn} L ${points.xB} ${points.yTurn} L ${points.xB} ${points.yB}`}
                  fill="none"
                />
              </g>

              {/* Traveling crimson data pulses: One-time pulse 0 from Apply Now + Continuous Telemetry Loop */}
              <g className="pointer-events-none">
                {/* One-time Pulse 0: Point arises from 'Apply Now' and travels to junction */}
                <circle r="2.8" fill="#DC2626">
                  <animateMotion
                    path={`M ${points.xApply} ${points.yApply} L ${points.xJ} ${points.yApply} L ${points.xJ} ${points.yJ} L ${points.xMid} ${points.yJ}`}
                    begin="1.6s"
                    dur="0.8s"
                    repeatCount="1"
                    fill="freeze"
                    calcMode="linear"
                  />
                  <animate
                    attributeName="opacity"
                    values="0;1;1;0"
                    keyTimes="0;0.1;0.85;1"
                    begin="1.6s"
                    dur="0.8s"
                    repeatCount="1"
                    fill="freeze"
                  />
                </circle>

                {/* Continuous Pulse 1: Branch 1 -> Card 1 (Domain mismatch) */}
                <circle r="2.8" fill="#DC2626">
                  <animateMotion
                    path={`M ${points.xMid} ${points.yJ} L ${points.xMid} ${points.yC1L} L ${points.xC1L} ${points.yC1L}`}
                    begin="2.4s"
                    dur="4.8s"
                    repeatCount="indefinite"
                    keyTimes="0;0.188;0.22;1"
                    keyPoints="0;1;1;1"
                    calcMode="linear"
                  />
                  <animate
                    attributeName="opacity"
                    values="0;1;1;0;0"
                    keyTimes="0;0.04;0.17;0.21;1"
                    begin="2.4s"
                    dur="4.8s"
                    repeatCount="indefinite"
                  />
                </circle>

                {/* Continuous Pulse 2: Branch 2 -> Card 2 (Payment request) - 100% straight horizontal */}
                <circle r="2.8" fill="#DC2626">
                  <animateMotion
                    path={`M ${points.xMid} ${points.yJ} L ${points.xC2L} ${points.yC2L}`}
                    begin="2.4s"
                    dur="4.8s"
                    repeatCount="indefinite"
                    keyTimes="0;0.146;0.333;0.36;1"
                    keyPoints="0;0;1;1;1"
                    calcMode="linear"
                  />
                  <animate
                    attributeName="opacity"
                    values="0;0;1;1;0;0"
                    keyTimes="0;0.14;0.18;0.31;0.35;1"
                    begin="2.4s"
                    dur="4.8s"
                    repeatCount="indefinite"
                  />
                </circle>

                {/* Continuous Pulse 3: Branch 3 -> Card 3 (Unverified employer) */}
                <circle r="2.8" fill="#DC2626">
                  <animateMotion
                    path={`M ${points.xMid} ${points.yJ} L ${points.xMid} ${points.yC3L} L ${points.xC3L} ${points.yC3L}`}
                    begin="2.4s"
                    dur="4.8s"
                    repeatCount="indefinite"
                    keyTimes="0;0.292;0.479;0.51;1"
                    keyPoints="0;0;1;1;1"
                    calcMode="linear"
                  />
                  <animate
                    attributeName="opacity"
                    values="0;0;1;1;0;0"
                    keyTimes="0;0.28;0.32;0.45;0.49;1"
                    begin="2.4s"
                    dur="4.8s"
                    repeatCount="indefinite"
                  />
                </circle>

                {/* Continuous Right Bus: Card 1 -> Bottom Card */}
                <circle r="2.8" fill="#DC2626">
                  <animateMotion
                    path={`M ${points.xC1R} ${points.yC1R} L ${points.xTrunk} ${points.yC1R} L ${points.xTrunk} ${points.yTurn} L ${points.xB} ${points.yTurn} L ${points.xB} ${points.yB}`}
                    begin="2.4s"
                    dur="4.8s"
                    repeatCount="indefinite"
                    keyTimes="0;0.50;0.75;0.78;1"
                    keyPoints="0;0;1;1;1"
                    calcMode="linear"
                  />
                  <animate
                    attributeName="opacity"
                    values="0;0;1;1;0;0"
                    keyTimes="0;0.49;0.53;0.73;0.77;1"
                    begin="2.4s"
                    dur="4.8s"
                    repeatCount="indefinite"
                  />
                </circle>

                {/* Continuous Right Bus: Card 2 -> Bottom Card */}
                <circle r="2.8" fill="#DC2626">
                  <animateMotion
                    path={`M ${points.xC2R} ${points.yC2R} L ${points.xTrunk} ${points.yC2R} L ${points.xTrunk} ${points.yTurn} L ${points.xB} ${points.yTurn} L ${points.xB} ${points.yB}`}
                    begin="2.4s"
                    dur="4.8s"
                    repeatCount="indefinite"
                    keyTimes="0;0.531;0.771;0.80;1"
                    keyPoints="0;0;1;1;1"
                    calcMode="linear"
                  />
                  <animate
                    attributeName="opacity"
                    values="0;0;1;1;0;0"
                    keyTimes="0;0.52;0.56;0.75;0.79;1"
                    begin="2.4s"
                    dur="4.8s"
                    repeatCount="indefinite"
                  />
                </circle>

                {/* Continuous Right Bus: Card 3 -> Bottom Card */}
                <circle r="2.8" fill="#DC2626">
                  <animateMotion
                    path={`M ${points.xC3R} ${points.yC3R} L ${points.xTrunk} ${points.yC3R} L ${points.xTrunk} ${points.yTurn} L ${points.xB} ${points.yTurn} L ${points.xB} ${points.yB}`}
                    begin="2.4s"
                    dur="4.8s"
                    repeatCount="indefinite"
                    keyTimes="0;0.562;0.802;0.83;1"
                    keyPoints="0;0;1;1;1"
                    calcMode="linear"
                  />
                  <animate
                    attributeName="opacity"
                    values="0;0;1;1;0;0"
                    keyTimes="0;0.55;0.59;0.78;0.82;1"
                    begin="2.4s"
                    dur="4.8s"
                    repeatCount="indefinite"
                  />
                </circle>
              </g>
            </g>
          )}
        </svg>

        {/* ── LAYER 2: CARDS (z-10 with solid background to guarantee lines never overlap inside!) ── */}
        <div className="relative z-10 grid grid-cols-[minmax(0,1.15fr)_minmax(0,0.95fr)] sm:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] gap-8 sm:gap-10 items-center">
          {/* 1. Job Card with elevated top white line and crisp razor-sharp edges */}
          <div className="relative">
            <div
              ref={jobCardRef}
              className="relative overflow-hidden bg-[#FAF9F6] border border-[#E2DFD7] rounded-none p-4 sm:p-5 card-interactive flow-anim-job"
              style={{
                boxShadow: '0 8px 26px -4px rgba(20, 20, 19, 0.07), 0 2px 6px -1px rgba(20, 20, 19, 0.03), inset 0 1px 0 0 #FFFFFF',
              }}
            >
              {/* Elevated top specular white highlight line */}
              <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-white pointer-events-none z-20 shadow-[0_1px_2px_rgba(255,255,255,0.9)]" />

              {/* Browser URL Pill */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-none bg-[#F5F4EE] border border-[#E4E2D8] mb-3.5 w-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
                <Lock size={10} className="text-[#141413]/70 flex-shrink-0" />
                <span className="text-[9.5px] sm:text-[10px] font-mono text-[#141413]/80 tracking-tight truncate">
                  careers-rapidtech.com/jobs/product...
                </span>
              </div>

              {/* Company Info Row */}
              <div className="flex items-center gap-2.5 mb-2.5">
                <div className="w-7 h-7 rounded-none bg-[#F5F4EE] border border-[#E4E2D8] flex items-center justify-center font-bold text-[12px] text-[#141413] flex-shrink-0">
                  R
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-[#141413] leading-tight truncate">
                    RapidTech Solutions
                  </p>
                  <p className="text-[10.5px] text-[#77746C] leading-tight mt-0.5">
                    Posted 2 days ago
                  </p>
                </div>
              </div>

              {/* Job Title */}
              <h3 className="text-[17px] sm:text-[18px] font-bold text-[#141413] leading-snug tracking-tight mb-1.5">
                Product Designer
              </h3>

              {/* Meta Tags Row */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-2">
                <div className="flex items-center gap-1">
                  <span className="text-[9.5px] uppercase tracking-wider text-[#77746C]">Location</span>
                  <span className="text-[11px] font-semibold text-[#141413]">Remote</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[9.5px] uppercase tracking-wider text-[#77746C]">Type</span>
                  <span className="text-[11px] font-semibold text-[#141413]">Full-time</span>
                </div>
              </div>

              {/* Salary */}
              <p className="text-[12.5px] sm:text-[13px] font-bold text-[#141413] mb-2">
                ₹80,000 – ₹1,20,000 / month
              </p>

              {/* Description */}
              <p className="text-[11px] sm:text-[11.5px] text-[#625F58] leading-relaxed mb-3.5">
                Join our fast-growing team as a Product Designer. You'll work on exciting products
                and get hands-on experience.
              </p>

              {/* Apply Button with Animated Synthetic Cursor & Click Simulation */}
              <div className="relative inline-block">
                <button
                  ref={applyBtnRef}
                  type="button"
                  className="text-[11px] font-semibold bg-[#141413] text-[#FAF9F5] rounded-none px-3.5 py-1.5 transition-colors cursor-pointer flow-anim-apply-btn"
                >
                  Apply Now
                </button>

                {/* Synthetic Dragging Mouse Cursor */}
                <div className="flow-anim-mouse-cursor absolute top-0 left-0 pointer-events-none z-30">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]"
                  >
                    <path
                      d="M4 2L15.5 13.5L10 14.5L13 20.5L10.5 21.8L7.5 15.8L3.5 19.8V2Z"
                      fill="#141413"
                      stroke="#FAF9F5"
                      strokeWidth="1.5"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {/* Click ripple ring */}
                  <span className="flow-anim-click-ripple absolute top-0.5 left-0.5 w-4 h-4 rounded-full border-2 border-[#DC2626] pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* 2. Three Annotation Cards Column with razor-sharp clean edges and elegant warm rose-porcelain theme */}
          <div className="flex flex-col gap-2.5 justify-between">
            {/* Card 1: Domain mismatch */}
            <div
              ref={c1Ref}
              className="relative overflow-hidden bg-gradient-to-b from-[#FFF2F0] via-[#FEECE8] to-[#FDE4E0] border border-[#F6C6BF] rounded-none p-3 pr-4 sm:pr-5 flex items-start gap-2.5 card-interactive flow-anim-warn-1"
              style={{
                boxShadow: '0 4px 16px -2px rgba(180, 50, 50, 0.05), 0 1px 3px -1px rgba(0, 0, 0, 0.03)',
              }}
            >
              <div className="mt-0.5 flex-shrink-0">{annotations[0].icon}</div>
              <div className="min-w-0">
                <h4 className="text-[12px] sm:text-[12.5px] font-bold text-[#991B1B] leading-tight">
                  {annotations[0].label}
                </h4>
                <p className="text-[10.5px] text-[#7F1D1D]/85 leading-snug mt-0.5">
                  {annotations[0].detail}
                </p>
              </div>
            </div>

            {/* Card 2: Upfront payment request */}
            <div
              ref={c2Ref}
              className="relative overflow-hidden bg-gradient-to-b from-[#FFF2F0] via-[#FEECE8] to-[#FDE4E0] border border-[#F6C6BF] rounded-none p-3 pr-4 sm:pr-5 flex items-start gap-2.5 card-interactive flow-anim-warn-2"
              style={{
                boxShadow: '0 4px 16px -2px rgba(180, 50, 50, 0.05), 0 1px 3px -1px rgba(0, 0, 0, 0.03)',
              }}
            >
              <div className="mt-0.5 flex-shrink-0">{annotations[1].icon}</div>
              <div className="min-w-0">
                <h4 className="text-[12px] sm:text-[12.5px] font-bold text-[#991B1B] leading-tight">
                  {annotations[1].label}
                </h4>
                <p className="text-[10.5px] text-[#7F1D1D]/85 leading-snug mt-0.5">
                  {annotations[1].detail}
                </p>
              </div>
            </div>

            {/* Card 3: Unverified employer */}
            <div
              ref={c3Ref}
              className="relative overflow-hidden bg-gradient-to-b from-[#FFF2F0] via-[#FEECE8] to-[#FDE4E0] border border-[#F6C6BF] rounded-none p-3 pr-4 sm:pr-5 flex items-start gap-2.5 card-interactive flow-anim-warn-3"
              style={{
                boxShadow: '0 4px 16px -2px rgba(180, 50, 50, 0.05), 0 1px 3px -1px rgba(0, 0, 0, 0.03)',
              }}
            >
              <div className="mt-0.5 flex-shrink-0">{annotations[2].icon}</div>
              <div className="min-w-0">
                <h4 className="text-[12px] sm:text-[12.5px] font-bold text-[#991B1B] leading-tight">
                  {annotations[2].label}
                </h4>
                <p className="text-[10.5px] text-[#7F1D1D]/85 leading-snug mt-0.5">
                  {annotations[2].detail}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── BOTTOM SECTION: Overall Assessment Result Card with elegant warm rose theme & circular wheel ── */}
        <div className="relative z-10 mt-8 sm:mt-9">
          <div
            ref={bottomCardRef}
            className="relative overflow-hidden bg-gradient-to-b from-[#FFF0EC] via-[#FEE8E2] to-[#FDE0D8] border border-[#F4BEB4] rounded-none p-4 sm:p-5 card-interactive flow-anim-bottom"
            style={{
              boxShadow: '0 8px 24px -4px rgba(180, 50, 50, 0.07), 0 2px 6px -1px rgba(0, 0, 0, 0.03)',
            }}
          >

            <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr] gap-4 sm:gap-6 items-center">
              {/* Left Column: Verdict & Narrative */}
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-3 h-3 rounded-none bg-[#DC2626] flex-shrink-0" />
                  <span className="text-[13.5px] sm:text-[14px] font-bold text-[#7F1D1D]">
                    Likely Suspicious
                  </span>
                  <span className="text-[9px] font-bold tracking-wider text-white bg-[#DC2626] border border-[#B91C1C] px-2 py-0.5 rounded-none uppercase flow-anim-badge">
                    HIGH RISK
                  </span>
                </div>

                <p className="text-[11.5px] sm:text-[12px] text-[#7F1D1D]/90 leading-relaxed mb-2.5 max-w-[320px]">
                  Multiple warning signs detected. Review the evidence and verify the details
                  independently.
                </p>

                <p className="text-[10px] text-[#991B1B] font-mono flex items-center gap-1">
                  + Illustrative demo data. Not a real investigation.
                </p>
              </div>

              {/* Right Column: Circular Risk Wheel Illustration & Factor Legend */}
              <div className="md:border-l md:border-[#F4B2A8]/70 md:pl-5">
                <p className="text-[9.5px] font-bold tracking-widest text-[#7F1D1D] uppercase mb-2">
                  KEY RISK FACTORS
                </p>

                <div className="flex items-center gap-3.5">
                  {/* Circular Radial Donut Wheel */}
                  <div className="relative w-[76px] h-[76px] flex-shrink-0">
                    <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90 flow-anim-wheel">
                      {/* Background track circle */}
                      <circle
                        cx="50"
                        cy="50"
                        r="38"
                        fill="none"
                        stroke="#FDECE9"
                        strokeWidth="9"
                      />

                      {/* Arc 1: Payment Fee (+0.42) -> 42% = 97.78 */}
                      <circle
                        cx="50"
                        cy="50"
                        r="38"
                        fill="none"
                        stroke="#DC2626"
                        strokeWidth="9"
                        strokeDasharray="97.78 140.98"
                        strokeDashoffset="0"
                      />

                      {/* Arc 2: Personal Email (+0.28) -> 28% = 64.35 */}
                      <circle
                        cx="50"
                        cy="50"
                        r="38"
                        fill="none"
                        stroke="#EA580C"
                        strokeWidth="9"
                        strokeDasharray="64.35 174.41"
                        strokeDashoffset="-100.28"
                      />

                      {/* Arc 3: Urgent Hiring (+0.18) -> 18% = 40.48 */}
                      <circle
                        cx="50"
                        cy="50"
                        r="38"
                        fill="none"
                        stroke="#D97706"
                        strokeWidth="9"
                        strokeDasharray="40.48 198.28"
                        strokeDashoffset="-167.13"
                      />

                      {/* Arc 4: Positive Signals (-0.12) -> 12% = 26.15 */}
                      <circle
                        cx="50"
                        cy="50"
                        r="38"
                        fill="none"
                        stroke="#16A34A"
                        strokeWidth="9"
                        strokeDasharray="26.15 212.61"
                        strokeDashoffset="-210.11"
                      />
                    </svg>

                    {/* Wheel Center Readout */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none flow-anim-score">
                      <span className="text-[12px] font-mono font-bold text-[#7F1D1D] leading-none">
                        +0.88
                      </span>
                      <span className="text-[7.5px] font-mono uppercase tracking-wider text-[#991B1B] mt-0.5">
                        RISK
                      </span>
                    </div>
                  </div>

                  {/* Legend List */}
                  <div className="flex-1 min-w-0 space-y-1 flow-anim-legend">
                    {riskFactors.map((factor) => (
                      <div key={factor.label} className="flex items-center justify-between gap-1.5 text-[11px]">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span
                            className="w-2 h-2 rounded-none flex-shrink-0"
                            style={{ backgroundColor: factor.color }}
                          />
                          <span className="text-[#141413] text-[10.5px] font-medium truncate">
                            {factor.label}
                          </span>
                        </div>
                        <span className="text-[10.5px] font-mono font-bold text-[#7F1D1D] text-right flex-shrink-0">
                          {factor.val}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── BOTTOM LIVE SYSTEM TELEMETRY TICKER ── */}
        <div
          className={`flex items-center justify-around mt-4 pt-3 border-t border-[#E8E6DE]/70 text-[10.5px] sm:text-[11.5px] font-mono select-none transition-all duration-700 ease-out ${
            telemetryActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
          }`}
        >
          <span className="text-[#77746C] font-medium tracking-wide">
            <RollingText text="18,492" active={telemetryActive} baseDelay={0} /> TXNS
          </span>
          <span className="text-[#DC2626] font-bold tracking-wide">
            <RollingText text="27" active={telemetryActive} baseDelay={160} /> THREATS
          </span>
          <span className="text-[#77746C] font-medium tracking-wide">
            <RollingText text="99.98%" active={telemetryActive} baseDelay={300} /> UPTIME
          </span>
        </div>

        {/* ── LAYER 3: FOREGROUND CIRCLE NODES (z-20) — Smaller, lighter, and delicate ── */}
        <svg
          className={`absolute inset-0 w-full h-full pointer-events-none z-20 transition-opacity duration-300 ${
            points.ready ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ overflow: 'visible' }}
          aria-hidden="true"
        >
          {points.ready && (
            <g fill="#FAF9F5" stroke="#77746C" strokeWidth="1.2">
              {/* Origin node at Apply Now button */}
              <circle cx={points.xApply} cy={points.yApply} r="2.8" className="node-ping-apply" />

              {/* Left connection nodes: single junction node where branches split */}
              <circle cx={points.xMid} cy={points.yJ} r="2.8" className="node-ping-j" />
              <circle cx={points.xC1L} cy={points.yC1L} r="2.8" className="node-ping-c1l" />
              <circle cx={points.xC2L} cy={points.yC2L} r="2.8" className="node-ping-c2l" />
              <circle cx={points.xC3L} cy={points.yC3L} r="2.8" className="node-ping-c3l" />

              {/* Right connection nodes */}
              <circle cx={points.xC1R} cy={points.yC1R} r="2.8" className="node-ping-c1r" />
              <circle cx={points.xC2R} cy={points.yC2R} r="2.8" className="node-ping-c2r" />
              <circle cx={points.xC3R} cy={points.yC3R} r="2.8" className="node-ping-c3r" />

              {/* Bottom card top connection node */}
              <circle cx={points.xB} cy={points.yB} r="2.8" className="node-ping-b" />
            </g>
          )}
        </svg>
      </div>
    </div>
  );
}
