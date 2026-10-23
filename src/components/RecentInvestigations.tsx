import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { demoInvestigations } from '../data/demoInvestigations';
import type { RiskLevel } from '../types/investigation';

function RiskBadge({ level, label }: { level: RiskLevel; label: string }) {
  const styles: Record<RiskLevel, string> = {
    low: 'text-[#2e7d32] bg-[#f1f8f1] border border-[#c8e6c9]',
    medium: 'text-[#b5640c] bg-[#fdf3e7] border border-[#f5d5a0]',
    high: 'text-[#c5291e] bg-[#fef2f2] border border-[#fcc9c6]',
    unknown: 'text-[#6b6b6b] bg-[#f7f7f6] border border-[#e4e4e0]',
  };

  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-[2px] tracking-wide uppercase ${styles[level]}`}>
      {label}
    </span>
  );
}

export default function RecentInvestigations() {
  const navigate = useNavigate();

  return (
    <section className="w-full px-6 lg:px-10 py-14 md:py-16">
      {/* Header row */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-[20px] sm:text-[22px] font-semibold text-[#111110] tracking-tight">Recent investigations</h2>
          <p className="text-[12px] sm:text-[13px] text-[#767672] mt-0.5">Illustrative demo data — not real employer records</p>
        </div>
        <button
          className="text-[13px] font-medium text-[#555552] hover:text-[#111110] transition-colors flex items-center gap-1.5 cursor-pointer"
          onClick={() => navigate('/investigations')}
        >
          View all <ArrowRight size={13} />
        </button>
      </div>

      {/* Investigation rows */}
      <div className="flex flex-col">
        {demoInvestigations.map((inv, i) => (
          <div
            key={inv.id}
            className={`flex items-center justify-between gap-4 py-4 cursor-pointer group transition-colors hover:bg-[#f7f7f6] -mx-3 px-3 rounded-[4px] ${
              i < demoInvestigations.length - 1 ? 'border-b border-[#e4e4e0]' : ''
            }`}
            onClick={() => navigate(`/investigations/${inv.id}`)}
          >
            {/* Job info */}
            <div className="flex flex-col min-w-0">
              <span className="text-[14px] font-medium text-[#111110] leading-tight truncate">
                {inv.jobTitle}
              </span>
              <span className="text-[12px] text-[#767672] mt-0.5 truncate">{inv.employer}</span>
            </div>

            {/* Meta */}
            <div className="hidden sm:flex items-center gap-3 flex-shrink-0">
              <span className="text-[12px] text-[#767672]">{inv.location}</span>
            </div>

            {/* Right: badge + arrow */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <RiskBadge level={inv.riskLevel} label={inv.assessmentLabel} />
              <ArrowRight
                size={14}
                className="text-[#d0d0cc] group-hover:text-[#555552] transition-colors"
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
