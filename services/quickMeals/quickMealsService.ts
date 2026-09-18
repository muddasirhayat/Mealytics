import { storage } from '@/storage/storage';
import { QuickMeal, DailyQuickMealsRecord } from '@/types/quickMeal';
import quickRecipesData from '@/data/quickRecipes.json';

const STORAGE_KEY_DAILY = 'mealytics_quick_daily';
const STORAGE_KEY_HISTORY = 'mealytics_quick_history';
const DAILY_COUNT = 10;
const MAX_HISTORY_TRACKED = 50;

// Helper to get local date string YYYY-MM-DD
export const getLocalDateString = (date: Date = new Date()): string => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

// Seeded/pseudo-random Fisher-Yates shuffle
const shuffleArray = <T>(array: T[]): T[] => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

export const quickMealsService = {
  /**
   * Returns all meals available in the local dataset.
   */
  getAllMeals(): QuickMeal[] {
    return quickRecipesData as QuickMeal[];
  },

  /**
   * Retrieves today's 10 healthy meals.
   * - If already generated for today's date, returns the saved selection from AsyncStorage.
   * - If date changed (or first run), selects a fresh 10 meals avoiding recently shown meals.
   */
  async getDailyQuickMeals(currentDate: Date = new Date()): Promise<QuickMeal[]> {
    const allMeals = this.getAllMeals();
    const todayStr = getLocalDateString(currentDate);

    // 1. Check if today's selection is already saved in AsyncStorage
    const savedDaily = await storage.getItem<DailyQuickMealsRecord>(STORAGE_KEY_DAILY);

    if (savedDaily && savedDaily.date === todayStr && Array.isArray(savedDaily.mealIds) && savedDaily.mealIds.length === DAILY_COUNT) {
      // Map stored mealIds back to full QuickMeal objects
      const mealMap = new Map(allMeals.map((m) => [m.id, m]));
      const retrieved = savedDaily.mealIds.map((id) => mealMap.get(id)).filter((m): m is QuickMeal => m !== undefined);

      if (retrieved.length === DAILY_COUNT) {
        return retrieved;
      }
    }

    // 2. Need to generate a new 10-meal selection for today
    const history = (await storage.getItem<string[]>(STORAGE_KEY_HISTORY)) || [];
    const historySet = new Set(history);

    // Filter out meals shown recently
    let candidates = allMeals.filter((m) => !historySet.has(m.id));

    // If history is too large or exhausted, allow older history to be reused
    if (candidates.length < DAILY_COUNT) {
      // Reset candidates to all meals not in yesterday's daily batch if available
      const yesterdayIds = new Set(savedDaily?.mealIds || []);
      candidates = allMeals.filter((m) => !yesterdayIds.has(m.id));
      if (candidates.length < DAILY_COUNT) {
        candidates = allMeals;
      }
    }

    // Shuffle candidates and pick exactly 10
    const shuffled = shuffleArray(candidates);
    const selected = shuffled.slice(0, DAILY_COUNT);

    // Ensure we have exactly 10 distinct meals (fallback if dataset is smaller)
    const selectedIds = selected.map((m) => m.id);

    // 3. Persist today's daily record
    const dailyRecord: DailyQuickMealsRecord = {
      date: todayStr,
      mealIds: selectedIds,
    };
    await storage.setItem(STORAGE_KEY_DAILY, dailyRecord);

    // 4. Update history (keep last MAX_HISTORY_TRACKED entries)
    const updatedHistory = [...selectedIds, ...history.filter((id) => !selectedIds.includes(id))].slice(
      0,
      MAX_HISTORY_TRACKED
    );
    await storage.setItem(STORAGE_KEY_HISTORY, updatedHistory);

    return selected;
  },

  /**
   * Force refresh today's selection (useful for testing or manual user reroll)
   */
  async forceRefreshDailyMeals(currentDate: Date = new Date()): Promise<QuickMeal[]> {
    await storage.removeItem(STORAGE_KEY_DAILY);
    return this.getDailyQuickMeals(currentDate);
  },
};
