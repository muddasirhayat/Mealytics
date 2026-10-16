import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useThemeColors } from '@/hooks/useThemeColors';
import { radius } from '@/theme/radius';
import { typography } from '@/theme/typography';
import { inset, raiseSm } from '@/utils/shadow';

type SegmentedProps<T extends string> = {
  options: { label: string; value: T }[];
  value: T;
  onChange: (value: T) => void;
  accessibilityLabel?: string;
};

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  accessibilityLabel,
}: SegmentedProps<T>) {
  const colors = useThemeColors();
  return (
    <View
      style={[styles.track, inset(), { backgroundColor: colors.base }]}
      accessibilityRole="tablist"
      accessibilityLabel={accessibilityLabel}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={option.label}
            style={[
              styles.item,
              selected && raiseSm(),
              selected && { backgroundColor: colors.base },
            ]}
          >
            <Text style={[styles.label, { color: selected ? colors.accent : colors.muted }]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    height: 44,
    borderRadius: radius.segmented,
    padding: 4,
    gap: 4,
  },
  item: {
    flex: 1,
    height: '100%',
    borderRadius: radius.segmentedInner,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 36,
  },
  label: {
    ...typography.chip,
  },
});
