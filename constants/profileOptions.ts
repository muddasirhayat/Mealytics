import type { Feather } from '@expo/vector-icons';
import type { ActivityLevel, GoalType } from '@/types/user';

type FeatherName = keyof typeof Feather.glyphMap;

export const ACTIVITY_OPTIONS: {
  label: string;
  shortLabel: string;
  description: string;
  value: ActivityLevel;
  icon: FeatherName;
}[] = [
  {
    label: 'Mostly sitting',
    shortLabel: 'Sitting',
    description: 'Desk job, little exercise',
    value: 'sedentary',
    icon: 'monitor',
  },
  {
    label: 'Lightly active',
    shortLabel: 'Light',
    description: 'Walks, 1–3 workouts a week',
    value: 'light',
    icon: 'navigation',
  },
  {
    label: 'Moderately active',
    shortLabel: 'Moderate',
    description: 'Exercise 3–5 days a week',
    value: 'moderate',
    icon: 'activity',
  },
  {
    label: 'Active',
    shortLabel: 'Active',
    description: 'Hard exercise most days',
    value: 'active',
    icon: 'trending-up',
  },
  {
    label: 'Very active',
    shortLabel: 'Very active',
    description: 'Hard training or physical job',
    value: 'very_active',
    icon: 'zap',
  },
];

export const GOAL_OPTIONS: {
  label: string;
  description: string;
  value: GoalType;
  icon: FeatherName;
}[] = [
  {
    label: 'Lose weight',
    description: 'Gentle calorie deficit',
    value: 'lose',
    icon: 'trending-down',
  },
  {
    label: 'Maintain',
    description: 'Keep your current weight',
    value: 'maintain',
    icon: 'minus',
  },
  {
    label: 'Gain muscle',
    description: 'Extra protein and calories',
    value: 'gain',
    icon: 'trending-up',
  },
];

/** Mealytics is not for children under 13. */
export const AGE_MIN = 13;
export const AGE_MAX = 100;

export const ageValidationMessage = (age: number | null): string | undefined => {
  if (age === null || age < AGE_MIN || age > AGE_MAX) {
    return `Enter an age between ${AGE_MIN} and ${AGE_MAX}.`;
  }
  return undefined;
};
export const HEIGHT_CM_MIN = 100;
export const HEIGHT_CM_MAX = 250;
export const WEIGHT_KG_MIN = 30;
export const WEIGHT_KG_MAX = 300;
