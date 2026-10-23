import Header from '../components/Header';
import HeroSection from '../components/HeroSection';
import WorkflowSection from '../components/WorkflowSection';
import RecentInvestigations from '../components/RecentInvestigations';
import AboutSection from '../components/AboutSection';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#FAF9F5]">
      <Header />
      <main className="max-w-[1200px] mx-auto border-x border-[#E0DED4] bg-[#FAF9F5]">
        <HeroSection />
        <WorkflowSection />
        <RecentInvestigations />
        <AboutSection />
      </main>
      <footer className="border-t border-[#E0DED4] bg-[#FAF9F5]">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-10 border-x border-[#E0DED4] py-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <p className="text-[12px] text-[#77746C]">
            © 2026 ScamShield AI. All results are illustrative. Verify independently.
          </p>
          <div className="flex items-center gap-6">
            {['Privacy', 'Terms', 'Contact'].map((l) => (
              <a key={l} href="#" className="text-[12px] text-[#77746C] hover:text-[#141413] transition-colors">
                {l}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
