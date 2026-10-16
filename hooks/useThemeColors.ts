import { useColorScheme } from 'react-native';
import { useThemeStore } from '@/store/themeStore';
import {
  darkColors,
  lightColors,
  type ColorSchemeName,
  type ThemeColors,
  type ThemePreference,
} from '@/theme/palette';

export const resolveScheme = (
  preference: ThemePreference,
  system: string | null | undefined
): ColorSchemeName => {
  if (preference === 'light' || preference === 'dark') return preference;
  return system === 'dark' ? 'dark' : 'light';
};

export const useResolvedScheme = (): ColorSchemeName => {
  const preference = useThemeStore((s) => s.preference);
  const system = useColorScheme();
  return resolveScheme(preference, system);
};

export const useThemeColors = (): ThemeColors => {
  const scheme = useResolvedScheme();
  return scheme === 'dark' ? darkColors : lightColors;
};
