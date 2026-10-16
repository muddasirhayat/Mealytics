import React, { useEffect, useMemo, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';
import { useTheme } from '@/hooks/useTheme';
import { fonts } from '@/theme/fonts';
import { inset } from '@/utils/shadow';
import { useTickFeedback } from '@/hooks/useTickFeedback';

const TICK = 14;
const RULER_WIDTH = 364;
const CENTER = RULER_WIDTH / 2;
const LABEL_WIDTH = 40;

type RulerProps = {
  value: number;
  min: number;
  max: number;
  step: number;
  majorEvery?: number;
  onChange: (value: number) => void;
  accessibilityLabel: string;
};

export const Ruler = ({
  value,
  min,
  max,
  step,
  majorEvery = 5,
  onChange,
  accessibilityLabel,
}: RulerProps) => {
  const { colors, isDark } = useTheme();
  const { tickIfChanged } = useTickFeedback();
  const listRef = useRef<Animated.FlatList<number>>(null);
  const lastEmitted = useRef(value);
  const scrollX = useSharedValue(0);

  const values = useMemo(() => {
    const next: number[] = [];
    const count = Math.round((max - min) / step) + 1;
    for (let i = 0; i < count; i += 1) {
      next.push(Number((min + i * step).toFixed(4)));
    }
    return next;
  }, [min, max, step]);

  const indexOf = (v: number) => {
    const i = Math.round((v - min) / step);
    return Math.min(values.length - 1, Math.max(0, i));
  };

  const emitFromOffset = (offsetX: number) => {
    const index = Math.round(offsetX / TICK);
    const next = values[Math.min(values.length - 1, Math.max(0, index))];
    if (next === undefined || next === lastEmitted.current) return;
    lastEmitted.current = next;
    tickIfChanged(next, majorEvery);
    onChange(next);
  };

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
      runOnJS(emitFromOffset)(event.contentOffset.x);
    },
  });

  useEffect(() => {
    lastEmitted.current = value;
    const offset = indexOf(value) * TICK;
    listRef.current?.scrollToOffset({ offset, animated: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-sync when external value jumps (unit switch)
  }, [min, max, step]);

  return (
    <View
      style={[
        styles.ruler,
        inset(),
        { backgroundColor: isDark ? colors.surfaceRaised : colors.base },
      ]}
      accessibilityRole="adjustable"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min, max, now: value }}
    >
      <Animated.FlatList
        ref={listRef}
        horizontal
        data={values}
        keyExtractor={(item) => String(item)}
        showsHorizontalScrollIndicator={false}
        snapToInterval={TICK}
        decelerationRate="fast"
        getItemLayout={(_, index) => ({ length: TICK, offset: TICK * index, index })}
        initialScrollIndex={indexOf(value)}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        onMomentumScrollEnd={(e) => emitFromOffset(e.nativeEvent.contentOffset.x)}
        onScrollToIndexFailed={({ index }) => {
          requestAnimationFrame(() => {
            listRef.current?.scrollToOffset({ offset: index * TICK, animated: false });
          });
        }}
        contentContainerStyle={{ paddingHorizontal: CENTER - TICK / 2 }}
        renderItem={({ item, index }) => {
          const major = index % majorEvery === 0;
          const label =
            Number.isInteger(item) || Math.abs(item - Math.round(item)) < 1e-6
              ? String(Math.round(item))
              : item.toFixed(1);
          return (
            <View style={styles.tickCol}>
              {major ? (
                <Text
                  style={[styles.tickLabel, { color: colors.inkMuted }]}
                  numberOfLines={1}
                  allowFontScaling={false}
                  accessible={false}
                >
                  {label}
                </Text>
              ) : (
                <View style={styles.tickSpacer} />
              )}
              <View
                style={[
                  styles.tick,
                  major
                    ? { height: 34, backgroundColor: colors.ink }
                    : { height: 18, backgroundColor: colors.inkMuted },
                ]}
              />
            </View>
          );
        }}
      />
      <View style={styles.caret} pointerEvents="none" accessible={false}>
        <View style={[styles.dot, { backgroundColor: colors.accent }]} />
        <View style={[styles.line, { backgroundColor: colors.accent }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  ruler: {
    height: 110,
    marginTop: 30,
    borderRadius: 26,
    overflow: 'hidden',
    width: '100%',
  },
  tickCol: {
    width: TICK,
    height: 110,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 18,
  },
  tick: {
    width: 2,
    borderRadius: 1,
  },
  tickLabel: {
    fontFamily: fonts.manropeBold,
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 8,
    width: LABEL_WIDTH,
    textAlign: 'center',
  },
  tickSpacer: {
    height: 20,
    marginBottom: 8,
  },
  caret: {
    position: 'absolute',
    left: CENTER - 8,
    top: 10,
    alignItems: 'center',
    width: 16,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  line: {
    width: 4,
    height: 66,
    borderRadius: 2,
    marginTop: 4,
  },
});
