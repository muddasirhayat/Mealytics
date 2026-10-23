import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { typography } from '@/theme/typography';
import { inset, raiseSm } from '@/utils/shadow';
import { PressableScale } from '@/components/ui/PressableScale';
import { emitSelectionHaptic } from '@/hooks/useTickFeedback';
import { usePreferencesStore } from '@/store/preferencesStore';

type ChipProps = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
};

export const Chip = ({ label, selected = false, onPress }: ChipProps) => {
  const { colors } = useTheme();
  const soundsOn = usePreferencesStore((s) => s.soundsAndHaptics);

  return (
    <PressableScale
      onPress={() => {
        emitSelectionHaptic(soundsOn);
        onPress?.();
      }}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      style={[
        styles.chip,
        selected
          ? [inset(), { backgroundColor: colors.base }]
          : [raiseSm(), { backgroundColor: colors.base }],
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: selected ? colors.accent : colors.ink,
          },
        ]}
      >
        {label}
      </Text>
    </PressableScale>
  );
};

const styles = StyleSheet.create({
  chip: {
    height: 40,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 40,
  },
  text: {
    ...typography.chip,
  },
});
