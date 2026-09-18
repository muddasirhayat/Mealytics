import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Meal } from '@/types/meal';
import { getMealSlot, getMealSlotLabel } from '@/utils/mealSlot';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { radius } from '@/theme/radius';

interface MealHistoryCardProps {
  meal: Meal;
  onDelete?: (id: string) => void;
}

export const MealHistoryCard = ({ meal, onDelete }: MealHistoryCardProps) => {
  const timeString = new Date(meal.timestamp).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
  const slotLabel = getMealSlotLabel(getMealSlot(meal));

  const handleDelete = () => {
    if (!onDelete) return;
    Alert.alert(
      "Delete Meal",
      "Are you sure you want to delete this meal?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => onDelete(meal.id) }
      ]
    );
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.timeContainer}>
          <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.timeText}>{slotLabel} · {timeString}</Text>
        </View>
        {onDelete && (
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Ionicons name="trash-outline" size={18} color={colors.error} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.macrosContainer}>
        <Text style={styles.caloriesText}>{Math.round(meal.totalCalories)} kcal</Text>
        <Text style={styles.macroText}>
          {Math.round(meal.totalProtein)}g P • {Math.round(meal.totalCarbohydrates)}g C • {Math.round(meal.totalFat)}g F
        </Text>
      </View>

      <View style={styles.divider} />

      <Text style={styles.foodsTitle}>Foods:</Text>
      {meal.foods.map((food, index) => (
        <Text key={`${food.id}-${index}`} style={styles.foodItem} numberOfLines={1}>
          • {food.name} ({Math.round((food.servingSize ?? 100) * 10) / 10}
          {food.servingUnit || 'g'})
        </Text>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  deleteButton: {
    padding: spacing.xs,
  },
  macrosContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: spacing.sm,
  },
  caloriesText: {
    ...typography.header,
    color: colors.primary,
    marginRight: spacing.md,
  },
  macroText: {
    ...typography.bodyMedium,
    color: colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  foodsTitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  foodItem: {
    ...typography.bodyMedium,
    color: colors.text,
    marginLeft: spacing.xs,
    marginBottom: 2,
  },
});
