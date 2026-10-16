import { create } from 'zustand';
import { UserProfile, UserGoals } from '@/types/user';
import { userStorage } from '@/storage/userStorage';
import { calculateGoals } from '@/utils/goals';

interface UserState {
  profile: UserProfile | null;
  goals: UserGoals | null;
  isLoading: boolean;
  isHydrated: boolean;
  hasOnboarded: boolean;

  loadProfile: () => Promise<void>;
  saveProfile: (profile: UserProfile) => Promise<void>;
  setHasOnboarded: (value: boolean) => Promise<void>;
  resetUser: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  profile: null,
  goals: null,
  isLoading: true,
  isHydrated: false,
  hasOnboarded: false,

  loadProfile: async () => {
    set({ isLoading: true });
    const [profile, hasOnboarded] = await Promise.all([
      userStorage.getProfile(),
      userStorage.getHasOnboarded(),
    ]);
    if (profile) {
      const goals = calculateGoals(profile);
      set({ profile, goals, hasOnboarded, isLoading: false, isHydrated: true });
    } else {
      set({ profile: null, goals: null, hasOnboarded, isLoading: false, isHydrated: true });
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

  setHasOnboarded: async (value: boolean) => {
    await userStorage.setHasOnboarded(value);
    set({ hasOnboarded: value });
  },

  resetUser: () => {
    set({ profile: null, goals: null, hasOnboarded: false });
  },
}));
