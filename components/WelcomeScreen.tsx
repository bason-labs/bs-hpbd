'use client';

import { useRef } from 'react';
import { gsap } from 'gsap';
import { useBirthdayStore } from '@/store/useBirthdayStore';
import { useSoundEffects } from '@/hooks/useSoundEffects';

export default function WelcomeScreen() {
  const overlayRef = useRef<HTMLDivElement>(null);
  const { setHasEntered } = useBirthdayStore();
  const { playBGM } = useSoundEffects();

  function handleEnter() {
    playBGM();

    gsap.to(overlayRef.current, {
      opacity: 0,
      duration: 1,
      ease: 'power2.inOut',
      onComplete: () => setHasEntered(true),
    });
  }

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{
        background: 'linear-gradient(to bottom, rgba(131,24,67,0.92), rgba(88,28,135,0.95))',
      }}
    >
      {/* Decorative sparkle rings */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full border border-pink-300/20"
            style={{
              width: `${180 + i * 120}px`,
              height: `${180 + i * 120}px`,
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              opacity: 0.4 - i * 0.05,
            }}
          />
        ))}
      </div>

      <p className="text-pink-200/70 text-sm tracking-[0.3em] uppercase mb-4">
        A special surprise for you
      </p>

      <h1
        className="text-5xl font-bold text-white mb-2 text-center"
        style={{ textShadow: '0 0 40px rgba(244,114,182,0.8)' }}
      >
        Happy Birthday
      </h1>
      <p className="text-4xl mb-12">🎂</p>

      <button
        onClick={handleEnter}
        className="relative px-10 py-4 rounded-full text-white font-semibold text-lg cursor-pointer transition-transform duration-150 hover:scale-105 active:scale-95"
        style={{
          background: 'linear-gradient(135deg, #ec4899, #a855f7)',
          boxShadow: '0 0 30px rgba(236,72,153,0.6), 0 0 60px rgba(168,85,247,0.3)',
        }}
      >
        ✨ Enter the Party
      </button>
    </div>
  );
}
