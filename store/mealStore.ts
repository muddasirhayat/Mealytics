import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Food } from '@/types/food';
import { MealSlot } from '@/types/meal';
import { zustandJsonStorage } from '@/storage/zustandStorage';
import { startOfDayMs } from '@/utils/date';

const defaultSlot = (): MealSlot => {
  const hour = new Date().getHours();
  if (hour >= 4 && hour < 11) return 'breakfast';
  if (hour >= 11 && hour < 16) return 'lunch';
  if (hour >= 16 && hour < 21) return 'dinner';
  return 'snacks';
};

const clampDraftDate = (value: unknown): number => {
  const today = startOfDayMs();
  if (typeof value !== 'number' || !Number.isFinite(value)) return today;
  const day = startOfDayMs(value);
  return day > today ? today : day;
};

interface MealStore {
  draftMeal: Food[];
  draftSlot: MealSlot;
  draftDate: number;
  setDraftSlot: (slot: MealSlot) => void;
  setDraftDate: (dateMs: number) => void;
  logForToday: () => void;
  addFoodToMeal: (food: Food) => void;
  updateFoodInMeal: (foodId: string, food: Food) => void;
  removeFoodFromMeal: (foodId: string) => void;
  clearDraftMeal: () => void;
}

export const useMealStore = create<MealStore>()(
  persist(
    (set) => ({
      draftMeal: [],
      draftSlot: defaultSlot(),
      draftDate: startOfDayMs(),
      setDraftSlot: (slot) => set({ draftSlot: slot }),
      setDraftDate: (dateMs) => set({ draftDate: clampDraftDate(dateMs) }),
      logForToday: () => set({ draftDate: startOfDayMs() }),
      addFoodToMeal: (food) =>
        set((state) => ({ draftMeal: [...state.draftMeal, food] })),
      updateFoodInMeal: (foodId, food) =>
        set((state) => ({
          draftMeal: state.draftMeal.map((item) => (item.id === foodId ? { ...food, id: foodId } : item)),
        })),
      removeFoodFromMeal: (foodId) =>
        set((state) => ({
          draftMeal: state.draftMeal.filter((item) => item.id !== foodId),
        })),
      clearDraftMeal: () =>
        set({ draftMeal: [], draftSlot: defaultSlot(), draftDate: startOfDayMs() }),
    }),
    {
      name: 'mealytics_draft_meal',
      storage: zustandJsonStorage(),
      partialize: (state) => ({
        draftMeal: state.draftMeal,
        draftSlot: state.draftSlot,
        draftDate: state.draftDate,
      }),
      merge: (persisted, current) => {
        const stored = (persisted ?? {}) as Partial<MealStore>;
        return {
          ...current,
          ...stored,
          draftDate: clampDraftDate(stored.draftDate),
        };
      },
    }
  )
);
