import React, { useEffect, useMemo, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { safeBack } from '@/utils/navigation';
import { Food } from '@/types/food';
import { MealSlot } from '@/types/meal';
import { useMealStore } from '@/store/mealStore';
import { mealStorage } from '@/storage/mealStorage';
import { LoggingDateNote } from '@/components/LoggingDateNote';
import { getMealSlotLabel } from '@/utils/mealSlot';
import { formatServingLabel, parseOptionalNumber, parsePositiveNumber } from '@/utils/nutrition';
import { sanitizeDecimalInput } from '@/utils/number';
import { createId } from '@/utils/id';
import { SERVING_UNIT_OPTIONS, toServingUnit, type ServingUnit } from '@/constants/servings';
import { ConfirmDialog, InsetField, PrimaryButton, Screen, Segmented, TopBar } from '@/components/ui';
import { useToast } from '@/components/ui/Toast';
import { HIGH_CALORIE_CONFIRM, NUTRITION_MAX } from '@/constants/nutritionLimits';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/fonts';
import { typography } from '@/theme/typography';

const SLOTS: { label: string; value: MealSlot }[] = [
  { label: 'Breakfast', value: 'breakfast' },
  { label: 'Lunch', value: 'lunch' },
  { label: 'Dinner', value: 'dinner' },
  { label: 'Snacks', value: 'snacks' },
];

const first = (value?: string | string[]) => (Array.isArray(value) ? value[0] : value);

const fieldValue = (value?: number) => (value === undefined ? '' : String(value));

export default function CustomFoodScreen() {
  const params = useLocalSearchParams<{
    editDraftId?: string | string[];
    editMealId?: string | string[];
    editIndex?: string | string[];
  }>();
  const editDraftId = first(params.editDraftId);
  const editMealId = first(params.editMealId);
  const editIndex = Number(first(params.editIndex));
  const isEditing = Boolean(editDraftId || (editMealId && Number.isFinite(editIndex)));

  const draftMeal = useMealStore((state) => state.draftMeal);
  const addFoodToMeal = useMealStore((state) => state.addFoodToMeal);
  const updateFoodInMeal = useMealStore((state) => state.updateFoodInMeal);
  const removeFoodFromMeal = useMealStore((state) => state.removeFoodFromMeal);
  const draftSlot = useMealStore((state) => state.draftSlot) ?? 'snacks';
  const setDraftSlot = useMealStore((state) => state.setDraftSlot);
  const { show } = useToast();
  const [highCalOpen, setHighCalOpen] = useState(false);

  const [name, setName] = useState('');
  const [serving, setServing] = useState('100');
  const [unit, setUnit] = useState<ServingUnit>('g');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [fiber, setFiber] = useState('');
  const [sugar, setSugar] = useState('');
  const [sodium, setSodium] = useState('');
  const [more, setMore] = useState(false);
  const [existingId, setExistingId] = useState<string | null>(editDraftId ?? null);
  const filled = useRef(false);

  const fillFromFood = (food: Food) => {
    setExistingId(food.id);
    setName(food.name);
    setServing(String(food.servingSize && food.servingSize > 0 ? food.servingSize : 100));
    setUnit(toServingUnit(food.servingUnit));
    setCalories(fieldValue(food.calories));
    setProtein(fieldValue(food.protein));
    setCarbs(fieldValue(food.carbohydrates));
    setFat(fieldValue(food.fat));
    setFiber(fieldValue(food.fiber));
    setSugar(fieldValue(food.sugar));
    setSodium(fieldValue(food.sodium));
    setMore(food.sugar !== undefined || food.sodium !== undefined);
    filled.current = true;
  };

  useEffect(() => {
    if (filled.current) return;
    if (editDraftId) {
      const food = draftMeal.find((item) => item.id === editDraftId);
      if (food) fillFromFood(food);
      return;
    }
    if (editMealId && Number.isFinite(editIndex)) {
      let cancelled = false;
      void mealStorage.getMeal(editMealId).then((meal) => {
        const food = meal?.foods[editIndex];
        if (!cancelled && food) fillFromFood(food);
      });
      return () => {
        cancelled = true;
      };
    }
  }, [editDraftId, editMealId, editIndex, draftMeal]);

  const servingAmount = parsePositiveNumber(serving);
  const caloriesValue = parseOptionalNumber(calories);
  const proteinValue = parseOptionalNumber(protein);
  const carbsValue = parseOptionalNumber(carbs);
  const fatValue = parseOptionalNumber(fat);
  const fiberValue = parseOptionalNumber(fiber);
  const sugarValue = parseOptionalNumber(sugar);
  const sodiumValue = parseOptionalNumber(sodium);
  const nameError = name.trim() ? undefined : 'Add a food name.';
  const servingError =
    servingAmount === null
      ? 'Enter a serving greater than 0.'
      : servingAmount > NUTRITION_MAX.serving
        ? `Serving can’t be over ${NUTRITION_MAX.serving}.`
        : undefined;
  const caloriesError =
    caloriesValue !== undefined && caloriesValue > NUTRITION_MAX.calories
      ? `Calories can’t be over ${NUTRITION_MAX.calories}.`
      : undefined;
  const proteinError =
    proteinValue !== undefined && proteinValue > NUTRITION_MAX.protein
      ? `Protein can’t be over ${NUTRITION_MAX.protein} g.`
      : undefined;
  const carbsError =
    carbsValue !== undefined && carbsValue > NUTRITION_MAX.carbs
      ? `Carbs can’t be over ${NUTRITION_MAX.carbs} g.`
      : undefined;
  const fatError =
    fatValue !== undefined && fatValue > NUTRITION_MAX.fat
      ? `Fat can’t be over ${NUTRITION_MAX.fat} g.`
      : undefined;
  const fiberError =
    fiberValue !== undefined && fiberValue > NUTRITION_MAX.fiber
      ? `Fiber can’t be over ${NUTRITION_MAX.fiber} g.`
      : undefined;
  const sugarError =
    sugarValue !== undefined && sugarValue > NUTRITION_MAX.sugar
      ? `Sugar can’t be over ${NUTRITION_MAX.sugar} g.`
      : undefined;
  const sodiumError =
    sodiumValue !== undefined && sodiumValue > NUTRITION_MAX.sodium
      ? `Sodium can’t be over ${NUTRITION_MAX.sodium} mg.`
      : undefined;
  const hasMacro =
    caloriesValue !== undefined ||
    proteinValue !== undefined ||
    carbsValue !== undefined ||
    fatValue !== undefined ||
    fiberValue !== undefined;
  const nutritionError = hasMacro ? undefined : 'Enter calories or at least one macro.';
  const canSave =
    !nameError &&
    !servingError &&
    !nutritionError &&
    !caloriesError &&
    !proteinError &&
    !carbsError &&
    !fatError &&
    !fiberError &&
    !sugarError &&
    !sodiumError;

  const buildFood = (id: string): Food | null => {
    if (servingAmount === null) return null;
    return {
      id,
      name: name.trim(),
      dataSource: 'custom',
      calories: parseOptionalNumber(calories) ?? 0,
      protein: parseOptionalNumber(protein) ?? 0,
      carbohydrates: parseOptionalNumber(carbs) ?? 0,
      fat: parseOptionalNumber(fat) ?? 0,
      fiber: parseOptionalNumber(fiber),
      sugar: parseOptionalNumber(sugar),
      sodium: parseOptionalNumber(sodium),
      servingSize: servingAmount,
      servingUnit: unit,
      servingLabel: formatServingLabel(servingAmount, unit),
      nutrients: [],
    };
  };

  const persistFood = async () => {
    if (!canSave) return;
    if (isEditing) {
      const food = buildFood(existingId ?? createId());
      if (!food) return;
      if (editDraftId) {
        updateFoodInMeal(editDraftId, food);
        show(`Updated · ${food.name}`);
        safeBack();
        return;
      }
      if (editMealId && Number.isFinite(editIndex)) {
        const success = await mealStorage.updateFood(editMealId, editIndex, food);
        show(success ? `Updated · ${food.name}` : 'Could not update');
        if (success) safeBack();
      }
      return;
    }
    const food = buildFood(createId());
    if (!food) return;
    addFoodToMeal(food);
    show(`Added to meal · ${food.name}, ${Math.round(food.calories)} kcal`, {
      label: 'Undo',
      onPress: () => removeFoodFromMeal(food.id),
    });
    safeBack();
  };

  const handleSave = async () => {
    if (!canSave) return;
    const kcal = caloriesValue ?? 0;
    if (kcal >= HIGH_CALORIE_CONFIRM) {
      setHighCalOpen(true);
      return;
    }
    await persistFood();
  };

  const unitOptions = useMemo(() => SERVING_UNIT_OPTIONS, []);

  return (
    <Screen blobs="B1">
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <TopBar title={isEditing ? 'Edit food' : 'Custom food'} />
        <LoggingDateNote />
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
          <View style={styles.row}>
            <InsetField label="Food name" value={name} onChangeText={setName} placeholder="e.g. Homemade daal" error={name.length ? nameError : undefined} />
            <InsetField
              label="Serving"
              value={serving}
              onChangeText={(text) => setServing(sanitizeDecimalInput(text))}
              keyboardType="decimal-pad"
              suffix={unit}
              error={serving.length ? servingError : undefined}
            />
          </View>
          <Text style={styles.unitLabel}>Unit</Text>
          <Segmented options={unitOptions} value={unit} onChange={setUnit} />
          <InsetField
            label="Calories (kcal)"
            value={calories}
            onChangeText={(text) => setCalories(sanitizeDecimalInput(text))}
            keyboardType="decimal-pad"
            error={
              caloriesError ??
              (nutritionError && calories.length + protein.length + carbs.length + fat.length + fiber.length > 0
                ? nutritionError
                : undefined)
            }
          />
          <View style={styles.row}>
            <InsetField label="Protein" value={protein} onChangeText={(text) => setProtein(sanitizeDecimalInput(text))} keyboardType="decimal-pad" suffix="g" error={proteinError} />
            <InsetField label="Carbs" value={carbs} onChangeText={(text) => setCarbs(sanitizeDecimalInput(text))} keyboardType="decimal-pad" suffix="g" error={carbsError} />
          </View>
          <View style={styles.row}>
            <InsetField label="Fat" value={fat} onChangeText={(text) => setFat(sanitizeDecimalInput(text))} keyboardType="decimal-pad" suffix="g" error={fatError} />
            <InsetField label="Fiber" value={fiber} onChangeText={(text) => setFiber(sanitizeDecimalInput(text))} keyboardType="decimal-pad" suffix="g" error={fiberError} />
          </View>
          <Pressable onPress={() => setMore((value) => !value)} accessibilityRole="button" style={styles.moreBtn}>
            <Text style={styles.more}>{more ? 'Hide extra nutrients' : 'More nutrients (optional)'}</Text>
          </Pressable>
          {more ? (
            <>
              <InsetField label="Sugar" value={sugar} onChangeText={(text) => setSugar(sanitizeDecimalInput(text))} keyboardType="decimal-pad" suffix="g" error={sugarError} />
              <InsetField label="Sodium" value={sodium} onChangeText={(text) => setSodium(sanitizeDecimalInput(text))} keyboardType="decimal-pad" suffix="mg" error={sodiumError} />
            </>
          ) : null}
          {isEditing ? null : (
            <>
              <Text style={styles.mealLabel}>Add to meal</Text>
              <Segmented options={SLOTS} value={draftSlot} onChange={setDraftSlot} />
            </>
          )}
        </ScrollView>
        <PrimaryButton
          label={isEditing ? 'Save changes' : `+ Add to ${getMealSlotLabel(draftSlot)}`}
          onPress={() => void handleSave()}
          disabled={!canSave}
        />
        <ConfirmDialog
          visible={highCalOpen}
          title="That’s a lot of calories"
          body={`${Math.round(caloriesValue ?? 0)} kcal in one food is unusually high. Add it anyway?`}
          confirmLabel="Add anyway"
          onCancel={() => setHighCalOpen(false)}
          onConfirm={() => {
            setHighCalOpen(false);
            void persistFood();
          }}
        />
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: {
    gap: 14,
    paddingBottom: 24,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  unitLabel: {
    ...typography.fieldLabel,
    color: colors.muted,
  },
  moreBtn: {
    minHeight: 44,
    justifyContent: 'center',
  },
  more: {
    fontFamily: fonts.outfitSemiBold,
    fontSize: 14,
    color: colors.accent,
  },
  mealLabel: {
    ...typography.fieldLabel,
    color: colors.muted,
  },
});
