import React, { useMemo, useRef } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { useThemeColors } from '@/hooks/useThemeColors';
import { fonts } from '@/theme/fonts';
import { inset } from '@/utils/shadow';
import { tickFeedback } from '@/utils/feedback';

const TICK = 14;
const RULER_WIDTH = 364;
const CENTER = RULER_WIDTH / 2;

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
  const colors = useThemeColors();
  const listRef = useRef<FlatList<number>>(null);
  const lastEmitted = useRef(value);

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
    tickFeedback();
    onChange(next);
  };

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    emitFromOffset(event.nativeEvent.contentOffset.x);
  };

  const onMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    emitFromOffset(event.nativeEvent.contentOffset.x);
  };

  return (
    <View
      style={[styles.ruler, inset(), { backgroundColor: colors.base }]}
      accessibilityRole="adjustable"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min, max, now: value }}
    >
      <FlatList
        ref={listRef}
        horizontal
        data={values}
        keyExtractor={(item) => String(item)}
        showsHorizontalScrollIndicator={false}
        snapToInterval={TICK}
        decelerationRate="fast"
        getItemLayout={(_, index) => ({ length: TICK, offset: TICK * index, index })}
        initialScrollIndex={indexOf(value)}
        onScroll={onScroll}
        scrollEventThrottle={16}
        onMomentumScrollEnd={onMomentumScrollEnd}
        onScrollToIndexFailed={({ index }) => {
          requestAnimationFrame(() => {
            listRef.current?.scrollToOffset({ offset: index * TICK, animated: false });
          });
        }}
        contentContainerStyle={{ paddingHorizontal: CENTER - TICK / 2 }}
        renderItem={({ item, index }) => {
          const major = index % majorEvery === 0;
          return (
            <View style={styles.tickCol}>
              {major ? (
                <Text style={[styles.tickLabel, { color: colors.muted }]} accessible={false}>
                  {Number.isInteger(item) ? item : item.toFixed(1)}
                </Text>
              ) : (
                <View style={styles.tickSpacer} />
              )}
              <View
                style={[
                  styles.tick,
                  major
                    ? { height: 34, backgroundColor: colors.ink }
                    : { height: 18, backgroundColor: colors.placeholder },
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
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
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
