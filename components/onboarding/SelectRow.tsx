import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { IconSquare } from '@/components/ui/IconSquare';
import { PressableScale } from '@/components/ui/PressableScale';
import { useTheme } from '@/hooks/useTheme';
import { fonts } from '@/theme/fonts';
import { typography } from '@/theme/typography';
import { inset, raiseSm } from '@/utils/shadow';
import { emitSelectionHaptic } from '@/hooks/useTickFeedback';
import { usePreferencesStore } from '@/store/preferencesStore';

type SelectRowProps = {
  label: string;
  description: string;
  icon: keyof typeof Feather.glyphMap;
  selected: boolean;
  onPress: () => void;
};

export const SelectRow = ({ label, description, icon, selected, onPress }: SelectRowProps) => {
  const { colors } = useTheme();
  const soundsOn = usePreferencesStore((s) => s.soundsAndHaptics);

  return (
    <PressableScale
      onPress={() => {
        emitSelectionHaptic(soundsOn);
        onPress();
      }}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={`${label}. ${description}`}
      style={[
        styles.row,
        selected
          ? [inset(), { backgroundColor: colors.base }]
          : [raiseSm(), { backgroundColor: colors.base }],
        { minHeight: 78 },
      ]}
    >
      <IconSquare
        name={icon}
        insetStyle={!selected}
        color={selected ? colors.accent : colors.inkSecondary}
        size={46}
      />
      <View style={styles.copy}>
        <Text
          style={[
            styles.label,
            {
              color: selected ? colors.accent : colors.ink,
            },
          ]}
        >
          {label}
        </Text>
        <Text
          style={[
            styles.description,
            { color: colors.inkSecondary },
          ]}
        >
          {description}
        </Text>
      </View>
      <View
        style={[
          styles.radio,
          selected
            ? { backgroundColor: colors.accent }
            : [inset(), { backgroundColor: colors.base }],
        ]}
      >
        {selected ? (
          <Feather
            name="check"
            size={15}
            color={colors.onAccent}
            accessible={false}
          />
        ) : null}
      </View>
    </PressableScale>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderRadius: 24,
    paddingHorizontal: 20,
    marginTop: 16,
  },
  copy: {
    flex: 1,
  },
  label: {
    fontFamily: fonts.outfitSemiBold,
    fontSize: 17,
    fontWeight: '600',
  },
  description: {
    ...typography.caption,
    fontFamily: fonts.manropeBold,
    fontWeight: '600',
    marginTop: 2,
  },
  radio: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
