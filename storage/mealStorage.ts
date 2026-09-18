import { storage } from './storage';
import { Meal } from '@/types/meal';

const MEALS_STORAGE_KEY = 'mealytics_meals';

export const mealStorage = {
  async getMeals(): Promise<Meal[]> {
    const meals = await storage.getItem<Meal[]>(MEALS_STORAGE_KEY);
    return meals || [];
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
  
  async clearMeals(): Promise<boolean> {
    return await storage.removeItem(MEALS_STORAGE_KEY);
  }
};
