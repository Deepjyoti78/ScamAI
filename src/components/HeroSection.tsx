import { useNavigate } from 'react-router-dom';
import Button from './Button';
import JobAnalysisMockup from './JobAnalysisMockup';

export default function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="w-full pt-8 pb-10 sm:pt-10 sm:pb-12 md:pt-12 md:pb-14 lg:pt-13 lg:pb-16 px-4 sm:px-6 lg:px-10">
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] gap-8 lg:gap-12 xl:gap-14 items-start">

          {/* ── Left column ── */}
          <div className="flex flex-col">
            {/* Eyebrow */}
            <p className="text-[12px] sm:text-[11px] font-medium tracking-[0.16em] uppercase text-[#77746C] mb-3 lg:mb-3.5 animate-text-reveal stagger-1">
              Recruitment Fraud Investigation
            </p>

            {/* Main headline — large editorial serif with sequential word reveal */}
            <h1
              className="font-serif leading-[1.05] tracking-[-0.025em] text-[#141413] mb-4 lg:mb-4.5"
              style={{ fontSize: 'clamp(38px, 5.5vw, 70px)' }}
            >
              <span className="block animate-text-reveal stagger-2">Know the</span>
              <span className="block animate-text-reveal stagger-3">opportunity.</span>
              <span className="block text-[#77746C] font-normal animate-text-reveal stagger-4">Before you trust it.</span>
            </h1>

            {/* Supporting description */}
            <p className="text-[15.5px] sm:text-[16px] lg:text-[17px] text-[#625F58] leading-[1.6] max-w-[440px] mb-6 lg:mb-7 animate-text-reveal stagger-4">
              Analyse job postings, cross-check key details, and
              detect potential recruitment scams with clear,
              explainable insights.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-7 lg:mb-8 w-full sm:w-auto animate-card-entrance stagger-5">
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate('/investigate')}
                className="w-full sm:w-auto justify-center h-[46px] text-[15px] sm:text-[14px] hover:shadow-[0_4px_16px_rgba(20,20,19,0.2)] hover:-translate-y-0.5 transition-all"
              >
                Start an investigation →
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => {
                  const el = document.getElementById('workflow');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full sm:w-auto justify-center h-[46px] text-[15px] sm:text-[14px] hover:-translate-y-0.5 transition-all"
              >
                How it works
              </Button>
            </div>

            {/* Value propositions — clean 3-column grid with clear readable mobile text */}
            <div className="grid grid-cols-3 divide-x divide-[#E0DED4] w-full max-w-[480px] animate-card-entrance stagger-6">
              {[
                { stat: '4+', label: 'Evidence sources' },
                { stat: 'Explainable', label: 'AI insights' },
                { stat: 'Safer', label: 'Decisions' },
              ].map((item, i) => (
                <div
                  key={item.stat}
                  className={`flex flex-col ${i === 0 ? 'pr-3 sm:pr-5' : i === 2 ? 'pl-3 sm:pl-5' : 'px-3 sm:px-5'} py-1 transition-transform duration-200 hover:-translate-y-0.5`}
                >
                  <span className="text-[14px] sm:text-[13px] font-semibold text-[#141413] leading-tight truncate">{item.stat}</span>
                  <span className="text-[12px] sm:text-[11px] text-[#77746C] leading-snug mt-0.5">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right column — job mockup ── */}
          <div className="lg:pt-2 w-full">
            <JobAnalysisMockup />
          </div>
        </div>
    </section>
  );
}
