interface KnifeProps {
  className?: string;
}

export default function Knife({ className }: KnifeProps) {
  return (
    <svg
      viewBox="0 0 80 200"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Cake knife"
    >
      {/* Blade body */}
      <path d="M 28,15 L 48,15 L 54,138 L 26,138 Z" fill="#e2e8f0" />

      {/* Blade bevel / edge highlight */}
      <path d="M 44,15 L 54,138 L 50,138 L 41,15 Z" fill="#94a3b8" />

      {/* Blade tip curve */}
      <path d="M 26,138 Q 40,148 54,138 L 26,138 Z" fill="#cbd5e1" />

      {/* Bolster */}
      <rect x="22" y="136" width="36" height="11" rx="3" fill="#64748b" />

      {/* Handle */}
      <rect x="27" y="147" width="26" height="46" rx="10" fill="#a78bfa" />

      {/* Handle grip lines */}
      <line x1="31" y1="160" x2="49" y2="160" stroke="#7c3aed" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="31" y1="170" x2="49" y2="170" stroke="#7c3aed" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="31" y1="180" x2="49" y2="180" stroke="#7c3aed" strokeWidth="1.5" strokeLinecap="round" />

      {/* Handle end cap */}
      <rect x="27" y="185" width="26" height="8" rx="8" fill="#8b5cf6" />
    </svg>
  );
}
