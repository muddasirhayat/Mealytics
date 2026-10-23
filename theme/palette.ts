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
  overlay: string;
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
  overlay: 'rgba(30, 37, 51, 0.40)',
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

/**
 * Midnight Indigo — soft-UI dark.
 * Same glass + neumorphism language as light: every neumorphic surface shares
 * ONE colour with the page (bg = base = surface = surfaceRaised) and depth comes
 * from a dual shadow pair (lighter top-left highlight + deeper bottom-right shadow).
 * Mid-dark slate-indigo base (not pure black) so both shadows stay visible.
 * Text contrast on bg #252A37: ink 12.7:1, inkSecondary 7.1:1, muted 5.8:1,
 * inkMuted 5.3:1, accent 4.6:1 (WCAG AA); white on accent 3.2:1 (AA large text / icons).
 */
export const darkColors: ThemeColors = {
  bg: '#252A37',
  bgElevated: '#252A37',
  surface: '#252A37',
  surfaceRaised: '#252A37',
  surfacePressed: '#212532',
  border: 'rgba(255,255,255,0.06)',
  borderStrong: 'rgba(255,255,255,0.10)',
  ink: '#EEF1F8',
  inkSecondary: '#AEB7CA',
  inkMuted: '#949EB3',
  accent: '#8084FF',
  accentPressed: '#7478F5',
  onAccent: '#FFFFFF',
  mint: '#3DD9B9',
  danger: '#FF8696',
  warning: '#F5BE5C',
  protein: '#FF8A9A',
  carbs: '#6FAEFF',
  fat: '#F5BE5C',
  fiber: '#3DD9B9',

  base: '#252A37',
  background: '#252A37',
  text: '#EEF1F8',
  muted: '#9CA5B9',
  textSecondary: '#AEB7CA',
  placeholder: '#949EB3',
  textMuted: '#949EB3',
  textInverse: '#FFFFFF',
  primary: '#8084FF',
  primaryDark: '#7478F5',
  primaryLight: 'rgba(128, 132, 255, 0.18)',
  mintFill: '#3DD9B9',
  success: '#3DD9B9',
  error: '#FF8696',
  info: '#6FAEFF',
  divider: 'rgba(255,255,255,0.07)',
  fallbackBorder: 'rgba(255,255,255,0.10)',
  insetFill: '#212532',
  // Neumorphic pair — dark-mode equivalents of light #FFFFFF / #BFC8D6
  shadowLight: '#323848',
  shadowDark: '#161922',
  overlay: 'rgba(10, 12, 18, 0.60)',
  // Glass tuned for dark: faint white fill, crisp hairline + top highlight
  glass: 'rgba(255, 255, 255, 0.06)',
  glassBorder: 'rgba(255, 255, 255, 0.12)',
  glassHighlight: 'rgba(255, 255, 255, 0.14)',
  glassShadow: 'rgba(8, 10, 16, 0.45)',
  blobMint: '#3DD9B9',
  blobViolet: '#8B7BFF',
  blobPeach: '#FF9F7A',
  blobOpacity: 0.35,
  tabBarGlass: 'rgba(37, 42, 55, 0.72)',
  raisedShadow: '',
  insetShadow: '',
  accentShadow: 'rgba(128, 132, 255, 0.35)',
  bmiUnderweight: '#6FAEFF',
  bmiNormal: '#3DD9B9',
  bmiOverweight: '#F5BE5C',
  bmiObese: '#FF8696',
};

export type ColorSchemeName = 'light' | 'dark';
export type ThemePreference = 'system' | 'light' | 'dark';

export const paletteFor = (scheme: ColorSchemeName): ThemeColors =>
  scheme === 'dark' ? darkColors : lightColors;
