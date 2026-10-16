import React from 'react';
import { StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { radius } from '@/theme/radius';
import { plusShadow } from '@/utils/shadow';
import { PressableScale } from '@/components/ui/PressableScale';

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
}: PlusButtonProps) => {
  const { colors, isDark } = useTheme();
  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={6}
      style={[
        styles.button,
        plusShadow(),
        {
          width: Math.max(44, size),
          height: Math.max(44, size),
          borderRadius: radius.plus,
          backgroundColor: checked
            ? isDark
              ? colors.surfaceRaised
              : colors.base
            : colors.accent,
        },
      ]}
    >
      <Feather
        name={checked ? 'check' : 'plus'}
        size={Math.round(size * 0.48)}
        color={checked ? colors.ink : colors.onAccent}
        accessible={false}
      />
    </PressableScale>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
