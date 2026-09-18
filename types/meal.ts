import { Food } from './food';

export type MealSlot = 'breakfast' | 'lunch' | 'dinner' | 'snacks';

export interface Meal {
  id: string;
  timestamp: number;
  slot?: MealSlot;
  foods: Food[];
  totalCalories: number;
  totalProtein: number;
  totalCarbohydrates: number;
  totalFat: number;
}
