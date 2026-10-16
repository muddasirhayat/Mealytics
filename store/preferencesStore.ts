import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { zustandJsonStorage } from '@/storage/zustandStorage';

type PreferencesState = {
  soundsAndHaptics: boolean;
  isHydrated: boolean;
  setSoundsAndHaptics: (value: boolean) => void;
};

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      soundsAndHaptics: true,
      isHydrated: false,
      setSoundsAndHaptics: (soundsAndHaptics) => set({ soundsAndHaptics }),
    }),
    {
      name: 'mealytics_preferences',
      storage: zustandJsonStorage({ debounceMs: 300 }),
      partialize: (state) => ({ soundsAndHaptics: state.soundsAndHaptics }),
      onRehydrateStorage: () => () => {
        usePreferencesStore.setState({ isHydrated: true });
      },
    }
  )
);
