import { storage } from './storage';

const dayKey = (prefix: string, date: Date = new Date()) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${prefix}_${yyyy}-${mm}-${dd}`;
};

export const celebrationStorage = {
  async hasWaterGoalCelebrated(date: Date = new Date()): Promise<boolean> {
    return Boolean(await storage.getItem<boolean>(dayKey('mealytics_water_goal', date)));
  },

  async markWaterGoalCelebrated(date: Date = new Date()): Promise<void> {
    await storage.setItem(dayKey('mealytics_water_goal', date), true);
  },

  async clearWaterGoalCelebrated(date: Date = new Date()): Promise<void> {
    await storage.removeItem(dayKey('mealytics_water_goal', date));
  },

  async hasCalorieGoalCelebrated(date: Date = new Date()): Promise<boolean> {
    return Boolean(await storage.getItem<boolean>(dayKey('mealytics_calorie_goal', date)));
  },

  async markCalorieGoalCelebrated(date: Date = new Date()): Promise<void> {
    await storage.setItem(dayKey('mealytics_calorie_goal', date), true);
  },
};
