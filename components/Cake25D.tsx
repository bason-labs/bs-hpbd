'use client';

import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { useBirthdayStore } from '@/store/useBirthdayStore';
import { useSoundEffects } from '@/hooks/useSoundEffects';

interface Cake25DProps {
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
  hideCandle?: boolean;
}

export default function Cake25D({ onClick, className, style, hideCandle }: Cake25DProps) {
  const flameRef  = useRef<HTMLDivElement>(null);
  const svgRef    = useRef<SVGSVGElement>(null);
  const flickerTl = useRef<gsap.core.Timeline | null>(null);
  const prevLit   = useRef(false);
  const { playLightMatch, setCandleBuzzing } = useSoundEffects();

  // Parallax layer refs (SVGGElement — inside <defs>, real DOM nodes)
  const plateGroupRef  = useRef<SVGGElement>(null);
  const bottomTierRef  = useRef<SVGGElement>(null);
  const topTierRef     = useRef<SVGGElement>(null);
  const candleGroupRef = useRef<SVGGElement>(null);

  // Smoke puff refs (3 blurred circles shown on extinguish)
  const smokeRefs = useRef<(HTMLDivElement | null)[]>([null, null, null]);

  const isFlameLit   = useBirthdayStore((s) => s.isFlameLit);
  const currentStep  = useBirthdayStore((s) => s.currentStep);

  // ── Flame in / out + smoke ────────────────────────────────────────────────
  useEffect(() => {
    const el = flameRef.current;
    if (!el) return;

    if (isFlameLit && !prevLit.current) {
      flickerTl.current?.kill();
      gsap.fromTo(el,
        { opacity: 0, scale: 0, y: 6 },
        {
          opacity: 1, scale: 1, y: 0, duration: 0.45,
          ease: 'back.out(2)', transformOrigin: '50% 100%',
          onComplete: () => {
            flickerTl.current = gsap.timeline({ repeat: -1, yoyo: true })
              .to(el, { scaleX: 1.18, scaleY: 0.86, duration: 0.12,
                        ease: 'power1.inOut', transformOrigin: '50% 100%' });
          },
        }
      );
    } else if (!isFlameLit && prevLit.current) {
      flickerTl.current?.kill();
      gsap.to(el, {
        opacity: 0, scaleY: 0.25, x: 10, duration: 0.28,
        ease: 'power2.in', transformOrigin: '50% 100%',
        onComplete: () => { gsap.set(el, { x: 0 }); },
      });

      // Smoke puff burst — fromTo resets state so repeated cycles work cleanly
      const validSmoke = smokeRefs.current.filter(Boolean) as HTMLDivElement[];
      if (validSmoke.length) {
        gsap.fromTo(
          validSmoke,
          { opacity: 0.6, scale: 1, y: 0 },
          { opacity: 0, scale: 2.5, y: -50, duration: 1.2, ease: 'power1.out', stagger: 0.15 }
        );
      }
    }

    prevLit.current = isFlameLit;
    return () => { flickerTl.current?.kill(); };
  }, [isFlameLit]);

  // ── Reset parallax to centre when entering step 2 ────────────────────────
  useEffect(() => {
    if (currentStep !== 2) return;
    const targets = [
      plateGroupRef.current,
      bottomTierRef.current,
      topTierRef.current,
      candleGroupRef.current,
      flameRef.current,
    ].filter(Boolean);
    gsap.to(targets, { x: 0, y: 0, duration: 0.6, ease: 'power2.out' });
  }, [currentStep]);

  // ── Hide candle for step 3 (overlay replica takes over) ─────────────────
  useEffect(() => {
    if (!candleGroupRef.current) return;
    gsap.set(candleGroupRef.current, { opacity: hideCandle ? 0 : 1 });
    if (hideCandle && flameRef.current) {
      flickerTl.current?.kill();
      gsap.set(flameRef.current, { opacity: 0 });
    }
  }, [hideCandle]);

  // ── Candle buzz sound ────────────────────────────────────────────────────
  useEffect(() => {
    setCandleBuzzing(isFlameLit);
  // setCandleBuzzing is stable (module-level), no dep needed
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFlameLit]);

  // ── 2.5D Parallax on mousemove ───────────────────────────────────────────
  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      const offsetX = (e.clientX - window.innerWidth  / 2) / window.innerWidth  * 2; // -1..1
      const offsetY = (e.clientY - window.innerHeight / 2) / window.innerHeight * 2;
      const cfg = { duration: 0.6, ease: 'power2.out' } as const;

      if (plateGroupRef.current)  gsap.to(plateGroupRef.current,  { x: offsetX * 4,  y: offsetY * 2.5, ...cfg });
      if (bottomTierRef.current)  gsap.to(bottomTierRef.current,  { x: offsetX * 8,  y: offsetY * 5,   ...cfg });
      if (topTierRef.current)     gsap.to(topTierRef.current,     { x: offsetX * 13, y: offsetY * 8,   ...cfg });
      if (candleGroupRef.current) gsap.to(candleGroupRef.current, { x: offsetX * 18, y: offsetY * 11,  ...cfg });
      if (flameRef.current)       gsap.to(flameRef.current,       { x: offsetX * 20, y: offsetY * 12,  ...cfg });
    }

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div
      className={`relative w-full h-full select-none ${onClick ? 'cursor-pointer' : 'cursor-default'} ${className ?? ''}`}
      style={style}
      onClick={(e) => {
        if (isFlameLit || !onClick) return;
        const svg = svgRef.current;
        if (!svg) return;
        const rect = svg.getBoundingClientRect();
        const svgX = (e.clientX - rect.left)  * (320 / rect.width);
        const svgY = (e.clientY - rect.top)   * (320 / rect.height);
        // Candle: x 153–167, y 88–132. Wick tip: y 70. Add padding for parallax + usability.
        const inCandle = svgX >= 135 && svgX <= 185 && svgY >= 55 && svgY <= 140;
        if (!inCandle) return;
        playLightMatch();
        onClick();
      }}
    >
      {/* ── Cake SVG ──────────────────────────────────────────────────────
          ViewBox 320×320.

          Cut-animation pattern (same as Cake.tsx):
            #cake-left  — full content clipped to x 0–160
            #cake-right — full content clipped to x 160–320
          GSAP in Step3 targets these IDs: gsap.to('#cake-left', { x: -N })

          Vertical key points:
            y=70   wick tip  (flame bottom aligns here via top:21.875%)
            y=88   candle body top
            y=132  top-tier frosting / drip origin
            y=199  bottom-tier frosting / drip origin
            y=282  plate center
      ──────────────────────────────────────────────────────────────────── */}
      <svg
        ref={svgRef}
        viewBox="0 0 320 320"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
        overflow="visible"
        style={{
          filter: 'drop-shadow(0 20px 40px rgba(168,85,247,0.28)) drop-shadow(0 8px 18px rgba(0,0,0,0.14))',
        }}
        aria-label="Birthday cake"
      >
        <defs>
          {/* ── Gradients ── */}
          <linearGradient id="btg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#f9a8d4" />
            <stop offset="100%" stopColor="#be185d" />
          </linearGradient>
          <linearGradient id="ttg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#ddd6fe" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
          <linearGradient id="cg" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="#fde68a" />
            <stop offset="40%"  stopColor="#fff7ed" />
            <stop offset="100%" stopColor="#fde68a" />
          </linearGradient>
          <linearGradient id="ss" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="#000" stopOpacity="0.13" />
            <stop offset="10%"  stopColor="#000" stopOpacity="0"    />
            <stop offset="90%"  stopColor="#000" stopOpacity="0"    />
            <stop offset="100%" stopColor="#000" stopOpacity="0.13" />
          </linearGradient>

          {/* ── Clip paths for step-3 cut animation ── */}
          <clipPath id="cake-clip-left">
            <rect x="0" y="0" width="160" height="320" />
          </clipPath>
          <clipPath id="cake-clip-right">
            <rect x="160" y="0" width="160" height="320" />
          </clipPath>

          {/* ── All cake visuals defined once, reused by both halves ──
              Grouped into 4 parallax layers: plate, bottom tier, top tier, candle.
              Each group has a ref so GSAP can move them independently.
          ── */}
          <g id="cake-content">
            {/* PLATE — least movement */}
            <g ref={plateGroupRef}>
              <ellipse cx="160" cy="285" rx="130" ry="10" fill="#ddd6fe" opacity="0.45" />
              <ellipse cx="160" cy="282" rx="126" ry="8"  fill="#ede9fe" />
              <ellipse cx="160" cy="282" rx="126" ry="8"  fill="none" stroke="#c4b5fd" strokeWidth="1" opacity="0.7" />
            </g>

            {/* BOTTOM TIER */}
            <g ref={bottomTierRef}>
              <rect x="52" y="199" width="216" height="83" rx="6" fill="url(#btg)" />
              <rect x="52" y="199" width="216" height="83" rx="6" fill="url(#ss)"  />
              <rect x="52" y="229" width="216" height="16"       fill="#fff" opacity="0.10" />
              <circle cx="85"  cy="218" r="7"   fill="#fbbf24" opacity="0.95" />
              <circle cx="85"  cy="218" r="3.5" fill="#fff"    opacity="0.55" />
              <circle cx="119" cy="255" r="6"   fill="#f0abfc" opacity="0.90" />
              <circle cx="151" cy="218" r="6"   fill="#67e8f9" opacity="0.85" />
              <circle cx="179" cy="257" r="7"   fill="#fbbf24" opacity="0.95" />
              <circle cx="179" cy="257" r="3.5" fill="#fff"    opacity="0.55" />
              <circle cx="210" cy="218" r="6"   fill="#f0abfc" opacity="0.90" />
              <circle cx="241" cy="254" r="6"   fill="#67e8f9" opacity="0.85" />
              <circle cx="70"  cy="254" r="4"   fill="#fbbf24" opacity="0.80" />
              <circle cx="248" cy="220" r="4"   fill="#fde68a" opacity="0.80" />
              <ellipse cx="160" cy="199" rx="108" ry="14" fill="white" opacity="0.93" />
              <ellipse cx="148" cy="196" rx="52"  ry="7"  fill="white" opacity="0.40" />
              <path d="M 75,199 L 85,199 Q 88,224 80,230 Q 72,224 75,199 Z"     fill="white" opacity="0.88" />
              <path d="M 101,199 L 111,199 Q 114,220 106,225 Q 98,220 101,199 Z" fill="white" opacity="0.88" />
              <path d="M 128,199 L 138,199 Q 141,227 133,233 Q 125,227 128,199 Z" fill="white" opacity="0.88" />
              <path d="M 154,199 L 164,199 Q 167,222 159,228 Q 151,222 154,199 Z" fill="white" opacity="0.88" />
              <path d="M 179,199 L 189,199 Q 192,229 184,235 Q 176,229 179,199 Z" fill="white" opacity="0.88" />
              <path d="M 204,199 L 214,199 Q 217,220 209,226 Q 201,220 204,199 Z" fill="white" opacity="0.88" />
              <path d="M 229,199 L 239,199 Q 242,225 234,231 Q 226,225 229,199 Z" fill="white" opacity="0.88" />
            </g>

            {/* TOP TIER */}
            <g ref={topTierRef}>
              <rect x="92" y="132" width="136" height="67" rx="6" fill="url(#ttg)" />
              <rect x="92" y="132" width="136" height="67" rx="6" fill="url(#ss)"  />
              <rect x="92" y="153" width="136" height="13"       fill="#fff" opacity="0.10" />
              <circle cx="117" cy="150" r="6"   fill="#fbbf24" opacity="0.95" />
              <circle cx="117" cy="150" r="3"   fill="#fff"    opacity="0.55" />
              <circle cx="144" cy="170" r="5"   fill="#67e8f9" opacity="0.85" />
              <circle cx="176" cy="170" r="5"   fill="#f0abfc" opacity="0.90" />
              <circle cx="203" cy="150" r="6"   fill="#fbbf24" opacity="0.95" />
              <circle cx="203" cy="150" r="3"   fill="#fff"    opacity="0.55" />
              <circle cx="160" cy="178" r="4"   fill="#fde68a" opacity="0.85" />
              <ellipse cx="160" cy="132" rx="68" ry="10" fill="white" opacity="0.93" />
              <ellipse cx="151" cy="129" rx="32" ry="5"  fill="white" opacity="0.40" />
              <path d="M 104,132 L 114,132 Q 117,153 109,159 Q 101,153 104,132 Z" fill="white" opacity="0.88" />
              <path d="M 128,132 L 138,132 Q 141,157 133,163 Q 125,157 128,132 Z" fill="white" opacity="0.88" />
              <path d="M 153,132 L 163,132 Q 166,154 158,160 Q 150,154 153,132 Z" fill="white" opacity="0.88" />
              <path d="M 178,132 L 188,132 Q 191,156 183,162 Q 175,156 178,132 Z" fill="white" opacity="0.88" />
              <path d="M 202,132 L 212,132 Q 215,152 207,158 Q 199,152 202,132 Z" fill="white" opacity="0.88" />
            </g>

            {/* CANDLE — most movement */}
            <g ref={candleGroupRef}>
              <ellipse cx="160" cy="130" rx="10" ry="4" fill="white" opacity="0.95" />
              <rect x="153" y="88"  width="14" height="44" rx="3" fill="url(#cg)" />
              <rect x="153" y="98"  width="14" height="4"  rx="1" fill="#f9a8d4" opacity="0.85" />
              <rect x="153" y="110" width="14" height="4"  rx="1" fill="#c4b5fd" opacity="0.85" />
              <rect x="153" y="122" width="14" height="4"  rx="1" fill="#f9a8d4" opacity="0.85" />
              <rect x="155" y="89"  width="3"  height="42" rx="2" fill="white"   opacity="0.38" />
              <line x1="160" y1="70" x2="160" y2="88" stroke="#44403c" strokeWidth="2" strokeLinecap="round" />
              <circle cx="160" cy="70" r="1.5" fill="#1c1917" />
            </g>
          </g>
        </defs>

        {/* Left half — moves left on cut */}
        <g id="cake-left" clipPath="url(#cake-clip-left)">
          <use href="#cake-content" />
        </g>

        {/* Right half — moves right on cut */}
        <g id="cake-right" clipPath="url(#cake-clip-right)">
          <use href="#cake-content" />
        </g>
      </svg>

      {/*
        Flame overlay — two-div pattern:
          outer: CSS positioning (top: 21.875% = wick-tip%, transform bottom-anchors it)
          inner (flameRef): GSAP animation target
        Scales correctly at any container size.
      */}
      <div
        style={{
          position: 'absolute',
          top: '21.875%',
          left: '50%',
          transform: 'translate(-50%, -100%)',
          width: '8.75%',
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            background: 'radial-gradient(circle, #fbbf24 0%, transparent 70%)',
            transform: 'scale(3)', filter: 'blur(6px)', opacity: 0.55, zIndex: -1,
          }}
        />

        {/* Smoke puffs — hidden until candle is blown out */}
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            ref={(el) => { smokeRefs.current[i] = el; }}
            style={{
              position: 'absolute',
              width:  `${10 + i * 2}px`,
              height: `${10 + i * 2}px`,
              borderRadius: '50%',
              backgroundColor: '#9ca3af',
              filter: 'blur(4px)',
              opacity: 0,
              bottom: '100%',
              left: `${30 + i * 12}%`,
              pointerEvents: 'none',
            }}
          />
        ))}

        <div ref={flameRef} style={{ opacity: 0 }}>
          <svg viewBox="0 0 28 44" style={{ width: '100%', height: 'auto' }} aria-hidden>
            <ellipse cx="14" cy="28" rx="9"   ry="13" fill="#fb923c" opacity="0.85" />
            <ellipse cx="14" cy="30" rx="5"   ry="9"  fill="#fbbf24" />
            <ellipse cx="14" cy="32" rx="3"   ry="6"  fill="#fef9c3" />
            <ellipse cx="14" cy="17" rx="2.5" ry="5"  fill="#fdba74" opacity="0.75" />
          </svg>
        </div>
      </div>
    </div>
  );
}
