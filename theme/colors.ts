import { getActiveColors } from '@/theme/runtime';
import {
  darkColors,
  lightColors,
  paletteFor,
  type ColorSchemeName,
  type ThemeColors,
  type ThemePreference,
} from '@/theme/palette';

export {
  darkColors,
  lightColors,
  paletteFor,
  type ColorSchemeName,
  type ThemeColors,
  type ThemePreference,
};

export const gradients = {
  ring: [lightColors.mint, lightColors.accent] as const,
};

/**
 * Live palette proxy — property reads resolve to the active scheme.
 * Module-level StyleSheet.create still snapshots values at first evaluation;
 * themed screens should use `useThemeColors` / `useThemedStyles`.
 */
export const colors: ThemeColors = new Proxy(lightColors, {
  get(_target, prop) {
    if (typeof prop !== 'string') return undefined;
    if (prop in lightColors) {
      return getActiveColors()[prop as keyof ThemeColors];
    }
    return undefined;
  },
}) as ThemeColors;

export type Colors = ThemeColors;
