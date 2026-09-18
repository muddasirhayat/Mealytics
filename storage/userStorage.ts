import { storage } from './storage';
import { UserProfile } from '@/types/user';

const PROFILE_STORAGE_KEY = 'mealytics_user_profile';

export const userStorage = {
  async getProfile(): Promise<UserProfile | null> {
    return await storage.getItem<UserProfile>(PROFILE_STORAGE_KEY);
  },

  async saveProfile(profile: UserProfile): Promise<boolean> {
    return await storage.setItem(PROFILE_STORAGE_KEY, profile);
  },
};
