import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '@/hooks/useTheme';
import { motion } from '@/constants/motion';
import { inset } from '@/utils/shadow';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type RingProps = {
  size?: number;
  stroke?: number;
  progress: number;
  color?: string;
  over?: boolean;
  children?: React.ReactNode;
};

export const Ring = ({
  size = 160,
  stroke = 14,
  progress,
  color,
  over = false,
  children,
}: RingProps) => {
  const { colors, isDark } = useTheme();
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const target = over ? 1 : Math.min(1, Math.max(0, progress));
  const strokeColor = color ?? (over ? colors.danger : colors.accent);
  const progressSv = useSharedValue(target);

  useEffect(() => {
    progressSv.value = withTiming(target, { duration: motion.duration.slow, easing: motion.easing });
  }, [target, progressSv]);

  const animatedProps = useAnimatedProps(() => {
    const p = Math.min(1, Math.max(0, progressSv.value));
    const dash = p >= 0.999 ? c : c * p;
    return {
      strokeDasharray: `${dash} ${c}`,
    };
  });

  const angle = -Math.PI / 2 + target * 2 * Math.PI;
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
          backgroundColor: colors.base,
        },
      ]}
    >
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={isDark ? colors.shadowDark : colors.fallbackBorder}
          strokeWidth={stroke}
          fill="none"
          opacity={isDark ? 0.7 : 0.35}
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={strokeColor}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
          animatedProps={animatedProps}
        />
      </Svg>
      {target > 0.02 && target < 0.999 ? (
        <View
          style={[
            styles.tip,
            {
              left: tipX - 5,
              top: tipY - 5,
              backgroundColor: strokeColor,
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
