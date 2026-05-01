'use client';

import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { useBirthdayStore } from '@/store/useBirthdayStore';
import { useBlowDetect } from '@/hooks/useBlowDetect';
import { useSoundEffects } from '@/hooks/useSoundEffects';

/*
  Step 2 is a hint overlay — the cake (with flame already lit) stays mounted
  from Step 1 in page.tsx. This view only adds the mic tutorial icon and
  drives the blow-detection logic.
*/
export default function Step2BlowCandle() {
  const { setStep, setFlameLit } = useBirthdayStore();
  const { isBlowing, startListening } = useBlowDetect();
  const { playAirBlow } = useSoundEffects();
  const hintRef = useRef<HTMLDivElement>(null);

  // Start mic on mount
  useEffect(() => {
    startListening();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Hint entrance animation
  useEffect(() => {
    if (!hintRef.current) return;
    gsap.set(hintRef.current, { opacity: 0, y: 16, scale: 0.85 });
    gsap.to(hintRef.current, {
      opacity: 1, y: 0, scale: 1, duration: 0.55, ease: 'back.out(1.6)', delay: 0.3,
    });
    // Gentle breathing pulse
    gsap.to(hintRef.current, {
      scale: 1.06, duration: 1.1, ease: 'sine.inOut', repeat: -1, yoyo: true, delay: 0.85,
    });
  }, []);

  // Blow detected → extinguish flame then advance
  useEffect(() => {
    if (!isBlowing) return;
    playAirBlow();
    if (hintRef.current) {
      gsap.killTweensOf(hintRef.current);
      gsap.to(hintRef.current, { opacity: 0, scale: 0.7, duration: 0.25 });
    }
    setFlameLit(false);
    setTimeout(() => setStep(3), 1500);
  }, [isBlowing, setFlameLit, setStep]);

  return (
    /* Fixed overlay, bottom-center — sits above the cake, no text */
    <div className="fixed inset-0 pointer-events-none flex items-end justify-center pb-[10vh]">
      <div ref={hintRef} className="flex flex-col items-center gap-3">

        {/* Mic icon */}
        <div className="relative">
          {/* Pulsing glow ring */}
          <div className="absolute inset-0 rounded-full bg-purple-400/40 blur-xl animate-ping" style={{ animationDuration: '1.6s' }} />
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-label="Blow into the mic">
            {/* Mic capsule */}
            <rect x="22" y="8" width="20" height="28" rx="10" fill="#a855f7" />
            {/* Highlight */}
            <rect x="25" y="11" width="5" height="12" rx="3" fill="white" opacity="0.35" />
            {/* Stand arc */}
            <path d="M 14 34 Q 14 52 32 52 Q 50 52 50 34"
                  stroke="#a855f7" strokeWidth="3.5" fill="none" strokeLinecap="round" />
            {/* Pole */}
            <line x1="32" y1="52" x2="32" y2="58" stroke="#a855f7" strokeWidth="3.5" strokeLinecap="round" />
            {/* Base */}
            <line x1="22" y1="58" x2="42" y2="58" stroke="#a855f7" strokeWidth="3.5" strokeLinecap="round" />
          </svg>
        </div>

        {/* Animated sound-wave dots */}
        <div className="flex items-end gap-1" aria-hidden>
          {[0, 150, 300, 150, 0].map((delay, i) => (
            <div
              key={i}
              className="w-1.5 rounded-full bg-purple-400 animate-bounce"
              style={{ height: `${[10, 18, 24, 18, 10][i]}px`, animationDelay: `${delay}ms`, animationDuration: '0.9s' }}
            />
          ))}
        </div>

        {/* Step label */}
        <p className="text-sm font-semibold text-purple-500 text-center whitespace-nowrap">
          Make a wish and blow! 💨
        </p>

      </div>
    </div>
  );
}
