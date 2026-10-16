import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useThemeColors } from '@/hooks/useThemeColors';
import { fonts } from '@/theme/fonts';
import { typography } from '@/theme/typography';
import { raiseSm } from '@/utils/shadow';
import { waterStorage } from '@/storage/waterStorage';
import { celebrationStorage } from '@/storage/celebrationStorage';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { GoalCelebration } from '@/components/ui/GoalCelebration';
import { RaisedCard } from '@/components/ui/RaisedCard';
import { tickFeedback } from '@/utils/feedback';

type WaterTrackerCardProps = {
  dailyTargetMl?: number;
};

export const WaterTrackerCard = ({ dailyTargetMl = 2000 }: WaterTrackerCardProps) => {
  const colors = useThemeColors();
  const [currentMl, setCurrentMl] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [celebrate, setCelebrate] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const amount = await waterStorage.getWater(new Date());
      setCurrentMl(amount);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  const maybeCelebrate = async (updated: number, previous: number) => {
    if (updated < dailyTargetMl || previous >= dailyTargetMl) return;
    const already = await celebrationStorage.hasWaterGoalCelebrated();
    if (already) return;
    await celebrationStorage.markWaterGoalCelebrated();
    setCelebrate(true);
  };

  const handleAdd = async (amount: number) => {
    if (busy) return;
    setBusy(true);
    try {
      const previous = currentMl;
      const updated = await waterStorage.addWater(amount, new Date());
      setCurrentMl(updated);
      tickFeedback();
      await maybeCelebrate(updated, previous);
    } finally {
      setBusy(false);
    }
  };

  const progress = Math.min(1, currentMl / Math.max(1, dailyTargetMl));

  return (
    <>
      <RaisedCard padding={12} radiusValue={22} style={styles.card}>
        <Feather name="droplet" size={22} color={colors.carbs} accessible={false} />
        <View style={styles.copy}>
          <Text style={[styles.title, { color: colors.ink }]}>Water</Text>
          <Text style={[styles.sub, { color: colors.muted }]}>
            {loading ? 'Loading…' : `${currentMl.toLocaleString()} of ${dailyTargetMl.toLocaleString()} ml`}
          </Text>
          <View style={[styles.track, { backgroundColor: colors.insetFill }]}>
            <View style={[styles.fill, { width: `${progress * 100}%`, backgroundColor: colors.carbs }]} />
          </View>
        </View>
        <Pressable
          onPress={() => void handleAdd(250)}
          onLongPress={() => setMenuOpen(true)}
          disabled={busy || loading}
          accessibilityRole="button"
          accessibilityLabel="Add 250 milliliters of water. Long press for more amounts."
          hitSlop={6}
          style={[styles.add, raiseSm(), { backgroundColor: colors.accent }, (busy || loading) && styles.addDisabled]}
        >
          {busy || loading ? (
            <ActivityIndicator color={colors.textInverse} />
          ) : (
            <Text style={[styles.addText, { color: colors.textInverse }]}>+ 250 ml</Text>
          )}
        </Pressable>
      </RaisedCard>
      <ConfirmDialog
        visible={menuOpen}
        title="Water"
        body="Add another amount or reset today."
        confirmLabel="Reset today"
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
            await waterStorage.resetWater(new Date());
            await celebrationStorage.clearWaterGoalCelebrated();
            setCurrentMl(0);
            setMenuOpen(false);
          })();
        }}
      />
      <GoalCelebration
        visible={celebrate}
        title="Water goal reached"
        body="You hit your daily water target. Keep sipping."
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
  title: {
    fontFamily: fonts.outfitSemiBold,
    fontSize: 16,
    fontWeight: '600',
  },
  sub: {
    ...typography.caption,
    fontFamily: fonts.manropeBold,
    fontWeight: '600',
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
