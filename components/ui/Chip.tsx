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
  const { colors, isDark } = useTheme();
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
          ? isDark
            ? { backgroundColor: colors.accent, borderWidth: 0 }
            : [inset(), { backgroundColor: colors.base }]
          : isDark
            ? { backgroundColor: colors.surfaceRaised, borderWidth: 0 }
            : [raiseSm(), { backgroundColor: colors.base }],
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: selected
              ? isDark
                ? colors.onAccent
                : colors.accent
              : isDark
                ? colors.inkSecondary
                : colors.ink,
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
