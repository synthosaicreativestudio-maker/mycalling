import { create } from 'zustand';

export type IntroState = 'moon' | 'tree' | 'leaves' | 'professions' | 'logo' | 'transition' | 'completed';

interface UIState {
  introState: IntroState;
  setIntroState: (state: IntroState) => void;
}

export const useUIStore = create<UIState>((set) => ({
  introState: 'moon',
  setIntroState: (state) => set({ introState: state }),
}));
