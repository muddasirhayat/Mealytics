import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getFoodById } from '@/services/food/searchFoods';
import { foodCache } from '@/services/food/foodCache';
import { Food } from '@/types/food';
import { LoadingState, ErrorState } from '@/components/StateIndicators';
import { NutritionCard } from '@/components/NutritionCard';
import { QuantitySelector } from '@/components/QuantitySelector';
import { useMealStore } from '@/store/mealStore';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { radius } from '@/theme/radius';
import { Ionicons } from '@expo/vector-icons';
import { createId } from '@/utils/id';

export default function FoodDetailsScreen() {
  const params = useLocalSearchParams<{ id: string | string[] }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const cachedFood = id ? foodCache.get(id) : undefined;
  const [food, setFood] = useState<Food | null>(cachedFood ?? null);
  const [isLoading, setIsLoading] = useState(Boolean(id) && !cachedFood);
  const [error, setError] = useState<string | null>(id ? null : 'Food not found.');
  const [quantity, setQuantity] = useState(1);
  const [retryKey, setRetryKey] = useState(0);

  const addFoodToMeal = useMealStore((state) => state.addFoodToMeal);

  useEffect(() => {
    if (!id) {
      return;
    }

    const cached = foodCache.get(id);
    if (cached) {
      setFood(cached);
      setError(null);
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    const fetchDetails = async () => {
      try {
        const nextFood = await getFoodById(id);
        if (cancelled) return;
        setFood(nextFood);
        setError(null);
      } catch (err) {
        if (cancelled) {
          return;
        }
        setError(err instanceof Error ? err.message : 'Could not load food details.');
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void fetchDetails();

    return () => {
      cancelled = true;
    };
  }, [id, retryKey]);

  const handleAddToMeal = () => {
    if (!food) return;

    const calculatedFood: Food = {
      ...food,
      id: createId(),
      calories: food.calories * quantity,
      protein: food.protein * quantity,
      carbohydrates: food.carbohydrates * quantity,
      fat: food.fat * quantity,
      fiber: food.fiber !== undefined ? food.fiber * quantity : undefined,
      sugar: food.sugar !== undefined ? food.sugar * quantity : undefined,
      sodium: food.sodium !== undefined ? food.sodium * quantity : undefined,
      servingSize: (food.servingSize || 1) * quantity,
    };

    addFoodToMeal(calculatedFood);
    Alert.alert('Added to meal', `${food.name} is in your current meal.`, [
      { text: 'Add more', onPress: () => router.back() },
      { text: 'Review meal', onPress: () => router.replace('/meal/draft') },
    ]);
  };

  if (isLoading) {
    return <LoadingState message="Loading nutrition info..." />;
  }

  if (error || !food) {
    return (
      <ErrorState
        message={error || 'Food not found.'}
        onRetry={id ? () => {
          setIsLoading(true);
          setError(null);
          setRetryKey((key) => key + 1);
        } : undefined}
      />
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>{food.name}</Text>
          {food.brand && <Text style={styles.brand}>{food.brand}</Text>}
          {food.servingSize && food.servingUnit && (
            <Text style={styles.servingInfo}>
              Base serving: {food.servingSize}{food.servingUnit}
            </Text>
          )}
        </View>

        <View style={styles.section}>
          <QuantitySelector
            quantity={quantity}
            onChange={setQuantity}
            label="Servings"
          />
        </View>

        <View style={styles.section}>
          <NutritionCard food={food} multiplier={quantity} />
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddToMeal}
          accessibilityRole="button"
          accessibilityLabel="Add food to meal"
        >
          <Ionicons name="add" size={24} color={colors.surface} style={styles.addIcon} />
          <Text style={styles.addButtonText}>Add to Meal</Text>
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
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl * 3,
  },
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.header,
    color: colors.text,
  },
  brand: {
    ...typography.bodyLarge,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  servingInfo: {
    ...typography.bodyMedium,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  section: {
    marginBottom: spacing.lg,
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
  addButton: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addIcon: {
    marginRight: spacing.sm,
  },
  addButtonText: {
    ...typography.title,
    color: colors.surface,
  },
});
