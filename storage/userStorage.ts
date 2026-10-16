import { storage } from './storage';
import { UserProfile } from '@/types/user';

const PROFILE_STORAGE_KEY = 'mealytics_user_profile';
const ONBOARDED_KEY = 'mealytics_has_onboarded';

export const userStorage = {
  async getProfile(): Promise<UserProfile | null> {
    return await storage.getItem<UserProfile>(PROFILE_STORAGE_KEY);
  },

  async saveProfile(profile: UserProfile): Promise<boolean> {
    return await storage.setItem(PROFILE_STORAGE_KEY, profile);
  },

  async getHasOnboarded(): Promise<boolean> {
    const value = await storage.getItem<boolean>(ONBOARDED_KEY);
    return value === true;
  },

  async setHasOnboarded(value: boolean): Promise<boolean> {
    return await storage.setItem(ONBOARDED_KEY, value);
  },

  async clearProfile(): Promise<boolean> {
    return await storage.removeItem(PROFILE_STORAGE_KEY);
  },
};
