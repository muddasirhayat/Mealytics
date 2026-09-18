import React from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Alert, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMealStore } from '@/store/mealStore';
import { mealStorage } from '@/storage/mealStorage';
import { MealTotalsCard } from '@/components/MealTotalsCard';
import { MealFoodRow } from '@/components/MealFoodRow';
import { MealSlotPicker } from '@/components/MealSlotPicker';
import { EmptyState } from '@/components/StateIndicators';
import { getMealSlotLabel } from '@/utils/mealSlot';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { radius } from '@/theme/radius';
import { Ionicons } from '@expo/vector-icons';
import { createId } from '@/utils/id';

export default function DraftMealScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { draftMeal, draftSlot, setDraftSlot, removeFoodFromMeal, clearDraftMeal } = useMealStore();

  const totals = draftMeal.reduce(
    (acc, food) => {
      acc.calories += food.calories || 0;
      acc.protein += food.protein || 0;
      acc.carbs += food.carbohydrates || 0;
      acc.fat += food.fat || 0;
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const handleSaveMeal = async () => {
    if (draftMeal.length === 0) return;

    const newMeal = {
      id: createId(),
      timestamp: Date.now(),
      slot: draftSlot,
      foods: draftMeal,
      totalCalories: Math.round(totals.calories),
      totalProtein: Math.round(totals.protein),
      totalCarbohydrates: Math.round(totals.carbs),
      totalFat: Math.round(totals.fat),
    };

    const success = await mealStorage.saveMeal(newMeal);
    if (success) {
      clearDraftMeal();
      Alert.alert('Meal saved', `${getMealSlotLabel(draftSlot)} was added to today's log.`, [
        { text: 'OK', onPress: () => router.replace('/') },
      ]);
    } else {
      Alert.alert('Could not save', 'Please try again.');
    }
  };

  if (draftMeal.length === 0) {
    return (
      <View style={styles.container}>
        <EmptyState
          icon="restaurant-outline"
          message="Your meal is empty. Search for foods to add them here."
        />
        <TouchableOpacity style={styles.backButton} onPress={() => router.push('/search')}>
          <Text style={styles.backButtonText}>Search foods</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={draftMeal}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <MealFoodRow food={item} onRemove={removeFoodFromMeal} />
        )}
        ListHeaderComponent={
          <View style={styles.header}>
            <MealTotalsCard
              calories={totals.calories}
              protein={totals.protein}
              carbs={totals.carbs}
              fat={totals.fat}
            />
            <MealSlotPicker value={draftSlot} onChange={setDraftSlot} />
            <Text style={styles.listTitle}>Foods in this meal</Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSaveMeal}
          accessibilityRole="button"
          accessibilityLabel="Save meal"
        >
          <Ionicons name="checkmark-circle" size={24} color={colors.surface} style={styles.saveIcon} />
          <Text style={styles.saveButtonText}>Save {getMealSlotLabel(draftSlot)}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl * 3,
  },
  header: {
    marginBottom: spacing.lg,
  },
  listTitle: {
    ...typography.title,
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  saveButton: {
    flexDirection: 'row',
    backgroundColor: colors.success,
    padding: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveIcon: {
    marginRight: spacing.sm,
  },
  saveButtonText: {
    ...typography.title,
    color: colors.surface,
  },
  backButton: {
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  backButtonText: {
    ...typography.bodyLarge,
    color: colors.primary,
    fontWeight: '700',
  },
});
