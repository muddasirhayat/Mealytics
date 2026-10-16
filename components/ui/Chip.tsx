import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useThemeColors } from '@/hooks/useThemeColors';
import { radius } from '@/theme/radius';
import { typography } from '@/theme/typography';
import { inset, raiseSm } from '@/utils/shadow';

type ChipProps = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
};

export const Chip = ({ label, selected = false, onPress }: ChipProps) => {
  const colors = useThemeColors();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      style={[
        styles.chip,
        { backgroundColor: colors.base },
        selected ? inset() : raiseSm(),
      ]}
    >
      <Text style={[styles.text, { color: selected ? colors.accent : colors.ink }]}>{label}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  chip: {
    height: 40,
    paddingHorizontal: 16,
    borderRadius: radius.chip,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  text: {
    ...typography.chip,
  },
});
