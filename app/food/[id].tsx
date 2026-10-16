import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { safeBack } from '@/utils/navigation';
import { getFoodById } from '@/services/food/searchFoods';
import { foodCache } from '@/services/food/foodCache';
import { Food } from '@/types/food';
import { MealSlot } from '@/types/meal';
import { LoadingState, ErrorState } from '@/components/StateIndicators';
import { ServingSizeSelector } from '@/components/ServingSizeSelector';
import {
  GlassCard,
  IconSquare,
  PrimaryButton,
  RaisedCard,
  Screen,
  Segmented,
  TopBar,
} from '@/components/ui';
import { useToast } from '@/components/ui/Toast';
import { useMealStore } from '@/store/mealStore';
import { FEATURES } from '@/constants/features';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/fonts';
import { typography } from '@/theme/typography';
import { createId } from '@/utils/id';
import { getBaseServing, scaleFoodNutrition } from '@/utils/nutrition';
import { getMealSlotLabel } from '@/utils/mealSlot';

const SLOTS: { label: string; value: MealSlot }[] = [
  { label: 'Breakfast', value: 'breakfast' },
  { label: 'Lunch', value: 'lunch' },
  { label: 'Dinner', value: 'dinner' },
  { label: 'Snacks', value: 'snacks' },
];

const sourceLabel = (food: Food) => {
  if (food.id.startsWith('off-') || food.brand === 'Open Food Facts') return 'Open Food Facts';
  if (food.dataSource === 'usda') return 'USDA';
  return food.brand || 'Custom';
};

export default function FoodDetailsScreen() {
  const params = useLocalSearchParams<{ id: string | string[] }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const cachedFood = id ? foodCache.get(id) : undefined;
  const [food, setFood] = useState<Food | null>(cachedFood ?? null);
  const [isLoading, setIsLoading] = useState(Boolean(id) && !cachedFood);
  const [error, setError] = useState<string | null>(id ? null : 'Food not found.');
  const [amount, setAmount] = useState(cachedFood ? getBaseServing(cachedFood) : 100);
  const [retryKey, setRetryKey] = useState(0);
  const loadKey = `${id ?? ''}:${retryKey}`;
  const [syncedLoadKey, setSyncedLoadKey] = useState(loadKey);
  const addFoodToMeal = useMealStore((state) => state.addFoodToMeal);
  const removeFoodFromMeal = useMealStore((state) => state.removeFoodFromMeal);
  const draftSlot = useMealStore((state) => state.draftSlot) ?? 'snacks';
  const setDraftSlot = useMealStore((state) => state.setDraftSlot);
  const { show } = useToast();

  if (loadKey !== syncedLoadKey) {
    const nextCached = id ? foodCache.get(id) : undefined;
    setSyncedLoadKey(loadKey);
    setFood(nextCached ?? null);
    setAmount(nextCached ? getBaseServing(nextCached) : 100);
    setError(id ? null : 'Food not found.');
    setIsLoading(Boolean(id) && !nextCached);
  }

  useEffect(() => {
    if (!id || foodCache.get(id)) {
      return;
    }
    let cancelled = false;
    const fetchDetails = async () => {
      try {
        const nextFood = await getFoodById(id);
        if (cancelled) return;
        setFood(nextFood);
        setAmount(getBaseServing(nextFood));
        setError(null);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Could not load food details.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    void fetchDetails();
    return () => {
      cancelled = true;
    };
  }, [id, retryKey]);

  if (isLoading) {
    return (
      <Screen>
        <TopBar title="Food details" />
        <LoadingState message="Loading nutrition info..." />
      </Screen>
    );
  }

  if (error || !food) {
    return (
      <Screen>
        <TopBar title="Food details" />
        <ErrorState
          message={error || 'Food not found.'}
          onRetry={id ? () => {
            setIsLoading(true);
            setError(null);
            setRetryKey((key) => key + 1);
          } : undefined}
        />
      </Screen>
    );
  }

  const baseServing = getBaseServing(food);
  const unit = food.servingUnit?.trim() || 'g';
  const scaled = scaleFoodNutrition(food, amount);

  const handleAdd = () => {
    const calculatedFood: Food = { ...scaled, id: createId() };
    addFoodToMeal(calculatedFood);
    show(`Added to meal · ${food.name}, ${Math.round(calculatedFood.calories)} kcal`, {
      label: 'Undo',
      onPress: () => removeFoodFromMeal(calculatedFood.id),
    });
    safeBack();
  };

  return (
    <Screen blobs="B1">
      <TopBar
        title="Food details"
        right={FEATURES.favourites ? <IconSquare name="star" accessibilityLabel="Favourite" /> : undefined}
      />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <GlassCard padding={20} radiusValue={28} style={styles.hero}>
          <View style={styles.heroIcon}>
            <IconSquare name="coffee" insetStyle size={64} iconSize={28} />
          </View>
          <Text style={styles.name}>{food.name}</Text>
          <Text style={styles.meta}>
            {sourceLabel(food)} · per {food.servingLabel ?? `${Math.round(baseServing)}${unit}`}
          </Text>
          <Text style={styles.kcal}>{Math.round(scaled.calories)}</Text>
        </GlassCard>

        <ServingSizeSelector amount={amount} unit={unit} baseAmount={baseServing} onChange={setAmount} />

        <View style={styles.macros}>
          {[
            { label: 'Protein', value: scaled.protein, color: colors.protein },
            { label: 'Carbs', value: scaled.carbohydrates, color: colors.carbs },
            { label: 'Fat', value: scaled.fat, color: colors.fat },
            { label: 'Fiber', value: scaled.fiber ?? 0, color: colors.fiber },
          ].map((item) => (
            <RaisedCard key={item.label} padding={14} radiusValue={22} style={styles.macroTile}>
              <Text style={styles.macroValue}>{Math.round(item.value * 10) / 10}g</Text>
              <Text style={styles.macroLabel}>{item.label}</Text>
              <View style={[styles.underline, { backgroundColor: item.color }]} />
            </RaisedCard>
          ))}
        </View>

        <Text style={styles.mealLabel}>Meal</Text>
        <Segmented options={SLOTS} value={draftSlot} onChange={setDraftSlot} />
      </ScrollView>
      <View style={styles.footer}>
        <PrimaryButton
          label={`+ Add to ${getMealSlotLabel(draftSlot)}`}
          onPress={handleAdd}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: 120,
    gap: 16,
  },
  hero: {
    alignItems: 'center',
  },
  heroIcon: {
    marginBottom: 10,
  },
  name: {
    fontFamily: fonts.outfitBold,
    fontSize: 22,
    fontWeight: '700',
    color: colors.ink,
    textAlign: 'center',
  },
  meta: {
    ...typography.caption,
    color: colors.muted,
    marginTop: 4,
  },
  kcal: {
    fontFamily: fonts.outfitBold,
    fontSize: 48,
    fontWeight: '700',
    letterSpacing: -1.5,
    color: colors.ink,
    marginTop: 8,
  },
  macros: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  macroTile: {
    width: '47%',
    flexGrow: 1,
    minWidth: 140,
  },
  macroValue: {
    fontFamily: fonts.outfitSemiBold,
    fontSize: 20,
    color: colors.ink,
  },
  macroLabel: {
    ...typography.caption,
    color: colors.muted,
    marginTop: 2,
  },
  underline: {
    height: 4,
    borderRadius: 2,
    marginTop: 10,
  },
  mealLabel: {
    ...typography.fieldLabel,
    color: colors.muted,
  },
  footer: {
    paddingBottom: 12,
  },
});
