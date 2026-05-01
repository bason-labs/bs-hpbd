import { create } from "zustand";

interface BirthdayState {
  /** 1-indexed step tracking progress through the birthday experience */
  currentStep: number;
  setStep: (step: number) => void;
  /** Whether the user has clicked through the welcome screen */
  hasEntered: boolean;
  setHasEntered: (val: boolean) => void;
  /** Whether the candle flame is currently lit */
  isFlameLit: boolean;
  setFlameLit: (val: boolean) => void;
}

export const useBirthdayStore = create<BirthdayState>()((set) => ({
  currentStep: 1,
  setStep: (step) => set({ currentStep: step }),
  hasEntered: false,
  setHasEntered: (val) => set({ hasEntered: val }),
  isFlameLit: false,
  setFlameLit: (val) => set({ isFlameLit: val }),
}));
