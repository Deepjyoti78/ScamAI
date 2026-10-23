import { ScanSearch, GitCompareArrows, Lightbulb } from 'lucide-react';

const steps = [
  {
    num: '01',
    icon: <ScanSearch size={18} strokeWidth={1.5} className="text-[#111110]" />,
    title: 'Analyse',
    description:
      'Paste a job link or description. Extract relevant details and analyse the content for red flags.',
  },
  {
    num: '02',
    icon: <GitCompareArrows size={18} strokeWidth={1.5} className="text-[#111110]" />,
    title: 'Cross-check',
    description:
      'Compare available employer, recruiter, and domain information to identify inconsistencies.',
  },
  {
    num: '03',
    icon: <Lightbulb size={18} strokeWidth={1.5} className="text-[#111110]" />,
    title: 'Get insights',
    description:
      'Understand suspicious signals and receive practical next steps before you respond.',
  },
];

export default function WorkflowSection() {
  return (
    <section id="workflow" className="w-full border-t border-b border-[#e4e4e0] px-6 lg:px-10 py-14 md:py-16">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-[#e4e4e0]">
        {steps.map((step) => (
          <div key={step.num} className="flex flex-col gap-3 md:px-8 py-8 md:py-2 first:pl-0 last:pr-0">
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-mono font-medium text-[#767672] tracking-widest">{step.num}</span>
              <div className="w-9 h-9 flex items-center justify-center rounded-[4px] bg-[#f7f7f6] border border-[#e4e4e0]">
                {step.icon}
              </div>
            </div>
            <h3 className="text-[19px] sm:text-[20px] font-semibold text-[#111110] tracking-tight">{step.title}</h3>
            <p className="text-[14px] text-[#555552] leading-relaxed">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
