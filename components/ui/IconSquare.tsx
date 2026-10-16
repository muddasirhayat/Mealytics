import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { radius } from '@/theme/radius';
import { inset, raiseSm } from '@/utils/shadow';
import { PressableScale } from '@/components/ui/PressableScale';

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
  const { colors, isDark } = useTheme();
  const iconColor = color ?? colors.ink;
  const bg = isDark ? colors.surfaceRaised : colors.base;
  const inner = (
    <View
      style={[
        styles.box,
        { backgroundColor: bg },
        insetStyle || isDark ? inset() : raiseSm(),
        { width: size, height: size, borderRadius: radius.icon },
      ]}
    >
      <Feather name={name} size={iconSize ?? Math.round(size * 0.43)} color={iconColor} accessible={false} />
    </View>
  );

  if (!onPress) return inner;

  return (
    <PressableScale
      onPress={onPress}
      hitSlop={4}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? name}
      style={{ minWidth: 44, minHeight: 44, justifyContent: 'center' }}
    >
      {inner}
    </PressableScale>
  );
};

const styles = StyleSheet.create({
  box: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
