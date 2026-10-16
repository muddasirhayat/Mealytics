import { Linking } from 'react-native';
import { logError } from '@/utils/log';

export const openExternalUrl = async (url: string): Promise<boolean> => {
  try {
    await Linking.openURL(url);
    return true;
  } catch (error) {
    logError('Failed to open URL', error);
    return false;
  }
};
