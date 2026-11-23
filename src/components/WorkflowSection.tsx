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
} from 'lucide-react';

/* ── REUSABLE CRISP JOB POSTING CARD (MATCHING USER MOCKUPS) ── */
function JobPostingCard({ className = '' }: { className?: string }) {
  const navigate = useNavigate();

  return (
    <div
      className={`bg-[#FFFFFF] border border-[#E0DED4] rounded-none p-4 sm:p-5 shadow-[0_2px_12px_rgba(20,20,19,0.04),inset_0_1px_0_0_#FFFFFF] relative ${className}`}
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

      {/* Action button */}
      <button
        type="button"
        onClick={() => navigate('/investigate')}
        className="w-full inline-flex items-center justify-center gap-2 h-[34px] px-3 rounded-none bg-[#141413] text-[#FAF9F5] text-[12px] font-semibold tracking-wide hover:bg-[#262523] active:scale-[0.99] transition-all cursor-pointer"
      >
        <span>Apply Now</span>
        <ArrowRight size={13} />
      </button>
    </div>
  );
}

/* ── STEP 01: LAPTOP SCREEN WITH FLOATING URL BAR & BURST (IMAGE 2) ── */
function LaptopInputMockup() {
  const navigate = useNavigate();

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

        {/* Floating URL Pill Overlay (matching Image 2) */}
        <div className="absolute top-[46%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[94%] max-w-[330px] bg-[#FFFFFF] border-2 border-[#141413] rounded-none p-1.5 shadow-[0_8px_24px_rgba(20,20,19,0.18)] z-10 flex items-center gap-2">
          <LinkIcon size={13} className="text-[#4A6B3E] flex-shrink-0 ml-1" />
          <span className="text-[10px] sm:text-[10.5px] font-mono text-[#141413] truncate font-semibold flex-1">
            careers-rapidtech.com/jobs/product-designer
          </span>
          <button
            type="button"
            onClick={() => navigate('/investigate')}
            className="w-6 h-6 bg-[#141413] text-white flex items-center justify-center rounded-none flex-shrink-0 hover:bg-[#262523] cursor-pointer"
            title="Analyze this URL"
          >
            <Search size={11} />
          </button>
        </div>

        {/* Directed Olive Curved Flow Arrow leading towards the Job Posting card (matching Image 2) */}
        <svg
          className="hidden lg:block absolute -right-8 top-[50%] w-10 h-10 pointer-events-none z-20 overflow-visible text-[#4A6B3E]"
          viewBox="0 0 40 40"
          fill="none"
        >
          <path
            d="M 2 8 C 8 22 22 26 34 26"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M 28 20 L 34 26 L 28 32"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}

export default function WorkflowSection() {
  const navigate = useNavigate();

  return (
    <section id="workflow" className="w-full border-t border-[#E0DED4] px-4 sm:px-6 lg:px-10 py-12 sm:py-16 md:py-20 bg-[#FAF9F5]">
      <div className="max-w-[1140px] mx-auto">

        {/* ── SECTION HEADER (MATCHING IMAGE 1) ── */}
        <div className="mb-12 sm:mb-16">
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
            From job posting to informed decision.
          </p>
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
              <span className="w-2 h-2 rounded-full bg-[#141413]" />
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
                <span className="w-4 h-[3px] bg-[#141413] rounded-none" />
                <span className="w-4 h-[3px] bg-[#E0DED4] rounded-none" />
                <span className="w-4 h-[3px] bg-[#E0DED4] rounded-none" />
                <span className="w-4 h-[3px] bg-[#E0DED4] rounded-none" />
              </div>
            </div>

            {/* Step Right Visual Card */}
            <div className="flex-1 bg-[#FAF9F6] border border-[#E0DED4] rounded-none p-5 sm:p-6 shadow-[0_2px_12px_rgba(20,20,19,0.02)] relative overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-6 items-center">
                {/* Left: 3D Laptop Mockup with Floating URL Bar & Olive Burst lines */}
                <LaptopInputMockup />

                {/* Right: Extracted Job Card */}
                <div className="flex justify-center lg:justify-end">
                  <JobPostingCard className="w-full max-w-[290px]" />
                </div>
              </div>
            </div>
          </div>


          {/* ══════════════════════════════════════════════════════════════
              STEP 02: EXTRACT SIGNALS (IMAGE 3)
          ══════════════════════════════════════════════════════════════ */}
          <div className="relative flex flex-col md:flex-row items-stretch gap-6 md:gap-10">
            {/* Timeline node dot (md+) */}
            <div className="hidden md:flex absolute left-0 top-[24px] w-5 h-5 -translate-x-[0px] rounded-full border border-[#D0CDC2] bg-[#FAF9F5] items-center justify-center z-10 flex-shrink-0">
              <span className="w-2 h-2 rounded-full bg-[#141413]" />
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
            <div className="flex-1 bg-[#FAF9F6] border border-[#E0DED4] rounded-none p-5 sm:p-6 shadow-[0_2px_12px_rgba(20,20,19,0.02)] relative overflow-hidden">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-6 relative">

                {/* Left: Parsed Job Card */}
                <div className="w-full lg:w-[260px] flex-shrink-0">
                  <JobPostingCard />
                </div>

                {/* Center: Branching SVG Tree Trunk with Exact Height Alignment */}
                <div className="hidden lg:block w-[70px] h-[264px] relative flex-shrink-0">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 70 264" fill="none">
                    {/* Origin point dot on left edge (touching right edge of Job card) */}
                    <circle cx="0" cy="132" r="3.5" fill="#141413" />

                    {/* 6 Curved Branching Bezier Lines to 6 Right Pills */}
                    {/* Line 1 -> Job content (y ≈ 18) */}
                    <path d="M 0 132 C 35 132 35 18 70 18" stroke="#141413" strokeWidth="1.2" fill="none" />
                    <circle cx="70" cy="18" r="2.5" fill="#141413" />

                    {/* Line 2 -> Domain & URL (y ≈ 62) */}
                    <path d="M 0 132 C 35 132 35 62 70 62" stroke="#141413" strokeWidth="1.2" fill="none" />
                    <circle cx="70" cy="62" r="2.5" fill="#141413" />

                    {/* Line 3 -> Recruiter email (y ≈ 108) */}
                    <path d="M 0 132 C 35 132 35 108 70 108" stroke="#141413" strokeWidth="1.2" fill="none" />
                    <circle cx="70" cy="108" r="2.5" fill="#141413" />

                    {/* Line 4 -> Application destination (y ≈ 154) */}
                    <path d="M 0 132 C 35 132 35 154 70 154" stroke="#141413" strokeWidth="1.2" fill="none" />
                    <circle cx="70" cy="154" r="2.5" fill="#141413" />

                    {/* Line 5 -> Payment request (y ≈ 200) */}
                    <path d="M 0 132 C 35 132 35 200 70 200" stroke="#141413" strokeWidth="1.2" fill="none" />
                    <circle cx="70" cy="200" r="2.5" fill="#141413" />

                    {/* Line 6 -> Employer & web evidence (y ≈ 246) */}
                    <path d="M 0 132 C 35 132 35 246 70 246" stroke="#141413" strokeWidth="1.2" fill="none" />
                    <circle cx="70" cy="246" r="2.5" fill="#141413" />
                  </svg>
                </div>

                {/* Right: 6 Signal Feature Pills with Connection Dots on Left Edge (matching Image 3) */}
                <div className="w-full lg:flex-1 space-y-2">
                  {[
                    { icon: <FileText size={13} className="text-[#141413]" />, title: 'Job content' },
                    { icon: <LinkIcon size={13} className="text-[#141413]" />, title: 'Domain & URL' },
                    { icon: <Mail size={13} className="text-[#141413]" />, title: 'Recruiter email' },
                    { icon: <MousePointer size={13} className="text-[#141413]" />, title: 'Application destination' },
                    { icon: <Coins size={13} className="text-[#141413]" />, title: 'Payment request' },
                    { icon: <Layers size={13} className="text-[#141413]" />, title: 'Employer & web evidence' },
                  ].map((sig, i) => (
                    <div
                      key={i}
                      className="bg-[#FFFFFF] border border-[#E0DED4] rounded-none px-3.5 py-2 flex items-center justify-between shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:border-[#141413]/40 transition-colors relative"
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
                      <span className="w-1.5 h-1.5 rounded-full bg-[#141413]/20" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>


          {/* ══════════════════════════════════════════════════════════════
              STEP 03: ANALYZE WITH SCAMSHIELD AI (IMAGES 4 & 5)
          ══════════════════════════════════════════════════════════════ */}
          <div className="relative flex flex-col md:flex-row items-stretch gap-6 md:gap-10">
            {/* Timeline node dot (md+) */}
            <div className="hidden md:flex absolute left-0 top-[24px] w-5 h-5 -translate-x-[0px] rounded-full border border-[#D0CDC2] bg-[#FAF9F5] items-center justify-center z-10 flex-shrink-0">
              <span className="w-2 h-2 rounded-full bg-[#141413]" />
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
            <div className="flex-1 bg-[#FAF9F6] border border-[#E0DED4] rounded-none p-5 sm:p-6 shadow-[0_2px_12px_rgba(20,20,19,0.02)] relative overflow-hidden">
              <div className="flex flex-col lg:flex-row items-center gap-4 lg:gap-6 relative">

                {/* Left: 6 Input Feature Pills with vertical dividers & right connection dots */}
                <div className="w-full lg:w-[210px] space-y-2 flex-shrink-0">
                  {[
                    { icon: <FileText size={12} />, title: 'Job content' },
                    { icon: <LinkIcon size={12} />, title: 'Domain & URL' },
                    { icon: <Mail size={12} />, title: 'Recruiter email' },
                    { icon: <MousePointer size={12} />, title: 'Application destination' },
                    { icon: <Coins size={12} />, title: 'Payment request' },
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
                      {/* Connection node dot on right edge matching Image 4 */}
                      <span className="w-2 h-2 rounded-full bg-[#141413] flex-shrink-0" />
                    </div>
                  ))}
                </div>

                {/* Center & Right: Unified Canvas connecting 6 Pills into Circular Orbit Engine (Matching Image 4 & 5) */}
                <div className="flex-1 relative w-full h-[280px] flex items-center">
                  {/* SVG Layer for Exact Mathematical Connections */}
                  <svg className="w-full h-full absolute inset-0 overflow-visible" viewBox="0 0 490 280" fill="none">
                    {/* 6 converging bezier curves from left pills (x=0) to junction node (x=60, y=140) */}
                    <path d="M 0 19 C 32 19 45 140 60 140" stroke="#141413" strokeWidth="1.2" fill="none" />
                    <circle cx="0" cy="19" r="2.5" fill="#141413" />

                    <path d="M 0 67 C 28 67 42 140 60 140" stroke="#141413" strokeWidth="1.2" fill="none" />
                    <circle cx="0" cy="67" r="2.5" fill="#141413" />

                    <path d="M 0 115 C 22 115 38 140 60 140" stroke="#141413" strokeWidth="1.2" fill="none" />
                    <circle cx="0" cy="115" r="2.5" fill="#141413" />

                    <path d="M 0 163 C 22 163 38 140 60 140" stroke="#141413" strokeWidth="1.2" fill="none" />
                    <circle cx="0" cy="163" r="2.5" fill="#141413" />

                    <path d="M 0 211 C 28 211 42 140 60 140" stroke="#141413" strokeWidth="1.2" fill="none" />
                    <circle cx="0" cy="211" r="2.5" fill="#141413" />

                    <path d="M 0 259 C 32 259 45 140 60 140" stroke="#141413" strokeWidth="1.2" fill="none" />
                    <circle cx="0" cy="259" r="2.5" fill="#141413" />

                    {/* Central convergence node dot */}
                    <circle cx="60" cy="140" r="3.5" fill="#141413" />

                    {/* Horizontal connector line touching the circular orbit edge directly at x=105 */}
                    <line x1="60" y1="140" x2="105" y2="140" stroke="#141413" strokeWidth="1.2" />

                    {/* Dashed Circular Orbit Ring (cx=235, cy=140, r=130) -> left edge is 235-130 = 105! */}
                    <circle cx="235" cy="140" r="130" stroke="#C8C5B9" strokeWidth="1.2" strokeDasharray="3 3" fill="none" />

                    {/* 1. Dashed connector to Pattern scoring (pill at x=55, y=34) */}
                    <path d="M 98 34 C 118 34 132 40 144 48" stroke="#77746C" strokeWidth="1.2" strokeDasharray="2.5 2.5" fill="none" />
                    <circle cx="98" cy="34" r="2.5" fill="#141413" />

                    {/* 2. Dashed connector to Text analysis (pill at cx=235, y=-2) */}
                    <line x1="235" y1="2" x2="235" y2="10" stroke="#77746C" strokeWidth="1.2" strokeDasharray="2.5 2.5" />
                    <circle cx="235" cy="2" r="2.5" fill="#141413" />

                    {/* 3. Dashed connector to Feature explanation (pill at x=370, y=34) */}
                    <path d="M 326 48 C 338 40 352 34 372 34" stroke="#77746C" strokeWidth="1.2" strokeDasharray="2.5 2.5" fill="none" />
                    <circle cx="372" cy="34" r="2.5" fill="#141413" />

                    {/* 4. Dashed connector to Risk synthesis (pill at x=400, y=140) */}
                    <line x1="365" y1="140" x2="400" y2="140" stroke="#77746C" strokeWidth="1.2" strokeDasharray="2.5 2.5" />
                    <circle cx="400" cy="140" r="2.5" fill="#141413" />

                    {/* 5. Downward dashed flow arrow connecting into Step 04 (matching Image 5) */}
                    <path d="M 235 270 L 235 298" stroke="#77746C" strokeWidth="1.2" strokeDasharray="2.5 2.5" />
                    <path d="M 231 292 L 235 298 L 239 292" stroke="#77746C" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>

                  {/* Satellite Badges Layer (HTML for crisp text & sharp borders) */}
                  <div className="absolute inset-0 pointer-events-none">
                    {/* Badge 1: Pattern scoring */}
                    <div className="absolute left-[4px] sm:left-[12px] top-[18px]">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-none bg-[#FFFFFF] border border-[#E0DED4] shadow-[0_2px_8px_rgba(20,20,19,0.06)] text-[11px] font-mono font-medium text-[#141413]">
                        Pattern scoring
                      </span>
                    </div>

                    {/* Badge 2: Text analysis */}
                    <div className="absolute left-[235px] -translate-x-1/2 -top-[16px]">
                      <span className="inline-flex items-center px-3 py-1 rounded-none bg-[#FFFFFF] border border-[#E0DED4] shadow-[0_2px_8px_rgba(20,20,19,0.06)] text-[11px] font-mono font-medium text-[#141413]">
                        Text analysis
                      </span>
                    </div>

                    {/* Badge 3: Feature explanation */}
                    <div className="absolute right-[8px] sm:right-[18px] top-[18px]">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-none bg-[#FFFFFF] border border-[#E0DED4] shadow-[0_2px_8px_rgba(20,20,19,0.06)] text-[11px] font-mono font-medium text-[#141413]">
                        Feature explanation
                      </span>
                    </div>

                    {/* Badge 4: Risk synthesis */}
                    <div className="absolute right-[0px] sm:right-[10px] top-[125px]">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-none bg-[#FFFFFF] border border-[#E0DED4] shadow-[0_2px_8px_rgba(20,20,19,0.06)] text-[11px] font-mono font-medium text-[#141413]">
                        Risk synthesis
                      </span>
                    </div>

                    {/* Center Brain Engine Block inside the Dashed Orbit */}
                    <div className="absolute left-[235px] top-[140px] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center">
                      <div className="relative w-[150px] sm:w-[175px] h-[105px] sm:h-[120px] flex items-center justify-center">
                        <img
                          src="/Detailed Ivory Brain Illustration.png"
                          alt="ScamShield Analysis Engine"
                          className="w-full h-full object-contain drop-shadow-[0_8px_20px_rgba(20,20,19,0.12)] mix-blend-multiply select-none pointer-events-none"
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
              STEP 04: CROSS-CHECK EVIDENCE (IMAGE 5)
          ══════════════════════════════════════════════════════════════ */}
          <div className="relative flex flex-col md:flex-row items-stretch gap-6 md:gap-10">
            {/* Timeline node dot (md+) */}
            <div className="hidden md:flex absolute left-0 top-[24px] w-5 h-5 -translate-x-[0px] rounded-full border border-[#D0CDC2] bg-[#FAF9F5] items-center justify-center z-10 flex-shrink-0">
              <span className="w-2 h-2 rounded-full bg-[#141413]" />
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

            {/* Step Right Visual Card: 4-Column Evidence Cards (Matching Image 5) */}
            <div className="flex-1 bg-[#FAF9F6] border border-[#E0DED4] rounded-none p-5 sm:p-6 shadow-[0_2px_12px_rgba(20,20,19,0.02)] relative overflow-hidden">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">

                {/* Card 1: Domain consistency (Pass) */}
                <div className="bg-[#FFFFFF] border border-[#E0DED4] rounded-none p-3.5 flex flex-col justify-between shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:border-[#141413]/30 transition-colors">
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
                <div className="bg-[#FFFFFF] border border-[#F6C6BF] rounded-none p-3.5 flex flex-col justify-between shadow-[0_1px_3px_rgba(220,38,38,0.03)] hover:border-[#DC2626]/50 transition-colors">
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
                <div className="bg-[#FFFFFF] border border-[#E0DED4] rounded-none p-3.5 flex flex-col justify-between shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:border-[#141413]/30 transition-colors">
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
                <div className="bg-[#FFFFFF] border border-[#FDE68A] rounded-none p-3.5 flex flex-col justify-between shadow-[0_1px_3px_rgba(217,119,6,0.03)] hover:border-[#D97706]/50 transition-colors">
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
              STEP 05: RECEIVE AN EXPLAINABLE VERDICT (IMAGE 1)
          ══════════════════════════════════════════════════════════════ */}
          <div className="relative flex flex-col md:flex-row items-stretch gap-6 md:gap-10">
            {/* Timeline node dot (md+) */}
            <div className="hidden md:flex absolute left-0 top-[24px] w-5 h-5 -translate-x-[0px] rounded-full border border-[#F4B2A8] bg-[#FEECE8] items-center justify-center z-10 flex-shrink-0">
              <span className="w-2 h-2 rounded-full bg-[#DC2626]" />
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

            {/* Step Right Visual Card: Warm Rose-Porcelain Verdict Card (Matching Image 1) */}
            <div className="flex-1 bg-gradient-to-b from-[#FFF2F0] via-[#FEECE8] to-[#FDE4E0] border border-[#F6C6BF] rounded-none p-5 sm:p-6 shadow-[0_4px_20px_rgba(220,38,38,0.06),inset_0_1px_0_0_rgba(255,255,255,0.85)] relative overflow-hidden">
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
                    <div className="w-5 h-5 rounded-none bg-[#DC2626] text-white flex items-center justify-center flex-shrink-0">
                      <ShieldAlert size={12} strokeWidth={2.2} />
                    </div>
                    <span className="text-[20px] sm:text-[22px] font-serif font-bold text-[#7F1D1D] leading-tight">
                      High Risk
                    </span>
                  </div>
                </div>

                {/* Col 2: Model Score */}
                <div className="sm:border-l sm:border-[#F4B2A8]/60 sm:pl-4">
                  <span className="text-[9.5px] font-mono font-bold uppercase tracking-wider text-[#991B1B]">
                    MODEL SCORE
                  </span>
                  <div className="flex items-baseline gap-1 mt-1 font-mono">
                    <span className="text-[22px] sm:text-[24px] font-bold text-[#141413] leading-none">
                      94
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
                  className="inline-flex items-center gap-2 h-[34px] px-4 rounded-none bg-[#141413] text-[#FAF9F5] text-[12px] font-semibold tracking-[-0.01em] border border-[#3E3D38] shadow-[0_2px_8px_rgba(20,20,19,0.2)] hover:bg-[#262523] active:scale-[0.99] transition-all cursor-pointer"
                >
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
