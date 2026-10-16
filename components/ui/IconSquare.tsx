import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useThemeColors } from '@/hooks/useThemeColors';
import { radius } from '@/theme/radius';
import { inset, raiseSm } from '@/utils/shadow';

type IconSquareProps = {
  name: keyof typeof Feather.glyphMap;
  onPress?: () => void;
  insetStyle?: boolean;
  size?: number;
  iconSize?: number;
  color?: string;
  accessibilityLabel?: string;
};

export const IconSquare = ({
  name,
  onPress,
  insetStyle = false,
  size = 46,
  iconSize,
  color,
  accessibilityLabel,
}: IconSquareProps) => {
  const colors = useThemeColors();
  const iconColor = color ?? colors.ink;
  const inner = (
    <View
      style={[
        styles.box,
        { backgroundColor: colors.base },
        insetStyle ? inset() : raiseSm(),
        { width: size, height: size, borderRadius: radius.icon },
      ]}
    >
      <Feather name={name} size={iconSize ?? Math.round(size * 0.43)} color={iconColor} accessible={false} />
    </View>
  );

  if (!onPress) {
    return inner;
  }

  return (
    <Pressable
      onPress={onPress}
      hitSlop={4}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? name}
      style={({ pressed }) => [pressed && styles.pressed, { minWidth: 44, minHeight: 44, justifyContent: 'center' }]}
    >
      {inner}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  box: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
});
