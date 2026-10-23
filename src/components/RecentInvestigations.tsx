import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, FileText, Sparkles } from 'lucide-react';
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
    unknown: 'text-[#625F58] bg-[#F0EEE6] border-[#E0DED4]',
  };

  const style = styles[level] || styles.unknown;

  return (
    <span
      className={`text-[9.5px] sm:text-[10px] font-bold px-2.5 py-0.5 rounded-none tracking-wider uppercase border text-center whitespace-nowrap min-w-[85px] sm:min-w-[95px] ${style}`}
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
    <section className="w-full px-6 lg:px-10 py-8 md:py-11 border-t border-[#E0DED4]">
      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2.5 mb-4 sm:mb-5">
        <div>
          <div className="flex flex-wrap items-baseline gap-2.5">
            <h2 className="text-[21px] sm:text-[24px] font-serif font-normal text-[#141413] tracking-tight leading-none">
              Recent investigations
            </h2>
            <span className="text-[12px] sm:text-[12.5px] text-[#77746C] font-sans font-normal">
              {displayList.length} sample cases
            </span>
            {hasRealRecord && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-none text-[10px] font-medium bg-[#f0fdf4] text-[#16a34a] border border-[#bbf7d0]">
                <span className="w-1.5 h-1.5 bg-[#16a34a]" />
                Live Session Active
              </span>
            )}
          </div>
          <p className="text-[12px] sm:text-[12.5px] text-[#625F58] font-sans mt-1">
            Illustrative demo data — not real employer records.
          </p>
        </div>

        <button
          className="inline-flex items-center gap-1 text-[13px] font-medium text-[#141413] hover:text-[#625F58] transition-colors cursor-pointer group self-start sm:self-auto"
          onClick={() => navigate('/investigations')}
        >
          View all
          <ArrowRight
            size={13}
            className="group-hover:translate-x-0.5 transition-transform"
          />
        </button>
      </div>

      {/* Card container with sharp, square edges and compact content */}
      <div className="border border-[#E0DED4] rounded-none bg-[#FAF9F5] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="divide-y divide-[#E0DED4]">
          {displayList.map((inv) => {
            const probability =
              typeof inv.fraudProbability === 'number'
                ? inv.fraudProbability
                : inv.riskLevel === 'high'
                ? 0.885
                : inv.riskLevel === 'medium'
                ? 0.542
                : 0.082;
            const probPct = (probability * 100).toFixed(1);

            return (
              <div
                key={inv.id}
                className="grid grid-cols-12 items-center px-4 sm:px-5 py-3 sm:py-3.5 gap-3 sm:gap-4 cursor-pointer group transition-colors duration-150 hover:bg-[#F0EEE6]"
                onClick={() => navigate(`/investigations/${inv.id}`)}
              >
                {/* Column 1: Document Icon + Job Title & Employer */}
                <div className="col-span-8 sm:col-span-6 flex items-center gap-3 min-w-0 pr-2">
                  <div className="w-8 h-8 rounded-none bg-[#FAF9F5] border border-[#E0DED4] flex items-center justify-center text-[#141413] shrink-0">
                    <FileText className="w-4 h-4 text-[#141413]" strokeWidth={1.5} />
                  </div>
                  <div className="min-w-0 flex flex-col justify-center">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[13.5px] sm:text-[14px] font-semibold text-[#141413] leading-snug group-hover:text-[#141413] transition-colors truncate">
                        {inv.jobTitle}
                      </span>
                      {inv.isRealAnalysis && (
                        <span className="inline-flex items-center gap-1 px-1 py-0.2 rounded-none text-[9px] font-mono uppercase bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                          <Sparkles size={8} />
                          Live ML
                        </span>
                      )}
                    </div>
                    <span className="text-[11.5px] sm:text-[12px] text-[#625F58] mt-0.5 truncate">
                      {inv.employer}
                    </span>
                    {/* Mobile-only percentage subtitle instead of location */}
                    <div className="sm:hidden flex items-center gap-1.5 text-[11px] text-[#625F58] mt-0.5">
                      <span className="font-mono font-medium text-[#141413]">
                        {probPct}%
                      </span>
                      <span className="text-[#77746C]">fraud prob.</span>
                    </div>
                  </div>
                </div>

                {/* Column 2: Percentage info instead of Location */}
                <div className="hidden sm:flex sm:col-span-3 items-center gap-2 text-[12.5px] text-[#625F58] font-normal truncate">
                  <span className="font-mono font-medium text-[#141413]">
                    {probPct}%
                  </span>
                  <span className="text-[12px] text-[#77746C] truncate">
                    fraud probability
                  </span>
                </div>

                {/* Column 3: Assessment Badge + Action Arrow */}
                <div className="col-span-4 sm:col-span-3 flex items-center justify-end gap-2.5 sm:gap-3.5 shrink-0">
                  <RiskBadge level={inv.riskLevel} label={inv.assessmentLabel} />
                  <ArrowRight
                    size={13}
                    className="text-[#77746C] group-hover:text-[#141413] group-hover:translate-x-0.5 transition-all shrink-0"
                    strokeWidth={1.75}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
