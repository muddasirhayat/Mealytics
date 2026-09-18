export interface QuickMeal {
  id: string;
  name: string;
  servingSize: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  tags: string[];
}

export interface DailyQuickMealsRecord {
  date: string; // YYYY-MM-DD
  mealIds: string[];
}
