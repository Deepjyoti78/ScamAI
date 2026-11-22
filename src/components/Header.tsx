import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Menu, X } from 'lucide-react';
import Button from './Button';
import { checkApiHealth } from '../services/investigationService';

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [apiConnected, setApiConnected] = useState<boolean | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    checkApiHealth().then((res) => {
      if (mounted) {
        setApiConnected(res.isConnected);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const navLinks = [
    { label: 'Product', href: '/#workflow' },
    { label: 'How it works', href: '/#workflow' },
    { label: 'Research', href: '/investigations' },
    { label: 'About', href: '/#about' },
  ];

  return (
    <header className="w-full bg-[#FAF9F5] sticky top-0 z-50 animate-navbar-entrance">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-10 border-x border-b border-[#E0DED4]">
        <div className="flex items-center justify-between h-[56px] md:h-[60px]">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0 group">
            <div className="w-[28px] h-[28px] rounded-none border border-[#141413] flex items-center justify-center transition-transform duration-200 group-hover:scale-105 group-hover:bg-[#141413] group-hover:text-[#FAF9F5]">
              <Shield size={14} strokeWidth={2} className="text-[#141413] group-hover:text-[#FAF9F5] transition-colors" />
            </div>
            <span className="text-[14px] font-semibold tracking-tight text-[#141413] group-hover:opacity-85 transition-opacity">ScamShield AI</span>
          </Link>

          {/* Desktop center nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-[14px] text-[#625F58] hover:text-[#141413] transition-colors duration-150 font-normal relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1.5px] after:bg-[#141413] hover:after:w-full after:transition-all after:duration-200"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right CTA + API Connection Status */}
          <div className="hidden md:flex items-center gap-4">
            {apiConnected !== null && (
              <div
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-none border border-[#E0DED4] bg-[#FAF9F5] text-[11px] hover:border-[#77746C] transition-colors"
                title={apiConnected ? 'FastAPI ML backend is running and connected' : 'FastAPI backend is offline'}
              >
                <span
                  className={`w-1.5 h-1.5 ${
                    apiConnected ? 'bg-[#2e7d32] animate-live-pulse' : 'bg-[#c5291e]'
                  }`}
                />
                <span className="text-[#625F58] font-medium">
                  {apiConnected ? 'API connected' : 'API unavailable'}
                </span>
              </div>
            )}
            <Button variant="primary" size="sm" onClick={() => navigate('/investigate')} className="hover:shadow-[0_2px_8px_rgba(20,20,19,0.15)] transition-all">
              Investigate a job →
            </Button>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 rounded-none text-[#141413] hover:bg-[#F0EEE6] active:bg-[#E8E6DC] transition-colors cursor-pointer"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[#FAF9F5]">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-5 flex flex-col gap-3.5 border-x border-b border-[#E0DED4]">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-[15px] font-medium text-[#141413] hover:text-[#625F58] py-1.5 transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </a>
            ))}
            {apiConnected !== null && (
              <div className="flex items-center gap-2 px-1 py-1 text-[12.5px] text-[#625F58]">
                <span
                  className={`w-2 h-2 rounded-none ${
                    apiConnected ? 'bg-[#2e7d32]' : 'bg-[#c5291e]'
                  }`}
                />
                <span>{apiConnected ? 'API connected (http://127.0.0.1:8000)' : 'API unavailable'}</span>
              </div>
            )}
            <div className="pt-3 border-t border-[#E0DED4]">
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  setMobileOpen(false);
                  navigate('/investigate');
                }}
                className="w-full justify-center h-[44px] text-[14px]"
              >
                Investigate a job →
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
