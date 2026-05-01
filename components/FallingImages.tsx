'use client';

import { useMemo } from 'react';

interface FallingImagesProps {
  images: string[];
  count?: number;
}

interface FallingItem {
  id: number;
  src: string;
  left: string;
  width: number;
  duration: number;
  delay: number;
  rotate: number;
}

// Seeded pseudo-random so SSR and client produce the same values (avoids hydration mismatch)
function seededRandom(seed: number) {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

export default function FallingImages({ images, count = 20 }: FallingImagesProps) {
  const items: FallingItem[] = useMemo(() => {
    if (!images.length) return [];
    return Array.from({ length: count }, (_, i) => {
      const r = (offset: number) => seededRandom(i * 7 + offset);
      // toFixed() pins the string representation so server and client always match
      const duration = parseFloat((8 + r(0) * 12).toFixed(2));   // 8–20 s
      return {
        id: i,
        src: images[i % images.length],
        left: `${(r(1) * 95).toFixed(2)}vw`,
        width: Math.round(40 + r(2) * 60),                        // 40–100 px (integer, safe)
        duration,
        delay: parseFloat((-(r(3) * duration)).toFixed(2)),
        rotate: Math.round((r(4) - 0.5) * 40),                    // integer, safe
      };
    });
  }, [images, count]);

  if (!items.length) return null;

  return (
    <>
      <style>{`
        @keyframes fall {
          from { top: -120px; }
          to   { top: 110vh;  }
        }
      `}</style>

      <div
        style={{
          position: 'fixed',
          inset: 0,
          overflow: 'hidden',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      >
        {items.map((item) => (
          <div
            key={item.id}
            style={{
              position: 'absolute',
              left: item.left,
              top: 0,
              width: item.width,
              animationName: 'fall',
              animationDuration: `${item.duration}s`,
              animationDelay: `${item.delay}s`,
              animationTimingFunction: 'linear',
              animationIterationCount: 'infinite',
              transform: `rotate(${item.rotate}deg)`,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.src}
              alt=""
              width={item.width}
              style={{ width: item.width, height: 'auto', borderRadius: '8px', opacity: 0.85 }}
              draggable={false}
            />
          </div>
        ))}
      </div>
    </>
  );
}
