export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
export type Gender = 'male' | 'female';
export type GoalType = 'lose' | 'maintain' | 'gain';
export type UnitSystem = 'metric' | 'imperial';

export interface UserProfile {
  name: string;
  age: number;
  gender: Gender;
  heightCm: number;    // Always stored in metric internally
  weightKg: number;    // Always stored in metric internally
  activityLevel: ActivityLevel;
  goalType: GoalType;
  unitSystem: UnitSystem;
}

export interface UserGoals {
  targetCalories: number;
  targetProtein: number; // in grams
  targetCarbs: number;   // in grams
  targetFat: number;     // in grams
  bmi: number;
}
