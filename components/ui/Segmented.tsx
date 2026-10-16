import React, { useEffect, useState } from 'react';
import { LayoutChangeEvent, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useTheme } from '@/hooks/useTheme';
import { motion } from '@/constants/motion';
import { radius } from '@/theme/radius';
import { typography } from '@/theme/typography';
import { inset, raiseSm } from '@/utils/shadow';
import { emitSelectionHaptic } from '@/hooks/useTickFeedback';
import { usePreferencesStore } from '@/store/preferencesStore';

type SegmentedProps<T extends string> = {
  options: { label: string; value: T }[];
  value: T;
  onChange: (value: T) => void;
  accessibilityLabel?: string;
};

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  accessibilityLabel,
}: SegmentedProps<T>) {
  const { colors, isDark } = useTheme();
  const soundsOn = usePreferencesStore((s) => s.soundsAndHaptics);
  const index = Math.max(0, options.findIndex((o) => o.value === value));
  const [trackW, setTrackW] = useState(0);
  const thumbX = useSharedValue(0);

  const count = Math.max(1, options.length);
  const itemW = trackW > 0 ? (trackW - 8) / count : 0;

  useEffect(() => {
    if (trackW <= 0) return;
    thumbX.value = withSpring(4 + index * itemW, motion.spring);
  }, [index, itemW, thumbX, trackW]);

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: thumbX.value }],
  }));

  const onLayout = (event: LayoutChangeEvent) => {
    const w = event.nativeEvent.layout.width;
    setTrackW(w);
    const nextItemW = (w - 8) / count;
    // eslint-disable-next-line react-hooks/immutability -- shared value
    thumbX.value = 4 + index * nextItemW;
  };

  return (
    <View
      onLayout={onLayout}
      style={[
        styles.track,
        isDark
          ? {
              backgroundColor: colors.surfaceRaised,
              borderWidth: 1,
              borderColor: colors.border,
            }
          : [inset(), { backgroundColor: colors.base }],
      ]}
      accessibilityRole="tablist"
      accessibilityLabel={accessibilityLabel}
    >
      <Animated.View
        pointerEvents="none"
        style={[
          styles.thumb,
          thumbStyle,
          { width: Math.max(0, itemW) },
          isDark
            ? {
                backgroundColor: colors.surfacePressed,
                boxShadow: [{ offsetX: 0, offsetY: 4, blurRadius: 10, color: 'rgba(0,0,0,0.35)' }],
              }
            : [{ backgroundColor: colors.base }, raiseSm()],
        ]}
      />
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => {
              if (option.value !== value) {
                emitSelectionHaptic(soundsOn);
                onChange(option.value);
              }
            }}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={option.label}
            style={styles.item}
          >
            <Text
              style={[
                styles.label,
                {
                  color: selected
                    ? colors.accent
                    : isDark
                      ? colors.inkSecondary
                      : colors.muted,
                },
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    height: 44,
    borderRadius: radius.segmented,
    padding: 4,
    position: 'relative',
  },
  thumb: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    left: 0,
    borderRadius: radius.segmentedInner,
  },
  item: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 36,
    zIndex: 1,
  },
  label: {
    ...typography.chip,
  },
});
