import AsyncStorage from '@react-native-async-storage/async-storage';
import { logError } from '@/utils/log';
import { useThemeStore } from '@/store/themeStore';
import { usePreferencesStore } from '@/store/preferencesStore';
import { useMealStore } from '@/store/mealStore';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useUserStore } from '@/store/userStore';

const PREFIX = 'mealytics_';

const resetMemory = () => {
  useThemeStore.getState().reset();
  usePreferencesStore.getState().reset();
  useMealStore.getState().clearDraftMeal();
  useOnboardingStore.getState().reset();
  useUserStore.getState().resetUser();
};

export const wipeMealyticsKeys = async (): Promise<void> => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const ours = keys.filter((key) => key.startsWith(PREFIX));
    if (ours.length > 0) {
      await AsyncStorage.multiRemove(ours);
    }
  } catch (error) {
    logError('Failed to wipe Mealytics storage keys', error);
    throw error;
  }
};

/** Storage + in-memory stores back to a first-run app (light theme, empty onboarding). */
export const resetAppToFreshInstall = async (): Promise<void> => {
  resetMemory();
  await Promise.all([
    useThemeStore.persist.clearStorage(),
    usePreferencesStore.persist.clearStorage(),
    useMealStore.persist.clearStorage(),
    useOnboardingStore.persist.clearStorage(),
  ]);
  await wipeMealyticsKeys();
  resetMemory();
};
