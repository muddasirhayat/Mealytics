/**
 * Mealytics colour tokens.
 * Light values are the product source of truth — do not change them.
 * Dark values implement the "Midnight Indigo" theme.
 */

export type ThemeColors = {
  // Semantic surfaces
  bg: string;
  bgElevated: string;
  surface: string;
  surfaceRaised: string;
  surfacePressed: string;
  border: string;
  borderStrong: string;
  ink: string;
  inkSecondary: string;
  inkMuted: string;
  accent: string;
  accentPressed: string;
  onAccent: string;
  mint: string;
  danger: string;
  warning: string;
  protein: string;
  carbs: string;
  fat: string;
  fiber: string;

  // Legacy aliases (map to semantic tokens — keep call sites stable)
  base: string;
  background: string;
  text: string;
  muted: string;
  textSecondary: string;
  placeholder: string;
  textMuted: string;
  textInverse: string;
  primary: string;
  primaryDark: string;
  primaryLight: string;
  mintFill: string;
  success: string;
  error: string;
  info: string;
  divider: string;
  fallbackBorder: string;
  insetFill: string;
  shadowLight: string;
  shadowDark: string;
  glass: string;
  glassBorder: string;
  glassHighlight: string;
  glassShadow: string;
  blobMint: string;
  blobViolet: string;
  blobPeach: string;
  blobOpacity: number;
  tabBarGlass: string;
  raisedShadow: string;
  insetShadow: string;
  accentShadow: string;
  bmiUnderweight: string;
  bmiNormal: string;
  bmiOverweight: string;
  bmiObese: string;
};

export const lightColors: ThemeColors = {
  bg: '#E6EBF2',
  bgElevated: '#E6EBF2',
  surface: '#E6EBF2',
  surfaceRaised: '#E6EBF2',
  surfacePressed: '#DDE3EB',
  border: '#D3DAE5',
  borderStrong: '#D3DAE5',
  ink: '#1E2533',
  inkSecondary: '#5F6B7E',
  inkMuted: '#7A8597',
  accent: '#5B5FEF',
  accentPressed: '#4F53E0',
  onAccent: '#FFFFFF',
  mint: '#2CC8A8',
  danger: '#DC2626',
  warning: '#F2B24C',
  protein: '#F07C8C',
  carbs: '#5B9BF0',
  fat: '#F2B24C',
  fiber: '#2CC8A8',

  base: '#E6EBF2',
  background: '#E6EBF2',
  text: '#1E2533',
  muted: '#5F6B7E',
  textSecondary: '#5F6B7E',
  placeholder: '#7A8597',
  textMuted: '#7A8597',
  textInverse: '#FFFFFF',
  primary: '#5B5FEF',
  primaryDark: '#5B5FEF',
  primaryLight: 'rgba(91, 95, 239, 0.14)',
  mintFill: '#2CC8A8',
  success: '#2CC8A8',
  error: '#DC2626',
  info: '#5B9BF0',
  divider: 'rgba(30, 37, 51, 0.08)',
  fallbackBorder: '#D3DAE5',
  insetFill: '#DDE3EB',
  shadowLight: '#FFFFFF',
  shadowDark: '#BFC8D6',
  glass: 'rgba(255, 255, 255, 0.32)',
  glassBorder: 'rgba(255, 255, 255, 0.7)',
  glassHighlight: 'rgba(255, 255, 255, 0.9)',
  glassShadow: 'rgba(70, 80, 120, 0.12)',
  blobMint: '#7FE3CF',
  blobViolet: '#B9A8FF',
  blobPeach: '#FFC7A8',
  blobOpacity: 0.75,
  tabBarGlass: 'rgba(255, 255, 255, 0.32)',
  raisedShadow: '',
  insetShadow: '',
  accentShadow: 'rgba(91,95,239,0.4)',
  bmiUnderweight: '#5B9BF0',
  bmiNormal: '#2CC8A8',
  bmiOverweight: '#F2B24C',
  bmiObese: '#DC2626',
};

/** Midnight Indigo */
export const darkColors: ThemeColors = {
  bg: '#12151F',
  bgElevated: '#171B27',
  surface: '#1C2130',
  surfaceRaised: '#242A3B',
  surfacePressed: '#2B3246',
  border: 'rgba(255,255,255,0.08)',
  borderStrong: 'rgba(255,255,255,0.10)',
  ink: '#F1F3F9',
  inkSecondary: '#A7B0C2',
  inkMuted: '#6F7A90',
  accent: '#7C80FF',
  accentPressed: '#6A6EF0',
  onAccent: '#FFFFFF',
  mint: '#34D4B4',
  danger: '#FF7A8A',
  warning: '#F5B95A',
  protein: '#FF8A9A',
  carbs: '#6BA8FF',
  fat: '#F5BE5C',
  fiber: '#34D4B4',

  base: '#12151F',
  background: '#12151F',
  text: '#F1F3F9',
  muted: '#A7B0C2',
  textSecondary: '#A7B0C2',
  placeholder: '#6F7A90',
  textMuted: '#6F7A90',
  textInverse: '#FFFFFF',
  primary: '#7C80FF',
  primaryDark: '#6A6EF0',
  primaryLight: 'rgba(124, 128, 255, 0.18)',
  mintFill: '#34D4B4',
  success: '#34D4B4',
  error: '#FF7A8A',
  info: '#6BA8FF',
  divider: 'rgba(255,255,255,0.06)',
  fallbackBorder: 'rgba(255,255,255,0.10)',
  insetFill: '#242A3B',
  shadowLight: 'transparent',
  shadowDark: 'rgba(0,0,0,0.40)',
  glass: 'rgba(255,255,255,0.05)',
  glassBorder: 'rgba(255,255,255,0.08)',
  glassHighlight: 'transparent',
  glassShadow: 'rgba(0,0,0,0.40)',
  blobMint: '#34D4B4',
  blobViolet: '#8B7BFF',
  blobPeach: '#FF9F7A',
  blobOpacity: 0.18,
  tabBarGlass: 'rgba(23,27,39,0.85)',
  raisedShadow: 'rgba(0,0,0,0.40)',
  insetShadow: 'rgba(0,0,0,0.45)',
  accentShadow: 'rgba(124,128,255,0.35)',
  bmiUnderweight: '#6BA8FF',
  bmiNormal: '#34D4B4',
  bmiOverweight: '#F5B95A',
  bmiObese: '#FF7A8A',
};

export type ColorSchemeName = 'light' | 'dark';
export type ThemePreference = 'system' | 'light' | 'dark';

export const paletteFor = (scheme: ColorSchemeName): ThemeColors =>
  scheme === 'dark' ? darkColors : lightColors;
