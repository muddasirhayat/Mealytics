import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { radius } from '@/theme/radius';
import { Ionicons } from '@expo/vector-icons';

interface MealTotalsProps {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  targetCalories?: number;
  targetProtein?: number;
  targetCarbs?: number;
  targetFat?: number;
}

export const MealTotalsCard = ({
  calories,
  targetCalories = 2000,
}: MealTotalsProps) => {
  const eaten = Math.round(calories);
  const target = Math.round(targetCalories);
  const remaining = target - eaten;
  const isOver = remaining < 0;
  const percentage = Math.min(100, Math.max(0, Math.round((eaten / target) * 100)));

  return (
    <View style={styles.card}>
      {/* Header with pill */}
      <View style={styles.headerRow}>
        <View style={styles.titleWithIcon}>
          <View style={styles.iconCircle}>
            <Ionicons name="flame" size={18} color={colors.primary} />
          </View>
          <Text style={styles.cardTitle}>Calorie Budget</Text>
        </View>
        <View style={[styles.percentBadge, isOver && styles.percentBadgeOver]}>
          <Text style={[styles.percentText, isOver && styles.percentTextOver]}>
            {isOver ? 'Exceeded' : `${percentage}% Eaten`}
          </Text>
        </View>
      </View>

      {/* Hero Display: Remaining */}
      <View style={styles.heroCenter}>
        <Text style={[styles.heroValue, isOver && styles.heroValueOver]}>
          {isOver ? `+${Math.abs(remaining)}` : remaining.toLocaleString()}
        </Text>
        <Text style={styles.heroUnit}>kcal {isOver ? 'over limit' : 'remaining'}</Text>
      </View>

      {/* Progress Bar with glow effect */}
      <View style={styles.barContainer}>
        <View style={styles.barTrack}>
          <View
            style={[
              styles.barFill,
              { width: `${percentage}%` },
              isOver && styles.barFillOver,
            ]}
          />
        </View>
      </View>

      {/* 3-Way Metric Breakdown */}
      <View style={styles.breakdownRow}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Target</Text>
          <Text style={styles.statValue}>{target.toLocaleString()}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Food Eaten</Text>
          <Text style={[styles.statValue, { color: colors.primary }]}>
            {eaten.toLocaleString()}
          </Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Remaining</Text>
          <Text
            style={[
              styles.statValue,
              { color: isOver ? colors.error : colors.text },
            ]}
          >
            {Math.max(0, remaining).toLocaleString()}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.04)',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    ...typography.title,
    fontSize: 17,
    color: colors.text,
  },
  percentBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 4,
    borderRadius: 20,
  },
  percentBadgeOver: {
    backgroundColor: '#FEE2E2',
  },
  percentText: {
    ...typography.caption,
    color: colors.primaryDark,
    fontWeight: '700',
  },
  percentTextOver: {
    color: colors.error,
  },
  heroCenter: {
    alignItems: 'center',
    marginVertical: spacing.xs,
  },
  heroValue: {
    fontSize: 44,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -1,
  },
  heroValueOver: {
    color: colors.error,
  },
  heroUnit: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    fontWeight: '600',
    marginTop: -2,
    marginBottom: spacing.md,
  },
  barContainer: {
    marginBottom: spacing.lg,
  },
  barTrack: {
    height: 12,
    backgroundColor: colors.divider,
    borderRadius: 6,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 6,
  },
  barFillOver: {
    backgroundColor: colors.error,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: '60%',
    backgroundColor: colors.border,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 2,
    fontWeight: '500',
  },
  statValue: {
    ...typography.bodyLarge,
    fontWeight: '700',
    color: colors.text,
  },
});
