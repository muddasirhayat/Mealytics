import AsyncStorage from '@react-native-async-storage/async-storage';
import { logError } from '@/utils/log';

const PREFIX = 'mealytics_';

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
