import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { radius } from '@/theme/radius';
import { typography } from '@/theme/typography';
import { inset, primaryButtonShadow } from '@/utils/shadow';
import { PressableScale } from '@/components/ui/PressableScale';
import { emitSelectionHaptic } from '@/hooks/useTickFeedback';
import { usePreferencesStore } from '@/store/preferencesStore';

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  icon?: keyof typeof Feather.glyphMap;
  loading?: boolean;
  disabled?: boolean;
};

export const PrimaryButton = ({
  label,
  onPress,
  icon,
  loading = false,
  disabled = false,
}: PrimaryButtonProps) => {
  const { colors } = useTheme();
  const soundsOn = usePreferencesStore((s) => s.soundsAndHaptics);
  const inactive = disabled || loading;
  const [pressed, setPressed] = useState(false);

  return (
    <PressableScale
      onPress={() => {
        emitSelectionHaptic(soundsOn);
        onPress();
      }}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityState={{ disabled: inactive, busy: loading }}
      accessibilityLabel={label}
      style={[
        styles.button,
        { backgroundColor: pressed && !inactive ? colors.accentPressed : colors.accent },
        pressed && !inactive ? inset() : primaryButtonShadow(),
        inactive && styles.disabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors.onAccent} />
      ) : (
        <View style={styles.row}>
          {icon ? <Feather name={icon} size={20} color={colors.onAccent} accessible={false} /> : null}
          <Text style={[styles.label, { color: colors.onAccent }]}>{label}</Text>
        </View>
      )}
    </PressableScale>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 62,
    borderRadius: radius.button,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  label: {
    ...typography.button,
  },
  disabled: {
    opacity: 0.5,
  },
});
