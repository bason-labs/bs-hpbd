'use client';

import { useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import confetti from 'canvas-confetti';
import GiftBox from '@/components/GiftBox';
import PointerFinger from '@/components/PointerFinger';
import { useSoundEffects } from '@/hooks/useSoundEffects';

const GIFT_IMAGES = ['/gifts/card-1.svg', '/gifts/card-2.svg'];

// Fan layout: [behind-left, front-right]
const CARD_ANGLES  = [-15, 9];
const CARD_X       = [-4, 40];
const CARD_Y       = [-85, -20];

export default function Step4OpenGift() {
  const [opened, setOpened] = useState(false);
  const cardRef      = useRef<HTMLDivElement>(null);
  const fingerRef    = useRef<HTMLImageElement>(null);
  const photoRefs    = useRef<(HTMLDivElement | null)[]>([]);
  const { playPop }  = useSoundEffects();

  // Finger bounce animation on mount — points at gift bow
  useEffect(() => {
    if (!fingerRef.current) return;
    gsap.set(fingerRef.current, { opacity: 0, y: -8 });
    gsap.to(fingerRef.current, { opacity: 1, duration: 0.4, ease: 'power2.out' });
    gsap.to(fingerRef.current, {
      y: 10,
      duration: 0.3,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true,
      delay: 0.4,
    });
  }, []);

  useEffect(() => {
    if (!opened || !cardRef.current) return;
    gsap.fromTo(
      cardRef.current,
      { scale: 0.4, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.7, delay: 0.3, ease: 'back.out(1.7)' }
    );
  }, [opened]);

  function handleOpen() {
    if (opened) return;
    playPop();
    setOpened(true);

    // Touch press → fade out
    gsap.killTweensOf(fingerRef.current);
    gsap.timeline()
      .to(fingerRef.current, { scale: 0.75, y: '+=10', duration: 0.1, ease: 'power2.in' })
      .to(fingerRef.current, { opacity: 0, y: '+=16', scale: 0.5, duration: 0.2, ease: 'power2.out' });

    gsap.timeline()
      // Pop lid off the box
      .to('#box-lid', {
        y: -50,
        rotation: -8,
        svgOrigin: '100 85',
        duration: 0.28,
        ease: 'power2.out',
      })
      // Fall and lean against the right side of the box
      .to('#box-lid', {
        x: 95,
        y: 55,
        rotation: 75,
        scale: 0.7,
        duration: 0.55,
        ease: 'back.out(0.7)',
      });

    // Photo cards rise from inside the box in a fan
    photoRefs.current.forEach((el, i) => {
      if (!el) return;
      gsap.fromTo(
        el,
        { y: 80, x: 0, opacity: 0, rotation: 0, scale: 0.85 },
        {
          y: CARD_Y[i],
          x: CARD_X[i],
          opacity: 1,
          rotation: CARD_ANGLES[i],
          scale: 1,
          transformOrigin: 'center bottom',
          duration: 0.72,
          delay: 0.22 + i * 0.13,
          ease: 'back.out(1.5)',
        }
      );
    });

    confetti({ particleCount: 80, spread: 70, origin: { y: 0.5 } });
    confetti({ particleCount: 40, spread: 50, angle: 60,  origin: { x: 0.2, y: 0.6 } });
    confetti({ particleCount: 40, spread: 50, angle: 120, origin: { x: 0.8, y: 0.6 } });
  }

  return (
    <div className="flex flex-col items-center gap-8 pointer-events-auto">
      <button
        onClick={handleOpen}
        disabled={opened}
        className="relative w-80 h-80 cursor-pointer rounded-2xl focus:outline-none focus-visible:ring-4 focus-visible:ring-purple-400 transition-transform active:scale-95 disabled:cursor-default"
        aria-label="Open gift box"
      >
        {/* Photo cards z-0 — box SVG at z-10 paints on top */}
        <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
          {GIFT_IMAGES.map((src, i) => (
            <div
              key={i}
              ref={el => { photoRefs.current[i] = el; }}
              className="absolute w-44 rounded-2xl overflow-hidden"
              style={{ opacity: 0 }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt=""
                className="w-full h-auto"
                draggable={false}
              />
            </div>
          ))}
        </div>

        {/* z-10 → renders on top of photo cards */}
        <div className="absolute inset-0 z-10 pointer-events-none">
          <GiftBox className="w-full h-full" />
        </div>

        <PointerFinger
          ref={fingerRef}
          className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-14 pointer-events-none z-10"
        />
      </button>


      {opened && (
        <div
          ref={cardRef}
          className="bg-white rounded-2xl shadow-2xl border border-pink-100 px-8 py-10 max-w-sm w-full text-center"
          style={{ opacity: 0 }}
        >
          <div className="text-4xl mb-3">🎂</div>
          <h2 className="text-2xl font-bold text-pink-500 tracking-tight">
            Happy Birthday!
          </h2>
          <p className="text-slate-600 leading-relaxed mt-4 text-base">
            Wishing you a day filled with joy, laughter, and all the things that make
            your heart smile. You deserve every wonderful moment — today and always.
          </p>
          <p className="mt-6 text-slate-400 leading-relaxed text-sm italic">
            May this year bring you adventures you&apos;ll never forget and memories
            you&apos;ll always treasure. Here&apos;s to you! 🥂
          </p>
          <p className="mt-6 text-xs text-pink-300 tracking-widest uppercase">
            With hope ✦
          </p>
        </div>
      )}
    </div>
  );
}
