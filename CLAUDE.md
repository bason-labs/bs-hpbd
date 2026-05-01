# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run lint     # Run ESLint
```

## Architecture

This is an interactive birthday celebration app built with Next.js 16 (App Router), React 19, Zustand, and GSAP.

**Core flow:** `app/page.tsx` reads `currentStep` (1–4) from the Zustand store (`store/useBirthdayStore.ts`) and renders the matching view from `views/`. Each step auto-advances by calling `setStep(n+1)` after its animation completes.

**Steps:**
1. `Step1LightCandle` — click to light; GSAP flame tween
2. `Step2BlowCandle` — microphone blow detection via `hooks/useBlowDetect.ts` (Web Audio API, FFT analysis)
3. `Step3CutCake` — pointer drag; GSAP splits cake SVG via `clipPath` groups
4. `Step4OpenGift` — click to open; GSAP lid animation + canvas-confetti burst

**Key patterns:**
- All interactive views are `'use client'` components
- SVG components in `components/` accept `className` and `ref` for GSAP targeting; cake uses `clipPath` IDs `cake-left`/`cake-right`, gift uses ID `box-lid`
- Onboarding (`react-joyride`) is shown on first visit (`hasSeenTutorial === false`) and targets CSS class `.tour-step-1`
- Ionicons is loaded via CDN in `app/layout.tsx` with `afterInteractive` strategy; custom element types are declared in `types/ionicons.d.ts`
- `lib/store.ts` is a legacy store (0-indexed steps) — not currently used; active store is `store/useBirthdayStore.ts`
