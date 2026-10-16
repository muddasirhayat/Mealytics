import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { colors } from '@/theme/colors';
import { inset } from '@/utils/shadow';

type RingProps = {
  size?: number;
  stroke?: number;
  progress: number;
  children?: React.ReactNode;
};

export const Ring = ({ size = 160, stroke = 14, progress, children }: RingProps) => {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.min(1, Math.max(0, progress));
  const dash = c * clamped;

  return (
    <View style={[styles.wrap, inset(), { width: size, height: size, borderRadius: size / 2 }]}>
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id="mealytics-ring" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={colors.mint} />
            <Stop offset="100%" stopColor={colors.accent} />
          </LinearGradient>
        </Defs>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={colors.fallbackBorder}
          strokeWidth={stroke}
          fill="none"
          opacity={0.35}
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="url(#mealytics-ring)"
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={`${dash} ${c}`}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View style={styles.center} pointerEvents="none">
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.base,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
