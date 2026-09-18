import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Food } from '@/types/food';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { radius } from '@/theme/radius';

interface MealFoodRowProps {
  food: Food;
  onRemove: (id: string) => void;
}

export const MealFoodRow = ({ food, onRemove }: MealFoodRowProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.infoContainer}>
        <Text style={styles.name} numberOfLines={1}>{food.name}</Text>
        <Text style={styles.details}>
          {Math.round(food.calories)} kcal • {Math.round(food.protein)}g P • {Math.round(food.carbohydrates)}g C • {Math.round(food.fat)}g F
        </Text>
      </View>
      <TouchableOpacity style={styles.removeButton} onPress={() => onRemove(food.id)}>
        <Ionicons name="trash-outline" size={20} color={colors.error} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoContainer: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  name: {
    ...typography.bodyMedium,
    color: colors.text,
  },
  details: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  removeButton: {
    padding: spacing.xs,
  },
});
