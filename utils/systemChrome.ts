import { Platform, StatusBar } from 'react-native';
import * as SystemUI from 'expo-system-ui';
import type { ColorSchemeName, ThemeColors } from '@/theme/palette';

export const applySystemChrome = (colors: ThemeColors, scheme: ColorSchemeName) => {
  void SystemUI.setBackgroundColorAsync(colors.bg);
  const barStyle = scheme === 'dark' ? 'light-content' : 'dark-content';
  StatusBar.setBarStyle(barStyle, true);
  if (Platform.OS === 'android') {
    try {
      StatusBar.setBackgroundColor(colors.bg, true);
      StatusBar.setTranslucent(false);
    } catch {
      // Android 15 edge-to-edge ignores status-bar background color.
    }
  }
};
