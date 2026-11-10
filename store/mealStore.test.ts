import { beforeEach, describe, expect, it } from 'vitest';
import type { Food } from '@/types/food';
import { startOfDayMs } from '@/utils/date';
import { useMealStore } from '@/store/mealStore';

const rice: Food = {
  id: 'rice',
  name: 'Rice',
  dataSource: 'custom',
  calories: 200,
  protein: 4,
  carbohydrates: 40,
  fat: 1,
  nutrients: [],
};

describe('logForToday', () => {
  beforeEach(() => {
    useMealStore.getState().clearDraftMeal();
  });

  it('keeps foods that were started for a previous day', () => {
    const today = startOfDayMs();
    const yesterday = startOfDayMs(today - 36 * 60 * 60 * 1000);
    useMealStore.setState({ draftMeal: [rice], draftDate: yesterday, draftSlot: 'dinner' });
    useMealStore.getState().logForToday();
    expect(useMealStore.getState().draftDate).toBe(yesterday);
    expect(useMealStore.getState().draftMeal).toHaveLength(1);
  });

  it('moves an empty draft onto today', () => {
    const today = startOfDayMs();
    const yesterday = startOfDayMs(today - 36 * 60 * 60 * 1000);
    useMealStore.setState({ draftMeal: [], draftDate: yesterday });
    useMealStore.getState().logForToday();
    expect(useMealStore.getState().draftDate).toBe(today);
  });
});
