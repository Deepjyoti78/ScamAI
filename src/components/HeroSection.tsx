import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Button from './Button';
import JobAnalysisMockup from './JobAnalysisMockup';

export default function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="w-full pt-4 pb-6 sm:pt-6 sm:pb-8 lg:pt-6 lg:pb-8 px-4 sm:px-6 lg:px-8 xl:px-10 overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,440px)_1fr] xl:grid-cols-[minmax(0,460px)_1fr] gap-6 lg:gap-8 xl:gap-10 items-center">

          {/* ── Left column ── */}
          <div className="flex flex-col">
            {/* Main headline — large editorial serif with sequential word reveal */}
            <h1
              className="font-serif leading-[1.05] tracking-[-0.025em] text-[#141413] mb-2"
              style={{ fontSize: 'clamp(36px, 5.2vw, 68px)' }}
            >
              <span className="block animate-text-reveal stagger-1">Know the</span>
              <span className="block animate-text-reveal stagger-2">opportunity.</span>
            </h1>

            {/* Tagline / Category moved directly below Opportunity with decreased text size */}
            <p className="flex items-center gap-2 text-[10px] sm:text-[9.5px] font-semibold tracking-[0.2em] uppercase text-[#77746C] my-2 animate-text-reveal stagger-3">
              <span>Recruitment Fraud Investigation</span>
              <span className="inline-block w-4 h-[1px] bg-[#77746C]/60" />
            </p>

            <p
              className="font-serif leading-[1.05] tracking-[-0.025em] text-[#77746C] font-normal mb-4 lg:mb-4.5 animate-text-reveal stagger-3"
              style={{ fontSize: 'clamp(36px, 5.2vw, 68px)' }}
            >
              Before you trust it.
            </p>

            {/* Supporting description */}
            <p className="text-[15px] sm:text-[15.5px] lg:text-[16px] text-[#625F58] leading-[1.6] max-w-[440px] mb-5 lg:mb-6 animate-text-reveal stagger-4">
              Analyse job postings, cross-check key details, and
              detect potential recruitment scams with clear,
              explainable AI.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto animate-card-entrance stagger-5">
              <button
                type="button"
                onClick={() => navigate('/investigate')}
                className="group relative inline-flex items-center justify-center gap-2.5 h-[48px] px-6 rounded-none bg-gradient-to-b from-[#262523] to-[#121211] text-[#FAF9F5] text-[15px] font-semibold tracking-[-0.01em] border border-[#3E3D38] shadow-[0_4px_16px_rgba(20,20,19,0.22),inset_0_1px_0_0_rgba(255,255,255,0.18)] hover:from-[#32312D] hover:to-[#171615] hover:border-[#4E4D47] hover:shadow-[0_8px_24px_rgba(20,20,19,0.32)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] transition-all duration-200 cursor-pointer select-none"
              >
                <span>Start an investigation</span>
                <ArrowRight
                  size={15}
                  strokeWidth={2.2}
                  className="text-[#FAF9F5]/90 transition-transform duration-200 group-hover:translate-x-1"
                />
              </button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => {
                  const el = document.getElementById('workflow');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full sm:w-auto justify-center h-[48px] px-5 text-[15px] font-medium border-[#D0CDC2] hover:bg-[#EFECE3] hover:-translate-y-0.5 active:translate-y-0 transition-all shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
              >
                How it works
              </Button>
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
