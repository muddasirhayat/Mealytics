import { create } from 'zustand';
import { UserProfile, UserGoals } from '@/types/user';
import { userStorage } from '@/storage/userStorage';

// Constants for macro split (can be customized later)
const MACRO_SPLIT = {
  PROTEIN: 0.30, // 30% of calories from protein
  FAT: 0.30,     // 30% of calories from fat
  CARBS: 0.40,   // 40% of calories from carbs
};

// Activity multipliers
const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

// Goal adjustments (in calories)
const GOAL_ADJUSTMENTS = {
  lose: -500, // deficit
  maintain: 0,
  gain: 500,  // surplus
};

interface UserState {
  profile: UserProfile | null;
  goals: UserGoals | null;
  isLoading: boolean;
  
  loadProfile: () => Promise<void>;
  saveProfile: (profile: UserProfile) => Promise<void>;
}

const calculateGoals = (profile: UserProfile): UserGoals => {
  // BMI Calculation
  const heightM = profile.heightCm / 100;
  const bmi = profile.weightKg / (heightM * heightM);

  // BMR Calculation (Mifflin-St Jeor Equation)
  let bmr = (10 * profile.weightKg) + (6.25 * profile.heightCm) - (5 * profile.age);
  if (profile.gender === 'male') {
    bmr += 5;
  } else {
    bmr -= 161;
  }

  // TDEE (Total Daily Energy Expenditure)
  const tdee = bmr * ACTIVITY_MULTIPLIERS[profile.activityLevel];

  // Target Calories
  const targetCalories = Math.round(tdee + GOAL_ADJUSTMENTS[profile.goalType]);

  // Macro Calculation (Protein=4kcal/g, Carbs=4kcal/g, Fat=9kcal/g)
  const targetProtein = Math.round((targetCalories * MACRO_SPLIT.PROTEIN) / 4);
  const targetCarbs = Math.round((targetCalories * MACRO_SPLIT.CARBS) / 4);
  const targetFat = Math.round((targetCalories * MACRO_SPLIT.FAT) / 9);

  return {
    targetCalories,
    targetProtein,
    targetCarbs,
    targetFat,
    bmi: Number(bmi.toFixed(1)),
  };
};

export const useUserStore = create<UserState>((set) => ({
  profile: null,
  goals: null,
  isLoading: true,

  loadProfile: async () => {
    set({ isLoading: true });
    const profile = await userStorage.getProfile();
    if (profile) {
      const goals = calculateGoals(profile);
      set({ profile, goals, isLoading: false });
    } else {
      set({ profile: null, goals: null, isLoading: false });
    }
  },

  saveProfile: async (profile: UserProfile) => {
    const success = await userStorage.saveProfile(profile);
    if (!success) {
      throw new Error('Failed to save profile');
    }
    const goals = calculateGoals(profile);
    set({ profile, goals });
  },
}));
