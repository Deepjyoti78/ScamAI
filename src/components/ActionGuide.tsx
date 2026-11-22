import { ShieldAlert, CheckSquare, ExternalLink, KeyRound, DollarSign } from 'lucide-react';
import type { RiskLevel } from '../types/investigation';

interface ActionGuideProps {
  riskLevel: RiskLevel;
}

export default function ActionGuide({ riskLevel }: ActionGuideProps) {
  const steps = [
    {
      icon: <DollarSign size={16} className="text-[#141413]" />,
      title: 'Zero Upfront Payment Rule',
      desc: 'Authentic employers never ask applicants for training fees, background check deposits, or software purchase reimbursements.',
      action: 'Refuse any payment request immediately.',
      critical: true,
    },
    {
      icon: <KeyRound size={16} className="text-[#141413]" />,
      title: 'Verify Official Email Domain',
      desc: 'Check the sender address carefully. Genuine recruiters use company-owned email domains (@company.com), never public webmail.',
      action: 'Inspect full email headers for spoofing.',
      critical: false,
    },
    {
      icon: <ExternalLink size={16} className="text-[#141413]" />,
      title: 'Cross-Reference Official Careers Page',
      desc: 'Visit the company website directly (outside of this message) and check their open careers listings for this exact role.',
      action: 'Apply directly via the official company portal.',
      critical: false,
    },
    {
      icon: <CheckSquare size={16} className="text-[#141413]" />,
      title: 'Protect Identity & Banking Documents',
      desc: 'Never share bank account numbers, tax documents, passport scans, or passwords before an in-person or video interview is conducted.',
      action: 'Hold sensitive documents until verified.',
      critical: false,
    },
  ];

  return (
    <div className="mb-8 border border-[#E0DED4] bg-[#FAF9F5] rounded-none p-5 sm:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] card-interactive">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E0DED4]">
        <div className="flex items-center gap-2">
          <ShieldAlert size={16} className="text-[#141413]" />
          <h2 className="text-[14px] font-semibold text-[#141413] uppercase tracking-wider">
            Applicant Safety & Next Steps Guide
          </h2>
        </div>
        <span className="text-[11px] font-mono text-[#77746C] hidden sm:inline">
          {riskLevel === 'high' ? 'High Risk Immediate Protocol' : 'Standard Verification Protocol'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {steps.map((step, idx) => (
          <div
            key={idx}
            className="p-4 bg-[#F0EEE6] border border-[#E0DED4] rounded-none flex items-start gap-3 hover:border-[#77746C] transition-colors"
          >
            <div className="w-8 h-8 rounded-none border border-[#E0DED4] bg-[#FAF9F5] flex items-center justify-center flex-shrink-0 mt-0.5">
              {step.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-[13px] font-semibold text-[#141413] leading-snug mb-1">
                {step.title}
              </h3>
              <p className="text-[12px] text-[#625F58] leading-relaxed mb-2">
                {step.desc}
              </p>
              <div className="inline-flex items-center gap-1.5 text-[11px] font-mono font-medium text-[#141413] bg-[#FAF9F5] px-2 py-0.5 border border-[#E0DED4]">
                <span className="text-[#16a34a] font-bold">✓</span> {step.action}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
