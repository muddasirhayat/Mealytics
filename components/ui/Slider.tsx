import React, { useRef } from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS, useSharedValue } from 'react-native-reanimated';
import { useThemeColors } from '@/hooks/useThemeColors';
import { inset, raiseSm } from '@/utils/shadow';

type SliderProps = {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  color?: string;
  onChange: (value: number) => void;
  accessibilityLabel?: string;
};

export const Slider = ({
  value,
  min = 0,
  max = 100,
  step = 1,
  color,
  onChange,
  accessibilityLabel,
}: SliderProps) => {
  const colors = useThemeColors();
  const fillColor = color ?? colors.accent;
  const width = useSharedValue(1);
  const pageX = useSharedValue(0);
  const startValue = useSharedValue(value);
  const trackRef = useRef<View>(null);

  const clamp = (next: number) => {
    const snapped = Math.round(next / step) * step;
    return Math.min(max, Math.max(min, snapped));
  };

  const ratio = max === min ? 0 : (value - min) / (max - min);

  const applyFromLocalX = (x: number) => {
    'worklet';
    const next = min + (x / Math.max(1, width.value)) * (max - min);
    const snapped = Math.round(next / step) * step;
    runOnJS(onChange)(Math.min(max, Math.max(min, snapped)));
  };

  const gesture = Gesture.Pan()
    .activeOffsetX([-2, 2])
    .onBegin((event) => {
      startValue.value = value;
      applyFromLocalX(Math.min(width.value, Math.max(0, event.x)));
    })
    .onUpdate((event) => {
      const localX = Math.min(width.value, Math.max(0, event.absoluteX - pageX.value));
      applyFromLocalX(localX);
    });

  const tap = Gesture.Tap().onEnd((event) => {
    applyFromLocalX(Math.min(width.value, Math.max(0, event.x)));
  });

  const composed = Gesture.Exclusive(gesture, tap);

  const onLayout = (event: LayoutChangeEvent) => {
    width.value = event.nativeEvent.layout.width;
    trackRef.current?.measureInWindow((x) => {
      pageX.value = x;
    });
  };

  return (
    <GestureDetector gesture={composed}>
      <View
        ref={trackRef}
        onLayout={onLayout}
        accessibilityRole="adjustable"
        accessibilityLabel={accessibilityLabel}
        accessibilityValue={{ min, max, now: value }}
        accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
        onAccessibilityAction={(event) => {
          if (event.nativeEvent.actionName === 'increment') onChange(clamp(value + step));
          if (event.nativeEvent.actionName === 'decrement') onChange(clamp(value - step));
        }}
        style={styles.hit}
      >
        <View style={[styles.track, inset(), { backgroundColor: colors.base }]}>
          <View style={[styles.fill, { width: `${ratio * 100}%`, backgroundColor: fillColor }]} />
          <View
            style={[
              styles.thumb,
              raiseSm(),
              { left: `${ratio * 100}%`, backgroundColor: colors.base },
            ]}
          />
        </View>
      </View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  hit: {
    height: 44,
    justifyContent: 'center',
    minHeight: 44,
  },
  track: {
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 4,
    bottom: 4,
    borderRadius: 6,
  },
  thumb: {
    position: 'absolute',
    width: 28,
    height: 28,
    marginLeft: -14,
    borderRadius: 14,
  },
});
