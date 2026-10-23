import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, MapPin, FileText, Sparkles } from 'lucide-react';
import { demoInvestigations } from '../data/demoInvestigations';
import type { Investigation, RiskLevel } from '../types/investigation';

function RiskBadge({ level, label }: { level: RiskLevel; label: string }) {
  // Normalize badge text to match reference image conventions (LOWER RISK, SUSPICIOUS, NEEDS REVIEW)
  let text = label.toUpperCase();
  if (level === 'low' && !text.includes('RISK')) text = 'LOWER RISK';
  if (level === 'high' && !text.includes('SUSPICIOUS')) text = 'SUSPICIOUS';
  if (level === 'medium' && !text.includes('REVIEW')) text = 'NEEDS REVIEW';

  const styles: Record<RiskLevel, string> = {
    low: 'text-[#16a34a] bg-[#f0fdf4] border-[#86efac]',
    medium: 'text-[#d97706] bg-[#fffbeb] border-[#fed7aa]',
    high: 'text-[#dc2626] bg-[#fef2f2] border-[#fca5a5]',
    unknown: 'text-neutral-600 bg-neutral-50 border-neutral-200',
  };

  const style = styles[level] || styles.unknown;

  return (
    <span
      className={`text-[11px] font-bold px-3.5 py-1 rounded-lg tracking-wider uppercase border text-center whitespace-nowrap min-w-[105px] sm:min-w-[115px] ${style}`}
    >
      {text}
    </span>
  );
}

export default function RecentInvestigations() {
  const navigate = useNavigate();
  const [displayList, setDisplayList] = useState<Investigation[]>(demoInvestigations.slice(0, 3));
  const [hasRealRecord, setHasRealRecord] = useState(false);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('scamshield_real_investigations');
      if (stored) {
        const real: Investigation[] = JSON.parse(stored);
        if (real.length > 0) {
          setHasRealRecord(true);
          // Combine live investigations with demo records, max 3 total
          const remainingDemo = demoInvestigations.filter(
            (demo) => !real.some((r) => r.id === demo.id)
          );
          setDisplayList([...real.slice(0, 3), ...remainingDemo].slice(0, 3));
        }
      }
    } catch {
      // Fallback to initial demo records
    }
  }, []);

  return (
    <section className="w-full px-6 lg:px-10 py-12 md:py-16 border-t border-[#e4e4e0]">
      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 mb-6">
        <div>
          <div className="flex flex-wrap items-baseline gap-2.5 sm:gap-3">
            <h2 className="text-[28px] sm:text-[34px] font-serif font-normal text-neutral-900 tracking-tight leading-none">
              Recent investigations
            </h2>
            <span className="text-[13px] sm:text-[14px] text-neutral-500 font-sans font-normal">
              {displayList.length} sample cases
            </span>
            {hasRealRecord && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-[#f0fdf4] text-[#16a34a] border border-[#bbf7d0]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a]" />
                Live Session Active
              </span>
            )}
          </div>
          <p className="text-[13px] sm:text-[14px] text-neutral-500 font-sans mt-2">
            Illustrative demo data — not real employer records.
          </p>
        </div>

        <button
          className="inline-flex items-center gap-1.5 text-[14px] font-medium text-neutral-900 hover:text-neutral-600 transition-colors cursor-pointer group self-start sm:self-auto"
          onClick={() => navigate('/investigations')}
        >
          View all
          <ArrowRight
            size={14}
            className="group-hover:translate-x-0.5 transition-transform"
          />
        </button>
      </div>

      {/* Card container matching reference design */}
      <div className="border border-neutral-200/90 rounded-2xl bg-white overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
        <div className="divide-y divide-neutral-100">
          {displayList.map((inv) => (
            <div
              key={inv.id}
              className="grid grid-cols-12 items-center px-5 sm:px-7 py-4.5 sm:py-5 gap-3 sm:gap-4 cursor-pointer group transition-colors duration-150 hover:bg-neutral-50/60"
              onClick={() => navigate(`/investigations/${inv.id}`)}
            >
              {/* Column 1: Document Icon + Job Title & Employer */}
              <div className="col-span-8 sm:col-span-6 flex items-center gap-3.5 sm:gap-4 min-w-0 pr-2">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white border border-neutral-200/90 shadow-[0_1px_2px_rgba(0,0,0,0.03)] flex items-center justify-center text-neutral-700 shrink-0">
                  <FileText className="w-5 h-5 text-neutral-700" strokeWidth={1.5} />
                </div>
                <div className="min-w-0 flex flex-col justify-center">
                  <div className="flex items-center gap-2">
                    <span className="text-[15px] sm:text-[16px] font-semibold text-neutral-900 leading-snug group-hover:text-black transition-colors truncate">
                      {inv.jobTitle}
                    </span>
                    {inv.isRealAnalysis && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono uppercase bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                        <Sparkles size={10} />
                        Live ML
                      </span>
                    )}
                  </div>
                  <span className="text-[13px] text-neutral-500 mt-0.5 truncate">
                    {inv.employer}
                  </span>
                  {/* Mobile-only location subtitle */}
                  <div className="sm:hidden flex items-center gap-1.5 text-[12px] text-neutral-500 mt-1">
                    <MapPin size={12} className="text-neutral-400 shrink-0" />
                    <span className="truncate">{inv.location || 'Remote'}</span>
                  </div>
                </div>
              </div>

              {/* Column 2: Location (Desktop column aligned) */}
              <div className="hidden sm:flex sm:col-span-3 items-center gap-2 text-[13.5px] text-neutral-600 font-normal truncate">
                <MapPin size={15} className="text-neutral-400 shrink-0" strokeWidth={1.75} />
                <span className="truncate">{inv.location || 'Remote'}</span>
              </div>

              {/* Column 3: Assessment Badge + Action Arrow */}
              <div className="col-span-4 sm:col-span-3 flex items-center justify-end gap-3 sm:gap-4 shrink-0">
                <RiskBadge level={inv.riskLevel} label={inv.assessmentLabel} />
                <ArrowRight
                  size={16}
                  className="text-neutral-400 group-hover:text-neutral-900 group-hover:translate-x-0.5 transition-all shrink-0"
                  strokeWidth={1.75}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
