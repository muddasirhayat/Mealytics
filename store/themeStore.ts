import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { zustandJsonStorage } from '@/storage/zustandStorage';
import type { ThemePreference } from '@/theme/palette';

type ThemeState = {
  preference: ThemePreference;
  isHydrated: boolean;
  setPreference: (preference: ThemePreference) => void;
  reset: () => void;
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      preference: 'system',
      isHydrated: false,
      setPreference: (preference) => set({ preference }),
      reset: () => set({ preference: 'light' }),
    }),
    {
      name: 'mealytics_theme',
      storage: zustandJsonStorage(),
      partialize: (state) => ({ preference: state.preference }),
      onRehydrateStorage: () => () => {
        useThemeStore.setState({ isHydrated: true });
      },
    }
  )
);
