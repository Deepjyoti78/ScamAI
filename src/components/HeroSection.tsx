import { useNavigate } from 'react-router-dom';
import { ArrowRight, Layers, BarChart3, Shield } from 'lucide-react';
import Button from './Button';
import JobAnalysisMockup from './JobAnalysisMockup';

export default function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="w-full pt-4 pb-6 sm:pt-6 sm:pb-8 lg:pt-6 lg:pb-8 px-4 sm:px-6 lg:px-8 xl:px-10 overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,440px)_1fr] xl:grid-cols-[minmax(0,470px)_1fr] gap-6 lg:gap-8 xl:gap-10 items-start">

          {/* ── Left column ── */}
          <div className="flex flex-col pt-16 sm:pt-20 lg:pt-36 xl:pt-40">
            {/* Eyebrow with red left dash and right dividing rule */}
            <div className="flex items-center gap-2.5 mb-4 lg:mb-5 animate-text-reveal stagger-1">
              <span className="w-5 h-[2px] bg-[#DC2626] flex-shrink-0" />
              <span className="text-[11px] sm:text-[11.5px] font-mono uppercase tracking-[0.18em] text-[#77746C] font-semibold">
                Recruitment Fraud Investigation
              </span>
              <span className="w-8 sm:w-12 h-[1px] bg-[#E0DED4] flex-shrink-0" />
            </div>

            {/* Main headline matching reference image layout */}
            <h1
              className="font-serif leading-[1.08] tracking-[-0.025em] mb-4 lg:mb-5"
              style={{ fontSize: 'clamp(36px, 5.2vw, 62px)' }}
            >
              <span className="block text-[#141413] animate-text-reveal stagger-2">
                Scams evolve every day.
              </span>
              <span className="block text-[#7F1D1D] animate-text-reveal stagger-3">
                So does our defense.
              </span>
            </h1>

            {/* Supporting description matching exact copy */}
            <p className="text-[14px] sm:text-[14.5px] lg:text-[15px] text-[#55524B] leading-[1.6] max-w-[440px] mb-8 sm:mb-10 lg:mb-12 animate-text-reveal stagger-4">
              Spot, verify, and avoid recruitment fraud before you share your details or commit to an opportunity.
            </p>

            {/* CTA buttons — positioned lower downward as requested */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-8 sm:mb-9 lg:mb-10 w-full sm:w-auto animate-card-entrance stagger-5">
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

            {/* Value propositions — 3 items with icons matching reference layout */}
            <div className="flex flex-wrap items-center gap-6 sm:gap-8 pt-3 sm:pt-4 animate-card-entrance stagger-6">
              <div className="flex items-center gap-2.5">
                <Layers className="w-4 h-4 text-[#77746C] flex-shrink-0" strokeWidth={1.6} />
                <div className="flex flex-col">
                  <span className="text-[13px] font-bold text-[#141413] leading-tight">4+</span>
                  <span className="text-[11px] text-[#77746C] leading-snug">Evidence sources</span>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <BarChart3 className="w-4 h-4 text-[#77746C] flex-shrink-0" strokeWidth={1.6} />
                <div className="flex flex-col">
                  <span className="text-[13px] font-bold text-[#141413] leading-tight">Explainable</span>
                  <span className="text-[11px] text-[#77746C] leading-snug">AI insights</span>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <Shield className="w-4 h-4 text-[#77746C] flex-shrink-0" strokeWidth={1.6} />
                <div className="flex flex-col">
                  <span className="text-[13px] font-bold text-[#141413] leading-tight">Safer</span>
                  <span className="text-[11px] text-[#77746C] leading-snug">Decisions</span>
                </div>
              </div>
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
