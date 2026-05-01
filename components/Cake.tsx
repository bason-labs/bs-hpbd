interface CakeProps {
  className?: string;
}

export default function Cake({ className }: CakeProps) {
  return (
    <svg
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Birthday cake"
    >
      <defs>
        <clipPath id="cake-clip-left">
          <rect x="0" y="0" width="100" height="200" />
        </clipPath>
        <clipPath id="cake-clip-right">
          <rect x="100" y="0" width="100" height="200" />
        </clipPath>
      </defs>

      <g id="cake-left" clipPath="url(#cake-clip-left)">
        {/* Plate */}
        <ellipse cx="100" cy="188" rx="85" ry="9" fill="#e9d5ff" opacity="0.6" />

        {/* Bottom tier body */}
        <rect x="20" y="122" width="160" height="62" rx="8" fill="#f9a8d4" />

        {/* Bottom tier frosting drip */}
        <path
          d="M20,130 Q35,118 50,130 Q65,118 80,130 Q95,118 110,130 Q125,118 140,130 Q155,118 170,130 Q180,122 180,122 L20,122 Z"
          fill="#ffffff"
        />

        {/* Bottom tier decoration dots */}
        <circle cx="50" cy="155" r="5" fill="#e879f9" />
        <circle cx="80" cy="148" r="4" fill="#c084fc" />
        <circle cx="110" cy="158" r="5" fill="#e879f9" />
        <circle cx="140" cy="148" r="4" fill="#c084fc" />
        <circle cx="162" cy="155" r="3.5" fill="#e879f9" />

        {/* Top tier body */}
        <rect x="52" y="72" width="96" height="52" rx="8" fill="#f0abfc" />

        {/* Top tier frosting drip */}
        <path
          d="M52,82 Q64,70 76,82 Q88,70 100,82 Q112,70 124,82 Q136,70 148,82 L148,72 L52,72 Z"
          fill="#ffffff"
        />

        {/* Top tier decoration dots */}
        <circle cx="75" cy="102" r="4" fill="#e879f9" />
        <circle cx="100" cy="96" r="3.5" fill="#c084fc" />
        <circle cx="125" cy="102" r="4" fill="#e879f9" />

        {/* Candle holder notch hint on top */}
        <rect x="93" y="64" width="14" height="10" rx="2" fill="#d946ef" opacity="0.5" />
      </g>

      <g id="cake-right" clipPath="url(#cake-clip-right)">
        {/* Plate */}
        <ellipse cx="100" cy="188" rx="85" ry="9" fill="#e9d5ff" opacity="0.6" />

        {/* Bottom tier body */}
        <rect x="20" y="122" width="160" height="62" rx="8" fill="#f9a8d4" />

        {/* Bottom tier frosting drip */}
        <path
          d="M20,130 Q35,118 50,130 Q65,118 80,130 Q95,118 110,130 Q125,118 140,130 Q155,118 170,130 Q180,122 180,122 L20,122 Z"
          fill="#ffffff"
        />

        {/* Bottom tier decoration dots */}
        <circle cx="50" cy="155" r="5" fill="#e879f9" />
        <circle cx="80" cy="148" r="4" fill="#c084fc" />
        <circle cx="110" cy="158" r="5" fill="#e879f9" />
        <circle cx="140" cy="148" r="4" fill="#c084fc" />
        <circle cx="162" cy="155" r="3.5" fill="#e879f9" />

        {/* Top tier body */}
        <rect x="52" y="72" width="96" height="52" rx="8" fill="#f0abfc" />

        {/* Top tier frosting drip */}
        <path
          d="M52,82 Q64,70 76,82 Q88,70 100,82 Q112,70 124,82 Q136,70 148,82 L148,72 L52,72 Z"
          fill="#ffffff"
        />

        {/* Top tier decoration dots */}
        <circle cx="75" cy="102" r="4" fill="#e879f9" />
        <circle cx="100" cy="96" r="3.5" fill="#c084fc" />
        <circle cx="125" cy="102" r="4" fill="#e879f9" />

        {/* Candle holder notch hint on top */}
        <rect x="93" y="64" width="14" height="10" rx="2" fill="#d946ef" opacity="0.5" />
      </g>
    </svg>
  );
}
