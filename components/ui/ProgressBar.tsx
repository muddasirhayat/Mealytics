import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useTheme } from '@/hooks/useTheme';
import { gradients } from '@/theme/colors';
import { motion } from '@/constants/motion';
import { inset } from '@/utils/shadow';

type ProgressBarProps = {
  progress: number;
  color?: string;
  gradient?: boolean;
  height?: number;
};

export const ProgressBar = ({
  progress,
  color,
  gradient = false,
  height = 12,
}: ProgressBarProps) => {
  const { colors } = useTheme();
  const clamped = Math.min(1, Math.max(0, progress));
  const progressSv = useSharedValue(clamped);

  useEffect(() => {
    progressSv.value = withTiming(clamped, { duration: motion.duration.slow, easing: motion.easing });
  }, [clamped, progressSv]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${progressSv.value * 100}%`,
  }));

  return (
    <View
      style={[
        styles.track,
        inset(),
        {
          height,
          padding: 2,
          backgroundColor: colors.base,
        },
      ]}
    >
      {gradient ? (
        <Animated.View style={[styles.fill, fillStyle]}>
          <LinearGradient
            colors={[...gradients.ring]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={[StyleSheet.absoluteFill, { borderRadius: Math.max(4, height / 2 - 2) }]}
          />
        </Animated.View>
      ) : (
        <Animated.View
          style={[
            styles.fill,
            fillStyle,
            {
              backgroundColor: color ?? colors.accent,
              borderRadius: Math.max(4, height / 2 - 2),
            },
          ]}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  track: { borderRadius: 8, overflow: 'hidden' },
  fill: { height: '100%' },
});
