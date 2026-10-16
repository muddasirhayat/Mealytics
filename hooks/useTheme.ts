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

/** Preferred theme API — colours + scheme. */
export const useTheme = (): { colors: ThemeColors; scheme: ColorSchemeName; isDark: boolean } => {
  const scheme = useResolvedScheme();
  const colors = scheme === 'dark' ? darkColors : lightColors;
  return { colors, scheme, isDark: scheme === 'dark' };
};

/** @deprecated Prefer useTheme().colors */
export const useThemeColors = (): ThemeColors => useTheme().colors;
