import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Food } from '@/types/food';
import type { Meal } from '@/types/meal';

const mem = new Map<string, string>();
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

vi.mock('./storage', () => ({
  storage: {
    async getItem<T>(key: string): Promise<T | null> {
      await delay(20);
      const value = mem.get(key);
      return value ? (JSON.parse(value) as T) : null;
    },
    async setItem<T>(key: string, value: T): Promise<boolean> {
      await delay(20);
      mem.set(key, JSON.stringify(value));
      return true;
    },
    async removeItem(key: string): Promise<boolean> {
      await delay(20);
      mem.delete(key);
      return true;
    },
  },
}));

import { mealStorage } from './mealStorage';

const food = (id: string, name: string): Food => ({
  id,
  name,
  dataSource: 'custom',
  calories: 100,
  protein: 10,
  carbohydrates: 10,
  fat: 2,
  nutrients: [],
});

const meal = (id: string, foods: Food[] = [food(`${id}-food`, 'Rice')]): Meal => ({
  id,
  timestamp: Date.now(),
  slot: 'lunch',
  foods,
  totalCalories: 100,
  totalProtein: 10,
  totalCarbohydrates: 10,
  totalFat: 2,
});

describe('mealStorage write queue', () => {
  beforeEach(async () => {
    mem.clear();
    await mealStorage.clearMeals();
  });

  it('keeps both meals when two saves overlap', async () => {
    await Promise.all([mealStorage.saveMeal(meal('a')), mealStorage.saveMeal(meal('b'))]);
    const saved = await mealStorage.getMeals();
    expect(saved.map((item) => item.id).sort()).toEqual(['a', 'b']);
  });

  it('does not drop a meal saved while another meal loses a food', async () => {
    await mealStorage.saveMeal(meal('kept', [food('f1', 'Apple'), food('f2', 'Bread')]));
    await Promise.all([
      mealStorage.saveMeal(meal('added')),
      mealStorage.removeFood('kept', 0),
    ]);
    const saved = await mealStorage.getMeals();
    const ids = saved.map((item) => item.id).sort();
    expect(ids).toEqual(['added', 'kept']);
    const kept = saved.find((item) => item.id === 'kept');
    expect(kept?.foods).toHaveLength(1);
    expect(kept?.foods[0]?.name).toBe('Bread');
  });
});
