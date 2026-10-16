import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColors } from '@/hooks/useThemeColors';
import { gradients } from '@/theme/colors';
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
  const colors = useThemeColors();
  const width = `${Math.min(100, Math.max(0, progress * 100))}%` as const;
  return (
    <View style={[styles.track, inset(), { height, padding: 2, backgroundColor: colors.base }]}>
      {gradient ? (
        <LinearGradient
          colors={[...gradients.ring]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={[styles.fill, { width, borderRadius: Math.max(4, height / 2 - 2) }]}
        />
      ) : (
        <View
          style={[
            styles.fill,
            { width, backgroundColor: color ?? colors.accent, borderRadius: Math.max(4, height / 2 - 2) },
          ]}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  track: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
});
