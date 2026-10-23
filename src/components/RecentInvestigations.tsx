import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, MapPin, Clock, Sparkles } from 'lucide-react';
import { demoInvestigations } from '../data/demoInvestigations';
import type { Investigation, RiskLevel } from '../types/investigation';

function RiskBadge({ level, label }: { level: RiskLevel; label: string }) {
  const styles: Record<RiskLevel, { badge: string; dot: string }> = {
    low: {
      badge: 'text-[#2e7d32] bg-[#f1f8f1] border-[#c8e6c9]',
      dot: 'bg-[#2e7d32]',
    },
    medium: {
      badge: 'text-[#b5640c] bg-[#fdf3e7] border-[#f5d5a0]',
      dot: 'bg-[#b5640c]',
    },
    high: {
      badge: 'text-[#c5291e] bg-[#fef2f2] border-[#fcc9c6]',
      dot: 'bg-[#c5291e]',
    },
    unknown: {
      badge: 'text-[#6b6b6b] bg-[#f7f7f6] border-[#e4e4e0]',
      dot: 'bg-[#9a9a9a]',
    },
  };

  const style = styles[level] || styles.unknown;

  return (
    <span
      className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-[3px] tracking-wider uppercase border inline-flex items-center gap-1.5 flex-shrink-0 ${style.badge}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      {label}
    </span>
  );
}

export default function RecentInvestigations() {
  const navigate = useNavigate();
  const [displayList, setDisplayList] = useState<Investigation[]>(demoInvestigations.slice(0, 4));
  const [hasRealRecord, setHasRealRecord] = useState(false);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('scamshield_real_investigations');
      if (stored) {
        const real: Investigation[] = JSON.parse(stored);
        if (real.length > 0) {
          setHasRealRecord(true);
          // Combine live investigations with demo records, max 4 total
          const remainingDemo = demoInvestigations.filter(
            (demo) => !real.some((r) => r.id === demo.id)
          );
          setDisplayList([...real.slice(0, 3), ...remainingDemo].slice(0, 4));
        }
      }
    } catch {
      // Fallback to initial demo records
    }
  }, []);

  return (
    <section className="w-full px-6 lg:px-10 py-14 md:py-16 border-t border-[#e4e4e0]">
      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-7">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#767672]">
              Case Records
            </span>
            {hasRealRecord && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[3px] text-[10px] font-medium bg-[#f1f8f1] text-[#2e7d32] border border-[#c8e6c9]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2e7d32]" />
                Live Session Active
              </span>
            )}
          </div>
          <h2 className="text-[20px] sm:text-[22px] font-semibold text-[#111110] tracking-tight">
            Recent investigations
          </h2>
          <p className="text-[12px] sm:text-[13px] text-[#767672] mt-0.5">
            Verified benchmark scenarios and live fraud risk assessments
          </p>
        </div>

        <button
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#555552] hover:text-[#111110] transition-colors cursor-pointer group self-start sm:self-auto"
          onClick={() => navigate('/investigations')}
        >
          View all records
          <ArrowRight
            size={13}
            className="group-hover:translate-x-0.5 transition-transform"
          />
        </button>
      </div>

      {/* Structured investigations table card */}
      <div className="border border-[#e4e4e0] rounded-[6px] bg-white overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        {/* Table column headers (strictly aligned) */}
        <div className="hidden sm:grid grid-cols-12 items-center gap-4 px-4 py-2.5 bg-[#fafaf9] border-b border-[#e4e4e0] text-[11px] font-semibold tracking-[0.06em] uppercase text-[#767672]">
          <div className="sm:col-span-5 md:col-span-5">Role & Employer</div>
          <div className="sm:col-span-3 md:col-span-3">Location</div>
          <div className="hidden md:block md:col-span-2">Date</div>
          <div className="sm:col-span-4 md:col-span-2 text-right">Assessment</div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-[#e4e4e0]">
          {displayList.map((inv) => (
            <div
              key={inv.id}
              className="grid grid-cols-12 items-center gap-3 sm:gap-4 py-3.5 px-4 cursor-pointer group transition-colors duration-150 hover:bg-[#fafaf9]"
              onClick={() => navigate(`/investigations/${inv.id}`)}
            >
              {/* Column 1: Role & Employer */}
              <div className="col-span-8 sm:col-span-5 md:col-span-5 flex flex-col min-w-0 pr-2">
                <div className="flex items-center gap-2">
                  <span className="text-[13.5px] font-medium text-[#111110] leading-tight truncate group-hover:text-black transition-colors">
                    {inv.jobTitle}
                  </span>
                  {inv.isRealAnalysis && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-[2px] text-[9.5px] font-mono uppercase bg-[#e8f0fe] text-[#1a73e8] border border-[#d2e3fc] flex-shrink-0">
                      <Sparkles size={9} />
                      Live ML
                    </span>
                  )}
                </div>
                {/* Desktop subtitle */}
                <span className="hidden sm:block text-[12px] text-[#767672] mt-0.5 truncate">
                  {inv.employer}
                </span>
                {/* Mobile combined subtitle */}
                <span className="sm:hidden text-[11.5px] text-[#767672] mt-0.5 truncate">
                  {inv.employer} · {inv.location || 'Remote'}
                </span>
              </div>

              {/* Column 2: Location (Strictly locked to column 2 on sm and above) */}
              <div className="hidden sm:flex sm:col-span-3 md:col-span-3 items-center gap-1.5 text-[12px] text-[#555552] truncate">
                <MapPin size={13} className="text-[#9a9a9a] flex-shrink-0" />
                <span className="truncate">{inv.location || 'Remote'}</span>
              </div>

              {/* Column 3: Date Analyzed */}
              <div className="hidden md:flex md:col-span-2 items-center gap-1.5 text-[11.5px] text-[#767672]">
                <Clock size={12} className="text-[#a0a09c] flex-shrink-0" />
                <span>
                  {new Date(inv.submittedAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>

              {/* Column 4: Assessment Badge + Action Arrow */}
              <div className="col-span-4 sm:col-span-4 md:col-span-2 flex items-center justify-end gap-2.5 sm:gap-3 flex-shrink-0">
                <RiskBadge level={inv.riskLevel} label={inv.assessmentLabel} />
                <ArrowRight
                  size={14}
                  className="text-[#c5c5c1] group-hover:text-[#111110] group-hover:translate-x-0.5 transition-all flex-shrink-0"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
