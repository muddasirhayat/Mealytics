import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '@/theme/colors';
import { radius } from '@/theme/radius';
import { plusShadow } from '@/utils/shadow';

type PlusButtonProps = {
  onPress: () => void;
  size?: number;
  accessibilityLabel?: string;
  checked?: boolean;
};

export const PlusButton = ({
  onPress,
  size = 40,
  accessibilityLabel = 'Add',
  checked = false,
}: PlusButtonProps) => (
  <Pressable
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={accessibilityLabel}
    hitSlop={6}
    style={({ pressed }) => [
      styles.button,
      plusShadow(),
      {
        width: Math.max(44, size),
        height: Math.max(44, size),
        borderRadius: radius.plus,
      },
      checked && styles.checked,
      pressed && styles.pressed,
    ]}
  >
    <Feather
      name={checked ? 'check' : 'plus'}
      size={Math.round(size * 0.48)}
      color={checked ? colors.ink : colors.textInverse}
      accessible={false}
    />
  </Pressable>
);

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checked: {
    backgroundColor: colors.base,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
});
