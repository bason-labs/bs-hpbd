interface GiftBoxProps {
  className?: string;
}

export default function GiftBox({ className }: GiftBoxProps) {
  return (
    <svg
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      overflow="visible"
      aria-label="Gift box"
    >
      <g id="box-base">
        {/* Box shadow */}
        <ellipse cx="100" cy="192" rx="70" ry="7" fill="#c7d2fe" opacity="0.5" />

        {/* Box body */}
        <rect x="28" y="105" width="144" height="82" rx="6" fill="#818cf8" />

        {/* Box body shading */}
        <rect x="28" y="105" width="144" height="20" rx="6" fill="#6366f1" opacity="0.4" />

        {/* Ribbon vertical */}
        <rect x="91" y="105" width="18" height="82" fill="#f43f5e" opacity="0.9" />
      </g>

      <g id="box-lid">
        {/* Lid */}
        <rect x="22" y="72" width="156" height="38" rx="6" fill="#6366f1" />

        {/* Lid shading */}
        <rect x="22" y="72" width="156" height="12" rx="6" fill="#4f46e5" opacity="0.5" />

        {/* Ribbon on lid horizontal */}
        <rect x="22" y="86" width="156" height="18" fill="#f43f5e" opacity="0.9" />

        {/* Bow — left loop */}
        <ellipse
          cx="80"
          cy="72"
          rx="22"
          ry="13"
          fill="#fb7185"
          transform="rotate(-25 80 72)"
        />

        {/* Bow — right loop */}
        <ellipse
          cx="120"
          cy="72"
          rx="22"
          ry="13"
          fill="#fb7185"
          transform="rotate(25 120 72)"
        />

        {/* Bow — center knot */}
        <circle cx="100" cy="72" r="11" fill="#f43f5e" />
        <circle cx="100" cy="72" r="6" fill="#fb7185" />
      </g>
    </svg>
  );
}
