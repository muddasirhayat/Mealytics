import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { QuickMeal } from '@/types/quickMeal';
import { Food } from '@/types/food';
import { useMealStore } from '@/store/mealStore';
import { createId } from '@/utils/id';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { radius } from '@/theme/radius';

interface QuickMealCardProps {
  meal: QuickMeal;
  index: number;
}

export const QuickMealCard = ({ meal, index }: QuickMealCardProps) => {
  const router = useRouter();
  const addFoodToMeal = useMealStore((state) => state.addFoodToMeal);
  const [added, setAdded] = useState(false);
  const addedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (addedTimer.current) {
        clearTimeout(addedTimer.current);
      }
    };
  }, []);

  const handleAdd = () => {
    const foodItem: Food = {
      id: createId(),
      name: meal.name,
      dataSource: 'custom',
      calories: meal.calories,
      protein: meal.protein,
      carbohydrates: meal.carbs,
      fat: meal.fat,
      fiber: meal.fiber,
      servingUnit: meal.servingSize,
      nutrients: [],
    };

    addFoodToMeal(foodItem);
    setAdded(true);
    if (addedTimer.current) {
      clearTimeout(addedTimer.current);
    }
    addedTimer.current = setTimeout(() => setAdded(false), 2000);
  };

  return (
    <View style={styles.card}>
      {/* Top row: Number Badge + Meal Name + Calorie Tag */}
      <View style={styles.topRow}>
        <View style={styles.titleArea}>
          <View style={styles.indexBadge}>
            <Text style={styles.indexText}>{index + 1}</Text>
          </View>
          <View style={styles.nameContainer}>
            <Text style={styles.mealName}>{meal.name}</Text>
            <Text style={styles.servingText}>Serving: {meal.servingSize}</Text>
          </View>
        </View>

        <View style={styles.calorieBadge}>
          <Text style={styles.calorieValue}>{meal.calories}</Text>
          <Text style={styles.calorieUnit}>kcal</Text>
        </View>
      </View>

      {/* Macro Grid */}
      <View style={styles.macrosRow}>
        <View style={styles.macroBox}>
          <View style={[styles.dot, { backgroundColor: colors.protein }]} />
          <Text style={styles.macroLabel}>Protein</Text>
          <Text style={styles.macroVal}>{meal.protein}g</Text>
        </View>

        <View style={styles.macroBox}>
          <View style={[styles.dot, { backgroundColor: colors.carbs }]} />
          <Text style={styles.macroLabel}>Carbs</Text>
          <Text style={styles.macroVal}>{meal.carbs}g</Text>
        </View>

        <View style={styles.macroBox}>
          <View style={[styles.dot, { backgroundColor: colors.fat }]} />
          <Text style={styles.macroLabel}>Fat</Text>
          <Text style={styles.macroVal}>{meal.fat}g</Text>
        </View>

        <View style={styles.macroBox}>
          <View style={[styles.dot, { backgroundColor: colors.success }]} />
          <Text style={styles.macroLabel}>Fiber</Text>
          <Text style={styles.macroVal}>{meal.fiber}g</Text>
        </View>
      </View>

      {/* Footer: Tags + Quick Log Action */}
      <View style={styles.footerRow}>
        <View style={styles.tagsContainer}>
          {meal.tags.map((tag, i) => (
            <View key={i} style={styles.tagPill}>
              <Text style={styles.tagText}>#{tag}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.addBtn, added && styles.addBtnSuccess]}
          onPress={added ? () => router.push('/meal/draft') : handleAdd}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={added ? 'Review current meal' : `Add ${meal.name} to meal`}
        >
          <Ionicons
            name={added ? 'checkmark' : 'add'}
            size={16}
            color={added ? colors.surface : colors.primaryDark}
          />
          <Text style={[styles.addBtnText, added && styles.addBtnTextSuccess]}>
            {added ? 'Review' : 'Add'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  titleArea: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    paddingRight: spacing.sm,
    gap: spacing.sm,
  },
  indexBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  indexText: {
    ...typography.caption,
    fontWeight: '800',
    color: colors.primaryDark,
    fontSize: 12,
  },
  nameContainer: {
    flex: 1,
  },
  mealName: {
    ...typography.title,
    fontSize: 16,
    color: colors.text,
    lineHeight: 22,
  },
  servingText: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
    fontSize: 12,
  },
  calorieBadge: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 4,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  calorieValue: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  calorieUnit: {
    ...typography.caption,
    fontSize: 10,
    color: colors.primaryDark,
    fontWeight: '600',
    marginTop: -2,
  },
  macrosRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
    borderRadius: radius.md,
    paddingVertical: spacing.xs + 4,
    paddingHorizontal: spacing.sm,
    marginVertical: spacing.xs,
  },
  macroBox: {
    alignItems: 'center',
    flex: 1,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginBottom: 2,
  },
  macroLabel: {
    ...typography.caption,
    fontSize: 10,
    color: colors.textMuted,
  },
  macroVal: {
    ...typography.caption,
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    flex: 1,
  },
  tagPill: {
    backgroundColor: colors.divider,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  tagText: {
    ...typography.caption,
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.md,
    gap: 4,
  },
  addBtnSuccess: {
    backgroundColor: colors.success,
  },
  addBtnText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.primaryDark,
    fontSize: 12,
  },
  addBtnTextSuccess: {
    color: colors.surface,
  },
});
