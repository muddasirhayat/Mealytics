import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '@/hooks/useTheme';
import { inset } from '@/utils/shadow';

type RingProps = {
  size?: number;
  stroke?: number;
  progress: number;
  children?: React.ReactNode;
};

export const Ring = ({ size = 160, stroke = 14, progress, children }: RingProps) => {
  const { colors, isDark } = useTheme();
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.min(1, Math.max(0, progress));
  const dash = c * clamped;
  // Tip of the arc for the accent dot
  const angle = -Math.PI / 2 + clamped * 2 * Math.PI;
  const tipX = size / 2 + r * Math.cos(angle);
  const tipY = size / 2 + r * Math.sin(angle);

  return (
    <View
      style={[
        styles.wrap,
        inset(),
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: isDark ? colors.surface : colors.base,
        },
      ]}
    >
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={isDark ? colors.surfaceRaised : colors.fallbackBorder}
          strokeWidth={stroke}
          fill="none"
          opacity={isDark ? 1 : 0.35}
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={colors.accent}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={`${dash} ${c}`}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      {clamped > 0.02 ? (
        <View
          style={[
            styles.tip,
            {
              left: tipX - 5,
              top: tipY - 5,
              backgroundColor: colors.accent,
            },
          ]}
          accessible={false}
        />
      ) : null}
      <View style={styles.center} pointerEvents="none">
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tip: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
