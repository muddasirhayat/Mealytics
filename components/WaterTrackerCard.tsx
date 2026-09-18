import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { radius } from '@/theme/radius';
import { Ionicons } from '@expo/vector-icons';
import { waterStorage } from '@/storage/waterStorage';

interface WaterTrackerCardProps {
  dailyTargetMl?: number;
}

export const WaterTrackerCard = ({ dailyTargetMl = 2000 }: WaterTrackerCardProps) => {
  const [currentMl, setCurrentMl] = useState(0);

  useEffect(() => {
    let cancelled = false;
    waterStorage.getWater(new Date()).then((amount) => {
      if (!cancelled) {
        setCurrentMl(amount);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleAdd = async (amount: number) => {
    const updated = await waterStorage.addWater(amount, new Date());
    setCurrentMl(updated);
  };

  const handleReset = async () => {
    await waterStorage.resetWater(new Date());
    setCurrentMl(0);
  };

  const percentage = Math.min(100, Math.round((currentMl / dailyTargetMl) * 100));
  const glasses = (currentMl / 250).toFixed(1);

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={styles.iconCircle}>
            <Ionicons name="water" size={18} color="#0284C7" />
          </View>
          <View>
            <Text style={styles.title}>Daily Hydration</Text>
            <Text style={styles.subtitle}>
              {currentMl.toLocaleString()} / {dailyTargetMl.toLocaleString()} ml ({glasses} glasses)
            </Text>
          </View>
        </View>
        <Text style={styles.percentText}>{percentage}%</Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${percentage}%` }]} />
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => handleAdd(250)}
          activeOpacity={0.7}
        >
          <Ionicons name="add" size={14} color="#0284C7" />
          <Text style={styles.btnText}>+250 ml</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => handleAdd(500)}
          activeOpacity={0.7}
        >
          <Ionicons name="add" size={14} color="#0284C7" />
          <Text style={styles.btnText}>+500 ml</Text>
        </TouchableOpacity>

        {currentMl > 0 && (
          <TouchableOpacity
            style={styles.resetBtn}
            onPress={handleReset}
            activeOpacity={0.7}
          >
            <Ionicons name="refresh" size={14} color={colors.textMuted} />
            <Text style={styles.resetText}>Reset</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#F0F9FF',
    borderRadius: radius.xl,
    padding: spacing.md + 2,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    ...typography.title,
    fontSize: 16,
    color: '#0369A1',
  },
  subtitle: {
    ...typography.caption,
    color: '#0284C7',
    fontWeight: '500',
  },
  percentText: {
    ...typography.title,
    color: '#0284C7',
    fontWeight: '800',
    fontSize: 16,
  },
  track: {
    height: 10,
    backgroundColor: '#E0F2FE',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  fill: {
    height: '100%',
    backgroundColor: '#0284C7',
    borderRadius: 5,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    gap: 4,
  },
  btnText: {
    ...typography.caption,
    color: '#0284C7',
    fontWeight: '700',
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs + 2,
    gap: 4,
    marginLeft: 'auto',
  },
  resetText: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '500',
  },
});
