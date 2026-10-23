import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import Header from '../components/Header';
import Button from '../components/Button';
import { demoInvestigations } from '../data/demoInvestigations';
import type { Investigation, RiskLevel } from '../types/investigation';

function RiskBadge({ level, label }: { level: RiskLevel; label: string }) {
  const styles: Record<RiskLevel, string> = {
    low: 'text-[#2e7d32] bg-[#f1f8f1] border border-[#c8e6c9]',
    medium: 'text-[#b5640c] bg-[#fdf3e7] border border-[#f5d5a0]',
    high: 'text-[#c5291e] bg-[#fef2f2] border border-[#fcc9c6]',
    unknown: 'text-[#6b6b6b] bg-[#f7f7f6] border border-[#e4e4e0]',
  };

  return (
    <span
      className={`text-[10px] font-semibold px-2 py-0.5 rounded-[2px] tracking-wide uppercase ${styles[level]}`}
    >
      {label}
    </span>
  );
}

export default function InvestigationsListPage() {
  const navigate = useNavigate();
  const [realInvestigations, setRealInvestigations] = useState<Investigation[]>([]);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('scamshield_real_investigations');
      if (stored) {
        setRealInvestigations(JSON.parse(stored));
      }
    } catch {
      // Ignore sessionStorage parsing errors
    }
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="max-w-[1200px] mx-auto px-6 lg:px-10 pt-5 pb-14 md:pt-6 md:pb-18 border-x border-[#e4e4e0] min-h-[calc(100vh-60px)]">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-[10px] font-medium tracking-[0.18em] uppercase text-[#9a9a9a] mb-2">
              All Records
            </p>
            <h1 className="font-serif text-[32px] md:text-[38px] leading-[1.1] tracking-[-0.02em] text-[#111110]">
              Investigations
            </h1>
          </div>
          <Button variant="primary" size="sm" onClick={() => navigate('/investigate')}>
            New investigation →
          </Button>
        </div>

        {/* Real Investigations Section (if any submitted during session) */}
        {realInvestigations.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck size={14} className="text-[#2e7d32]" />
              <h2 className="text-[12px] font-semibold uppercase tracking-wider text-[#111110]">
                Live ML Investigations (This Session)
              </h2>
            </div>
            <div className="flex flex-col border border-[#e4e4e0] rounded-[4px] overflow-hidden divide-y divide-[#e4e4e0] mb-8">
              {realInvestigations.map((inv) => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between gap-4 py-3.5 px-4 cursor-pointer group transition-colors hover:bg-[#fafaf9] bg-white"
                  onClick={() => navigate(`/investigations/${inv.id}`)}
                >
                  <div className="flex flex-col min-w-0">
                    <span className="text-[13px] font-medium text-[#111110] leading-tight truncate">
                      {inv.jobTitle}
                    </span>
                    <span className="text-[11px] text-[#767672] mt-0.5 truncate">
                      {inv.employer} · {inv.location}
                    </span>
                  </div>
                  <div className="hidden sm:block text-[11px] text-[#767672] flex-shrink-0">
                    {new Date(inv.submittedAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {inv.fraudProbability !== undefined && (
                      <span className="text-[11px] font-mono text-[#555552] hidden md:inline">
                        {(inv.fraudProbability * 100).toFixed(1)}% prob.
                      </span>
                    )}
                    <RiskBadge level={inv.riskLevel} label={inv.assessmentLabel} />
                    <ArrowRight
                      size={14}
                      className="text-[#d0d0cc] group-hover:text-[#6b6b6b] transition-colors"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Illustrative Demo Records */}
        <div>
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#e4e4e0]">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-[#767672]">
              Illustrative Sample Records
            </span>
            <span className="text-[11px] text-[#9a9a9a]">Demo benchmark scenarios</span>
          </div>

          <div className="flex flex-col">
            {demoInvestigations.map((inv, i) => (
              <div
                key={inv.id}
                className={`flex items-center justify-between gap-4 py-4 cursor-pointer group transition-colors hover:bg-[#f7f7f6] -mx-3 px-3 rounded-[3px] ${
                  i < demoInvestigations.length - 1 ? 'border-b border-[#e4e4e0]' : ''
                }`}
                onClick={() => navigate(`/investigations/${inv.id}`)}
              >
                <div className="flex flex-col min-w-0">
                  <span className="text-[13px] font-medium text-[#111110] leading-tight truncate">
                    {inv.jobTitle}
                  </span>
                  <span className="text-[11px] text-[#9a9a9a] mt-0.5 truncate">
                    {inv.employer} · {inv.location}
                  </span>
                </div>
                <div className="hidden sm:block text-[11px] text-[#9a9a9a] flex-shrink-0">
                  {new Date(inv.submittedAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <RiskBadge level={inv.riskLevel} label={inv.assessmentLabel} />
                  <ArrowRight
                    size={14}
                    className="text-[#d0d0cc] group-hover:text-[#6b6b6b] transition-colors"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
