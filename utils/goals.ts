import { UserProfile, UserGoals, type MacroSplit } from '@/types/user';

export const MACRO_SPLIT: MacroSplit = {
  protein: 0.3,
  fat: 0.3,
  carbs: 0.4,
};

export const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
} as const;

export const GOAL_ADJUSTMENTS = {
  lose: -500,
  maintain: 0,
  gain: 500,
} as const;

export const waterTargetMl = (weightKg: number): number => Math.round(weightKg * 35);

export const goalLabel = (goalType: UserProfile['goalType']): string => {
  if (goalType === 'lose') return 'Weight loss';
  if (goalType === 'gain') return 'Muscle gain';
  return 'Maintain';
};

export type MacroPercents = {
  protein: number;
  carbs: number;
  fat: number;
};

const MACRO_KEYS: (keyof MacroPercents)[] = ['protein', 'carbs', 'fat'];

export const DEFAULT_MACRO_PERCENTS: MacroPercents = {
  protein: 30,
  carbs: 40,
  fat: 30,
};

export const percentsToSplit = (percents: MacroPercents): MacroSplit => ({
  protein: percents.protein / 100,
  carbs: percents.carbs / 100,
  fat: percents.fat / 100,
});

export const splitToPercents = (split: MacroSplit): MacroPercents => ({
  protein: Math.round(split.protein * 100),
  carbs: Math.round(split.carbs * 100),
  fat: Math.round(split.fat * 100),
});

/** Keep each macro 10–60% and the three values summing to 100. */
export const rebalanceMacros = (
  current: MacroPercents,
  changed: keyof MacroPercents,
  raw: number
): MacroPercents => {
  const next = Math.round(Math.min(60, Math.max(10, raw)));
  const others = MACRO_KEYS.filter((key) => key !== changed);
  const remaining = 100 - next;
  const firstKey = others[0];
  const secondKey = others[1];
  const firstCurrent = current[firstKey];
  const secondCurrent = current[secondKey];
  const sum = firstCurrent + secondCurrent || 1;
  const minFirst = Math.max(10, remaining - 60);
  const maxFirst = Math.min(60, remaining - 10);
  const first = Math.round(Math.min(maxFirst, Math.max(minFirst, remaining * (firstCurrent / sum))));
  const second = remaining - first;
  return {
    ...current,
    [changed]: next,
    [firstKey]: first,
    [secondKey]: second,
  };
};

export const calculateGoals = (profile: UserProfile): UserGoals => {
  const heightM = profile.heightCm / 100;
  const bmi = profile.weightKg / (heightM * heightM);

  let bmr = (10 * profile.weightKg) + (6.25 * profile.heightCm) - (5 * profile.age);
  if (profile.gender === 'male') {
    bmr += 5;
  } else {
    bmr -= 161;
  }

  const tdee = bmr * ACTIVITY_MULTIPLIERS[profile.activityLevel];
  const targetCalories = Math.round(tdee + GOAL_ADJUSTMENTS[profile.goalType]);

  const split = profile.macroSplit ?? MACRO_SPLIT;
  const targetProtein = Math.round((targetCalories * split.protein) / 4);
  const targetCarbs = Math.round((targetCalories * split.carbs) / 4);
  const targetFat = Math.round((targetCalories * split.fat) / 9);
  const targetFiber = Math.max(20, Math.round((targetCalories / 1000) * 14));

  return {
    targetCalories,
    targetProtein,
    targetCarbs,
    targetFat,
    targetFiber,
    bmi: Number(bmi.toFixed(1)),
  };
};
