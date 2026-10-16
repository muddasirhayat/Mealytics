import React, { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { safeBack } from '@/utils/navigation';
import { Food } from '@/types/food';
import { MealSlot } from '@/types/meal';
import { useMealStore } from '@/store/mealStore';
import { getMealSlotLabel } from '@/utils/mealSlot';
import { parseOptionalNumber, parsePositiveNumber } from '@/utils/nutrition';
import { sanitizeDecimalInput } from '@/utils/number';
import { createId } from '@/utils/id';
import { InsetField, PrimaryButton, Screen, Segmented, TopBar } from '@/components/ui';
import { useToast } from '@/components/ui/Toast';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/fonts';
import { typography } from '@/theme/typography';

const SLOTS: { label: string; value: MealSlot }[] = [
  { label: 'Breakfast', value: 'breakfast' },
  { label: 'Lunch', value: 'lunch' },
  { label: 'Dinner', value: 'dinner' },
  { label: 'Snacks', value: 'snacks' },
];

const UNITS = ['g', 'ml', 'cup', 'piece', 'plate', 'bowl', 'slice'] as const;

export default function CustomFoodScreen() {
  const addFoodToMeal = useMealStore((state) => state.addFoodToMeal);
  const removeFoodFromMeal = useMealStore((state) => state.removeFoodFromMeal);
  const draftSlot = useMealStore((state) => state.draftSlot) ?? 'snacks';
  const setDraftSlot = useMealStore((state) => state.setDraftSlot);
  const { show } = useToast();

  const [name, setName] = useState('');
  const [serving, setServing] = useState('100');
  const [unit, setUnit] = useState<(typeof UNITS)[number]>('g');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [fiber, setFiber] = useState('');
  const [sugar, setSugar] = useState('');
  const [sodium, setSodium] = useState('');
  const [more, setMore] = useState(false);

  const servingAmount = parsePositiveNumber(serving);
  const nameError = name.trim() ? undefined : 'Add a food name.';
  const servingError = servingAmount === null ? 'Enter a serving greater than 0.' : undefined;
  const hasMacro =
    parseOptionalNumber(calories) !== undefined ||
    parseOptionalNumber(protein) !== undefined ||
    parseOptionalNumber(carbs) !== undefined ||
    parseOptionalNumber(fat) !== undefined ||
    parseOptionalNumber(fiber) !== undefined;
  const nutritionError = hasMacro ? undefined : 'Enter calories or at least one macro.';
  const canSave = !nameError && !servingError && !nutritionError;

  const handleSave = () => {
    if (!canSave || servingAmount === null) return;
    const food: Food = {
      id: createId(),
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
      servingLabel: `${servingAmount} ${unit}`,
      nutrients: [],
    };
    addFoodToMeal(food);
    show(`Added to meal · ${food.name}, ${Math.round(food.calories)} kcal`, {
      label: 'Undo',
      onPress: () => removeFoodFromMeal(food.id),
    });
    safeBack();
  };

  const unitOptions = useMemo(
    () => UNITS.map((item) => ({ label: item, value: item })),
    []
  );

  return (
    <Screen blobs="B1">
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <TopBar title="Custom food" />
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
            error={nutritionError && calories.length + protein.length + carbs.length + fat.length + fiber.length > 0 ? nutritionError : undefined}
          />
          <View style={styles.row}>
            <InsetField label="Protein" value={protein} onChangeText={(text) => setProtein(sanitizeDecimalInput(text))} keyboardType="decimal-pad" suffix="g" />
            <InsetField label="Carbs" value={carbs} onChangeText={(text) => setCarbs(sanitizeDecimalInput(text))} keyboardType="decimal-pad" suffix="g" />
          </View>
          <View style={styles.row}>
            <InsetField label="Fat" value={fat} onChangeText={(text) => setFat(sanitizeDecimalInput(text))} keyboardType="decimal-pad" suffix="g" />
            <InsetField label="Fiber" value={fiber} onChangeText={(text) => setFiber(sanitizeDecimalInput(text))} keyboardType="decimal-pad" suffix="g" />
          </View>
          <Pressable onPress={() => setMore((value) => !value)} accessibilityRole="button" style={styles.moreBtn}>
            <Text style={styles.more}>{more ? 'Hide extra nutrients' : 'More nutrients (optional)'}</Text>
          </Pressable>
          {more ? (
            <>
              <InsetField label="Sugar" value={sugar} onChangeText={(text) => setSugar(sanitizeDecimalInput(text))} keyboardType="decimal-pad" suffix="g" />
              <InsetField label="Sodium" value={sodium} onChangeText={(text) => setSodium(sanitizeDecimalInput(text))} keyboardType="decimal-pad" suffix="mg" />
            </>
          ) : null}
          <Text style={styles.mealLabel}>Add to meal</Text>
          <Segmented options={SLOTS} value={draftSlot} onChange={setDraftSlot} />
        </ScrollView>
        <PrimaryButton
          label={`+ Add to ${getMealSlotLabel(draftSlot)}`}
          onPress={handleSave}
          disabled={!canSave}
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
