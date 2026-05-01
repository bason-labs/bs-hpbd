'use client';

import { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import confetti from 'canvas-confetti';
import PointerFinger from '@/components/PointerFinger';
import { useBirthdayStore } from '@/store/useBirthdayStore';
import { useSoundEffects } from '@/hooks/useSoundEffects';

/*
  Step 3 — two-phase interaction:
    Phase 1: drag the (unlit) candle away from the cake
    Phase 2: drag knife top-to-bottom to cut the cake

  Cake25D hides its candle group when hideCandle=true (passed from page.tsx),
  so the replica candle here is the only visible one during this step.

  Candle position in the min(72vmin, 560px) container (SVG viewBox 320×320):
    Wick tip  → top: 21.875%  (y=70/320)
    Candle bottom → top: 41.25%  (y=132/320)
    Horizontal center → left: 50%
*/
export default function Step3CutCake() {
  const setStep = useBirthdayStore((s) => s.setStep);
  const { playSword } = useSoundEffects();

  // Shared
  const containerRef = useRef<HTMLDivElement>(null);
  const cakeAreaRef  = useRef<HTMLDivElement>(null);

  // ── Phase 1: candle drag ──────────────────────────────────────────────────
  const candleElRef      = useRef<HTMLDivElement>(null);
  const candleHintRef    = useRef<HTMLImageElement>(null);
  const candleDragActive = useRef(false);
  const candleDragStartX = useRef(0);
  const candleDragStartY = useRef(0);
  const candleRemovedRef   = useRef(false); // synchronous gate
  const [candleGone, setCandleGone]             = useState(false);
  const [isDraggingCandle, setIsDraggingCandle] = useState(false);

  // Phase 1 hint: PointerFinger bobbing above candle
  useEffect(() => {
    const el = candleHintRef.current;
    if (!el || candleGone) return;
    gsap.set(el, { opacity: 0, y: -6 });
    gsap.to(el, { opacity: 1, duration: 0.4, delay: 0.6 });
    const tl = gsap.timeline({ repeat: -1, yoyo: true, delay: 1.0 });
    tl.to(el, { y: 8, duration: 0.5, ease: 'sine.inOut' });
    return () => { tl.kill(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function triggerCandleRemoval(dx: number, dy: number) {
    candleDragActive.current  = false;
    candleRemovedRef.current  = true;
    const dist  = Math.hypot(dx, dy) || 1;
    const flyX  = (dx / dist) * 420;
    const flyY  = (dy / dist) * 420;
    const spin  = dx >= 0 ? 25 : -25;

    gsap.to(candleHintRef.current, { opacity: 0, duration: 0.15 });
    gsap.to(candleElRef.current, {
      x: flyX, y: flyY, opacity: 0, rotation: spin,
      duration: 0.4, ease: 'power2.in',
      onComplete: () => setCandleGone(true),
    });
  }

  function handleCandlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    e.stopPropagation();
    if (candleRemovedRef.current) return;
    candleDragActive.current = true;
    candleDragStartX.current = e.clientX;
    candleDragStartY.current = e.clientY;
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDraggingCandle(true);
    gsap.to(candleHintRef.current, { opacity: 0, duration: 0.15 });
    gsap.to(candleElRef.current, {
      scale: 1.2,
      filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.4))',
      duration: 0.15,
    });
  }

  function handleCandlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!candleDragActive.current || candleRemovedRef.current) return;
    const dx = e.clientX - candleDragStartX.current;
    const dy = e.clientY - candleDragStartY.current;
    gsap.set(candleElRef.current, { x: dx, y: dy });
    if (Math.hypot(dx, dy) > 80) triggerCandleRemoval(dx, dy);
  }

  function handleCandlePointerUp() {
    if (candleRemovedRef.current) return;
    candleDragActive.current = false;
    setIsDraggingCandle(false);
    gsap.to(candleElRef.current, {
      x: 0, y: 0, scale: 1, filter: 'none',
      duration: 0.4, ease: 'back.out(2)',
    });
    gsap.to(candleHintRef.current, { opacity: 1, duration: 0.3 });
  }

  // ── Phase 2: knife cut ────────────────────────────────────────────────────
  const fingerRef    = useRef<HTMLImageElement>(null);
  const fingerTlRef  = useRef<gsap.core.Timeline | null>(null);
  const dragStartY   = useRef(0);
  const isDragging   = useRef(false);
  const hasCut       = useRef(false);

  // Apply knife cursor to full page when candle is gone (Phase 2)
  useEffect(() => {
    if (candleGone) {
      document.body.classList.add('knife-cursor');
    }
    return () => { document.body.classList.remove('knife-cursor'); };
  }, [candleGone]);

  // Phase 2 hint: top-to-bottom swipe (starts once candle is gone)
  useEffect(() => {
    if (!candleGone) return;
    const el = fingerRef.current;
    if (!el) return;
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.8 });
    tl.set(el, { opacity: 0, y: 0 });
    tl.to(el, { opacity: 1, duration: 0.25 });
    tl.to(el, { y: 180, duration: 0.6, ease: 'power1.inOut' });
    tl.to(el, { opacity: 0, duration: 0.25 });
    fingerTlRef.current = tl;
    return () => { tl.kill(); };
  }, [candleGone]);

  function triggerCut() {
    document.body.classList.remove('knife-cursor');
    if (containerRef.current) containerRef.current.style.cursor = '';
    playSword();
    hasCut.current     = true;
    isDragging.current = false;

    fingerTlRef.current?.kill();
    gsap.killTweensOf(fingerRef.current);
    gsap.timeline()
      .to(fingerRef.current, { scale: 0.75, y: '+=10', duration: 0.1, ease: 'power2.in' })
      .to(fingerRef.current, { opacity: 0, y: '+=16', scale: 0.5, duration: 0.2, ease: 'power2.out' });

    gsap.to(['#cake-left', '#cake-right'], {
      y: -12, duration: 0.15, ease: 'power2.out', yoyo: true, repeat: 1,
      onComplete: () => {
        const split = (cakeAreaRef.current?.offsetWidth ?? 320) * 0.14;
        gsap.to('#cake-left',  { x: -split, duration: 0.5, ease: 'power2.out' });
        gsap.to('#cake-right', { x:  split, duration: 0.5, ease: 'power2.out' });

        confetti({
          particleCount: 80,
          startVelocity: 28,
          spread: 55,
          origin: { x: 0.5, y: 0.55 },
          colors: ['#fbbf24', '#fde68a', '#f59e0b', '#fffbeb', '#fef3c7', '#f0abfc'],
          scalar: 0.65,
          shapes: ['circle'],
          gravity: 1.2,
        });

        gsap.to(containerRef.current, {
          opacity: 0, duration: 0.4, delay: 1.1,
          onComplete: () => setStep(4),
        });
      },
    });
  }

  const KNIFE_CURSOR = "url('/cursur/knife.png') 8 0, crosshair";

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (hasCut.current || !candleGone) return;
    dragStartY.current = e.clientY;
    isDragging.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    // Force cursor on the capturing element — setPointerCapture bypasses body/class cursor
    e.currentTarget.style.cursor = KNIFE_CURSOR;
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!isDragging.current || hasCut.current || !candleGone) return;
    if (e.clientY - dragStartY.current > 80) triggerCut();
  }

  function handlePointerUp() {
    isDragging.current = false;
    if (containerRef.current) containerRef.current.style.cursor = '';
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-auto touch-none select-none flex items-center justify-center"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <div
        ref={cakeAreaRef}
        className="relative"
        style={{
          width: 'min(72vmin, 560px)',
          height: 'min(72vmin, 560px)',
          cursor: hasCut.current
            ? 'default'
            : candleGone
              ? "url('/cursur/knife.png') 8 0, crosshair"
              : 'default',
        }}
      >

        {/* ── Phase 1: draggable unlit candle replica ───────────────────────
            Positioned so its top edge aligns with the SVG wick tip (21.875%).
            ViewBox 28×62: wick (0–18) + candle body (18–62).
            Width 8.75% matches Cake25D's flame overlay width so the replica
            sits flush over the hidden SVG candle.
        ─────────────────────────────────────────────────────────────────── */}
        {!candleGone && (
          <div
            ref={candleElRef}
            style={{
              position: 'absolute',
              top: '21.875%',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 'clamp(32px, 8.75%, 49px)',
              cursor: isDraggingCandle ? 'grabbing' : 'grab',
              touchAction: 'none',
              userSelect: 'none',
              willChange: 'transform',
              zIndex: 20,
            }}
            onPointerDown={handleCandlePointerDown}
            onPointerMove={handleCandlePointerMove}
            onPointerUp={handleCandlePointerUp}
          >
            {/* Pulsing glow ring — hidden while dragging */}
            {!isDraggingCandle && (
              <div style={{
                position: 'absolute',
                inset: '-10px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(251,191,36,0.55) 0%, transparent 70%)',
                animation: 'pulse-glow 1.4s ease-in-out infinite',
                pointerEvents: 'none',
              }} />
            )}
            <svg
              viewBox="0 0 28 62"
              style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}
              aria-hidden
            >
              <defs>
                <linearGradient id="cg-step3" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%"   stopColor="#fde68a" />
                  <stop offset="40%"  stopColor="#fff7ed" />
                  <stop offset="100%" stopColor="#fde68a" />
                </linearGradient>
              </defs>
              {/* Wick */}
              <line x1="14" y1="0" x2="14" y2="18" stroke="#44403c" strokeWidth="2" strokeLinecap="round" />
              <circle cx="14" cy="0" r="1.5" fill="#1c1917" />
              {/* Candle top cap */}
              <ellipse cx="14" cy="18" rx="10" ry="4" fill="white" opacity="0.95" />
              {/* Candle body */}
              <rect x="7" y="18" width="14" height="44" rx="3" fill="url(#cg-step3)" />
              {/* Colour stripes */}
              <rect x="7" y="28" width="14" height="4" rx="1" fill="#f9a8d4" opacity="0.85" />
              <rect x="7" y="40" width="14" height="4" rx="1" fill="#c4b5fd" opacity="0.85" />
              <rect x="7" y="52" width="14" height="4" rx="1" fill="#f9a8d4" opacity="0.85" />
              {/* Highlight */}
              <rect x="9" y="19" width="3" height="42" rx="2" fill="white" opacity="0.38" />
            </svg>
          </div>
        )}

        {/* Phase 1 hint: finger bobbing above candle, pointing down at it */}
        {!candleGone && (
          <PointerFinger
            ref={candleHintRef}
            className="absolute pointer-events-none"
            style={{
              top: '12%',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '10%',
              zIndex: 21,
            }}
          />
        )}

        {/* Phase 2 hint: top-to-bottom knife swipe */}
        {candleGone && (
          <PointerFinger
            ref={fingerRef}
            className="absolute pointer-events-none z-10"
            style={{ top: '10%', left: '50%', transform: 'translateX(-50%)', width: '12.5%' }}
          />
        )}
      </div>
    </div>
  );
}
