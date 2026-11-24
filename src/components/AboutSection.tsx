import { Link } from 'react-router-dom';
import { Shield, Brain, Search, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';

const pillars = [
  {
    icon: <Brain className="w-4 h-4 text-[#141413]" strokeWidth={1.75} />,
    title: 'Historical ML Classifier',
    subtitle: 'EMSCAD Benchmark Model',
    description:
      'Uses a saved TF-IDF and Logistic Regression model developed on historical EMSCAD postings. Its score is uncalibrated and does not establish whether a current offer is genuine.',
  },
  {
    icon: <Lock className="w-4 h-4 text-[#141413]" strokeWidth={1.75} />,
    title: 'Five Trust Chain Checks',
    subtitle: 'Text and Supplied Domains',
    description:
      'Inspects fee demands, credential requests, supplied recruiter and application domains, and missing metadata. These observations do not authenticate an employer.',
  },
  {
    icon: <Search className="w-4 h-4 text-[#141413]" strokeWidth={1.75} />,
    title: 'Optional Web Research',
    subtitle: 'Provider Configuration Required',
    description:
      'Optional search requires a configured backend provider. The controlled local demo performs no external employer search; missing search evidence is shown explicitly.',
  },
  {
    icon: <Shield className="w-4 h-4 text-[#141413]" strokeWidth={1.75} />,
    title: 'Transparent Evidence',
    subtitle: 'Actionable Safety Dossiers',
    description:
      'Shows model feature contributions, separate rule observations and unavailable checks so users can decide what to investigate independently.',
  },
];

const stats = [
  { value: '17,880', label: 'Historical corpus postings' },
  { value: '5 Stages', label: 'Investigation workflow' },
  { value: '5 Checks', label: 'Trust Chain observations' },
  { value: 'Local Demo', label: 'Pasted-text analysis' },
];

export default function AboutSection() {
  return (
    <section id="about" className="w-full border-t border-[#E0DED4] px-4 sm:px-6 lg:px-10 py-10 sm:py-12 md:py-16 bg-[#FAF9F5]">
      {/* Section Header */}
      <div className="max-w-[1020px] mb-8 sm:mb-10 md:mb-12 animate-text-reveal">
        <span className="text-[11.5px] sm:text-[11px] font-mono text-[#77746C] uppercase tracking-wider block mb-2 font-medium">
          About ScamShield AI
        </span>
        <h2 className="font-serif text-[26px] sm:text-[34px] md:text-[38px] font-normal tracking-[-0.01em] text-[#141413] leading-[1.15] mb-3.5">
          Explainable text analysis for recruitment review
        </h2>
        <p className="text-[14px] sm:text-[14px] text-[#625F58] leading-relaxed max-w-[760px]">
          ScamShield AI combines a historical text classifier with separate fee, credential and supplied-domain checks. Review its uncalibrated model score, operational tier and evidence limitations together. A Legitimate classifier prediction does not guarantee safety, and employer identity is not independently verified by the local demo.
        </p>
      </div>

      {/* 4 Pillars Grid (Warm Porcelain Product Designer Style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 sm:mb-10">
        {pillars.map((pillar, index) => (
          <div
            key={index}
            className={`p-5 border border-[#E2DFD7] bg-[#FAF9F6] rounded-none relative overflow-hidden flex flex-col justify-between group shadow-[0_8px_24px_-4px_rgba(20,20,19,0.06),0_2px_6px_-1px_rgba(20,20,19,0.02),inset_0_1px_0_0_#FFFFFF] animate-card-entrance ${
              index === 0 ? 'stagger-1' : index === 1 ? 'stagger-2' : index === 2 ? 'stagger-3' : 'stagger-4'
            }`}
          >
            {/* Top specular hairline */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-white pointer-events-none z-10 shadow-[0_1px_2px_rgba(255,255,255,0.9)]" />
            <div>
              <div className="w-9 h-9 sm:w-8 sm:h-8 rounded-none border border-[#E2DFD7] bg-[#F5F4EE] flex items-center justify-center mb-4 group-hover:border-[#141413] group-hover:scale-105 transition-all">
                {pillar.icon}
              </div>
              <span className="text-[11px] sm:text-[10px] font-mono font-medium text-[#77746C] uppercase tracking-wider block mb-1">
                {pillar.subtitle}
              </span>
              <h3 className="text-[15px] sm:text-[14px] font-semibold text-[#141413] tracking-tight mb-2">
                {pillar.title}
              </h3>
              <p className="text-[13px] sm:text-[12px] text-[#625F58] leading-relaxed">
                {pillar.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Stats Strip (Sharp Square Boxes) */}
      <div className="border border-[#E0DED4] bg-[#FAF9F5] p-5 sm:p-7 rounded-none mb-8 sm:mb-10 shadow-[0_1px_3px_rgba(0,0,0,0.02)] animate-card-entrance stagger-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 sm:gap-4">
          {stats.map((stat, i) => (
            <div key={i} className={`flex flex-col transition-transform duration-200 hover:-translate-y-0.5 ${i > 0 ? 'sm:border-l sm:border-[#E0DED4] sm:pl-6' : ''}`}>
              <span className="font-serif text-[28px] sm:text-[30px] font-normal text-[#141413] leading-none mb-1.5">
                {stat.value}
              </span>
              <span className="text-[12px] sm:text-[11px] font-mono text-[#77746C]">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA Box */}
      <div className="relative overflow-hidden p-5 sm:p-8 border border-[#E2DFD7] bg-[#FAF9F6] rounded-none flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 animate-card-entrance stagger-5 shadow-[0_8px_26px_-4px_rgba(20,20,19,0.06),0_2px_6px_-1px_rgba(20,20,19,0.03),inset_0_1px_0_0_#FFFFFF]">
        {/* Specular hairline at top edge */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-white pointer-events-none z-10 shadow-[0_1px_2px_rgba(255,255,255,0.9)]" />
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <CheckCircle2 size={16} className="text-[#141413]" strokeWidth={2} />
            <span className="text-[13.5px] sm:text-[12px] font-semibold tracking-tight text-[#141413]">
              Free and open career protection
            </span>
          </div>
          <p className="text-[13px] sm:text-[13px] text-[#625F58]">
            Have a suspicious offer letter or job posting? Run an instant investigation in seconds.
          </p>
        </div>
        <Link
          to="/investigate"
          className="w-full sm:w-auto inline-flex items-center justify-center font-medium bg-[#141413] text-[#FAF9F5] hover:bg-[#30302D] active:bg-[#141413] px-5 py-3 sm:py-2.5 text-[14px] sm:text-[13px] rounded-none gap-2 transition-all cursor-pointer shadow-sm hover:shadow-[0_4px_16px_rgba(20,20,19,0.2)] hover:-translate-y-0.5 whitespace-nowrap flex-shrink-0"
        >
          Investigate a job posting <ArrowRight size={14} />
        </Link>
      </div>
    </section>
  );
}
