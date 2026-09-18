import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { radius } from '@/theme/radius';
import { Ionicons } from '@expo/vector-icons';
import { Meal } from '@/types/meal';
import { useMealStore } from '@/store/mealStore';
import { MEAL_SLOTS, getMealSlot } from '@/utils/mealSlot';

interface MealSlotListProps {
  meals: Meal[];
  targetCalories?: number;
}

export const MealSlotList = ({ meals }: MealSlotListProps) => {
  const router = useRouter();
  const setDraftSlot = useMealStore((state) => state.setDraftSlot);

  const slotData = MEAL_SLOTS.map((slot) => {
    const slotMeals = meals.filter((m) => getMealSlot(m) === slot.id);
    const totalCal = slotMeals.reduce((sum, m) => sum + m.totalCalories, 0);
    const foodCount = slotMeals.reduce((sum, m) => sum + m.foods.length, 0);

    return {
      ...slot,
      meals: slotMeals,
      totalCal: Math.round(totalCal),
      foodCount,
    };
  });

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Daily Meals</Text>

      {slotData.map((slot) => {
        const hasMeals = slot.meals.length > 0;

        return (
          <View key={slot.id} style={styles.slotCard}>
            <View style={styles.slotHeader}>
              <View style={styles.slotLeft}>
                <Text style={styles.slotEmoji}>{slot.emoji}</Text>
                <View>
                  <Text style={styles.slotTitle}>{slot.title}</Text>
                  <Text style={styles.slotTime}>{slot.timeRange}</Text>
                </View>
              </View>

              <View style={styles.slotRight}>
                <View style={styles.calWrapper}>
                  <Text style={[styles.calValue, hasMeals && styles.calValueActive]}>
                    {slot.totalCal}
                  </Text>
                  <Text style={styles.calUnit}>kcal</Text>
                </View>

                <TouchableOpacity
                  style={styles.addBtn}
                  onPress={() => {
                    setDraftSlot(slot.id);
                    router.push({ pathname: '/search', params: { slot: slot.id } });
                  }}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel={`Add food to ${slot.title}`}
                >
                  <Ionicons name="add" size={16} color={colors.primary} />
                  <Text style={styles.addBtnText}>Add</Text>
                </TouchableOpacity>
              </View>
            </View>

            {hasMeals && (
              <View style={styles.itemsList}>
                {slot.meals.map((meal) =>
                  meal.foods.map((food) => (
                    <View key={food.id} style={styles.foodRow}>
                      <Text style={styles.foodName} numberOfLines={1}>
                        • {food.name}
                      </Text>
                      <Text style={styles.foodCal}>{Math.round(food.calories)} kcal</Text>
                    </View>
                  ))
                )}
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  sectionTitle: {
    ...typography.title,
    fontSize: 18,
    color: colors.text,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  slotCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm + 2,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  slotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  slotLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  slotEmoji: {
    fontSize: 24,
  },
  slotTitle: {
    ...typography.title,
    fontSize: 15,
    color: colors.text,
  },
  slotTime: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 11,
  },
  slotRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  calWrapper: {
    alignItems: 'flex-end',
  },
  calValue: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textSecondary,
  },
  calValueActive: {
    color: colors.primary,
  },
  calUnit: {
    ...typography.caption,
    fontSize: 10,
    color: colors.textMuted,
    marginTop: -2,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 5,
    borderRadius: radius.md,
    gap: 2,
  },
  addBtnText: {
    ...typography.caption,
    color: colors.primaryDark,
    fontWeight: '700',
    fontSize: 12,
  },
  itemsList: {
    marginTop: spacing.sm,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    gap: 3,
  },
  foodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  foodName: {
    ...typography.caption,
    color: colors.textSecondary,
    flex: 1,
    paddingRight: spacing.sm,
  },
  foodCal: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '600',
  },
});
