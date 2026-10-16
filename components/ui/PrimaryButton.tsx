import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useThemeColors } from '@/hooks/useThemeColors';
import { radius } from '@/theme/radius';
import { typography } from '@/theme/typography';
import { inset, primaryButtonShadow } from '@/utils/shadow';

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
  const colors = useThemeColors();
  const inactive = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityState={{ disabled: inactive, busy: loading }}
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: colors.accent },
        pressed && !inactive ? inset() : primaryButtonShadow(),
        inactive && styles.disabled,
        pressed && !inactive && styles.pressed,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors.textInverse} />
      ) : (
        <View style={styles.row}>
          {icon ? <Feather name={icon} size={20} color={colors.textInverse} accessible={false} /> : null}
          <Text style={[styles.label, { color: colors.textInverse }]}>{label}</Text>
        </View>
      )}
    </Pressable>
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
    opacity: 0.45,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
});
