import { Link } from 'react-router-dom';
import { Shield, Brain, Search, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';

const pillars = [
  {
    icon: <Brain className="w-4 h-4 text-[#141413]" strokeWidth={1.75} />,
    title: 'Calibrated ML Classifier',
    subtitle: 'EMSCAD Benchmark Model',
    description:
      'Trained on 17,880 real recruitment records with TF-IDF linguistic feature weighting, detecting high-risk phrase patterns, urgency cues, and compensation anomalies.',
  },
  {
    icon: <Lock className="w-4 h-4 text-[#141413]" strokeWidth={1.75} />,
    title: '7-Point Trust Chain',
    subtitle: 'Cross-Domain Audit',
    description:
      'Inspects alignment between claimed employers, recruiter email providers (flagging free domains like Gmail), advance fee demands, and credential collection forms.',
  },
  {
    icon: <Search className="w-4 h-4 text-[#141413]" strokeWidth={1.75} />,
    title: 'Live Web Research',
    subtitle: 'Tavily Search Engine',
    description:
      'Searches official company domains, corporate career portals, and leading ATS platforms (Workday, Greenhouse, Lever) to cross-reference vacancy authenticity.',
  },
  {
    icon: <Shield className="w-4 h-4 text-[#141413]" strokeWidth={1.75} />,
    title: 'Transparent Evidence',
    subtitle: 'Actionable Safety Dossiers',
    description:
      'Delivers transparent impact attributions, safety guidance, and direct employer verification paths—helping job seekers make confident, informed career decisions.',
  },
];

const stats = [
  { value: '17,880', label: 'Benchmark postings trained' },
  { value: '5 Stages', label: 'Automated verification pipeline' },
  { value: '7 Points', label: 'Trust Chain integrity checks' },
  { value: '100%', label: 'Verifiable evidence citations' },
];

export default function AboutSection() {
  return (
    <section id="about" className="w-full border-t border-[#E0DED4] px-6 lg:px-10 py-12 md:py-16 bg-[#FAF9F5]">
      {/* Section Header */}
      <div className="max-w-[760px] mb-10 md:mb-12">
        <span className="text-[11px] font-mono text-[#77746C] uppercase tracking-wider block mb-2 font-medium">
          About ScamShield AI
        </span>
        <h2 className="font-serif text-[28px] sm:text-[34px] md:text-[38px] font-normal tracking-[-0.01em] text-[#141413] leading-[1.15] mb-3.5">
          Empowering job seekers with verifiable AI recruitment defense
        </h2>
        <p className="text-[13px] sm:text-[14px] text-[#625F58] leading-relaxed">
          Recruitment fraud causes billions in losses each year through counterfeit interview portals, advance fee scams, and identity theft. ScamShield AI unites calibrated machine learning, cross-domain integrity audits, and real-time external web research to protect applicants before they share sensitive credentials or funds.
        </p>
      </div>

      {/* 4 Pillars Grid (Sharp Square Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {pillars.map((pillar, index) => (
          <div
            key={index}
            className="p-5 border border-[#E0DED4] bg-[#FAF9F5] rounded-none hover:border-[#141413] transition-all duration-200 flex flex-col justify-between group shadow-[0_1px_3px_rgba(0,0,0,0.02)]"
          >
            <div>
              <div className="w-8 h-8 rounded-none border border-[#E0DED4] bg-[#FAF9F5] flex items-center justify-center mb-4 group-hover:border-[#141413] transition-colors">
                {pillar.icon}
              </div>
              <span className="text-[10px] font-mono font-medium text-[#77746C] uppercase tracking-wider block mb-1">
                {pillar.subtitle}
              </span>
              <h3 className="text-[14px] font-semibold text-[#141413] tracking-tight mb-2">
                {pillar.title}
              </h3>
              <p className="text-[12px] text-[#625F58] leading-relaxed">
                {pillar.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Stats Strip (Sharp Square Boxes) */}
      <div className="border border-[#E0DED4] bg-[#FAF9F5] p-6 sm:p-7 rounded-none mb-10 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-4 divide-y sm:divide-y-0 sm:divide-x divide-[#E0DED4]">
          {stats.map((stat, i) => (
            <div key={i} className={`flex flex-col ${i > 0 ? 'pt-4 sm:pt-0 sm:pl-6' : ''}`}>
              <span className="font-serif text-[26px] sm:text-[30px] font-normal text-[#141413] leading-none mb-1.5">
                {stat.value}
              </span>
              <span className="text-[11px] font-mono text-[#77746C]">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA Box */}
      <div className="p-6 sm:p-8 border border-[#E0DED4] bg-[#FAF9F5] rounded-none flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <CheckCircle2 size={15} className="text-[#137333]" />
            <span className="text-[12px] font-semibold tracking-tight text-[#141413]">
              Free and open career protection
            </span>
          </div>
          <p className="text-[12px] sm:text-[13px] text-[#625F58]">
            Have a suspicious offer letter or job posting? Run an instant investigation in seconds.
          </p>
        </div>
        <Link
          to="/investigate"
          className="inline-flex items-center justify-center font-medium bg-[#141413] text-[#FAF9F5] hover:bg-[#30302D] active:bg-[#141413] px-5 py-2.5 text-[13px] rounded-none gap-2 transition-colors cursor-pointer shadow-sm whitespace-nowrap flex-shrink-0"
        >
          Investigate a job posting <ArrowRight size={14} />
        </Link>
      </div>
    </section>
  );
}
