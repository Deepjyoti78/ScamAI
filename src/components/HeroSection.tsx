import { useNavigate } from 'react-router-dom';
import Button from './Button';
import JobAnalysisMockup from './JobAnalysisMockup';

export default function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="w-full pt-10 pb-12 md:pt-12 md:pb-14 lg:pt-13 lg:pb-16 px-6 lg:px-10">
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] gap-8 lg:gap-12 xl:gap-14 items-start">

          {/* ── Left column ── */}
          <div className="flex flex-col">
            {/* Eyebrow */}
            <p className="text-[11px] font-medium tracking-[0.18em] uppercase text-[#767672] mb-3 lg:mb-3.5">
              Recruitment Fraud Investigation
            </p>

            {/* Main headline — large editorial serif */}
            <h1
              className="font-serif leading-[1.03] tracking-[-0.025em] text-[#111110] mb-4 lg:mb-4.5"
              style={{ fontSize: 'clamp(42px, 5vw, 70px)' }}
            >
              Know the
              <br />
              opportunity.
              <br />
              <span className="text-[#888884] font-normal">Before you trust it.</span>
            </h1>

            {/* Supporting description */}
            <p className="text-[15px] lg:text-[17px] text-[#555552] leading-[1.6] max-w-[420px] mb-6 lg:mb-7">
              Analyse job postings, cross-check key details, and
              detect potential recruitment scams with clear,
              explainable insights.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-wrap items-center gap-3 mb-7 lg:mb-8">
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate('/investigate')}
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
              >
                How it works
              </Button>
            </div>

            {/* Value propositions — simple horizontal groups with vertical dividers, no outer border or card backgrounds */}
            <div className="flex items-center divide-x divide-[#e4e4e0] w-full sm:w-fit max-w-[440px]">
              {[
                { stat: '4+', label: 'Evidence sources analysed' },
                { stat: 'Explainable', label: 'AI-powered insights' },
                { stat: 'Safer', label: 'Career decisions' },
              ].map((item, i) => (
                <div
                  key={item.stat}
                  className={`flex flex-col ${i === 0 ? 'pr-4 sm:pr-5' : i === 2 ? 'pl-4 sm:pl-5' : 'px-4 sm:px-5'} py-1`}
                >
                  <span className="text-[13px] font-semibold text-[#111110] leading-tight truncate">{item.stat}</span>
                  <span className="text-[11px] text-[#767672] leading-snug mt-0.5">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right column — job mockup ── */}
          <div className="lg:pt-2">
            <JobAnalysisMockup />
          </div>
        </div>
    </section>
  );
}
