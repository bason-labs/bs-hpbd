import { create } from "zustand";

interface AppState {
  /** 0-indexed step: 0=candle lit, 1=candle blown, 2=cake cut, 3=gift opened */
  currentStep: number;
  /** True once the user has completed the onboarding tutorial */
  hasSeenTutorial: boolean;
  setStep: (step: number) => void;
  markTutorialSeen: () => void;
}

export const useAppStore = create<AppState>()((set) => ({
  currentStep: 0,
  hasSeenTutorial: false,
  setStep: (step) => set({ currentStep: step }),
  markTutorialSeen: () => set({ hasSeenTutorial: true }),
}));
