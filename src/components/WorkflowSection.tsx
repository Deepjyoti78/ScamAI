import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Link as LinkIcon,
  Mail,
  MousePointer,
  CreditCard,
  Layers,
  Globe,
  ShieldAlert,
  Building2,
  Check,
  X,
  AlertTriangle,
  Search,
  ArrowRight,
  Target,
  BarChart2,
  Sparkles,
  Info,
} from 'lucide-react';

/* ── REUSABLE CRISP JOB POSTING CARD ── */
function JobPostingCard({ className = '' }: { className?: string }) {
  const navigate = useNavigate();

  return (
    <div
      className={`bg-[#FFFFFF] border border-[#E0DED4] rounded-none p-4 sm:p-4.5 shadow-[0_2px_10px_rgba(20,20,19,0.04),inset_0_1px_0_0_#FFFFFF] relative ${className}`}
    >
      {/* Specular top highlight */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-white pointer-events-none z-10" />

      {/* Header with avatar */}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-8 h-8 rounded-none bg-[#F5F4EE] border border-[#E0DED4] flex items-center justify-center font-bold text-[13px] text-[#141413] flex-shrink-0">
          R
        </div>
        <div className="min-w-0">
          <h4 className="text-[14px] font-bold text-[#141413] leading-tight truncate">
            Product Designer
          </h4>
          <p className="text-[11px] text-[#77746C] leading-tight mt-0.5">
            RapidTech Solutions
          </p>
        </div>
      </div>

      {/* Meta tags */}
      <div className="flex items-center gap-1.5 mb-2.5">
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-none bg-[#F5F4EE] border border-[#E0DED4] text-[9.5px] font-mono text-[#55524B]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Remote
        </span>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-none bg-[#F5F4EE] border border-[#E0DED4] text-[9.5px] font-mono text-[#55524B]">
          Full-time
        </span>
      </div>

      {/* Excerpt */}
      <p className="text-[11px] text-[#55524B] leading-relaxed mb-3">
        Join our product team to design intuitive, user-centric experiences and drive growth.
      </p>

      {/* Action button */}
      <button
        type="button"
        onClick={() => navigate('/investigate')}
        className="w-full inline-flex items-center justify-center gap-1.5 h-[32px] px-3 rounded-none bg-[#141413] text-[#FAF9F5] text-[11.5px] font-medium tracking-wide hover:bg-[#262523] active:scale-[0.99] transition-all cursor-pointer"
      >
        <span>Apply Now</span>
        <ArrowRight size={12} />
      </button>
    </div>
  );
}

/* ── HIGH-FIDELITY ANATOMICAL BRAIN ENGINE VECTOR ── */
function RealisticBrainGraphic() {
  return (
    <div className="relative w-[150px] h-[125px] sm:w-[170px] sm:h-[140px] flex items-center justify-center select-none">
      <svg
        viewBox="0 0 240 180"
        className="w-full h-full drop-shadow-[0_6px_16px_rgba(20,20,19,0.09)]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Main 3D volumetric shading gradient */}
          <radialGradient id="brain3D" cx="45%" cy="35%" r="65%" fx="35%" fy="25%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="45%" stopColor="#ECE8DF" />
            <stop offset="85%" stopColor="#D5CFBF" />
            <stop offset="100%" stopColor="#B8B1A0" />
          </radialGradient>

          {/* Cerebellum striated shading */}
          <linearGradient id="cerebellumGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#DDD8CC" />
            <stop offset="100%" stopColor="#BAB29F" />
          </linearGradient>

          {/* Drop shadow for convolutions */}
          <filter id="cortexShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="1" stdDeviation="0.8" floodColor="#141413" floodOpacity="0.18" />
          </filter>
        </defs>

        {/* ── 1. CEREBELLUM (Lower Posterior Lobe) ── */}
        <g id="cerebellum">
          <path
            d="M 50 115 C 38 128 46 148 68 152 C 86 155 104 150 112 138 C 98 136 84 130 74 122 C 64 116 56 114 50 115 Z"
            fill="url(#cerebellumGrad)"
            stroke="#141413"
            strokeWidth="2"
          />
          {/* Characteristic folia striations */}
          <path d="M 52 126 C 64 132 80 137 96 136" stroke="#44403C" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M 56 134 C 68 140 84 144 100 142" stroke="#44403C" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M 64 143 C 74 147 88 149 104 146" stroke="#44403C" strokeWidth="1.1" strokeLinecap="round" />
        </g>

        {/* ── 2. BRAINSTEM (Medulla & Pons Base) ── */}
        <path
          d="M 104 138 C 108 148 114 158 118 168 C 122 170 128 170 132 166 C 130 156 128 144 126 136"
          fill="#C4BEAE"
          stroke="#141413"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />

        {/* ── 3. CEREBRUM OUTLINE (Frontal, Parietal, Occipital, Temporal Lobes) ── */}
        <path
          d="M 65 116 C 52 110 40 98 34 82 C 26 62 34 38 52 24 C 70 10 98 8 124 14 C 150 20 178 34 195 56 C 210 75 212 98 202 118 C 192 136 172 146 150 148 C 134 149 122 144 115 136 C 108 126 95 125 85 125 C 75 125 68 120 65 116 Z"
          fill="url(#brain3D)"
          stroke="#141413"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* ── 4. SULCAL FOLDS & GYRI CONVOLUTIONS (High Anatomical Detail) ── */}
        <g stroke="#141413" strokeLinecap="round" strokeLinejoin="round" fill="none">
          {/* Lateral Sulcus (Sylvian Fissure) dividing frontal & temporal lobes */}
          <path
            d="M 52 88 C 68 94 88 88 106 74 C 124 60 146 66 162 78 C 178 88 194 86 202 80"
            strokeWidth="2.4"
          />

          {/* Central Sulcus of Rolando dividing frontal and parietal lobes */}
          <path
            d="M 120 14 C 116 34 122 52 114 70 C 108 82 104 96 112 112"
            strokeWidth="2.2"
          />

          {/* Frontal Lobe Gyri (Superior, Middle, Inferior) */}
          <path d="M 44 48 C 58 40 76 44 88 56 C 96 64 92 74 80 80 C 68 85 58 76 50 68" strokeWidth="1.8" />
          <path d="M 72 22 C 78 36 74 50 64 60 C 56 68 52 78 56 86" strokeWidth="1.6" />
          <path d="M 96 16 C 98 32 92 46 82 56" strokeWidth="1.6" />
          <path d="M 46 72 C 38 80 38 90 44 98" strokeWidth="1.6" />

          {/* Parietal Lobe Gyri */}
          <path d="M 142 18 C 138 32 148 46 160 50 C 172 54 180 66 178 78" strokeWidth="1.8" />
          <path d="M 166 28 C 172 38 182 46 190 56 C 196 64 192 76 186 84" strokeWidth="1.6" />
          <path d="M 132 38 C 142 48 136 62 126 70" strokeWidth="1.6" />

          {/* Occipital Lobe Gyri */}
          <path d="M 194 92 C 188 102 188 114 182 124 C 174 134 162 138 152 142" strokeWidth="1.7" />
          <path d="M 204 102 C 198 112 192 122 178 130" strokeWidth="1.5" />

          {/* Temporal Lobe Gyri */}
          <path d="M 82 98 C 94 104 112 102 126 94 C 140 86 156 94 162 106 C 166 114 158 126 144 132" strokeWidth="1.8" />
          <path d="M 96 114 C 110 120 128 116 138 108 C 148 102 160 110 164 120" strokeWidth="1.6" />
        </g>

        {/* ── 5. EMBEDDED SYNAPTIC NEURAL NODES & TELEMETRY PULSES ── */}
        <g id="synapses">
          <circle cx="78" cy="52" r="3" fill="#DC2626" />
          <circle cx="116" cy="46" r="2.5" fill="#141413" />
          <circle cx="158" cy="56" r="3" fill="#DC2626" />
          <circle cx="98" cy="88" r="2.5" fill="#141413" />
          <circle cx="140" cy="94" r="3" fill="#DC2626" />
          <circle cx="172" cy="108" r="2.5" fill="#141413" />
          <circle cx="120" cy="126" r="2.8" fill="#141413" />

          {/* Micro-synaptic circuit dashed interlinks */}
          <line x1="78" y1="52" x2="98" y2="88" stroke="#DC2626" strokeWidth="0.8" strokeDasharray="2 2" />
          <line x1="116" y1="46" x2="158" y2="56" stroke="#141413" strokeWidth="0.8" strokeDasharray="2 2" />
          <line x1="140" y1="94" x2="172" y2="108" stroke="#DC2626" strokeWidth="0.8" strokeDasharray="2 2" />
          <line x1="98" y1="88" x2="120" y2="126" stroke="#141413" strokeWidth="0.8" strokeDasharray="2 2" />
        </g>
      </svg>
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
              STEP 01: SUBMIT A JOB POSTING (IMAGES 1 & 2)
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
              <h3 className="text-[20px] sm:text-[23px] font-serif font-normal text-[#141413] tracking-tight leading-snug mb-2">
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

                {/* Left: Laptop Screen Mockup with Floating URL Input & Burst lines */}
                <div className="relative flex flex-col items-center justify-center py-4 sm:py-6">
                  {/* Decorative speed burst lines above laptop right side (matching Image 2) */}
                  <div className="absolute top-0 right-8 sm:right-12 flex gap-1 pointer-events-none select-none text-[#77746C]">
                    <span className="w-[1.5px] h-3 bg-[#77746C] transform rotate-[-30deg]" />
                    <span className="w-[1.5px] h-4 bg-[#77746C] transform -translate-y-1" />
                    <span className="w-[1.5px] h-3 bg-[#77746C] transform rotate-[30deg]" />
                  </div>

                  {/* Laptop Body */}
                  <div className="relative w-full max-w-[340px] aspect-[16/10] bg-[#1E1E1E] rounded-none p-2 shadow-lg border border-[#3E3D38]">
                    {/* Screen Bezel & Display */}
                    <div className="w-full h-full bg-[#FAF9F5] border border-[#D0CDC2] rounded-none p-3.5 flex flex-col justify-between overflow-hidden relative">
                      {/* Top wireframe navigation bar */}
                      <div className="flex items-center justify-between pb-2 border-b border-[#E8E6DE]">
                        <div className="w-16 h-2 bg-[#E2DFD7] rounded-none" />
                        <div className="flex gap-1.5">
                          <div className="w-8 h-1.5 bg-[#E8E6DE] rounded-none" />
                          <div className="w-8 h-1.5 bg-[#E8E6DE] rounded-none" />
                        </div>
                      </div>

                      {/* Screen Wireframe Skeleton Lines */}
                      <div className="space-y-2 py-1">
                        <div className="w-28 h-2.5 bg-[#141413]/20 rounded-none" />
                        <div className="w-full h-1.5 bg-[#E8E6DE] rounded-none" />
                        <div className="w-5/6 h-1.5 bg-[#E8E6DE] rounded-none" />
                        <div className="w-2/3 h-1.5 bg-[#E8E6DE] rounded-none" />
                      </div>

                      {/* Bottom button wireframe */}
                      <div className="w-20 h-4 bg-[#141413]/10 border border-[#141413]/20 rounded-none" />
                    </div>

                    {/* Laptop Bottom Hinge */}
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-[112%] h-2 bg-[#2D2D2A] border-t border-[#4A4944] rounded-none" />
                  </div>

                  {/* Floating URL Pill Overlay */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] max-w-[340px] bg-[#FFFFFF] border-2 border-[#141413] rounded-none p-1.5 shadow-[0_8px_24px_rgba(20,20,19,0.18)] z-10 flex items-center gap-2">
                    <LinkIcon size={13} className="text-[#16A34A] flex-shrink-0 ml-1" />
                    <span className="text-[10px] sm:text-[10.5px] font-mono text-[#141413] truncate font-semibold flex-1">
                      careers-rapidtech.com/jobs/product-designer
                    </span>
                    <button
                      type="button"
                      onClick={() => navigate('/investigate')}
                      className="w-6 h-6 bg-[#141413] text-white flex items-center justify-center rounded-none flex-shrink-0 hover:bg-[#262523]"
                      title="Analyze this URL"
                    >
                      <Search size={11} />
                    </button>
                  </div>

                  {/* Directed Green Flow Arrow from URL bar into the right Job Card */}
                  <svg
                    className="hidden lg:block absolute -right-6 top-1/2 -translate-y-1/2 w-8 h-8 pointer-events-none z-20 overflow-visible text-[#16A34A]"
                    viewBox="0 0 32 32"
                    fill="none"
                  >
                    <path
                      d="M 0 16 C 14 16 18 16 28 16"
                      stroke="currentColor"
                      strokeWidth="1.75"
                    />
                    <path d="M 22 10 L 28 16 L 22 22" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>

                {/* Right: Extracted Job Card */}
                <div className="flex justify-center lg:justify-end">
                  <JobPostingCard className="w-full max-w-[290px]" />
                </div>
              </div>
            </div>
          </div>


          {/* ══════════════════════════════════════════════════════════════
              STEP 02: EXTRACT SIGNALS (IMAGES 1 & 3)
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
              <h3 className="text-[20px] sm:text-[23px] font-serif font-normal text-[#141413] tracking-tight leading-snug mb-2">
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
                    {/* Origin point dot on left edge */}
                    <circle cx="0" cy="132" r="3" fill="#141413" />

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

                {/* Right: 6 Signal Feature Pills with Vertical Dividers (matching Image 3) */}
                <div className="w-full lg:flex-1 space-y-2">
                  {[
                    { icon: <FileText size={13} className="text-[#141413]" />, title: 'Job content' },
                    { icon: <LinkIcon size={13} className="text-[#141413]" />, title: 'Domain & URL' },
                    { icon: <Mail size={13} className="text-[#DC2626]" />, title: 'Recruiter email' },
                    { icon: <MousePointer size={13} className="text-[#141413]" />, title: 'Application destination' },
                    { icon: <CreditCard size={13} className="text-[#DC2626]" />, title: 'Payment request' },
                    { icon: <Layers size={13} className="text-[#141413]" />, title: 'Employer & web evidence' },
                  ].map((sig, i) => (
                    <div
                      key={i}
                      className="bg-[#FFFFFF] border border-[#E0DED4] rounded-none px-3 py-2 flex items-center justify-between shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:border-[#141413]/40 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="flex items-center justify-center text-[#141413] flex-shrink-0">
                          {sig.icon}
                        </span>
                        {/* Vertical dividing rule matching Image 3 */}
                        <span className="w-[1px] h-3.5 bg-[#E0DED4] flex-shrink-0" />
                        <span className="text-[12px] font-medium text-[#141413]">
                          {sig.title}
                        </span>
                      </div>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#141413]/30" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>


          {/* ══════════════════════════════════════════════════════════════
              STEP 03: ANALYZE WITH SCAMSHIELD AI (IMAGES 1, 4 & 5)
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
              <h3 className="text-[20px] sm:text-[23px] font-serif font-normal text-[#141413] tracking-tight leading-snug mb-2">
                Analyze with ScamShield AI
              </h3>
              <p className="text-[13px] sm:text-[13.5px] text-[#55524B] leading-relaxed">
                Use ML analysis and trust checks to assess the signals and estimate recruitment fraud risk.
              </p>
            </div>

            {/* Step Right Visual Card */}
            <div className="flex-1 bg-[#FAF9F6] border border-[#E0DED4] rounded-none p-5 sm:p-6 shadow-[0_2px_12px_rgba(20,20,19,0.02)] relative overflow-hidden">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-6 relative">

                {/* Left: 6 Input Feature Pills with vertical dividers */}
                <div className="w-full lg:w-[210px] space-y-1.5 flex-shrink-0">
                  {[
                    { icon: <FileText size={12} />, title: 'Job content' },
                    { icon: <LinkIcon size={12} />, title: 'Domain & URL' },
                    { icon: <Mail size={12} className="text-[#DC2626]" />, title: 'Recruiter email' },
                    { icon: <MousePointer size={12} />, title: 'Application destination' },
                    { icon: <CreditCard size={12} className="text-[#DC2626]" />, title: 'Payment request' },
                    { icon: <Layers size={12} />, title: 'Employer & web evidence' },
                  ].map((sig, i) => (
                    <div
                      key={i}
                      className="bg-[#FFFFFF] border border-[#E0DED4] rounded-none px-2.5 py-1.5 flex items-center gap-2 shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                    >
                      <span className="text-[#77746C] flex-shrink-0">{sig.icon}</span>
                      <span className="w-[1px] h-3 bg-[#E0DED4] flex-shrink-0" />
                      <span className="text-[11px] font-medium text-[#141413] truncate">
                        {sig.title}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Center SVG Connector Funnel converging into central node */}
                <div className="hidden lg:block w-[50px] h-[220px] relative flex-shrink-0">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 50 220" fill="none">
                    <path d="M 0 18 C 30 18 30 110 50 110" stroke="#77746C" strokeWidth="1" strokeDasharray="2 2" />
                    <path d="M 0 55 C 25 55 25 110 50 110" stroke="#77746C" strokeWidth="1" strokeDasharray="2 2" />
                    <path d="M 0 92 C 20 92 25 110 50 110" stroke="#77746C" strokeWidth="1" strokeDasharray="2 2" />
                    <path d="M 0 128 C 20 128 25 110 50 110" stroke="#77746C" strokeWidth="1" strokeDasharray="2 2" />
                    <path d="M 0 165 C 25 165 25 110 50 110" stroke="#77746C" strokeWidth="1" strokeDasharray="2 2" />
                    <path d="M 0 202 C 30 202 30 110 50 110" stroke="#77746C" strokeWidth="1" strokeDasharray="2 2" />
                    <circle cx="50" cy="110" r="3.5" fill="#141413" />
                  </svg>
                </div>

                {/* Center & Right: Anatomical Brain Illustration surrounded by Satellite Capabilities */}
                <div className="flex-1 flex flex-col items-center justify-center relative py-2 w-full">
                  <div className="relative flex flex-col items-center">

                    {/* Top Satellite Pill: Text analysis */}
                    <div className="mb-2 relative">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-none bg-[#FFFFFF] border border-[#E0DED4] shadow-sm text-[10.5px] font-mono font-medium text-[#141413]">
                        <FileText size={11} className="text-[#77746C]" />
                        Text analysis
                      </span>
                    </div>

                    <div className="flex items-center gap-3 sm:gap-5">
                      {/* Left Satellite Pill: Pattern scoring */}
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-none bg-[#FFFFFF] border border-[#E0DED4] shadow-sm text-[10.5px] font-mono font-medium text-[#141413]">
                        <Target size={11} className="text-[#DC2626]" />
                        Pattern scoring
                      </span>

                      {/* Center Brain Engine with circular dashed orbit */}
                      <div className="flex flex-col items-center relative">
                        {/* Circular dashed orbit ring (matching Image 4) */}
                        <div className="absolute inset-[-14px] rounded-full border border-dashed border-[#D0CDC2]/80 pointer-events-none" />

                        <RealisticBrainGraphic />
                        <span className="font-serif font-bold text-[14.5px] sm:text-[15.5px] text-[#141413] tracking-tight mt-1.5 text-center leading-snug">
                          ScamShield<br />Analysis Engine
                        </span>
                      </div>

                      {/* Right Satellite Pills Stack */}
                      <div className="flex flex-col gap-3">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-none bg-[#FFFFFF] border border-[#E0DED4] shadow-sm text-[10.5px] font-mono font-medium text-[#141413]">
                          <BarChart2 size={11} className="text-[#77746C]" />
                          Feature explanation
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-none bg-[#FFFFFF] border border-[#E0DED4] shadow-sm text-[10.5px] font-mono font-medium text-[#141413]">
                          <Sparkles size={11} className="text-[#DC2626]" />
                          Risk synthesis
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Downward Dashed Flow Arrow connecting Step 03 into Step 04 (matching Image 5) */}
              <div className="hidden lg:flex items-center justify-center pt-2">
                <svg className="w-6 h-6 overflow-visible text-[#77746C]" viewBox="0 0 24 24" fill="none">
                  <path d="M 12 0 L 12 20" stroke="currentColor" strokeWidth="1.2" strokeDasharray="2 2" />
                  <path d="M 8 16 L 12 20 L 16 16" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </div>


          {/* ══════════════════════════════════════════════════════════════
              STEP 04: CROSS-CHECK EVIDENCE (IMAGES 1 & 5)
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
              <h3 className="text-[20px] sm:text-[23px] font-serif font-normal text-[#141413] tracking-tight leading-snug mb-2">
                Cross-check evidence
              </h3>
              <p className="text-[13px] sm:text-[13.5px] text-[#55524B] leading-relaxed">
                Verify the analysis with specific evidence checks to build a clearer risk picture.
              </p>
            </div>

            {/* Step Right Visual Card: 4-Column Horizontal Evidence Cards (Matching Image 5) */}
            <div className="flex-1 bg-[#FAF9F6] border border-[#E0DED4] rounded-none p-5 sm:p-6 shadow-[0_2px_12px_rgba(20,20,19,0.02)] relative overflow-hidden">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">

                {/* Card 1: Domain consistency */}
                <div className="bg-[#FFFFFF] border border-[#E0DED4] rounded-none p-3.5 flex flex-col justify-between shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:border-[#141413]/30 transition-colors">
                  <div>
                    <div className="flex items-center justify-between mb-2">
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
                  <div className="mt-2.5 pt-2 border-t border-[#F0EEE6]">
                    <span className="text-[9.5px] font-mono text-emerald-700 font-semibold uppercase">
                      Check complete
                    </span>
                  </div>
                </div>

                {/* Card 2: Credential verification */}
                <div className="bg-[#FFFFFF] border border-[#F6C6BF] rounded-none p-3.5 flex flex-col justify-between shadow-[0_1px_3px_rgba(220,38,38,0.03)] hover:border-[#DC2626]/50 transition-colors">
                  <div>
                    <div className="flex items-center justify-between mb-2">
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
                  <div className="mt-2.5 pt-2 border-t border-[#FEECE8]">
                    <span className="text-[9.5px] font-mono text-rose-700 font-semibold uppercase">
                      Concern found
                    </span>
                  </div>
                </div>

                {/* Card 3: Web corroboration */}
                <div className="bg-[#FFFFFF] border border-[#E0DED4] rounded-none p-3.5 flex flex-col justify-between shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:border-[#141413]/30 transition-colors">
                  <div>
                    <div className="flex items-center justify-between mb-2">
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
                  <div className="mt-2.5 pt-2 border-t border-[#F0EEE6]">
                    <span className="text-[9.5px] font-mono text-emerald-700 font-semibold uppercase">
                      Check complete
                    </span>
                  </div>
                </div>

                {/* Card 4: Employer legitimacy */}
                <div className="bg-[#FFFFFF] border border-[#FDE68A] rounded-none p-3.5 flex flex-col justify-between shadow-[0_1px_3px_rgba(217,119,6,0.03)] hover:border-[#D97706]/50 transition-colors">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-none bg-[#FEF3C7] border border-[#FDE68A] flex items-center justify-center text-[#D97706]">
                          <Building2 size={14} />
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
                  <div className="mt-2.5 pt-2 border-t border-[#FEF3C7]">
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
              <h3 className="text-[20px] sm:text-[23px] font-serif font-normal text-[#141413] tracking-tight leading-snug mb-2">
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
