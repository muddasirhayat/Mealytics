import React, { useRef } from 'react';
import { FlatList, StyleSheet, Text, View, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';
import { useThemeColors } from '@/hooks/useThemeColors';
import { fonts } from '@/theme/fonts';
import { inset } from '@/utils/shadow';
import { AGE_MAX, AGE_MIN } from '@/constants/profileOptions';
import { tickFeedback } from '@/utils/feedback';

const ITEM_HEIGHT = 60;
const VISIBLE = 5;
const WHEEL_HEIGHT = ITEM_HEIGHT * VISIBLE;
const AGES = Array.from({ length: AGE_MAX - AGE_MIN + 1 }, (_, i) => AGE_MIN + i);

type AgeWheelProps = {
  value: number;
  onChange: (age: number) => void;
};

export const AgeWheel = ({ value, onChange }: AgeWheelProps) => {
  const colors = useThemeColors();
  const listRef = useRef<FlatList<number>>(null);
  const lastEmitted = useRef(value);
  const clamped = Math.min(AGE_MAX, Math.max(AGE_MIN, value));
  const selectedIndex = clamped - AGE_MIN;

  const emitFromOffset = (offsetY: number) => {
    const index = Math.round(offsetY / ITEM_HEIGHT);
    const next = AGES[Math.min(AGES.length - 1, Math.max(0, index))];
    if (next === undefined || next === lastEmitted.current) return;
    lastEmitted.current = next;
    tickFeedback();
    onChange(next);
  };

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    emitFromOffset(event.nativeEvent.contentOffset.y);
  };

  const onMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    emitFromOffset(event.nativeEvent.contentOffset.y);
  };

  return (
    <View
      style={styles.wrap}
      accessibilityRole="adjustable"
      accessibilityLabel="Age in years"
      accessibilityValue={{ min: AGE_MIN, max: AGE_MAX, now: clamped }}
    >
      <View
        style={[styles.window, inset(), { backgroundColor: colors.base }]}
        pointerEvents="none"
        accessible={false}
      />
      <FlatList
        ref={listRef}
        data={AGES}
        keyExtractor={(item) => String(item)}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        getItemLayout={(_, index) => ({ length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index })}
        extraData={clamped}
        initialScrollIndex={selectedIndex}
        onScroll={onScroll}
        scrollEventThrottle={16}
        onMomentumScrollEnd={onMomentumScrollEnd}
        onScrollToIndexFailed={({ index }) => {
          requestAnimationFrame(() => {
            listRef.current?.scrollToOffset({ offset: index * ITEM_HEIGHT, animated: false });
          });
        }}
        contentContainerStyle={styles.content}
        style={styles.list}
        renderItem={({ item }) => {
          const distance = Math.abs(item - clamped);
          const color =
            distance === 0 ? colors.ink : distance === 1 ? colors.muted : colors.placeholder;
          const size = distance === 0 ? 34 : distance === 1 ? 26 : 22;
          return (
            <View style={styles.item}>
              <Text
                style={[
                  styles.num,
                  {
                    color,
                    fontSize: size,
                    fontFamily: distance === 0 ? fonts.outfitBold : fonts.outfitSemiBold,
                  },
                ]}
              >
                {item}
              </Text>
            </View>
          );
        }}
      />
      <Text style={[styles.unit, { color: colors.muted }]} accessible={false}>
        years
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    width: 240,
    height: WHEEL_HEIGHT,
    alignSelf: 'center',
    marginTop: 44,
  },
  list: {
    height: WHEEL_HEIGHT,
  },
  content: {
    paddingVertical: (WHEEL_HEIGHT - ITEM_HEIGHT) / 2,
  },
  window: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: (WHEEL_HEIGHT - ITEM_HEIGHT) / 2,
    height: ITEM_HEIGHT,
    borderRadius: 20,
  },
  item: {
    height: ITEM_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  num: {
    fontWeight: '600',
  },
  unit: {
    position: 'absolute',
    right: -8,
    top: (WHEEL_HEIGHT - ITEM_HEIGHT) / 2 + 18,
    fontFamily: fonts.manropeBold,
    fontSize: 13,
    fontWeight: '700',
  },
});
