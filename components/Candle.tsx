import React from 'react';

interface CandleProps {
  flameOn?: boolean;
  flameRef?: React.Ref<SVGGElement>;
  className?: string;
}

export default function Candle({ flameOn = false, flameRef, className }: CandleProps) {
  return (
    <svg
      viewBox="0 0 40 100"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label={flameOn ? 'Lit candle' : 'Unlit candle'}
    >
      {/* Candle body */}
      <rect x="13" y="35" width="14" height="58" rx="3" fill="#fde68a" />

      {/* Decorative stripes */}
      <rect x="13" y="48" width="14" height="5" rx="0" fill="#f59e0b" opacity="0.7" />
      <rect x="13" y="64" width="14" height="5" rx="0" fill="#f59e0b" opacity="0.7" />
      <rect x="13" y="80" width="14" height="5" rx="0" fill="#f59e0b" opacity="0.7" />

      {/* Wick */}
      <line x1="20" y1="35" x2="20" y2="26" stroke="#374151" strokeWidth="1.5" strokeLinecap="round" />

      {/* Flame group — always in the DOM so GSAP can target it */}
      <g ref={flameRef} style={{ opacity: flameOn ? 1 : 0 }}>
        {/* Flame outer glow */}
        <ellipse cx="20" cy="18" rx="7" ry="10" fill="#fb923c" opacity="0.9" />
        {/* Flame inner bright */}
        <ellipse cx="20" cy="20" rx="3.5" ry="6" fill="#fef08a" />
        {/* Flame tip */}
        <ellipse cx="20" cy="11" rx="2.5" ry="4" fill="#fdba74" opacity="0.7" />
      </g>
    </svg>
  );
}
