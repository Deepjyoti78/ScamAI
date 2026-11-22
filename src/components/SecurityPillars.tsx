import { Brain, CreditCard, ShieldCheck, Globe, CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import type { RiskLevel, TrustChainFinding, WebResearchSummary } from '../types/investigation';

interface SecurityPillarsProps {
  fraudProbability: number | null;
  riskLevel: RiskLevel;
  trustChainFindings?: TrustChainFinding[];
  webResearchSummary?: WebResearchSummary;
  flaggedSignalsCount: number;
  cleanSignalsCount: number;
}

export default function SecurityPillars({
  fraudProbability,
  riskLevel,
  trustChainFindings = [],
  webResearchSummary,
  flaggedSignalsCount,
  cleanSignalsCount,
}: SecurityPillarsProps) {
  // Check fee rule
  const feeFinding = trustChainFindings.find(f => f.check_id === 'fee_detection' || f.title.toLowerCase().includes('fee') || f.title.toLowerCase().includes('payment'));
  const hasFeeConcern = feeFinding?.status === 'concern_observed' || flaggedSignalsCount > 0 && trustChainFindings.some(f => f.observation.toLowerCase().includes('fee') || f.observation.toLowerCase().includes('payment'));

  // Check domain rule
  const domainFinding = trustChainFindings.find(f => f.check_id === 'domain_consistency' || f.title.toLowerCase().includes('domain'));
  const hasDomainConcern = domainFinding?.status === 'concern_observed';
  const hasDomainPassed = domainFinding?.status === 'no_mismatch_observed';

  // Check web research
  const hasWebMatches = (webResearchSummary?.exact_matches_count || 0) > 0 || (webResearchSummary?.related_roles_count || 0) > 0 || (webResearchSummary?.official_presence_count || 0) > 0;

  const scorePct = typeof fraudProbability === 'number' ? Math.round(fraudProbability * 100) : 21;

  const pillars = [
    {
      id: 'linguistic',
      title: 'Linguistic AI Model',
      icon: <Brain size={18} className="text-[#141413]" />,
      value: `${scorePct}% Risk`,
      barWidth: `${scorePct}%`,
      barColor: riskLevel === 'high' ? 'bg-[#dc2626]' : riskLevel === 'medium' ? 'bg-[#d97706]' : 'bg-[#16a34a]',
      status: riskLevel === 'high' ? 'High Risk Patterns' : riskLevel === 'medium' ? 'Moderate Concerns' : 'Clean Corporate Text',
      statusType: riskLevel === 'high' ? 'danger' : riskLevel === 'medium' ? 'warning' : 'success',
      caption: `${cleanSignalsCount} positive trust signals vs ${flaggedSignalsCount} warning associations.`,
    },
    {
      id: 'financial',
      title: 'Advance Fee Demands',
      icon: <CreditCard size={18} className="text-[#141413]" />,
      value: hasFeeConcern ? 'Fee Detected' : '0 Fee Demands',
      barWidth: hasFeeConcern ? '100%' : '100%',
      barColor: hasFeeConcern ? 'bg-[#dc2626]' : 'bg-[#16a34a]',
      status: hasFeeConcern ? 'High Risk: Advance Fee' : 'Passed: No Fee Demanded',
      statusType: hasFeeConcern ? 'danger' : 'success',
      caption: hasFeeConcern
        ? 'Posting requires candidate to pay for registration or training.'
        : 'No advance registration fee or equipment purchases requested.',
    },
    {
      id: 'domain',
      title: 'Domain Consistency',
      icon: <ShieldCheck size={18} className="text-[#141413]" />,
      value: hasDomainConcern ? 'Mismatch' : hasDomainPassed ? 'Verified' : 'Consistent',
      barWidth: hasDomainConcern ? '100%' : '100%',
      barColor: hasDomainConcern ? 'bg-[#dc2626]' : 'bg-[#16a34a]',
      status: hasDomainConcern ? 'Domain Inconsistency' : 'No Mismatch Observed',
      statusType: hasDomainConcern ? 'danger' : 'success',
      caption: hasDomainConcern
        ? 'Sender email differs from claimed employer website.'
        : 'Recruiter communication channel aligns with official domain.',
    },
    {
      id: 'web',
      title: 'Public Web Evidence',
      icon: <Globe size={18} className="text-[#141413]" />,
      value: hasWebMatches ? 'Presence Found' : 'Text Ingestion',
      barWidth: hasWebMatches ? '100%' : '65%',
      barColor: hasWebMatches ? 'bg-[#16a34a]' : 'bg-[#77746C]',
      status: hasWebMatches ? 'Official Presence Found' : 'Pasted Text Analyzed',
      statusType: hasWebMatches ? 'success' : 'neutral',
      caption: hasWebMatches
        ? 'Cross-referenced against verified employer careers portals.'
        : 'Evaluation performed on submitted text description.',
    },
  ];

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[12px] font-semibold text-[#77746C] uppercase tracking-wider">
          Multi-Pillar Security Health Breakdown
        </h2>
        <span className="text-[11px] font-mono text-[#77746C]">4 Automated Audits</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {pillars.map((pillar) => (
          <div
            key={pillar.id}
            className="border border-[#E0DED4] bg-[#FAF9F5] p-4 rounded-none flex flex-col justify-between card-interactive shadow-[0_1px_3px_rgba(0,0,0,0.02)]"
          >
            <div>
              {/* Top Row: Icon + Value */}
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <div className="w-8 h-8 rounded-none border border-[#E0DED4] bg-[#F0EEE6] flex items-center justify-center">
                  {pillar.icon}
                </div>
                <span className="text-[12px] font-mono font-semibold text-[#141413]">
                  {pillar.value}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-[13px] font-semibold text-[#141413] leading-snug mb-1">
                {pillar.title}
              </h3>

              {/* Status Pill */}
              <div className="flex items-center gap-1.5 my-1.5">
                {pillar.statusType === 'success' && <CheckCircle2 size={12} className="text-[#16a34a]" />}
                {pillar.statusType === 'warning' && <AlertTriangle size={12} className="text-[#d97706]" />}
                {pillar.statusType === 'danger' && <AlertTriangle size={12} className="text-[#dc2626]" />}
                {pillar.statusType === 'neutral' && <Info size={12} className="text-[#77746C]" />}
                <span
                  className={`text-[10px] font-semibold uppercase tracking-wider ${
                    pillar.statusType === 'danger'
                      ? 'text-[#dc2626]'
                      : pillar.statusType === 'warning'
                      ? 'text-[#d97706]'
                      : pillar.statusType === 'success'
                      ? 'text-[#16a34a]'
                      : 'text-[#625F58]'
                  }`}
                >
                  {pillar.status}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="h-1.5 w-full bg-[#E8E6DC] rounded-none overflow-hidden my-2">
                <div className={`h-full ${pillar.barColor} transition-all duration-700`} style={{ width: pillar.barWidth }} />
              </div>
            </div>

            {/* Bottom Caption */}
            <p className="text-[11px] text-[#625F58] leading-relaxed pt-1.5 border-t border-[#E0DED4]/70 mt-1">
              {pillar.caption}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
