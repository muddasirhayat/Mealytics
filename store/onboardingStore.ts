import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { zustandJsonStorage } from '@/storage/zustandStorage';
import type { ActivityLevel, Gender, GoalType, UnitSystem } from '@/types/user';
import { DEFAULT_MACRO_PERCENTS, type MacroPercents } from '@/utils/goals';

export type OnboardingDraft = {
  name: string;
  goalType: GoalType;
  gender: Gender;
  age: number;
  heightCm: number;
  weightKg: number;
  unitSystem: UnitSystem;
  activityLevel: ActivityLevel;
  macroPercents: MacroPercents;
};

type OnboardingState = OnboardingDraft & {
  celebrating: boolean;
  isHydrated: boolean;
  patch: (partial: Partial<OnboardingDraft>) => void;
  setCelebrating: (value: boolean) => void;
  reset: () => void;
};

const defaults = (): OnboardingDraft => ({
  name: '',
  goalType: 'maintain',
  gender: 'male',
  age: 29,
  heightCm: 170,
  weightKg: 70,
  unitSystem: 'metric',
  activityLevel: 'moderate',
  macroPercents: { ...DEFAULT_MACRO_PERCENTS },
});

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      ...defaults(),
      celebrating: false,
      isHydrated: false,
      patch: (partial) => set(partial),
      setCelebrating: (value) => set({ celebrating: value }),
      reset: () => set({ ...defaults(), celebrating: false }),
    }),
    {
      name: 'mealytics_onboarding_draft',
      storage: zustandJsonStorage({ debounceMs: 300 }),
      partialize: (state) => ({
        name: state.name,
        goalType: state.goalType,
        gender: state.gender,
        age: state.age,
        heightCm: state.heightCm,
        weightKg: state.weightKg,
        unitSystem: state.unitSystem,
        activityLevel: state.activityLevel,
        macroPercents: state.macroPercents,
      }),
      onRehydrateStorage: () => () => {
        useOnboardingStore.setState({ isHydrated: true });
      },
    }
  )
);
