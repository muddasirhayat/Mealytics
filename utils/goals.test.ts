import { describe, expect, it } from 'vitest';
import { AGE_MIN, ageValidationMessage } from '@/constants/profileOptions';
import type { UserProfile } from '@/types/user';
import {
  ADULT_AGE,
  CALORIE_FLOOR_ADULT,
  CALORIE_FLOOR_MINOR,
  calculateGoals,
  calorieFloorForAge,
  rebalanceMacros,
} from '@/utils/goals';

const profile = (overrides: Partial<UserProfile> = {}): UserProfile => ({
  name: 'Test',
  age: 29,
  gender: 'male',
  heightCm: 170,
  weightKg: 70,
  activityLevel: 'moderate',
  goalType: 'maintain',
  unitSystem: 'metric',
  ...overrides,
});

describe('calculateGoals', () => {
  it('uses Mifflin-St Jeor for a typical maintenance target', () => {
    const goals = calculateGoals(profile());
    expect(goals.targetCalories).toBe(2515);
    expect(goals.targetRaisedToFloor).toBe(false);
    expect(goals.targetProtein).toBeGreaterThan(0);
    expect(goals.targetCarbs).toBeGreaterThan(0);
    expect(goals.targetFat).toBeGreaterThan(0);
  });

  it('lifts an extreme adult cut up to the adult floor', () => {
    const goals = calculateGoals(
      profile({
        age: 100,
        gender: 'female',
        heightCm: 100,
        weightKg: 30,
        activityLevel: 'sedentary',
        goalType: 'lose',
      })
    );
    expect(goals.targetCalories).toBe(CALORIE_FLOOR_ADULT);
    expect(goals.targetCalories).toBeGreaterThan(0);
    expect(goals.targetRaisedToFloor).toBe(true);
  });

  it('lifts a 13-year-old cut up to the minor floor', () => {
    const goals = calculateGoals(
      profile({
        age: 13,
        gender: 'female',
        heightCm: 100,
        weightKg: 30,
        activityLevel: 'sedentary',
        goalType: 'lose',
      })
    );
    expect(goals.targetCalories).toBeGreaterThanOrEqual(CALORIE_FLOOR_MINOR);
    expect(goals.targetRaisedToFloor).toBe(true);
  });

  it('switches floors at 18', () => {
    expect(calorieFloorForAge(ADULT_AGE - 1)).toBe(CALORIE_FLOOR_MINOR);
    expect(calorieFloorForAge(ADULT_AGE)).toBe(CALORIE_FLOOR_ADULT);
  });
});

describe('age minimum', () => {
  it('rejects ages under 13 and accepts the minimum', () => {
    expect(ageValidationMessage(AGE_MIN - 1)).toContain(String(AGE_MIN));
    expect(ageValidationMessage(AGE_MIN)).toBeUndefined();
    expect(ageValidationMessage(null)).toBeTruthy();
  });
});

describe('rebalanceMacros', () => {
  it('keeps protein, carbs, and fat summing to 100', () => {
    const next = rebalanceMacros({ protein: 30, carbs: 40, fat: 30 }, 'protein', 50);
    expect(next.protein).toBe(50);
    expect(next.protein + next.carbs + next.fat).toBe(100);
  });
});
