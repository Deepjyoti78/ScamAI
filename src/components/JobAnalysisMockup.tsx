import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { AlertTriangle, Mail, Building2, Link2 } from 'lucide-react';

interface PointCoords {
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
    icon: <Mail size={15} strokeWidth={1.75} className="text-[#dc2626]" />,
    label: 'Domain mismatch',
    detail: "Recruiter email doesn't match the company domain.",
  },
  {
    icon: <AlertTriangle size={15} strokeWidth={1.75} className="text-[#dc2626]" />,
    label: 'Payment request',
    detail: 'Mentions an upfront registration fee.',
  },
  {
    icon: <Building2 size={15} strokeWidth={1.75} className="text-[#dc2626]" />,
    label: 'Unverified employer',
    detail: 'Company details could not be verified.',
  },
];

const riskFactors = [
  { label: 'Payment Fee', fill: 'w-[68%]', val: '+0.42', positive: true },
  { label: 'Personal Email', fill: 'w-[46%]', val: '+0.28', positive: true },
  { label: 'Urgent Hiring', fill: 'w-[28%]', val: '+0.18', positive: true },
  { label: 'Positive Signals', fill: 'w-[18%]', val: '-0.12', positive: false },
];

export default function JobAnalysisMockup() {
  const containerRef = useRef<HTMLDivElement>(null);
  const jobCardRef = useRef<HTMLDivElement>(null);
  const c1Ref = useRef<HTMLDivElement>(null);
  const c2Ref = useRef<HTMLDivElement>(null);
  const c3Ref = useRef<HTMLDivElement>(null);
  const bottomCardRef = useRef<HTMLDivElement>(null);

  const [points, setPoints] = useState<PointCoords>({
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
      !c1Ref.current ||
      !c2Ref.current ||
      !c3Ref.current ||
      !bottomCardRef.current
    ) {
      return;
    }

    const container = containerRef.current.getBoundingClientRect();
    const job = jobCardRef.current.getBoundingClientRect();
    const c1 = c1Ref.current.getBoundingClientRect();
    const c2 = c2Ref.current.getBoundingClientRect();
    const c3 = c3Ref.current.getBoundingClientRect();
    const bottom = bottomCardRef.current.getBoundingClientRect();

    // Left connection: Job Card right edge to branch, then to 3 cards
    const xJ = job.right - container.left;
    const yJ = job.top + job.height / 2 - container.top;

    const xC1L = c1.left - container.left;
    const yC1L = c1.top + c1.height / 2 - container.top;

    const xC2L = c2.left - container.left;
    const yC2L = c2.top + c2.height / 2 - container.top;

    const xC3L = c3.left - container.left;
    const yC3L = c3.top + c3.height / 2 - container.top;

    const xMid = xJ + (xC2L - xJ) * 0.46;

    // Right connection: 3 cards right edges to vertical bus line, then down to bottom card
    const xC1R = c1.right - container.left;
    const yC1R = yC1L;

    const xC2R = c2.right - container.left;
    const yC2R = yC2L;

    const xC3R = c3.right - container.left;
    const yC3R = yC3L;

    const xTrunk = Math.max(xC1R, xC2R, xC3R) + 22;

    // Connect into the top edge of bottom card at ~38% width (aligns with the design in image)
    const xB = bottom.left - container.left + bottom.width * 0.39;
    const yB = bottom.top - container.top;

    const yTurn = yC3R + (yB - yC3R) * 0.44;

    setPoints({
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

    const timer = setTimeout(updateCoordinates, 300);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeObserver) resizeObserver.disconnect();
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className="w-full overflow-x-auto sm:overflow-x-visible pb-2 select-none no-scrollbar">
      {/* Container with exact proportional layout and space on right for the bus line */}
      <div
        ref={containerRef}
        className="relative min-w-[510px] sm:min-w-0 pr-7 pt-1 pb-1 animate-card-entrance stagger-3"
      >
        {/* ── SVG LAYER: Exact Dotted Line Design as in the image ── */}
        <svg
          className={`absolute inset-0 w-full h-full pointer-events-none z-20 transition-opacity duration-300 ${
            points.ready ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ overflow: 'visible' }}
          aria-hidden="true"
        >
          {points.ready && (
            <g stroke="#141413" strokeWidth="1.5">
              {/* 1. Left Dotted Lines: Job Card to 3 Annotation Cards */}
              {/* Job Card right edge to branch point */}
              <line
                x1={points.xJ}
                y1={points.yJ}
                x2={points.xMid}
                y2={points.yJ}
                strokeDasharray="2.5 3.5"
              />

              {/* Branch point straight to Card 2 */}
              <line
                x1={points.xMid}
                y1={points.yJ}
                x2={points.xC2L}
                y2={points.yC2L}
                strokeDasharray="2.5 3.5"
              />

              {/* Branch point up 90 deg and into Card 1 */}
              <path
                d={`M ${points.xMid} ${points.yJ} L ${points.xMid} ${points.yC1L} L ${points.xC1L} ${points.yC1L}`}
                fill="none"
                strokeDasharray="2.5 3.5"
              />

              {/* Branch point down 90 deg and into Card 3 */}
              <path
                d={`M ${points.xMid} ${points.yJ} L ${points.xMid} ${points.yC3L} L ${points.xC3L} ${points.yC3L}`}
                fill="none"
                strokeDasharray="2.5 3.5"
              />

              {/* 2. Left Circle Nodes */}
              <circle cx={points.xJ} cy={points.yJ} r="3.5" fill="#FAF9F5" stroke="#141413" strokeWidth="1.5" />
              <circle cx={points.xMid} cy={points.yJ} r="3.5" fill="#FAF9F5" stroke="#141413" strokeWidth="1.5" />
              <circle cx={points.xC1L} cy={points.yC1L} r="3.5" fill="#FAF9F5" stroke="#141413" strokeWidth="1.5" />
              <circle cx={points.xC2L} cy={points.yC2L} r="3.5" fill="#FAF9F5" stroke="#141413" strokeWidth="1.5" />
              <circle cx={points.xC3L} cy={points.yC3L} r="3.5" fill="#FAF9F5" stroke="#141413" strokeWidth="1.5" />

              {/* 3. Right Dotted Lines: 3 Cards to Vertical Bus Line */}
              <line
                x1={points.xC1R}
                y1={points.yC1R}
                x2={points.xTrunk}
                y2={points.yC1R}
                strokeDasharray="2.5 3.5"
              />
              <line
                x1={points.xC2R}
                y1={points.yC2R}
                x2={points.xTrunk}
                y2={points.yC2R}
                strokeDasharray="2.5 3.5"
              />
              <line
                x1={points.xC3R}
                y1={points.yC3R}
                x2={points.xTrunk}
                y2={points.yC3R}
                strokeDasharray="2.5 3.5"
              />

              {/* Vertical bus line, turn 90 deg left across, then turn 90 deg down into bottom card */}
              <path
                d={`M ${points.xTrunk} ${points.yC1R} L ${points.xTrunk} ${points.yTurn} L ${points.xB} ${points.yTurn} L ${points.xB} ${points.yB}`}
                fill="none"
                strokeDasharray="2.5 3.5"
              />

              {/* 4. Right Circle Nodes */}
              <circle cx={points.xC1R} cy={points.yC1R} r="3.5" fill="#FAF9F5" stroke="#141413" strokeWidth="1.5" />
              <circle cx={points.xC2R} cy={points.yC2R} r="3.5" fill="#FAF9F5" stroke="#141413" strokeWidth="1.5" />
              <circle cx={points.xC3R} cy={points.yC3R} r="3.5" fill="#FAF9F5" stroke="#141413" strokeWidth="1.5" />

              {/* 5. Bottom Card Circle Node (on top border) */}
              <circle cx={points.xB} cy={points.yB} r="3.5" fill="#FAF9F5" stroke="#141413" strokeWidth="1.5" />
            </g>
          )}
        </svg>

        {/* ── TOP SECTION: Job Card Left + 3 Annotation Cards Right ── */}
        <div className="grid grid-cols-[minmax(0,1.2fr)_minmax(0,0.88fr)] gap-8 sm:gap-11 items-center">
          {/* 1. Job Card */}
          <div
            ref={jobCardRef}
            className="bg-[#FAF9F5] border border-[#E0DED4] rounded-2xl p-4 sm:p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] card-interactive"
          >
            {/* Browser URL Pill */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F0EEE6] border border-[#E0DED4] mb-4 w-full">
              <Link2 size={12} className="text-[#141413]/70 flex-shrink-0" />
              <span className="text-[11px] font-mono text-[#141413]/80 truncate">
                careers-rapidtech.com/jobs/product-designer
              </span>
            </div>

            {/* Company Info Row */}
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-xl bg-[#F0EEE6] border border-[#E0DED4] flex items-center justify-center font-bold text-[13px] text-[#141413] flex-shrink-0">
                R
              </div>
              <div className="min-w-0">
                <p className="text-[13.5px] font-semibold text-[#141413] leading-tight truncate">
                  RapidTech Solutions
                </p>
                <p className="text-[11px] text-[#77746C] leading-tight mt-0.5">
                  Posted 2 days ago
                </p>
              </div>
            </div>

            {/* Job Title */}
            <h3 className="text-[18px] sm:text-[19px] font-bold text-[#141413] leading-snug tracking-tight mb-2">
              Product Designer
            </h3>

            {/* Meta Tags Row */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-2">
              <div className="flex items-center gap-1">
                <span className="text-[10px] uppercase tracking-wider text-[#77746C]">Location</span>
                <span className="text-[11.5px] font-semibold text-[#141413]">Remote</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[10px] uppercase tracking-wider text-[#77746C]">Type</span>
                <span className="text-[11.5px] font-semibold text-[#141413]">Full-time</span>
              </div>
            </div>

            {/* Salary */}
            <p className="text-[13px] sm:text-[13.5px] font-bold text-[#141413] mb-2.5">
              ₹80,000 – ₹1,20,000 / month
            </p>

            {/* Description */}
            <p className="text-[11.5px] sm:text-[12px] text-[#625F58] leading-relaxed mb-4">
              Join our fast-growing team as a Product Designer. You'll work on exciting products
              and get hands-on experience.
            </p>

            {/* Apply Button */}
            <button
              type="button"
              className="text-[11.5px] font-semibold bg-[#141413] text-[#FAF9F5] rounded-xl px-4 py-2 hover:bg-[#30302D] transition-colors cursor-pointer"
            >
              Apply Now
            </button>
          </div>

          {/* 2. Three Annotation Cards Column */}
          <div className="flex flex-col gap-3 justify-between">
            {/* Card 1: Domain mismatch */}
            <div
              ref={c1Ref}
              className="bg-[#FAF9F5] border border-[#E0DED4] rounded-2xl p-3 sm:p-3.5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-start gap-2.5 card-interactive"
            >
              <div className="mt-0.5 flex-shrink-0">{annotations[0].icon}</div>
              <div className="min-w-0">
                <h4 className="text-[12.5px] sm:text-[13px] font-bold text-[#141413] leading-tight">
                  {annotations[0].label}
                </h4>
                <p className="text-[10.5px] sm:text-[11px] text-[#625F58] leading-snug mt-0.5">
                  {annotations[0].detail}
                </p>
              </div>
            </div>

            {/* Card 2: Payment request */}
            <div
              ref={c2Ref}
              className="bg-[#FAF9F5] border border-[#E0DED4] rounded-2xl p-3 sm:p-3.5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-start gap-2.5 card-interactive"
            >
              <div className="mt-0.5 flex-shrink-0">{annotations[1].icon}</div>
              <div className="min-w-0">
                <h4 className="text-[12.5px] sm:text-[13px] font-bold text-[#141413] leading-tight">
                  {annotations[1].label}
                </h4>
                <p className="text-[10.5px] sm:text-[11px] text-[#625F58] leading-snug mt-0.5">
                  {annotations[1].detail}
                </p>
              </div>
            </div>

            {/* Card 3: Unverified employer */}
            <div
              ref={c3Ref}
              className="bg-[#FAF9F5] border border-[#E0DED4] rounded-2xl p-3 sm:p-3.5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-start gap-2.5 card-interactive"
            >
              <div className="mt-0.5 flex-shrink-0">{annotations[2].icon}</div>
              <div className="min-w-0">
                <h4 className="text-[12.5px] sm:text-[13px] font-bold text-[#141413] leading-tight">
                  {annotations[2].label}
                </h4>
                <p className="text-[10.5px] sm:text-[11px] text-[#625F58] leading-snug mt-0.5">
                  {annotations[2].detail}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── BOTTOM SECTION: Overall Assessment Result Card ── */}
        <div className="mt-9 sm:mt-10">
          <div
            ref={bottomCardRef}
            className="bg-[#FAF9F5] border border-[#E0DED4] rounded-2xl p-4 sm:p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] card-interactive"
          >
            <div className="grid grid-cols-1 md:grid-cols-[1.1fr_0.9fr] gap-4 sm:gap-6 items-center">
              {/* Left Column: Verdict & Narrative */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-3.5 h-3.5 rounded-[3px] bg-[#dc2626] flex-shrink-0" />
                  <span className="text-[14px] sm:text-[15px] font-bold text-[#141413]">
                    Likely Suspicious
                  </span>
                  <span className="text-[10px] font-bold tracking-wider text-[#dc2626] bg-[#fef2f2] border border-[#fca5a5] px-2 py-0.5 rounded-md uppercase">
                    HIGH RISK
                  </span>
                </div>

                <p className="text-[12px] sm:text-[12.5px] text-[#625F58] leading-relaxed mb-3 max-w-[340px]">
                  Multiple warning signs detected. Review the evidence and verify the details
                  independently.
                </p>

                <p className="text-[11px] text-[#77746C] font-mono flex items-center gap-1">
                  + Illustrative demo data. Not a real investigation.
                </p>
              </div>

              {/* Right Column: Key Risk Factors with Capsule Bars */}
              <div className="md:border-l md:border-[#E0DED4] md:pl-6">
                <p className="text-[10px] font-bold tracking-widest text-[#77746C] uppercase mb-2.5">
                  KEY RISK FACTORS
                </p>

                <div className="space-y-2">
                  {riskFactors.map((factor) => (
                    <div key={factor.label} className="flex items-center justify-between gap-3 text-[12px]">
                      <span className="text-[#141413] text-[11.5px] font-medium min-w-[95px]">
                        {factor.label}
                      </span>

                      {/* Horizontal Capsule Bar */}
                      <div className="w-10 h-2 rounded-full bg-[#E5E2D9] overflow-hidden flex-shrink-0">
                        <div
                          className={`h-full rounded-full ${
                            factor.positive ? 'bg-[#77746C]' : 'bg-[#C8C5BB]'
                          } ${factor.fill}`}
                        />
                      </div>

                      {/* Metric Value */}
                      <span className="text-[11.5px] font-mono font-semibold text-[#141413] text-right min-w-[38px]">
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
    </div>
  );
}
