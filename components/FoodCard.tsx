import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Food } from '@/types/food';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { radius } from '@/theme/radius';
import { typography } from '@/theme/typography';

interface FoodCardProps {
  food: Food;
  onPress: (food: Food) => void;
}

export const FoodCard = ({ food, onPress }: FoodCardProps) => {
  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => onPress(food)}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.name} numberOfLines={1}>{food.name}</Text>
          {food.brand && (
            <Text style={styles.brand} numberOfLines={1}>{food.brand}</Text>
          )}
        </View>
        <View style={styles.caloriesContainer}>
          <Text style={styles.calories}>{Math.round(food.calories)}</Text>
          <Text style={styles.kcalText}>kcal</Text>
          <Text style={styles.servingText}>
            per {Math.round(food.servingSize ?? 100)}
            {food.servingUnit || 'g'}
          </Text>
        </View>
      </View>
      
      <View style={styles.macros}>
        <View style={styles.macroBadge}>
          <View style={[styles.dot, { backgroundColor: colors.protein }]} />
          <Text style={styles.macroText}>{Math.round(food.protein)}g Protein</Text>
        </View>
        <View style={styles.macroBadge}>
          <View style={[styles.dot, { backgroundColor: colors.carbs }]} />
          <Text style={styles.macroText}>{Math.round(food.carbohydrates)}g Carbs</Text>
        </View>
        <View style={styles.macroBadge}>
          <View style={[styles.dot, { backgroundColor: colors.fat }]} />
          <Text style={styles.macroText}>{Math.round(food.fat)}g Fat</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  titleContainer: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  name: {
    ...typography.bodyMedium,
    color: colors.text,
  },
  brand: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  caloriesContainer: {
    alignItems: 'flex-end',
  },
  calories: {
    ...typography.title,
    color: colors.primary,
  },
  kcalText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  servingText: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  macros: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  macroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.round,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  macroText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
