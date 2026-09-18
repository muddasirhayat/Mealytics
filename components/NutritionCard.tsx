import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Food } from '@/types/food';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { radius } from '@/theme/radius';
import { typography } from '@/theme/typography';

interface NutritionCardProps {
  food: Food;
  multiplier?: number;
}

export const NutritionCard = ({ food, multiplier = 1 }: NutritionCardProps) => {
  const getVal = (val?: number) => Math.round((val || 0) * multiplier);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Nutrition Facts</Text>
      <View style={styles.divider} />
      
      <View style={styles.row}>
        <Text style={styles.calorieLabel}>Calories</Text>
        <Text style={styles.calorieValue}>{getVal(food.calories)}</Text>
      </View>
      <View style={styles.thickDivider} />

      <NutrientRow label="Protein" value={getVal(food.protein)} unit="g" color={colors.protein} bold />
      <View style={styles.divider} />
      
      <NutrientRow label="Carbohydrates" value={getVal(food.carbohydrates)} unit="g" color={colors.carbs} bold />
      {food.fiber !== undefined && (
        <>
          <View style={styles.divider} />
          <NutrientRow label="Dietary Fiber" value={getVal(food.fiber)} unit="g" indented />
        </>
      )}
      {food.sugar !== undefined && (
        <>
          <View style={styles.divider} />
          <NutrientRow label="Total Sugars" value={getVal(food.sugar)} unit="g" indented />
        </>
      )}
      <View style={styles.divider} />
      
      <NutrientRow label="Total Fat" value={getVal(food.fat)} unit="g" color={colors.fat} bold />
      {food.sodium !== undefined && (
        <>
          <View style={styles.divider} />
          <NutrientRow label="Sodium" value={getVal(food.sodium)} unit="mg" />
        </>
      )}
    </View>
  );
};

const NutrientRow = ({ 
  label, 
  value, 
  unit, 
  color,
  bold = false,
  indented = false,
}: { 
  label: string; 
  value: number; 
  unit: string; 
  color?: string;
  bold?: boolean;
  indented?: boolean;
}) => (
  <View style={[styles.row, indented && styles.indentedRow]}>
    <View style={styles.labelContainer}>
      {color && <View style={[styles.dot, { backgroundColor: color }]} />}
      <Text style={[styles.nutrientLabel, bold && styles.boldText]}>{label}</Text>
    </View>
    <Text style={[styles.nutrientValue, bold && styles.boldText]}>{value}{unit}</Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: {
    ...typography.title,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  thickDivider: {
    height: 4,
    backgroundColor: colors.text,
    marginVertical: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  indentedRow: {
    paddingLeft: spacing.lg,
  },
  calorieLabel: {
    ...typography.header,
    color: colors.text,
  },
  calorieValue: {
    ...typography.header,
    color: colors.text,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.sm,
  },
  nutrientLabel: {
    ...typography.bodyLarge,
    color: colors.text,
  },
  nutrientValue: {
    ...typography.bodyLarge,
    color: colors.text,
  },
  boldText: {
    fontWeight: '600',
  },
});
