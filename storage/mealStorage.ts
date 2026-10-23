import { storage } from './storage';
import { Food } from '@/types/food';
import { Meal } from '@/types/meal';

const MEALS_STORAGE_KEY = 'mealytics_meals';

const totalsFromFoods = (foods: Food[]) => ({
  totalCalories: Math.round(foods.reduce((sum, food) => sum + (food.calories || 0), 0)),
  totalProtein: Math.round(foods.reduce((sum, food) => sum + (food.protein || 0), 0)),
  totalCarbohydrates: Math.round(foods.reduce((sum, food) => sum + (food.carbohydrates || 0), 0)),
  totalFat: Math.round(foods.reduce((sum, food) => sum + (food.fat || 0), 0)),
});

export const mealStorage = {
  async getMeals(): Promise<Meal[]> {
    const meals = await storage.getItem<Meal[]>(MEALS_STORAGE_KEY);
    return meals || [];
  },

  async getMeal(id: string): Promise<Meal | undefined> {
    const meals = await this.getMeals();
    return meals.find((meal) => meal.id === id);
  },

  async getMealsByDate(date: Date): Promise<Meal[]> {
    const allMeals = await this.getMeals();
    return allMeals.filter(meal => {
      const mealDate = new Date(meal.timestamp);
      return (
        mealDate.getFullYear() === date.getFullYear() &&
        mealDate.getMonth() === date.getMonth() &&
        mealDate.getDate() === date.getDate()
      );
    });
  },

  async saveMeal(meal: Meal): Promise<boolean> {
    const meals = await this.getMeals();
    // Add new meal to the beginning of the array
    const updatedMeals = [meal, ...meals];
    return await storage.setItem(MEALS_STORAGE_KEY, updatedMeals);
  },

  async deleteMeal(id: string): Promise<boolean> {
    const meals = await this.getMeals();
    const updatedMeals = meals.filter(m => m.id !== id);
    return await storage.setItem(MEALS_STORAGE_KEY, updatedMeals);
  },

  async removeFood(mealId: string, index: number): Promise<boolean> {
    const meals = await this.getMeals();
    const meal = meals.find((item) => item.id === mealId);
    if (!meal || index < 0 || index >= meal.foods.length) {
      return false;
    }
    const foods = meal.foods.filter((_, foodIndex) => foodIndex !== index);
    if (foods.length === 0) {
      return this.deleteMeal(mealId);
    }
    const updated: Meal = {
      ...meal,
      foods,
      ...totalsFromFoods(foods),
    };
    const next = meals.map((item) => (item.id === mealId ? updated : item));
    return storage.setItem(MEALS_STORAGE_KEY, next);
  },

  async updateFood(mealId: string, index: number, food: Food): Promise<boolean> {
    const meals = await this.getMeals();
    const meal = meals.find((item) => item.id === mealId);
    if (!meal || index < 0 || index >= meal.foods.length) {
      return false;
    }
    const existing = meal.foods[index];
    if (!existing) {
      return false;
    }
    const foods = meal.foods.map((item, foodIndex) =>
      foodIndex === index ? { ...food, id: existing.id } : item
    );
    const updated: Meal = {
      ...meal,
      foods,
      ...totalsFromFoods(foods),
    };
    const next = meals.map((item) => (item.id === mealId ? updated : item));
    return storage.setItem(MEALS_STORAGE_KEY, next);
  },
  
  async clearMeals(): Promise<boolean> {
    return await storage.removeItem(MEALS_STORAGE_KEY);
  }
};
