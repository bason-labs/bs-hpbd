'use client';

import { useEffect, useState } from 'react';
import { useBirthdayStore } from '@/store/useBirthdayStore';
import Step1LightCandle from '@/views/Step1LightCandle';
import Step2BlowCandle from '@/views/Step2BlowCandle';
import Step3CutCake from '@/views/Step3CutCake';
import Step4OpenGift from '@/views/Step4OpenGift';
import WelcomeScreen from '@/components/WelcomeScreen';
import FallingImages from '@/components/FallingImages';
import Cake25D from '@/components/Cake25D';

const FALLING_IMAGES = [
  '/images/balloon.svg',
  '/images/balloon-blue.svg',
  '/images/balloon-yellow.svg',
  '/images/heart.svg',
  '/images/star.svg',
  '/images/cupcake.svg',
  '/images/gift.svg',
  '/images/confetti.svg',
];

// Hint overlays only — no cake rendered here
function renderHint(step: number) {
  switch (step) {
    case 1: return <Step1LightCandle />;
    case 2: return <Step2BlowCandle />;
    case 3: return <Step3CutCake />;
    case 4: return <Step4OpenGift />;
    default: return null;
  }
}

export default function Home() {
  const { currentStep, hasEntered, isFlameLit, setStep, setFlameLit } = useBirthdayStore();
  const [lighterCursor, setLighterCursor] = useState("url('/cursur/lighter.png') 10 10, pointer");
  const [cakeHovered, setCakeHovered] = useState(false);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => stream.getTracks().forEach(t => t.stop()))
      .catch(() => {});
  }, []);

  // Generate a rotated lighter cursor image via canvas (runs once on mount)
  useEffect(() => {
    const img = new Image();
    img.src = '/cursur/lighter.png';
    img.onload = () => {
      const ANGLE = -30 * (Math.PI / 180); // 30° counter-clockwise
      // Browsers cap custom cursor images at 128×128px.
      // Scale to target HEIGHT so the lighter appears taller.
      // At 30° rotation, bounding box ≈ 1.37× — keep sh ≤ 90 to stay inside 128px.
      const TARGET_H = 90;
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      const scale = TARGET_H / h;
      const sw = Math.ceil(w * scale);
      const sh = TARGET_H;
      const size = 128; // fixed canvas at browser max
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d')!;
      ctx.translate(size / 2, size / 2);
      ctx.rotate(ANGLE);
      ctx.drawImage(img, -sw / 2, -sh / 2, sw, sh);
      const half = Math.floor(size / 2);
      setLighterCursor(`url('${canvas.toDataURL()}') ${half} ${half}, pointer`);
    };
  }, []);

  // Apply lighter cursor to the full page only during step 1 (after entering)
  useEffect(() => {
    if (hasEntered && currentStep === 1) {
      document.body.style.cursor = lighterCursor;
    } else {
      document.body.style.cursor = '';
    }
    return () => { document.body.style.cursor = ''; };
  }, [currentStep, hasEntered, lighterCursor]);

  // Cake click handler lives here so Cake25D never remounts between steps
  function handleCakeClick() {
    if (currentStep !== 1 || isFlameLit) return;
    setFlameLit(true);
    setTimeout(() => setStep(2), 1500);
  }

  // Keep cake mounted for BOTH steps 1 and 2 — the same instance persists across
  // the step transition, so there is zero jump/flicker.
  const showCake = currentStep === 1 || currentStep === 2 || currentStep === 3;

  return (
    <>
      {/* Layer 1 — falling images (z-0) */}
      <FallingImages images={FALLING_IMAGES} count={20} />

      {/* Layer 2 — romantic gradient overlay (z-10), non-interactive */}
      <div className="fixed inset-0 z-10 pointer-events-none bg-gradient-to-b from-pink-300/40 to-purple-400/40" />

      {/*
        Layer 2.5 — persistent Cake25D (z-15).
        Mounted for steps 1 AND 2 so it never unmounts on the 1→2 transition.
        onClick only wired in step 1; step 2 it's just decorative.
        Size: min(72vmin, 560px) — large enough to fill most of the screen.
      */}
      {showCake && (
        <div className="fixed inset-0 z-[15] flex items-center justify-center pointer-events-none">
          <div
            className="pointer-events-auto"
            style={{
              width: 'min(72vmin, 560px)',
              height: 'min(72vmin, 560px)',
              transform: cakeHovered && currentStep <= 2 ? 'scale(1.04)' : 'scale(1)',
              transition: 'transform 0.35s ease',
            }}
            onMouseEnter={() => setCakeHovered(true)}
            onMouseLeave={() => setCakeHovered(false)}
          >
            <Cake25D
              onClick={currentStep === 1 ? handleCakeClick : undefined}
              className="w-full h-full"
              style={{ cursor: currentStep === 1 ? lighterCursor : undefined }}
              hideCandle={currentStep === 3}
            />
          </div>
        </div>
      )}

      {/* Layer 3 — step overlays + steps 3-4 UI (z-20) */}
      <main className="relative z-20 min-h-screen flex flex-col items-center justify-center pointer-events-none">
        {/* Steps 3-4 restore pointer-events via pointer-events-auto on their root div */}
        {renderHint(currentStep)}
      </main>

      {/* Layer 4 — welcome screen gate (z-50) */}
      {!hasEntered && <WelcomeScreen />}
    </>
  );
}
