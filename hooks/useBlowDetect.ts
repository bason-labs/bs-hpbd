'use client';

import { useRef, useState, useCallback, useEffect } from 'react';

// ── Tune these two values if detection feels too sensitive or too sluggish ──
// Average FFT volume (0–255) that must be sustained to count as a blow.
const VOLUME_THRESHOLD = 15;

// Number of consecutive rAF frames volume must stay above VOLUME_THRESHOLD.
// At ~60 fps, 20 frames ≈ 333ms. Any single frame below threshold resets to 0,
// so short spikes (clicks, coughs, typing) can never accumulate to this count.
const REQUIRED_CONSECUTIVE_FRAMES = 20;
// ────────────────────────────────────────────────────────────────────────────

export function useBlowDetect() {
  const [isListening, setIsListening] = useState(false);
  const [isBlowing, setIsBlowing] = useState(false);
  const [currentVolume, setCurrentVolume] = useState(0);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);

  const stopAll = useCallback(() => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') audioContextRef.current.close();
    if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
  }, []);

  const startListening = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,  // filters speaker bleed picked up by the mic
          noiseSuppression: true,  // suppresses steady background noise (fan, AC)
          autoGainControl: false,  // prevents mic from boosting quiet ambient sound
        },
      });
      streamRef.current = stream;

      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;

      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      audioContext.createMediaStreamSource(stream).connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      dataArrayRef.current = dataArray;

      setIsListening(true);

      // Counts unbroken frames above threshold. Any frame below threshold
      // resets this to 0, making it immune to short transient spikes.
      let consecutiveBlowFrames = 0;

      const detect = () => {
        analyser.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((sum, val) => sum + val, 0) / dataArray.length;

        setCurrentVolume(avg);

        if (avg >= VOLUME_THRESHOLD) {
          consecutiveBlowFrames++;

          if (consecutiveBlowFrames >= REQUIRED_CONSECUTIVE_FRAMES) {
            // Volume was sustained and unbroken long enough — genuine blow.
            stopAll();
            setIsBlowing(true);
            return; // exit rAF loop
          }
        } else {
          // Any gap resets the counter; a spike can never accumulate across frames.
          consecutiveBlowFrames = 0;
        }

        rafRef.current = requestAnimationFrame(detect);
      };

      rafRef.current = requestAnimationFrame(detect);
    } catch (err) {
      console.error('Microphone access denied or unavailable:', err);
    }
  }, [stopAll]);

  useEffect(() => stopAll, [stopAll]);

  return { isListening, isBlowing, currentVolume, startListening };
}
