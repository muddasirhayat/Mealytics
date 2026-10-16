import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { fonts } from '@/theme/fonts';
import { RaisedCard } from '@/components/ui/RaisedCard';
import { ProgressBar } from '@/components/ui/ProgressBar';
import type { ThemeColors } from '@/theme/palette';

type MacroCardsGridProps = {
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
  targetFiber: number;
};

const MacroCard = memo(function MacroCard({
  label,
  value,
  target,
  color,
  colors,
}: {
  label: string;
  value: number;
  target: number;
  color: string;
  colors: ThemeColors;
}) {
  const pct = target > 0 ? Math.round((value / target) * 100) : 0;
  return (
    <RaisedCard padding={14} radiusValue={22} style={styles.card}>
      <View style={styles.top}>
        <Text style={[styles.label, { color: colors.inkSecondary }]}>{label}</Text>
        <Text style={[styles.pct, { color: colors.inkSecondary }]}>{pct}%</Text>
      </View>
      <Text style={[styles.value, { color: colors.ink }]}>
        {Math.round(value)}
        <Text style={[styles.target, { color: colors.inkMuted }]}> / {Math.round(target)} g</Text>
      </Text>
      <View style={styles.bar}>
        <ProgressBar progress={Math.min(1, value / Math.max(1, target))} color={color} height={10} />
      </View>
    </RaisedCard>
  );
});

export const MacroCardsGrid = ({
  protein,
  carbs,
  fat,
  fiber,
  targetProtein,
  targetCarbs,
  targetFat,
  targetFiber,
}: MacroCardsGridProps) => {
  const { colors } = useTheme();
  return (
    <View style={styles.grid}>
      <MacroCard label="Protein" value={protein} target={targetProtein} color={colors.protein} colors={colors} />
      <MacroCard label="Carbs" value={carbs} target={targetCarbs} color={colors.carbs} colors={colors} />
      <MacroCard label="Fat" value={fat} target={targetFat} color={colors.fat} colors={colors} />
      <MacroCard label="Fiber" value={fiber} target={targetFiber} color={colors.fiber} colors={colors} />
    </View>
  );
};

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  card: { width: '47%', flexGrow: 1, minWidth: 140 },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontFamily: fonts.manropeBold, fontSize: 13, fontWeight: '700' },
  pct: { fontFamily: fonts.manropeBold, fontSize: 12, fontWeight: '700' },
  value: { fontFamily: fonts.outfitSemiBold, fontSize: 24, fontWeight: '600', marginTop: 4 },
  target: { fontFamily: fonts.manropeSemiBold, fontSize: 13, fontWeight: '600' },
  bar: { marginTop: 10 },
});
