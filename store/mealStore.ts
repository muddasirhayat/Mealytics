import { create } from 'zustand';
import { Food } from '@/types/food';
import { MealSlot } from '@/types/meal';

const defaultSlot = (): MealSlot => {
  const hour = new Date().getHours();
  if (hour >= 4 && hour < 11) return 'breakfast';
  if (hour >= 11 && hour < 16) return 'lunch';
  if (hour >= 16 && hour < 21) return 'dinner';
  return 'snacks';
};

interface MealStore {
  draftMeal: Food[];
  draftSlot: MealSlot;
  setDraftSlot: (slot: MealSlot) => void;
  addFoodToMeal: (food: Food) => void;
  removeFoodFromMeal: (foodId: string) => void;
  clearDraftMeal: () => void;
}

export const useMealStore = create<MealStore>((set) => ({
  draftMeal: [],
  draftSlot: defaultSlot(),
  setDraftSlot: (slot) => set({ draftSlot: slot }),
  addFoodToMeal: (food) =>
    set((state) => ({ draftMeal: [...state.draftMeal, food] })),
  removeFoodFromMeal: (foodId) =>
    set((state) => ({ draftMeal: state.draftMeal.filter((item) => item.id !== foodId) })),
  clearDraftMeal: () => set({ draftMeal: [], draftSlot: defaultSlot() }),
}));
