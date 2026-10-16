import { darkColors, lightColors, type ColorSchemeName, type ThemeColors } from '@/theme/palette';

let activeScheme: ColorSchemeName = 'light';
let active: ThemeColors = lightColors;

export const setActiveColors = (scheme: ColorSchemeName) => {
  activeScheme = scheme;
  active = scheme === 'dark' ? darkColors : lightColors;
};

export const getActiveColors = (): ThemeColors => active;

export const getActiveScheme = (): ColorSchemeName => activeScheme;

export const isDarkScheme = (): boolean => activeScheme === 'dark';
