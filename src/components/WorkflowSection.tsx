import { FileText, Sparkles, Lightbulb, Search, ArrowRight } from 'lucide-react';

const steps = [
  {
    num: '01',
    icon: <FileText className="w-4 h-4 text-[#141413]" strokeWidth={1.5} />,
    title: 'Analyse posting',
    description:
      'Paste a job description or URL to extract content and scan for initial red flags.',
  },
  {
    num: '02',
    icon: <Sparkles className="w-4 h-4 text-[#141413]" strokeWidth={1.5} />,
    title: 'Evaluate ML signals',
    description:
      'Run the calibrated classifier to calculate statistical recruitment fraud probability.',
  },
  {
    num: '03',
    icon: (
      <svg
        className="w-4 h-4 text-[#141413]"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="5" r="2.5" />
        <circle cx="6" cy="18" r="2.5" />
        <circle cx="18" cy="18" r="2.5" />
        <path d="M12 7.5v3.5" />
        <path d="M12 11l-4.5 4.5" />
        <path d="M12 11l4.5 4.5" />
      </svg>
    ),
    title: 'Cross-check details',
    description:
      'Audit recruiter domains, application links, and upfront fee or credential requests.',
  },
  {
    num: '04',
    icon: <Search className="w-4 h-4 text-[#141413]" strokeWidth={1.5} />,
    title: 'Verify web evidence',
    description:
      'Search official employer domains and reputable ATS platforms for vacancy matches.',
  },
  {
    num: '05',
    icon: <Lightbulb className="w-4 h-4 text-[#141413]" strokeWidth={1.5} />,
    title: 'Review evidence',
    description:
      'Inspect transparent findings, evidence breakdown, and practical next steps.',
  },
];

export default function WorkflowSection() {
  return (
    <section id="workflow" className="w-full border-t border-[#E0DED4] px-6 lg:px-10 py-10 md:py-12 bg-[#FAF9F5]">
      {/* Centered Section Header with tighter vertical spacing */}
      <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-9">
        <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-[#77746C] font-medium">
          HOW IT WORKS
        </span>
        <h2 className="text-[28px] sm:text-[34px] md:text-[38px] font-serif font-normal text-[#141413] tracking-tight leading-[1.15] mt-1.5">
          From job posting to informed decision.
        </h2>
        <p className="text-[13px] sm:text-[13.5px] text-[#625F58] font-sans mt-1.5 font-normal">
          Five steps. Clear evidence. Better-informed decisions.
        </p>
      </div>

      {/* 5 Sharp Square Step Cards */}
      <div className="flex flex-col sm:grid sm:grid-cols-2 lg:flex lg:flex-row items-stretch lg:items-center gap-3 lg:gap-2 max-w-[1180px] mx-auto">
        {steps.map((step, idx) => (
          <div key={step.num} className="contents">
            {/* Step Card with sharp square edges */}
            <div className="flex-1 bg-[#FAF9F5] border border-[#E0DED4] rounded-none p-4 sm:p-4.5 flex flex-col justify-between hover:border-[#77746C] transition-colors shadow-[0_1px_3px_rgba(0,0,0,0.02)] min-h-[175px]">
              <div>
                {/* Step Number + Icon */}
                <div className="flex items-center justify-between mb-3.5">
                  <span className="text-[11px] font-mono font-medium text-[#77746C]">
                    {step.num}
                  </span>
                  <div className="w-8 h-8 rounded-none bg-[#FAF9F5] border border-[#E0DED4] flex items-center justify-center shrink-0">
                    {step.icon}
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-[13.5px] sm:text-[14px] font-semibold text-[#141413] tracking-tight leading-snug">
                  {step.title}
                </h3>

                {/* Description */}
                <p className="text-[11.5px] sm:text-[12px] text-[#625F58] mt-1.5 leading-relaxed font-normal">
                  {step.description}
                </p>
              </div>
            </div>

            {/* Connecting Arrow between cards */}
            {idx < steps.length - 1 && (
              <div className="hidden lg:flex items-center justify-center text-[#D7D4C9] shrink-0 px-0.5">
                <ArrowRight className="w-3.5 h-3.5 text-[#D7D4C9]" strokeWidth={1.5} />
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
