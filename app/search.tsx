import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import Animated, { FadeInDown, LinearTransition } from 'react-native-reanimated';
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
  PressableScale,
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
import { useTheme } from '@/hooks/useTheme';
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

const SearchResultRow = memo(function SearchResultRow({
  food,
  index,
  added,
  onOpen,
  onQuickAdd,
  showDivider,
  animateIn,
}: {
  food: Food;
  index: number;
  added: boolean;
  onOpen: (food: Food) => void;
  onQuickAdd: (food: Food) => void;
  showDivider: boolean;
  animateIn: boolean;
}) {
  const { colors } = useTheme();
  const content = (
    <PressableScale
      onPress={() => onOpen(food)}
      accessibilityRole="button"
      accessibilityLabel={`${food.name}, ${Math.round(food.calories)} kilocalories`}
      style={[
        styles.result,
        showDivider && { borderTopWidth: 1, borderTopColor: colors.divider },
      ]}
    >
      <View style={styles.resultCopy}>
        <Text style={[styles.resultName, { color: colors.ink }]}>{food.name}</Text>
        <Text style={[styles.resultMeta, { color: colors.inkSecondary }]}>
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
        checked={added}
        onPress={() => onQuickAdd(food)}
        accessibilityLabel={`Quick add ${food.name}`}
      />
    </PressableScale>
  );

  if (!animateIn) return content;
  return (
    <Animated.View
      entering={FadeInDown.springify().damping(18).delay(Math.min(index, 7) * 30)}
      layout={LinearTransition}
    >
      {content}
    </Animated.View>
  );
});

export default function SearchScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
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
  const [addedIds, setAddedIds] = useState<Set<string>>(() => new Set());
  const firstMount = useRef(true);
  useEffect(() => {
    firstMount.current = false;
  }, []);

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

  const quickAdd = useCallback(
    (food: Food) => {
      const item = { ...food, id: createId() };
      addFoodToMeal(item);
      setAddedIds((prev) => new Set(prev).add(food.id));
      show(`Added ${food.name}`, {
        label: 'Undo',
        onPress: () => removeFoodFromMeal(item.id),
      });
    },
    [addFoodToMeal, removeFoodFromMeal, show]
  );

  const openFood = useCallback(
    (food: Food) => {
      void recentSearchStorage.add(query);
      router.push(`/food/${food.id}`);
    },
    [query, router]
  );

  const renderItem = useCallback(
    ({ item, index }: { item: Food; index: number }) => (
      <SearchResultRow
        food={item}
        index={index}
        added={addedIds.has(item.id)}
        onOpen={openFood}
        onQuickAdd={quickAdd}
        showDivider={index > 0}
        animateIn={firstMount.current || index < 8}
      />
    ),
    [addedIds, openFood, quickAdd]
  );

  const trimmed = query.trim();
  let empty: React.ReactNode = null;
  if (trimmed.length === 0) {
    empty = (
      <EmptyState
        compact
        icon="nutrition-outline"
        message="Search for an ingredient, branded food, or meal — or add one manually."
      />
    );
  } else if (trimmed.length === 1) {
    empty = <EmptyState compact message="Type at least 2 letters" />;
  } else if ((isPending || isLoading) && results.length === 0) {
    empty = <LoadingState compact message="Searching foods..." />;
  } else if (error && results.length === 0 && searchedQuery === trimmed && !isPending) {
    empty = <ErrorState compact message={error} onRetry={() => searchFoods(query)} />;
  } else if (!isPending && !isLoading && searchedQuery === trimmed && results.length === 0) {
    empty = (
      <EmptyState compact message="No foods matched. Try another name, or add a custom food above." />
    );
  }

  return (
    <Screen blobs="B1">
      <KeyboardAvoidingView
        style={styles.flex}
        behavior="padding"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      >
        <TopBar
          title="Search food"
          right={
            FEATURES.barcode ? (
              <IconSquare name="maximize" accessibilityLabel="Scan barcode" />
            ) : undefined
          }
        />
        <View
          style={[
            styles.searchRow,
            inset(),
            { backgroundColor: isDark ? colors.surfaceRaised : colors.base },
          ]}
        >
          <Feather name="search" size={18} color={colors.inkMuted} accessible={false} />
          <TextInput
            style={[styles.input, { color: colors.ink }]}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={() => void commitSearch(query)}
            placeholder="Search foods"
            placeholderTextColor={colors.inkMuted}
            selectionColor={colors.accent}
            cursorColor={colors.accent}
            accessibilityLabel="Search foods"
            returnKeyType="search"
          />
          {query.length > 0 ? (
            <PressableScale
              onPress={() => setQuery('')}
              accessibilityRole="button"
              accessibilityLabel="Clear search"
              hitSlop={8}
            >
              <Feather name="x" size={18} color={colors.inkMuted} />
            </PressableScale>
          ) : null}
        </View>
        {recents.length > 0 && trimmed.length === 0 ? (
          <View style={styles.recents}>
            {recents.map((item) => (
              <Chip key={item} label={item} onPress={() => void commitSearch(item)} />
            ))}
          </View>
        ) : null}
        <Text style={[styles.adding, { color: colors.ink }]}>
          Adding to: <Text style={[styles.slot, { color: colors.accent }]}>{getMealSlotLabel(draftSlot)}</Text>
        </Text>
        <Segmented options={SLOTS} value={draftSlot} onChange={setDraftSlot} accessibilityLabel="Meal slot" />
        <PressableScale
          onPress={() => router.push('/food/custom')}
          style={styles.custom}
          accessibilityRole="button"
        >
          <Text style={[styles.customText, { color: colors.accent }]}>Add custom food</Text>
        </PressableScale>
        <DraftMealBanner />
        {results.length > 0 ? (
          <GlassCard padding={8} radiusValue={26} style={styles.listCard}>
            <FlashList
              data={results}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            />
          </GlassCard>
        ) : (
          <View style={styles.body}>{empty}</View>
        )}
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
    paddingHorizontal: 14,
    gap: 8,
    marginBottom: 12,
  },
  input: {
    flex: 1,
    ...typography.fieldValue,
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
    marginBottom: 8,
  },
  slot: {
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
  },
  body: {
    paddingBottom: 24,
  },
  listCard: {
    flex: 1,
    minHeight: 200,
  },
  result: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    gap: 8,
  },
  resultCopy: {
    flex: 1,
    gap: 4,
  },
  resultName: {
    fontFamily: fonts.outfitSemiBold,
    fontSize: 15.5,
    fontWeight: '600',
  },
  resultMeta: {
    ...typography.caption,
  },
});
