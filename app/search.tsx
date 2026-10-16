import React, { useCallback, useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useFoodSearch } from '@/hooks/useFoodSearch';
import { EmptyState, ErrorState, LoadingState } from '@/components/StateIndicators';
import { DraftMealBanner } from '@/components/DraftMealBanner';
import {
  Chip,
  GlassCard,
  IconSquare,
  MacroDots,
  PlusButton,
  Screen,
  Segmented,
  TopBar,
} from '@/components/ui';
import { useToast } from '@/components/ui/Toast';
import { useMealStore } from '@/store/mealStore';
import { isMealSlot, getMealSlotLabel } from '@/utils/mealSlot';
import { formatFoodServing } from '@/utils/nutrition';
import { createId } from '@/utils/id';
import { recentSearchStorage } from '@/storage/recentSearches';
import { FEATURES } from '@/constants/features';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/fonts';
import { typography } from '@/theme/typography';
import { inset } from '@/utils/shadow';
import { Food } from '@/types/food';
import { MealSlot } from '@/types/meal';

const SLOTS: { label: string; value: MealSlot }[] = [
  { label: 'Breakfast', value: 'breakfast' },
  { label: 'Lunch', value: 'lunch' },
  { label: 'Dinner', value: 'dinner' },
  { label: 'Snacks', value: 'snacks' },
];

export default function SearchScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ slot?: string | string[] }>();
  const slotParam = Array.isArray(params.slot) ? params.slot[0] : params.slot;
  const { query, setQuery, results, isLoading, isPending, searchedQuery, error, searchFoods } =
    useFoodSearch();
  const draftSlot = useMealStore((state) => state.draftSlot) ?? 'snacks';
  const setDraftSlot = useMealStore((state) => state.setDraftSlot);
  const addFoodToMeal = useMealStore((state) => state.addFoodToMeal);
  const removeFoodFromMeal = useMealStore((state) => state.removeFoodFromMeal);
  const { show } = useToast();
  const [recents, setRecents] = useState<string[]>([]);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isMealSlot(slotParam)) {
      setDraftSlot(slotParam);
    }
  }, [slotParam, setDraftSlot]);

  useEffect(() => {
    void recentSearchStorage.get().then(setRecents);
  }, []);

  const commitSearch = useCallback(
    async (text: string) => {
      setQuery(text);
      const next = await recentSearchStorage.add(text);
      setRecents(next);
    },
    [setQuery]
  );

  const quickAdd = (food: Food) => {
    const item = { ...food, id: createId() };
    addFoodToMeal(item);
    setAddedIds((prev) => new Set(prev).add(food.id));
    show(`Added ${food.name}`, {
      label: 'Undo',
      onPress: () => removeFoodFromMeal(item.id),
    });
  };

  const trimmed = query.trim();
  let body: React.ReactNode = null;
  if (trimmed.length === 0) {
    body = (
      <EmptyState
        compact
        icon="nutrition-outline"
        message="Search for an ingredient, branded food, or meal — or add one manually."
      />
    );
  } else if (trimmed.length === 1) {
    body = <EmptyState compact message="Type at least 2 letters" />;
  } else if ((isPending || isLoading) && results.length === 0) {
    body = <LoadingState compact message="Searching foods..." />;
  } else if (error && results.length === 0 && searchedQuery === trimmed && !isPending) {
    body = <ErrorState compact message={error} onRetry={() => searchFoods(query)} />;
  } else if (!isPending && !isLoading && searchedQuery === trimmed && results.length === 0) {
    body = (
      <EmptyState compact message="No foods matched. Try another name, or add a custom food above." />
    );
  } else if (results.length > 0) {
    body = (
      <GlassCard padding={8} radiusValue={26}>
        {results.map((food, index) => (
          <Pressable
            key={food.id}
            onPress={() => {
              void recentSearchStorage.add(query);
              router.push(`/food/${food.id}`);
            }}
            accessibilityRole="button"
            accessibilityLabel={`${food.name}, ${Math.round(food.calories)} kilocalories`}
            style={[styles.result, index > 0 && styles.resultDivider]}
          >
            <View style={styles.resultCopy}>
              <Text style={styles.resultName}>{food.name}</Text>
              <Text style={styles.resultMeta}>
                {formatFoodServing(food)} · {Math.round(food.calories)} kcal
                {food.dataSource === 'usda' ? '' : food.brand ? ` · ${food.brand}` : ''}
              </Text>
              <MacroDots
                protein={food.protein}
                carbs={food.carbohydrates}
                fat={food.fat}
                fiber={food.fiber}
              />
            </View>
            <PlusButton
              checked={addedIds.has(food.id)}
              onPress={() => quickAdd(food)}
              accessibilityLabel={`Quick add ${food.name}`}
            />
          </Pressable>
        ))}
      </GlassCard>
    );
  }

  return (
    <Screen blobs="B1">
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <TopBar
          title="Search food"
          right={
            FEATURES.barcode ? (
              <IconSquare name="maximize" accessibilityLabel="Scan barcode" />
            ) : undefined
          }
        />
        <View style={[styles.searchRow, inset()]}>
          <Feather name="search" size={18} color={colors.muted} accessible={false} />
          <TextInput
            style={styles.input}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={() => void commitSearch(query)}
            placeholder="Search foods"
            placeholderTextColor={colors.placeholder}
            accessibilityLabel="Search foods"
            returnKeyType="search"
          />
          {query.length > 0 ? (
            <Pressable onPress={() => setQuery('')} accessibilityRole="button" accessibilityLabel="Clear search" hitSlop={8}>
              <Feather name="x" size={18} color={colors.muted} />
            </Pressable>
          ) : null}
        </View>
        {recents.length > 0 && trimmed.length === 0 ? (
          <View style={styles.recents}>
            {recents.map((item) => (
              <Chip key={item} label={item} onPress={() => void commitSearch(item)} />
            ))}
          </View>
        ) : null}
        <Text style={styles.adding}>
          Adding to: <Text style={styles.slot}>{getMealSlotLabel(draftSlot)}</Text>
        </Text>
        <Segmented options={SLOTS} value={draftSlot} onChange={setDraftSlot} accessibilityLabel="Meal slot" />
        <Pressable onPress={() => router.push('/food/custom')} style={styles.custom} accessibilityRole="button">
          <Text style={styles.customText}>Add custom food</Text>
        </Pressable>
        <DraftMealBanner />
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.body}>
          {body}
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: 16,
    backgroundColor: colors.base,
    paddingHorizontal: 14,
    gap: 8,
    marginBottom: 12,
  },
  input: {
    flex: 1,
    ...typography.fieldValue,
    color: colors.ink,
    paddingVertical: 0,
  },
  recents: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  adding: {
    ...typography.body,
    color: colors.ink,
    marginBottom: 8,
  },
  slot: {
    color: colors.accent,
    fontFamily: fonts.outfitSemiBold,
    fontWeight: '600',
  },
  custom: {
    minHeight: 44,
    justifyContent: 'center',
    marginVertical: 8,
  },
  customText: {
    fontFamily: fonts.outfitSemiBold,
    fontSize: 14,
    color: colors.accent,
  },
  body: {
    paddingBottom: 24,
  },
  result: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    gap: 8,
  },
  resultDivider: {
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  resultCopy: {
    flex: 1,
    gap: 4,
  },
  resultName: {
    fontFamily: fonts.outfitSemiBold,
    fontSize: 15.5,
    fontWeight: '600',
    color: colors.ink,
  },
  resultMeta: {
    ...typography.caption,
    color: colors.muted,
  },
});
