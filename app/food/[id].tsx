import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { safeBack } from '@/utils/navigation';
import { getFoodById } from '@/services/food/searchFoods';
import { foodCache } from '@/services/food/foodCache';
import { mealStorage } from '@/storage/mealStorage';
import { Food } from '@/types/food';
import { MealSlot } from '@/types/meal';
import { LoadingState, ErrorState } from '@/components/StateIndicators';
import { ServingSizeSelector } from '@/components/ServingSizeSelector';
import { LoggingDateNote } from '@/components/LoggingDateNote';
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
import { applyServing, asUnitBaseline, getBaseServing } from '@/utils/nutrition';
import { getMealSlotLabel } from '@/utils/mealSlot';

const SLOTS: { label: string; value: MealSlot }[] = [
  { label: 'Breakfast', value: 'breakfast' },
  { label: 'Lunch', value: 'lunch' },
  { label: 'Dinner', value: 'dinner' },
  { label: 'Snacks', value: 'snacks' },
];

const first = (value?: string | string[]) => (Array.isArray(value) ? value[0] : value);

const sourceLabel = (food: Food) => {
  if (food.id.startsWith('off-') || food.brand === 'Open Food Facts') return 'Open Food Facts';
  if (food.dataSource === 'usda') return 'USDA';
  return food.brand || 'Custom';
};

