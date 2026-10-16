import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { useThemeColors } from '@/hooks/useThemeColors';
import type { ThemeColors } from '@/theme/palette';

export function useThemedStyles<T extends StyleSheet.NamedStyles<T>>(
  factory: (colors: ThemeColors) => T
): T {
  const colors = useThemeColors();
  return useMemo(() => StyleSheet.create(factory(colors)), [colors, factory]);
}
