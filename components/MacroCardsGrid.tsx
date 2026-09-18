import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { radius } from '@/theme/radius';

interface MacroCardsGridProps {
  protein: number;
  carbs: number;
  fat: number;
  targetProtein?: number;
  targetCarbs?: number;
  targetFat?: number;
}

interface MacroCardProps {
  title: string;
  emoji: string;
  current: number;
  target: number;
  color: string;
  bgColor: string;
  borderColor: string;
}

const MacroCard = ({
  title,
  emoji,
  current,
  target,
  color,
  bgColor,
  borderColor,
}: MacroCardProps) => {
  const currentVal = Math.round(current);
  const targetVal = Math.round(target);
  const percent = targetVal > 0 ? Math.min(100, Math.round((currentVal / targetVal) * 100)) : 0;
  const remaining = Math.max(0, targetVal - currentVal);

  return (
    <View style={[styles.card, { backgroundColor: bgColor, borderColor }]}>
      <View style={styles.cardHeader}>
        <Text style={styles.emoji}>{emoji}</Text>
        <Text style={[styles.percentBadgeText, { color }]}>{percent}%</Text>
      </View>

      <Text style={styles.title}>{title}</Text>

      <View style={styles.valuesRow}>
        <Text style={[styles.currentText, { color }]}>{currentVal}g</Text>
        <Text style={styles.targetText}>/ {targetVal}g</Text>
      </View>

      {/* Progress Track */}
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${percent}%`, backgroundColor: color }]} />
      </View>

      <Text style={styles.remainingText}>{remaining}g left</Text>
    </View>
  );
};

export const MacroCardsGrid = ({
  protein,
  carbs,
  fat,
  targetProtein = 150,
  targetCarbs = 200,
  targetFat = 65,
}: MacroCardsGridProps) => {
  return (
    <View style={styles.grid}>
      <MacroCard
        title="Protein"
        emoji="🥩"
        current={protein}
        target={targetProtein}
        color={colors.protein}
        bgColor="#FFF1F2"
        borderColor="#FFE4E6"
      />
      <MacroCard
        title="Carbs"
        emoji="🍞"
        current={carbs}
        target={targetCarbs}
        color={colors.carbs}
        bgColor="#EFF6FF"
        borderColor="#DBEAFE"
      />
      <MacroCard
        title="Fat"
        emoji="🥑"
        current={fat}
        target={targetFat}
        color={colors.fat}
        bgColor="#FFFBEB"
        borderColor="#FEF3C7"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    gap: spacing.sm,
    width: '100%',
  },
  card: {
    flex: 1,
    borderRadius: radius.lg,
    padding: spacing.sm + 2,
    borderWidth: 1,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  emoji: {
    fontSize: 18,
  },
  percentBadgeText: {
    ...typography.caption,
    fontWeight: '800',
    fontSize: 11,
  },
  title: {
    ...typography.bodyMedium,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  valuesRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
    marginBottom: spacing.xs,
  },
  currentText: {
    fontSize: 15,
    fontWeight: '800',
  },
  targetText: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 11,
  },
  track: {
    height: 6,
    backgroundColor: 'rgba(0,0,0,0.06)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
  remainingText: {
    ...typography.caption,
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: '500',
  },
});