export default function FoodDetailsScreen() {
  const params = useLocalSearchParams<{
    id: string | string[];
    editDraftId?: string | string[];
    editMealId?: string | string[];
    editIndex?: string | string[];
  }>();
  const id = first(params.id);
  const editDraftId = first(params.editDraftId);
  const editMealId = first(params.editMealId);
  const editIndex = Number(first(params.editIndex));
  const isEditing = Boolean(editDraftId || (editMealId && Number.isFinite(editIndex)));

  const draftMeal = useMealStore((state) => state.draftMeal);
  const cachedFood = !isEditing && id ? foodCache.get(id) : undefined;
  const draftFood = editDraftId ? draftMeal.find((item) => item.id === editDraftId) : undefined;

  const [baseFood, setBaseFood] = useState<Food | null>(draftFood ?? cachedFood ?? null);
  const [isLoading, setIsLoading] = useState(Boolean(id) && !draftFood && !cachedFood);
  const [error, setError] = useState<string | null>(id || isEditing ? null : 'Food not found.');
  const [amount, setAmount] = useState(baseFood ? getBaseServing(baseFood) : 100);
  const [unit, setUnit] = useState(baseFood?.servingUnit?.trim() || 'g');
  const [retryKey, setRetryKey] = useState(0);

  const addFoodToMeal = useMealStore((state) => state.addFoodToMeal);
  const updateFoodInMeal = useMealStore((state) => state.updateFoodInMeal);
  const removeFoodFromMeal = useMealStore((state) => state.removeFoodFromMeal);
  const draftSlot = useMealStore((state) => state.draftSlot) ?? 'snacks';
  const setDraftSlot = useMealStore((state) => state.setDraftSlot);
  const { show } = useToast();

  const hydrate = useCallback((next: Food) => {
    setBaseFood(next);
    setAmount(getBaseServing(next));
    setUnit(next.servingUnit?.trim() || 'g');
    setError(null);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (editDraftId) {
      if (draftFood) {
        hydrate(draftFood);
      } else {
        setError('Food not found.');
        setIsLoading(false);
      }
      return;
    }
    if (editMealId && Number.isFinite(editIndex)) {
      let cancelled = false;
      void mealStorage.getMeal(editMealId).then((meal) => {
        if (cancelled) return;
        const next = meal?.foods[editIndex];
        if (!next) {
          setError('Food not found.');
          setIsLoading(false);
          return;
        }
        hydrate(next);
      });
      return () => {
        cancelled = true;
      };
    }
    if (!id) {
      setError('Food not found.');
      setIsLoading(false);
      return;
    }
    const cached = foodCache.get(id);
    if (cached) {
      hydrate(cached);
      return;
    }
    let cancelled = false;
    const fetchDetails = async () => {
      try {
        const nextFood = await getFoodById(id);
        if (cancelled) return;
        hydrate(nextFood);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Could not load food details.');
        setIsLoading(false);
      }
    };
    void fetchDetails();
    return () => {
      cancelled = true;
    };
  }, [id, retryKey, editDraftId, editMealId, editIndex, draftFood, hydrate]);

  const handleUnitChange = (nextUnit: string) => {
    if (!baseFood || nextUnit === unit) return;
    const nextBase: Food = {
      ...asUnitBaseline(baseFood, amount, nextUnit),
      id: baseFood.id,
    };
    setBaseFood(nextBase);
    setAmount(1);
    setUnit(nextUnit);
  };

  if (isLoading) {
    return (
      <Screen>
        <TopBar title={isEditing ? 'Edit food' : 'Food details'} />
        <LoadingState message="Loading nutrition info..." />
      </Screen>
    );
  }

  if (error || !baseFood) {
    return (
      <Screen>
        <TopBar title={isEditing ? 'Edit food' : 'Food details'} />
        <ErrorState
          message={error || 'Food not found.'}
          onRetry={
            id && !isEditing
              ? () => {
                  setIsLoading(true);
                  setError(null);
                  setRetryKey((key) => key + 1);
                }
              : undefined
          }
        />
      </Screen>
    );
  }

  const scaled = applyServing(baseFood, amount, unit);
  const display = { ...baseFood, ...scaled, id: baseFood.id };

  const handleSave = async () => {
    const calculatedFood: Food = { ...display, id: isEditing ? baseFood.id : createId() };
    if (editDraftId) {
      updateFoodInMeal(editDraftId, calculatedFood);
      show(`Updated · ${baseFood.name}`);
      safeBack();
      return;
    }
    if (editMealId && Number.isFinite(editIndex)) {
      const success = await mealStorage.updateFood(editMealId, editIndex, calculatedFood);
      show(success ? `Updated · ${baseFood.name}` : 'Could not update');
      if (success) safeBack();
      return;
    }
    addFoodToMeal(calculatedFood);
    show(`Added to meal · ${baseFood.name}, ${Math.round(calculatedFood.calories)} kcal`, {
      label: 'Undo',
      onPress: () => removeFoodFromMeal(calculatedFood.id),
    });
    safeBack();
  };

  return (
    <Screen blobs="B1">
      <TopBar
        title={isEditing ? 'Edit food' : 'Food details'}
        right={FEATURES.favourites ? <IconSquare name="star" accessibilityLabel="Favourite" /> : undefined}
      />
      <LoggingDateNote />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <GlassCard padding={20} radiusValue={28} style={styles.hero}>
          <View style={styles.heroIcon}>
            <IconSquare name="coffee" insetStyle size={64} iconSize={28} />
          </View>
          <Text style={styles.name}>{baseFood.name}</Text>
          <Text style={styles.meta}>
            {sourceLabel(baseFood)} · {display.servingLabel}
          </Text>
          <Text style={styles.kcal}>{Math.round(display.calories)}</Text>
        </GlassCard>

        <ServingSizeSelector
          amount={amount}
          unit={unit}
          baseAmount={getBaseServing(baseFood)}
          onChange={setAmount}
          onUnitChange={handleUnitChange}
        />

        <View style={styles.macros}>
          {[
            { label: 'Protein', value: display.protein, color: colors.protein },
            { label: 'Carbs', value: display.carbohydrates, color: colors.carbs },
            { label: 'Fat', value: display.fat, color: colors.fat },
            { label: 'Fiber', value: display.fiber ?? 0, color: colors.fiber },
          ].map((item) => (
            <RaisedCard key={item.label} padding={14} radiusValue={22} style={styles.macroTile}>
              <Text style={styles.macroValue}>{Math.round(item.value * 10) / 10}g</Text>
              <Text style={styles.macroLabel}>{item.label}</Text>
              <View style={[styles.underline, { backgroundColor: item.color }]} />
            </RaisedCard>
          ))}
        </View>

        {isEditing ? null : (
          <>
            <Text style={styles.mealLabel}>Meal</Text>
            <Segmented options={SLOTS} value={draftSlot} onChange={setDraftSlot} />
          </>
        )}
      </ScrollView>
      <View style={styles.footer}>
        <PrimaryButton
          label={isEditing ? 'Save changes' : `+ Add to ${getMealSlotLabel(draftSlot)}`}
          onPress={() => void handleSave()}
          disabled={amount <= 0}
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
