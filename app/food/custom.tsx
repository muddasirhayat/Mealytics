import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Food } from '@/types/food';
import { useMealStore } from '@/store/mealStore';
import { getMealSlotLabel } from '@/utils/mealSlot';
import { parseOptionalNumber, parsePositiveNumber } from '@/utils/nutrition';
import { createId } from '@/utils/id';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { radius } from '@/theme/radius';

export default function CustomFoodScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const addFoodToMeal = useMealStore((state) => state.addFoodToMeal);
  const draftSlot = useMealStore((state) => state.draftSlot) ?? 'snacks';

  const [name, setName] = useState('');
  const [serving, setServing] = useState('100');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [fiber, setFiber] = useState('');
  const [sugar, setSugar] = useState('');
  const [sodium, setSodium] = useState('');

  const canSave = useMemo(() => {
    const trimmedName = name.trim();
    const servingAmount = parsePositiveNumber(serving);
    const hasMacro =
      parseOptionalNumber(calories) !== undefined ||
      parseOptionalNumber(protein) !== undefined ||
      parseOptionalNumber(carbs) !== undefined ||
      parseOptionalNumber(fat) !== undefined ||
      parseOptionalNumber(fiber) !== undefined;
    return Boolean(trimmedName) && servingAmount !== null && hasMacro;
  }, [name, serving, calories, protein, carbs, fat, fiber]);

  const handleSave = () => {
    const trimmedName = name.trim();
    const servingAmount = parsePositiveNumber(serving);
    if (!trimmedName || servingAmount === null) {
      Alert.alert('Missing details', 'Add a name and a serving size greater than 0.');
      return;
    }

    const nextCalories = parseOptionalNumber(calories) ?? 0;
    const nextProtein = parseOptionalNumber(protein) ?? 0;
    const nextCarbs = parseOptionalNumber(carbs) ?? 0;
    const nextFat = parseOptionalNumber(fat) ?? 0;
    const nextFiber = parseOptionalNumber(fiber);
    const nextSugar = parseOptionalNumber(sugar);
    const nextSodium = parseOptionalNumber(sodium);

    if (
      nextCalories <= 0 &&
      nextProtein <= 0 &&
      nextCarbs <= 0 &&
      nextFat <= 0 &&
      (nextFiber === undefined || nextFiber <= 0)
    ) {
      Alert.alert('Missing nutrition', 'Enter calories or at least one macro for this serving.');
      return;
    }

    const food: Food = {
      id: createId(),
      name: trimmedName,
      dataSource: 'custom',
      calories: nextCalories,
      protein: nextProtein,
      carbohydrates: nextCarbs,
      fat: nextFat,
      fiber: nextFiber,
      sugar: nextSugar,
      sodium: nextSodium,
      servingSize: servingAmount,
      servingUnit: 'g',
      nutrients: [],
    };

    addFoodToMeal(food);
    Alert.alert('Added to meal', `${trimmedName} is in ${getMealSlotLabel(draftSlot).toLowerCase()}.`, [
      { text: 'Add more', onPress: () => router.back() },
      { text: 'Review meal', onPress: () => router.replace('/meal/draft') },
    ]);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: 120 + insets.bottom }]}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.intro}>
          Log a homemade meal or packaged food. Enter nutrition for the serving size you ate.
        </Text>
        <Text style={styles.slot}>Adding to {getMealSlotLabel(draftSlot)}</Text>

        <Field label="Name" value={name} onChangeText={setName} placeholder="e.g. Homemade daal" />
        <Field
          label="Serving size (g)"
          value={serving}
          onChangeText={setServing}
          placeholder="100"
          keyboardType="decimal-pad"
        />
        <Field
          label="Calories (kcal)"
          value={calories}
          onChangeText={setCalories}
          placeholder="0"
          keyboardType="decimal-pad"
        />
        <Field
          label="Protein (g)"
          value={protein}
          onChangeText={setProtein}
          placeholder="0"
          keyboardType="decimal-pad"
        />
        <Field
          label="Carbs (g)"
          value={carbs}
          onChangeText={setCarbs}
          placeholder="0"
          keyboardType="decimal-pad"
        />
        <Field
          label="Fat (g)"
          value={fat}
          onChangeText={setFat}
          placeholder="0"
          keyboardType="decimal-pad"
        />
        <Field
          label="Fiber (g)"
          value={fiber}
          onChangeText={setFiber}
          placeholder="optional"
          keyboardType="decimal-pad"
        />
        <Field
          label="Sugar (g)"
          value={sugar}
          onChangeText={setSugar}
          placeholder="optional"
          keyboardType="decimal-pad"
        />
        <Field
          label="Sodium (mg)"
          value={sodium}
          onChangeText={setSodium}
          placeholder="optional"
          keyboardType="decimal-pad"
        />
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
        <TouchableOpacity
          style={[styles.saveButton, !canSave && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={!canSave}
          accessibilityRole="button"
          accessibilityLabel="Add custom food to meal"
        >
          <Ionicons name="add" size={22} color={colors.surface} />
          <Text style={styles.saveText}>Add to {getMealSlotLabel(draftSlot)}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const Field = ({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  keyboardType?: 'default' | 'decimal-pad';
}) => (
  <View style={styles.field}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={colors.textMuted}
      keyboardType={keyboardType}
      inputMode={keyboardType === 'decimal-pad' ? 'decimal' : 'text'}
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
  },
  intro: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
  },
  slot: {
    ...typography.caption,
    color: colors.primaryDark,
    fontWeight: '700',
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  field: {
    marginBottom: spacing.sm,
  },
  fieldLabel: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    ...typography.bodyLarge,
    color: colors.text,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: radius.md,
  },
  saveButtonDisabled: {
    opacity: 0.45,
  },
  saveText: {
    ...typography.title,
    color: colors.surface,
  },
});
