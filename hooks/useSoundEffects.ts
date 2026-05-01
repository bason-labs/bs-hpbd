// Module-level singletons — persist across React re-renders without extra state.
// Created lazily on first use; guarded so SSR never touches HTMLAudioElement.

let bgmAudio: HTMLAudioElement | null = null;
let buzzAudio: HTMLAudioElement | null = null;
let buzzFadeTimer: ReturnType<typeof setInterval> | null = null;

function getBgm(): HTMLAudioElement | null {
  if (typeof window === 'undefined') return null;
  if (!bgmAudio) {
    bgmAudio = new Audio('/sounds/happy-birthday-song.mp3');
    bgmAudio.loop = true;
    bgmAudio.volume = 0.4;
  }
  return bgmAudio;
}

function getBuzz(): HTMLAudioElement | null {
  if (typeof window === 'undefined') return null;
  if (!buzzAudio) {
    buzzAudio = new Audio('/sounds/candle-buzz.mp3');
    buzzAudio.loop = true;
    buzzAudio.volume = 0.15;
  }
  return buzzAudio;
}

function playSfx(src: string) {
  if (typeof window === 'undefined') return;
  const audio = new Audio(src);
  audio.play().catch(() => {});
}

export function useSoundEffects() {
  function playBGM() {
    const bgm = getBgm();
    if (!bgm) return;
    bgm.play().catch(() => {});
  }

  function playLightMatch() {
    playSfx('/sounds/spinopel-light.mp3');
  }

  function playAirBlow() {
    playSfx('/sounds/air-blow.mp3');
  }

  function playSword() {
    playSfx('/sounds/sword.mp3');
  }

  function playPop() {
    playSfx('/sounds/pop.mp3');
  }

  function duckBGM() {
    const bgm = getBgm();
    if (bgm) bgm.volume = 0.1;
  }

  function restoreBGM() {
    const bgm = getBgm();
    if (bgm) bgm.volume = 0.4;
  }

  function setCandleBuzzing(isBuzzing: boolean) {
    const buzz = getBuzz();
    if (!buzz) return;

    if (isBuzzing) {
      // Clear any in-progress fade so we don't fight ourselves
      if (buzzFadeTimer !== null) {
        clearInterval(buzzFadeTimer);
        buzzFadeTimer = null;
      }
      buzz.volume = 0.15;
      buzz.currentTime = 0;
      buzz.play().catch(() => {});
    } else {
      // Smooth fade-out over ~400 ms (20 steps × 20 ms)
      if (buzzFadeTimer !== null) clearInterval(buzzFadeTimer);
      const step = buzz.volume / 20;
      buzzFadeTimer = setInterval(() => {
        if (!buzz) return;
        if (buzz.volume > step) {
          buzz.volume = Math.max(0, buzz.volume - step);
        } else {
          buzz.volume = 0;
          buzz.pause();
          if (buzzFadeTimer !== null) {
            clearInterval(buzzFadeTimer);
            buzzFadeTimer = null;
          }
        }
      }, 20);
    }
  }

  return { playBGM, duckBGM, restoreBGM, playLightMatch, playAirBlow, playSword, playPop, setCandleBuzzing };
}
