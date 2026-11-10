import { storage } from './storage';
import { Food } from '@/types/food';
import { Meal } from '@/types/meal';
import { createWriteQueue } from './writeQueue';

const MEALS_STORAGE_KEY = 'mealytics_meals';
const enqueue = createWriteQueue();

const totalsFromFoods = (foods: Food[]) => ({
  totalCalories: Math.round(foods.reduce((sum, food) => sum + (food.calories || 0), 0)),
  totalProtein: Math.round(foods.reduce((sum, food) => sum + (food.protein || 0), 0)),
  totalCarbohydrates: Math.round(foods.reduce((sum, food) => sum + (food.carbohydrates || 0), 0)),
  totalFat: Math.round(foods.reduce((sum, food) => sum + (food.fat || 0), 0)),
});

const readMeals = async (): Promise<Meal[]> => {
  const meals = await storage.getItem<Meal[]>(MEALS_STORAGE_KEY);
  return meals || [];
};

const writeMeals = (meals: Meal[]): Promise<boolean> => storage.setItem(MEALS_STORAGE_KEY, meals);

const saveMealUnlocked = async (meal: Meal): Promise<boolean> => {
  const meals = await readMeals();
  return writeMeals([meal, ...meals]);
};

const deleteMealUnlocked = async (id: string): Promise<boolean> => {
  const meals = await readMeals();
  return writeMeals(meals.filter((meal) => meal.id !== id));
};

const removeFoodUnlocked = async (mealId: string, index: number): Promise<boolean> => {
  const meals = await readMeals();
  const meal = meals.find((item) => item.id === mealId);
  if (!meal || index < 0 || index >= meal.foods.length) {
    return false;
  }
  const foods = meal.foods.filter((_, foodIndex) => foodIndex !== index);
  if (foods.length === 0) {
    return deleteMealUnlocked(mealId);
  }
  const updated: Meal = {
    ...meal,
    foods,
    ...totalsFromFoods(foods),
  };
  return writeMeals(meals.map((item) => (item.id === mealId ? updated : item)));
};

const updateFoodUnlocked = async (mealId: string, index: number, food: Food): Promise<boolean> => {
  const meals = await readMeals();
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
  return writeMeals(meals.map((item) => (item.id === mealId ? updated : item)));
};

export const mealStorage = {
  async getMeals(): Promise<Meal[]> {
    return readMeals();
  },

  async getMeal(id: string): Promise<Meal | undefined> {
    const meals = await readMeals();
    return meals.find((meal) => meal.id === id);
  },

  async getMealsByDate(date: Date): Promise<Meal[]> {
    const allMeals = await readMeals();
    return allMeals.filter((meal) => {
      const mealDate = new Date(meal.timestamp);
      return (
        mealDate.getFullYear() === date.getFullYear() &&
        mealDate.getMonth() === date.getMonth() &&
        mealDate.getDate() === date.getDate()
      );
    });
  },

  saveMeal(meal: Meal): Promise<boolean> {
    return enqueue(() => saveMealUnlocked(meal));
  },

  deleteMeal(id: string): Promise<boolean> {
    return enqueue(() => deleteMealUnlocked(id));
  },

  removeFood(mealId: string, index: number): Promise<boolean> {
    return enqueue(() => removeFoodUnlocked(mealId, index));
  },

  updateFood(mealId: string, index: number, food: Food): Promise<boolean> {
    return enqueue(() => updateFoodUnlocked(mealId, index, food));
  },

  clearMeals(): Promise<boolean> {
    return enqueue(() => storage.removeItem(MEALS_STORAGE_KEY));
  },
};
