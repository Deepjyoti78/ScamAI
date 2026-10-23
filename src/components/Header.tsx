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
    { label: 'Product', href: '#workflow' },
    { label: 'How it works', href: '#workflow' },
    { label: 'Research', href: '#' },
    { label: 'About', href: '#' },
  ];

  return (
    <header className="w-full border-b border-[#e4e4e0] bg-white sticky top-0 z-50">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-10 border-x border-[#e4e4e0]">
        <div className="flex items-center justify-between h-[56px] md:h-[60px]">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-[28px] h-[28px] rounded-none border border-[#111110] flex items-center justify-center">
              <Shield size={14} strokeWidth={2} className="text-[#111110]" />
            </div>
            <span className="text-[14px] font-semibold tracking-tight text-[#111110]">ScamShield AI</span>
          </Link>

          {/* Desktop center nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-[14px] text-[#555552] hover:text-[#111110] transition-colors duration-150 font-normal"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right CTA + API Connection Status */}
          <div className="hidden md:flex items-center gap-4">
            {apiConnected !== null && (
              <div
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-none border border-[#e4e4e0] bg-[#fafaf9] text-[11px]"
                title={apiConnected ? 'FastAPI ML backend is running and connected' : 'FastAPI backend is offline'}
              >
                <span
                  className={`w-1.5 h-1.5 ${
                    apiConnected ? 'bg-[#2e7d32]' : 'bg-[#c5291e]'
                  }`}
                />
                <span className="text-[#6b6b6b] font-medium">
                  {apiConnected ? 'API connected' : 'API unavailable'}
                </span>
              </div>
            )}
            <Button variant="primary" size="sm" onClick={() => navigate('/investigate')}>
              Investigate a job →
            </Button>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-1.5 rounded-none text-[#111110] hover:bg-[#f7f7f6] transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[#e4e4e0] bg-white">
          <div className="max-w-[1200px] mx-auto px-6 py-5 flex flex-col gap-4">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-[14px] text-[#6b6b6b] hover:text-[#111110] transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </a>
            ))}
            {apiConnected !== null && (
              <div className="flex items-center gap-2 px-1 text-[12px] text-[#6b6b6b]">
                <span
                  className={`w-2 h-2 rounded-none ${
                    apiConnected ? 'bg-[#2e7d32]' : 'bg-[#c5291e]'
                  }`}
                />
                <span>{apiConnected ? 'API connected (http://127.0.0.1:8000)' : 'API unavailable'}</span>
              </div>
            )}
            <div className="pt-3 border-t border-[#e4e4e0]">
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  setMobileOpen(false);
                  navigate('/investigate');
                }}
                className="w-full justify-center"
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
