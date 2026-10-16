import { darkColors, lightColors, type ColorSchemeName, type ThemeColors } from '@/theme/palette';

let active: ThemeColors = lightColors;

export const setActiveColors = (scheme: ColorSchemeName) => {
  active = scheme === 'dark' ? darkColors : lightColors;
};

export const getActiveColors = (): ThemeColors => active;
