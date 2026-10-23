import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useFocusEffect } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { fonts } from '@/theme/fonts';
import { typography } from '@/theme/typography';
import { motion } from '@/constants/motion';
import { raiseSm } from '@/utils/shadow';
import { waterStorage } from '@/storage/waterStorage';
import { celebrationStorage } from '@/storage/celebrationStorage';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { GoalCelebration } from '@/components/ui/GoalCelebration';
import { RaisedCard } from '@/components/ui/RaisedCard';
import { tickFeedback } from '@/utils/feedback';
import { formatLogDate, isTodayMs, startOfDay, startOfDayMs } from '@/utils/date';

type WaterTrackerCardProps = {
  dailyTargetMl?: number;
  dateMs?: number;
};

export const WaterTrackerCard = ({ dailyTargetMl = 2000, dateMs }: WaterTrackerCardProps) => {
  const { colors } = useTheme();
  const dayMs = startOfDayMs(dateMs ?? Date.now());
  const day = startOfDay(dayMs);
  const loggingToday = isTodayMs(dayMs);
  const [currentMl, setCurrentMl] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const knownValue = useRef(false);
  const fill = useSharedValue(0);

  const load = useCallback(async () => {
    try {
      const amount = await waterStorage.getWater(startOfDay(dayMs));
      setCurrentMl(amount);
      knownValue.current = true;
    } finally {
      setReady(true);
    }
  }, [dayMs]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  const ratio = currentMl / Math.max(1, dailyTargetMl);
  const reached = currentMl >= dailyTargetMl;
  const overMl = Math.max(0, currentMl - dailyTargetMl);

  useEffect(() => {
    fill.value = withTiming(Math.min(1, ratio), {
      duration: motion.duration.slow,
      easing: motion.easing,
    });
  }, [fill, ratio]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${fill.value * 100}%`,
  }));

  const maybeCelebrate = async (updated: number, previous: number) => {
    if (updated < dailyTargetMl || previous >= dailyTargetMl) return;
    const already = await celebrationStorage.hasWaterGoalCelebrated(day);
    if (already) return;
    await celebrationStorage.markWaterGoalCelebrated(day);
    setCelebrate(true);
  };

  const handleAdd = async (amount: number) => {
    if (busy) return;
    setBusy(true);
    try {
      const previous = currentMl;
      const updated = await waterStorage.addWater(amount, day);
      setCurrentMl(updated);
      tickFeedback();
      await maybeCelebrate(updated, previous);
    } finally {
      setBusy(false);
    }
  };

  const amountLabel = knownValue.current
    ? reached
      ? overMl > 0
        ? `${currentMl.toLocaleString()} / ${dailyTargetMl.toLocaleString()} ml · ${overMl.toLocaleString()} over`
        : `${currentMl.toLocaleString()} / ${dailyTargetMl.toLocaleString()} ml · goal reached`
      : `${currentMl.toLocaleString()} of ${dailyTargetMl.toLocaleString()} ml`
    : `${dailyTargetMl.toLocaleString()} ml goal`;

  return (
    <>
      <RaisedCard padding={12} radiusValue={22} style={styles.card}>
        <Feather name="droplet" size={22} color={reached ? colors.mint : colors.carbs} accessible={false} />
        <View style={styles.copy}>
          <View style={styles.titleRow}>
            <Text style={[styles.title, { color: colors.ink }]}>Water</Text>
            {reached ? <Feather name="check-circle" size={16} color={colors.mint} accessible={false} /> : null}
          </View>
          <Text style={[styles.sub, { color: reached ? colors.mint : colors.muted }]}>{amountLabel}</Text>
          <View
            style={[
              styles.track,
              { backgroundColor: colors.insetFill },
            ]}
          >
            <Animated.View
              style={[styles.fill, fillStyle, { backgroundColor: reached ? colors.mint : colors.carbs }]}
            />
          </View>
        </View>
        <Pressable
          onPress={() => void handleAdd(250)}
          onLongPress={() => setMenuOpen(true)}
          disabled={busy || !ready}
          accessibilityRole="button"
          accessibilityLabel="Add 250 milliliters of water. Long press for more amounts."
          hitSlop={6}
          style={[
            styles.add,
            raiseSm(),
            { backgroundColor: colors.accent },
            (busy || !ready) && styles.addDisabled,
          ]}
        >
          {busy ? (
            <ActivityIndicator color={colors.onAccent} />
          ) : (
            <Text style={[styles.addText, { color: colors.onAccent }]}>+ 250 ml</Text>
          )}
        </Pressable>
      </RaisedCard>
      <ConfirmDialog
        visible={menuOpen}
        title="Water"
        body={
          loggingToday
            ? 'Add another amount or reset today.'
            : `Add another amount or reset ${formatLogDate(dayMs)}.`
        }
        confirmLabel={loggingToday ? 'Reset today' : 'Reset this day'}
        destructive
        extraActions={[
          {
            label: '+ 500 ml',
            onPress: () => {
              void handleAdd(500);
              setMenuOpen(false);
            },
          },
          {
            label: '+ 1000 ml',
            onPress: () => {
              void handleAdd(1000);
              setMenuOpen(false);
            },
          },
        ]}
        onCancel={() => setMenuOpen(false)}
        onConfirm={() => {
          void (async () => {
            await waterStorage.resetWater(day);
            await celebrationStorage.clearWaterGoalCelebrated(day);
            setCurrentMl(0);
            setMenuOpen(false);
          })();
        }}
      />
      <GoalCelebration
        visible={celebrate}
        title="Water goal reached"
        body={
          loggingToday
            ? 'You hit your daily water target. Keep sipping.'
            : `You hit your water target for ${formatLogDate(dayMs)}.`
        }
        onClose={() => setCelebrate(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingLeft: 18,
  },
  copy: {
    flex: 1,
    gap: 6,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontFamily: fonts.outfitSemiBold,
    fontSize: 16,
    fontWeight: '600',
  },
  sub: {
    ...typography.caption,
    fontFamily: fonts.manropeBold,
    fontWeight: '600',
    flexShrink: 1,
  },
  track: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
  add: {
    height: 44,
    minWidth: 96,
    paddingHorizontal: 18,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addDisabled: {
    opacity: 0.7,
  },
  addText: {
    fontFamily: fonts.outfitSemiBold,
    fontSize: 14,
    fontWeight: '600',
  },
});
