import { create } from "zustand";

export type ScreenId =
  | "intro"
  | "firstRelease"
  | "video"
  | "votePrompt"
  | "login"
  | "vote"
  | "voteConfirm"
  | "dashboard";

export type VoteOption = "option1" | "option2" | null;

/** Intro sequence step: 0 = title only, 1 = + first subtext, 2 = transition, 3 = prompt + buttons */
export type IntroStep = 0 | 1 | 2 | 3;
export type IntroNoFlow = null | "maybe" | "second";

export interface ExperienceState {
  currentScreen: ScreenId;
  selectedVote: VoteOption;
  isLoggedIn: boolean;
  cameraPosition: { x: number; y: number; z: number };
  /** 0 = camera at start, 1 = camera at end (forward move complete) */
  cameraProgress: number;
  /** Set when camera move is triggered; used to dissolve initial black loading overlay */
  initialLoadComplete: boolean;
  /** Persisted so intro doesn't reset when component remounts */
  introStep: IntroStep;
  introNoFlow: IntroNoFlow;
  setScreen: (screen: ScreenId) => void;
  setVote: (vote: VoteOption) => void;
  setLoggedIn: (val: boolean) => void;
  setCameraPosition: (pos: { x: number; y: number; z: number }) => void;
  setCameraProgress: (progress: number) => void;
  setInitialLoadComplete: (value: boolean) => void;
  setIntroStep: (step: IntroStep) => void;
  setIntroNoFlow: (value: IntroNoFlow) => void;
}

export const useExperienceStore = create<ExperienceState>((set) => ({
  currentScreen: "intro",
  selectedVote: null,
  isLoggedIn: false,
  cameraPosition: { x: 0, y: 0, z: 45 },
  cameraProgress: 0,
  initialLoadComplete: false,
  introStep: 0,
  introNoFlow: null,
  setScreen: (screen) => set({ currentScreen: screen }),
  setVote: (selectedVote) => set({ selectedVote }),
  setLoggedIn: (isLoggedIn) => set({ isLoggedIn }),
  setCameraPosition: (cameraPosition) => set({ cameraPosition }),
  setCameraProgress: (cameraProgress) => set({ cameraProgress }),
  setInitialLoadComplete: (initialLoadComplete) => set({ initialLoadComplete }),
  setIntroStep: (introStep) => set({ introStep }),
  setIntroNoFlow: (introNoFlow) => set({ introNoFlow }),
}));
