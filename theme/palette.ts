export const lightColors = {
  base: '#E6EBF2',
  background: '#E6EBF2',
  surface: '#E6EBF2',
  ink: '#1E2533',
  text: '#1E2533',
  muted: '#5F6B7E',
  textSecondary: '#5F6B7E',
  placeholder: '#7A8597',
  textMuted: '#7A8597',
  textInverse: '#FFFFFF',

  shadowLight: '#FFFFFF',
  shadowDark: '#BFC8D6',
  fallbackBorder: '#D3DAE5',
  insetFill: '#DDE3EB',

  accent: '#5B5FEF',
  primary: '#5B5FEF',
  primaryDark: '#5B5FEF',
  primaryLight: 'rgba(91, 95, 239, 0.14)',
  mint: '#2CC8A8',
  mintFill: '#2CC8A8',

  glass: 'rgba(255, 255, 255, 0.32)',
  glassBorder: 'rgba(255, 255, 255, 0.7)',
  glassHighlight: 'rgba(255, 255, 255, 0.9)',
  glassShadow: 'rgba(70, 80, 120, 0.12)',

  blobMint: '#7FE3CF',
  blobViolet: '#B9A8FF',
  blobPeach: '#FFC7A8',

  protein: '#F07C8C',
  carbs: '#5B9BF0',
  fat: '#F2B24C',
  fiber: '#2CC8A8',

  success: '#2CC8A8',
  warning: '#F2B24C',
  error: '#DC2626',
  danger: '#DC2626',
  info: '#5B9BF0',

  border: '#D3DAE5',
  divider: 'rgba(30, 37, 51, 0.08)',

  bmiUnderweight: '#5B9BF0',
  bmiNormal: '#2CC8A8',
  bmiOverweight: '#F2B24C',
  bmiObese: '#DC2626',
};

export const darkColors: typeof lightColors = {
  base: '#1A1F2B',
  background: '#1A1F2B',
  surface: '#232A38',
  ink: '#EEF2F8',
  text: '#EEF2F8',
  muted: '#9AA6BA',
  textSecondary: '#9AA6BA',
  placeholder: '#7A8597',
  textMuted: '#7A8597',
  textInverse: '#FFFFFF',

  shadowLight: '#2A3142',
  shadowDark: '#0F131A',
  fallbackBorder: '#2F3748',
  insetFill: '#151A24',

  accent: '#7B7FF5',
  primary: '#7B7FF5',
  primaryDark: '#7B7FF5',
  primaryLight: 'rgba(123, 127, 245, 0.18)',
  mint: '#2CC8A8',
  mintFill: '#2CC8A8',

  glass: 'rgba(35, 42, 56, 0.72)',
  glassBorder: 'rgba(255, 255, 255, 0.12)',
  glassHighlight: 'rgba(255, 255, 255, 0.08)',
  glassShadow: 'rgba(0, 0, 0, 0.35)',

  blobMint: '#2A6B5E',
  blobViolet: '#4A4580',
  blobPeach: '#6B4A38',

  protein: '#F07C8C',
  carbs: '#5B9BF0',
  fat: '#F2B24C',
  fiber: '#2CC8A8',

  success: '#2CC8A8',
  warning: '#F2B24C',
  error: '#F87171',
  danger: '#F87171',
  info: '#5B9BF0',

  border: '#2F3748',
  divider: 'rgba(238, 242, 248, 0.1)',

  bmiUnderweight: '#5B9BF0',
  bmiNormal: '#2CC8A8',
  bmiOverweight: '#F2B24C',
  bmiObese: '#F87171',
};

export type ThemeColors = typeof lightColors;
export type ColorSchemeName = 'light' | 'dark';
export type ThemePreference = 'system' | 'light' | 'dark';

export const paletteFor = (scheme: ColorSchemeName): ThemeColors =>
  scheme === 'dark' ? darkColors : lightColors;
