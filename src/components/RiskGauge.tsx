import { useMemo } from 'react';
import { ShieldCheck, AlertTriangle, AlertCircle } from 'lucide-react';
import type { RiskLevel } from '../types/investigation';

interface RiskGaugeProps {
  score: number | null; // 0 to 1 or 0 to 100
  riskLevel: RiskLevel;
  label: string;
  prediction?: number | null;
  inferenceTimeMs?: number;
}

export default function RiskGauge({
  score,
  riskLevel,
  label,
  prediction,
  inferenceTimeMs,
}: RiskGaugeProps) {
  // Normalize score to 0..1
  const normalizedScore = useMemo(() => {
    if (score === null || score === undefined || isNaN(score)) return 0;
    return score > 1 ? score / 100 : score;
  }, [score]);

  const percentage = (normalizedScore * 100).toFixed(1);

  // Geometry for SVG semi-circle gauge (radius 80, center at 110, 105)
  const cx = 110;
  const cy = 105;
  const r = 78;
  const arcLength = Math.PI * r; // ~245.04
  const strokeOffset = arcLength * (1 - normalizedScore);

  // Needle angle (-90 deg at 0% to +90 deg at 100%)
  const needleAngle = -90 + normalizedScore * 180;

  // Color config based on risk level
  const theme = useMemo(() => {
    switch (riskLevel) {
      case 'high':
        return {
          color: '#dc2626',
          bg: '#fef2f2',
          border: '#fca5a5',
          badgeText: '#991b1b',
          verdict: 'High Scam Risk',
          summary: 'Multiple red flags detected. Do not send funds or sensitive personal data.',
          icon: <AlertTriangle size={15} className="text-[#dc2626]" />,
        };
      case 'medium':
        return {
          color: '#d97706',
          bg: '#fffbeb',
          border: '#fde68a',
          badgeText: '#92400e',
          verdict: 'Review Advisory',
          summary: 'Inconsistencies observed. Corroborate employer details independently.',
          icon: <AlertCircle size={15} className="text-[#d97706]" />,
        };
      case 'low':
      default:
        return {
          color: '#16a34a',
          bg: '#f0fdf4',
          border: '#bbf7d0',
          badgeText: '#166534',
          verdict: 'Lower Risk Listing',
          summary: 'Vocabulary and format match standard authentic recruitment listings.',
          icon: <ShieldCheck size={15} className="text-[#16a34a]" />,
        };
    }
  }, [riskLevel]);

  return (
    <div className="border border-[#E0DED4] bg-[#FAF9F5] rounded-none p-5 sm:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] card-interactive">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6">

        {/* ── Left Column: Semi-Circular Speedometer / Risk Dial ── */}
        <div className="flex flex-col items-center flex-shrink-0">
          <div className="relative w-[220px] h-[130px] flex items-center justify-center">
            <svg
              viewBox="0 0 220 125"
              className="w-full h-full overflow-visible"
              aria-label={`Risk gauge showing ${percentage}% score`}
            >
              <defs>
                {/* Arc gradient for gauge track */}
                <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#16a34a" />
                  <stop offset="35%" stopColor="#84cc16" />
                  <stop offset="60%" stopColor="#eab308" />
                  <stop offset="85%" stopColor="#f97316" />
                  <stop offset="100%" stopColor="#dc2626" />
                </linearGradient>

                {/* Subtle needle drop shadow */}
                <filter id="needleGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.25" />
                </filter>
              </defs>

              {/* Background Track Arc */}
              <path
                d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
                fill="none"
                stroke="#E8E6DC"
                strokeWidth="11"
                strokeLinecap="round"
              />

              {/* Segment Markers Ticks */}
              {/* Safe Tick (30%) */}
              <circle cx="55" cy="42" r="1.5" fill="#16a34a" />
              {/* Caution Tick (60%) */}
              <circle cx="165" cy="42" r="1.5" fill="#d97706" />

              {/* Active Colored Progress Fill Arc */}
              <path
                d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
                fill="none"
                stroke="url(#gaugeGradient)"
                strokeWidth="11"
                strokeLinecap="round"
                strokeDasharray={arcLength}
                strokeDashoffset={strokeOffset}
                className="transition-all duration-1000 ease-out"
              />

              {/* Needle Pointer */}
              <g
                style={{
                  transformOrigin: `${cx}px ${cy}px`,
                  transform: `rotate(${needleAngle}deg)`,
                  transition: 'transform 1.1s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
                filter="url(#needleGlow)"
              >
                {/* Needle Stem */}
                <line
                  x1={cx}
                  y1={cy}
                  x2={cx}
                  y2={cy - r + 8}
                  stroke="#141413"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                {/* Pointer Tip */}
                <polygon
                  points={`${cx - 3},${cy - r + 14} ${cx + 3},${cy - r + 14} ${cx},${cy - r + 5}`}
                  fill="#141413"
                />
                {/* Center Hub Outer Ring */}
                <circle cx={cx} cy={cy} r="6" fill="#141413" />
                {/* Center Hub Inner Dot */}
                <circle cx={cx} cy={cy} r="2.5" fill="#FAF9F5" />
              </g>

              {/* Scale Labels */}
              <text x="25" y={cy + 14} fontSize="9" fill="#77746C" fontFamily="monospace" textAnchor="middle">
                0%
              </text>
              <text x={cx} y="22" fontSize="8.5" fill="#77746C" fontFamily="monospace" textAnchor="middle">
                50%
              </text>
              <text x="195" y={cy + 14} fontSize="9" fill="#77746C" fontFamily="monospace" textAnchor="middle">
                100%
              </text>
            </svg>
          </div>

          {/* Zone Legend Ticks */}
          <div className="flex items-center justify-between w-full max-w-[210px] text-[10px] font-mono text-[#77746C] mt-1 pt-1 border-t border-[#E0DED4]">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a]" /> Safe (&lt;30%)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#d97706]" /> Review
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#dc2626]" /> Danger
            </span>
          </div>
        </div>

        {/* ── Right Column: Score Breakdown & Executive Verdict ── */}
        <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-[#77746C] font-medium">
                AI Fraud Risk Assessment
              </span>
              {typeof inferenceTimeMs === 'number' && (
                <span className="text-[10.5px] font-mono text-[#77746C] bg-[#F0EEE6] border border-[#E0DED4] px-2 py-0.5 rounded-none">
                  ⚡ {inferenceTimeMs.toFixed(1)}ms inference
                </span>
              )}
            </div>

            {/* Score & Verdict Banner */}
            <div className="flex items-baseline gap-3 mb-2 flex-wrap">
              <span className="font-serif text-[42px] sm:text-[48px] font-normal text-[#141413] leading-none tracking-tight">
                {percentage}%
              </span>
              <div
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-none border text-[11px] font-bold tracking-wider uppercase"
                style={{ backgroundColor: theme.bg, borderColor: theme.border, color: theme.badgeText }}
              >
                {theme.icon}
                {label || theme.verdict}
              </div>
            </div>

            {/* Clear Plain-Language Takeaway */}
            <p className="text-[14px] sm:text-[13.5px] text-[#141413] font-medium leading-relaxed mb-3">
              {theme.summary}
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-3 border-t border-[#E0DED4] text-[11px]">
            <div>
              <span className="text-[#77746C] font-mono block text-[10px] uppercase">Triage Tier</span>
              <span className="font-semibold text-[#141413] capitalize">{riskLevel} Risk</span>
            </div>
            <div>
              <span className="text-[#77746C] font-mono block text-[10px] uppercase">Binary Class</span>
              <span className={`font-semibold ${prediction === 1 ? 'text-[#c5291e]' : 'text-[#16a34a]'}`}>
                {prediction === 1 ? 'Class 1 (Fraudulent)' : 'Class 0 (Legitimate)'}
              </span>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <span className="text-[#77746C] font-mono block text-[10px] uppercase">Benchmark</span>
              <span className="font-semibold text-[#141413] truncate block">EMSCAD Trained</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
