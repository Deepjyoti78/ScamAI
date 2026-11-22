import { useState, useMemo } from 'react';
import { AlertTriangle, CheckCircle2, BarChart3, HelpCircle } from 'lucide-react';
import type { EvidenceSignal } from '../types/investigation';

interface AttributionBarChartProps {
  signals: EvidenceSignal[];
  riskLevel: string;
}

export default function AttributionBarChart({ signals, riskLevel }: AttributionBarChartProps) {
  const [filter, setFilter] = useState<'all' | 'flagged' | 'clean'>('all');

  // Partition signals into warning (flagged) and clean (positive)
  const flagged = useMemo(() => signals.filter(s => s.flagged), [signals]);
  const clean = useMemo(() => signals.filter(s => !s.flagged), [signals]);

  // Determine signals to show based on active filter
  const displayedSignals = useMemo(() => {
    if (filter === 'flagged') return flagged;
    if (filter === 'clean') return clean;
    return signals;
  }, [filter, flagged, clean, signals]);

  // Calculate maximum impact/weight for relative scaling
  const maxVal = useMemo(() => {
    if (!signals.length) return 1;
    return Math.max(...signals.map(s => Math.abs(s.impact ?? s.weight ?? 0.1)), 0.1);
  }, [signals]);

  // Overall Trust vs Risk vocabulary ratio
  const totalWeight = useMemo(() => {
    const fWeight = flagged.reduce((acc, s) => acc + (Math.abs(s.impact ?? s.weight ?? 0.1)), 0);
    const cWeight = clean.reduce((acc, s) => acc + (Math.abs(s.impact ?? s.weight ?? 0.1)), 0);
    const total = fWeight + cWeight || 1;
    return {
      riskPct: Math.round((fWeight / total) * 100),
      trustPct: Math.round((cWeight / total) * 100),
    };
  }, [flagged, clean]);

  return (
    <div className="mb-8 border border-[#E0DED4] bg-[#FAF9F5] rounded-none p-5 sm:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] card-interactive">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-[#E0DED4]">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 size={16} className="text-[#141413]" />
            <h2 className="text-[14px] font-semibold text-[#141413] uppercase tracking-wider">
              Vocabulary Impact & Predictive Feature Chart
            </h2>
          </div>
          <p className="text-[12px] text-[#625F58] mt-0.5">
            Statistical contribution of terms to the ML model (Tier:{' '}
            <span className="capitalize font-medium text-[#141413]">{riskLevel}</span>).
          </p>
        </div>

        {/* Filter buttons */}
        <div className="inline-flex border border-[#E0DED4] p-0.5 bg-[#F0EEE6] rounded-none text-[11px] self-start sm:self-auto font-mono">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-2.5 py-1 transition-colors cursor-pointer ${
              filter === 'all' ? 'bg-[#141413] text-[#FAF9F5]' : 'text-[#625F58] hover:text-[#141413]'
            }`}
          >
            All Terms ({signals.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('flagged')}
            className={`px-2.5 py-1 transition-colors cursor-pointer ${
              filter === 'flagged' ? 'bg-[#dc2626] text-white' : 'text-[#625F58] hover:text-[#141413]'
            }`}
          >
            Risk ({flagged.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('clean')}
            className={`px-2.5 py-1 transition-colors cursor-pointer ${
              filter === 'clean' ? 'bg-[#16a34a] text-white' : 'text-[#625F58] hover:text-[#141413]'
            }`}
          >
            Trust ({clean.length})
          </button>
        </div>
      </div>

      {/* Visual Signal Balance Ratio Bar */}
      <div className="mb-5 p-3.5 bg-[#F0EEE6] border border-[#E0DED4] rounded-none">
        <div className="flex items-center justify-between text-[11px] font-mono mb-1.5">
          <span className="font-semibold text-[#16a34a] flex items-center gap-1">
            <CheckCircle2 size={12} /> {totalWeight.trustPct}% Legitimate Signals
          </span>
          <span className="font-semibold text-[#dc2626] flex items-center gap-1">
            <AlertTriangle size={12} /> {totalWeight.riskPct}% Risk Correlated Signals
          </span>
        </div>
        <div className="h-2 w-full bg-[#E0DED4] rounded-none overflow-hidden flex">
          <div
            className="h-full bg-[#16a34a] transition-all duration-1000"
            style={{ width: `${totalWeight.trustPct}%` }}
          />
          <div
            className="h-full bg-[#dc2626] transition-all duration-1000"
            style={{ width: `${totalWeight.riskPct}%` }}
          />
        </div>
      </div>

      {/* Bar Chart Rows */}
      {displayedSignals.length > 0 ? (
        <div className="space-y-3">
          {displayedSignals.map((sig) => {
            const rawVal = Math.abs(sig.impact ?? sig.weight ?? 0.1);
            const barWidthPct = Math.min(100, Math.max(12, Math.round((rawVal / maxVal) * 100)));
            const isRisk = sig.flagged;

            return (
              <div
                key={sig.id}
                className="group p-2.5 rounded-none border border-transparent hover:border-[#E0DED4] hover:bg-[#F0EEE6] transition-all"
              >
                {/* Term label & impact metric */}
                <div className="flex items-center justify-between gap-3 mb-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    {isRisk ? (
                      <AlertTriangle size={13} className="text-[#dc2626] flex-shrink-0" />
                    ) : (
                      <CheckCircle2 size={13} className="text-[#16a34a] flex-shrink-0" />
                    )}
                    <span className="text-[13px] font-semibold text-[#141413] tracking-tight truncate">
                      &ldquo;{sig.label}&rdquo;
                    </span>
                    <span className="text-[11px] text-[#77746C] hidden sm:inline truncate">
                      — {sig.description}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0 font-mono text-[11px]">
                    <span
                      className={`font-semibold px-2 py-0.5 rounded-none text-[10.5px] ${
                        isRisk
                          ? 'bg-[#fef2f2] text-[#dc2626] border border-[#fca5a5]'
                          : 'bg-[#f0fdf4] text-[#16a34a] border border-[#bbf7d0]'
                      }`}
                    >
                      {isRisk ? `+${rawVal.toFixed(2)} Risk` : `-${rawVal.toFixed(2)} Trust`}
                    </span>
                  </div>
                </div>

                {/* Animated Horizontal Bar */}
                <div className="h-2 w-full bg-[#E8E6DC] rounded-none overflow-hidden flex items-center">
                  <div
                    className={`h-full rounded-none transition-all duration-700 ease-out ${
                      isRisk ? 'bg-[#dc2626]' : 'bg-[#16a34a]'
                    }`}
                    style={{ width: `${barWidthPct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="p-6 text-center border border-dashed border-[#D7D4C9] bg-[#FAF9F5] rounded-none">
          <CheckCircle2 size={24} className="text-[#16a34a] mx-auto mb-2" />
          <p className="text-[13px] font-semibold text-[#141413]">
            No High-Risk Trigger Words Observed
          </p>
          <p className="text-[12px] text-[#625F58] mt-1 max-w-md mx-auto">
            This job listing does not contain terms historically associated with advance-fee scams, suspicious communication channels, or credential harvesting.
          </p>
        </div>
      )}

      {/* Attribution Explanation Note */}
      <div className="mt-4 pt-3 border-t border-[#E0DED4] flex items-center justify-between text-[11px] text-[#77746C]">
        <span className="flex items-center gap-1 font-mono">
          <HelpCircle size={11} /> Formula: Impact = TF-IDF Score × Logistic Regression Coefficient
        </span>
        <span className="hidden sm:inline font-mono">
          Model vocabulary: EMSCAD dataset
        </span>
      </div>
    </div>
  );
}
