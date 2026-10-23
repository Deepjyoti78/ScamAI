import { AlertTriangle, Mail, Building2 } from 'lucide-react';

interface Annotation {
  icon: React.ReactNode;
  label: string;
  detail: string;
}

const annotations: Annotation[] = [
  {
    icon: <Mail size={12} strokeWidth={1.75} />,
    label: 'Domain mismatch',
    detail: "Recruiter email doesn't match the company domain.",
  },
  {
    icon: <AlertTriangle size={12} strokeWidth={1.75} />,
    label: 'Payment request',
    detail: 'Mentions an upfront registration fee.',
  },
  {
    icon: <Building2 size={12} strokeWidth={1.75} />,
    label: 'Unverified employer',
    detail: 'Company details could not be verified.',
  },
];

const signals = [
  { label: 'Payment Fee', weight: 0.42, flagged: true },
  { label: 'Personal Email', weight: 0.28, flagged: true },
  { label: 'Urgent Hiring', weight: 0.18, flagged: true },
  { label: 'Positive Signals', weight: 0.12, flagged: false },
];

export default function JobAnalysisMockup() {
  return (
    <div className="w-full select-none">
      {/* Two-panel layout: job card left, annotations right */}
      <div className="flex gap-2.5 xl:gap-3 items-start">

        {/* Job card */}
        <div className="flex-1 min-w-0 bg-[#FAF9F5] border border-[#E0DED4] rounded-none shadow-[0_2px_12px_rgba(0,0,0,0.05)] overflow-hidden">
          {/* Browser chrome */}
          <div className="flex items-center gap-1.5 px-3 py-2 border-b border-[#E0DED4] bg-[#F0EEE6]">
            <span className="w-2 h-2 rounded-none bg-[#D7D4C9]" />
            <span className="w-2 h-2 rounded-none bg-[#D7D4C9]" />
            <span className="w-2 h-2 rounded-none bg-[#D7D4C9]" />
            <div className="ml-2 flex-1 h-5 bg-[#FAF9F5] border border-[#E0DED4] rounded-none flex items-center px-2">
              <span className="text-[10px] text-[#77746C] font-mono tracking-wide truncate">
                careers-rapidtech.com/jobs/product-designer
              </span>
            </div>
          </div>

          {/* Job content */}
          <div className="p-4">
            {/* Company row */}
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-none bg-[#F0EEE6] border border-[#E0DED4] flex items-center justify-center flex-shrink-0">
                <span className="text-[12px] font-bold text-[#141413]">R</span>
              </div>
              <div>
                <p className="text-[12px] font-semibold text-[#141413] leading-tight">RapidTech Solutions</p>
                <p className="text-[10px] text-[#77746C] leading-tight mt-0.5">Posted 2 days ago</p>
              </div>
            </div>

            <h3 className="text-[16px] font-bold text-[#141413] leading-snug mb-2">
              Product Designer
            </h3>

            {/* Meta inline */}
            <div className="flex flex-wrap gap-x-4 gap-y-1 mb-2.5">
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-[#77746C] uppercase tracking-wider">Location</span>
                <span className="text-[11px] font-medium text-[#141413] ml-1">Remote</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-[#77746C] uppercase tracking-wider">Type</span>
                <span className="text-[11px] font-medium text-[#141413] ml-1">Full-time</span>
              </div>
            </div>
            <p className="text-[11px] font-medium text-[#141413] mb-2.5">₹80,000 – ₹1,20,000 / month</p>

            <p className="text-[11px] text-[#625F58] leading-relaxed mb-3 border-t border-[#E0DED4] pt-2">
              Join our fast-growing team as a Product Designer. You'll work on exciting products
              and get hands-on experience.
            </p>

            {/* Apply button */}
            <button className="text-[11px] font-semibold bg-[#141413] text-[#FAF9F5] rounded-none px-3.5 py-1.5 cursor-default hover:bg-[#30302D] transition-colors">
              Apply Now
            </button>
          </div>
        </div>

        {/* Annotation column — right of job card */}
        <div className="hidden lg:flex flex-col gap-2 w-[148px] xl:w-[164px] flex-shrink-0 pt-2">
          {annotations.map((a, i) => (
            <div
              key={i}
              className="bg-[#FAF9F5] border border-[#E0DED4] rounded-none p-2.5 shadow-[0_1px_4px_rgba(0,0,0,0.04)] relative"
            >
              {/* Connector dot on left edge */}
              <div className="absolute -left-[5px] top-1/2 -translate-y-1/2 w-2 h-2 rounded-none bg-[#FAF9F5] border border-[#D7D4C9]" />
              <div className="flex items-start gap-1.5">
                <span className="text-[#c5291e] mt-0.5 flex-shrink-0">{a.icon}</span>
                <div>
                  <p className="text-[11px] font-semibold text-[#141413] leading-tight mb-0.5">{a.label}</p>
                  <p className="text-[10px] text-[#625F58] leading-snug">{a.detail}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile-only annotations */}
      <div className="lg:hidden flex flex-col gap-2 mt-3">
        {annotations.map((a, i) => (
          <div key={i} className="bg-[#FAF9F5] border border-[#E0DED4] rounded-none p-2.5 flex items-start gap-2">
            <span className="text-[#c5291e] mt-0.5 flex-shrink-0">{a.icon}</span>
            <div>
              <p className="text-[11px] font-semibold text-[#141413] leading-tight mb-0.5">{a.label}</p>
              <p className="text-[10px] text-[#625F58] leading-snug">{a.detail}</p>
            </div>
          </div>
        ))}
      </div>

      {/* AI analysis panel — subtle white overlay with light-gray border */}
      <div className="mt-3 bg-[#FAF9F5] border border-[#E0DED4] rounded-none p-3.5 sm:p-4 shadow-[0_1px_4px_rgba(0,0,0,0.03)]">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-none bg-[#c5291e] flex-shrink-0" />
              <span className="text-[12px] font-semibold text-[#141413]">Likely Suspicious</span>
              <span className="text-[10px] font-semibold bg-[#fef2f2] text-[#c5291e] border border-[#fcc9c6] px-1.5 py-0.5 rounded-none tracking-wide uppercase">
                High Risk
              </span>
            </div>
            <p className="text-[11px] text-[#625F58] leading-relaxed max-w-[280px]">
              Multiple warning signs detected. Review the evidence and verify the details independently.
            </p>
          </div>
          <div className="flex-shrink-0 sm:min-w-[130px] pt-1 sm:pt-0 border-t sm:border-t-0 border-[#E0DED4]">
            <p className="text-[9px] font-medium text-[#77746C] mb-1.5 uppercase tracking-wider">Key risk factors</p>
            <div className="space-y-1.5">
              {signals.map((sig) => (
                <div key={sig.label} className="flex items-center gap-2">
                  <span className="text-[10px] text-[#625F58] w-[76px] truncate">{sig.label}</span>
                  <div className="flex-1 h-1 bg-[#E0DED4] rounded-none overflow-hidden">
                    <div
                      className={`h-full rounded-none ${sig.flagged ? 'bg-[#141413]' : 'bg-[#77746C]'}`}
                      style={{
                        width: `${sig.weight * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-[#77746C] w-7 text-right">
                    {sig.flagged ? `+${sig.weight.toFixed(2)}` : `-${sig.weight.toFixed(2)}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <p className="text-[10px] text-[#77746C] mt-2.5 pt-2 border-t border-[#E0DED4] leading-relaxed">
          ✦ Illustrative demo data. Not a real investigation.
        </p>
      </div>
    </div>
  );
}
