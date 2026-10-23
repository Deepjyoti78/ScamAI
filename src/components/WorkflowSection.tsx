import { FileText, Lightbulb, ArrowRight } from 'lucide-react';

const steps = [
  {
    num: '01',
    icon: <FileText className="w-5 h-5 text-neutral-700" strokeWidth={1.5} />,
    title: 'Analyse the posting',
    description:
      'Paste a job description or URL to identify risk-related language.',
  },
  {
    num: '02',
    icon: (
      <svg
        className="w-5 h-5 text-neutral-700"
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
    title: 'Cross-check the details',
    description:
      'Compare employer, recruiter, and application information when provided.',
  },
  {
    num: '03',
    icon: <Lightbulb className="w-5 h-5 text-neutral-700" strokeWidth={1.5} />,
    title: 'Review the evidence',
    description:
      'See the model estimate, observed signals, and practical next steps.',
  },
];

export default function WorkflowSection() {
  return (
    <section id="workflow" className="w-full border-t border-[#e4e4e0] px-6 lg:px-10 py-16 md:py-20 bg-white">
      {/* Centered Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-14">
        <span className="text-[11px] font-mono tracking-[0.2em] uppercase text-neutral-500 font-medium">
          HOW IT WORKS
        </span>
        <h2 className="text-[32px] sm:text-[40px] md:text-[46px] font-serif font-normal text-neutral-900 tracking-tight leading-[1.15] mt-3">
          From job posting to informed decision.
        </h2>
        <p className="text-[14px] sm:text-[15px] text-neutral-500 font-sans mt-3 font-normal">
          Three steps. Clear evidence. Better-informed decisions.
        </p>
      </div>

      {/* Step Cards with Connecting Arrows */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 lg:gap-4 max-w-[1100px] mx-auto">
        {steps.map((step, idx) => (
          <div key={step.num} className="contents">
            {/* Step Card */}
            <div className="flex-1 bg-white rounded-2xl border border-neutral-200/90 shadow-[0_2px_8px_rgba(0,0,0,0.02)] p-6 sm:p-7 flex flex-col justify-between hover:border-neutral-300 transition-colors">
              <div>
                {/* Step Number + Icon */}
                <div className="flex items-center gap-4">
                  <span className="text-[12px] font-mono text-neutral-400 font-medium">
                    {step.num}
                  </span>
                  <div className="w-11 h-11 rounded-xl bg-neutral-50/80 border border-neutral-200/70 shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex items-center justify-center shrink-0">
                    {step.icon}
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-[16px] sm:text-[17px] font-semibold text-neutral-900 mt-6 tracking-tight">
                  {step.title}
                </h3>

                {/* Description */}
                <p className="text-[13px] sm:text-[13.5px] text-neutral-500 mt-2 leading-relaxed font-normal">
                  {step.description}
                </p>
              </div>
            </div>

            {/* Connecting Arrow between cards */}
            {idx < steps.length - 1 && (
              <div className="hidden md:flex items-center justify-center text-neutral-400 shrink-0 px-0.5">
                <ArrowRight className="w-4 h-4 text-neutral-400" strokeWidth={1.5} />
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
