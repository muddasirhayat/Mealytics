import React, { useEffect } from 'react';
import { View, FlatList, StyleSheet, KeyboardAvoidingView, Platform, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useFoodSearch } from '@/hooks/useFoodSearch';
import { SearchBar } from '@/components/SearchBar';
import { FoodCard } from '@/components/FoodCard';
import { LoadingState, ErrorState, EmptyState } from '@/components/StateIndicators';
import { DraftMealBanner } from '@/components/DraftMealBanner';
import { useMealStore } from '@/store/mealStore';
import { isMealSlot, getMealSlotLabel } from '@/utils/mealSlot';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Food } from '@/types/food';

export default function SearchScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ slot?: string | string[] }>();
  const slotParam = Array.isArray(params.slot) ? params.slot[0] : params.slot;
  const { query, setQuery, results, isLoading, error, searchFoods } = useFoodSearch();
  const draftSlot = useMealStore((state) => state.draftSlot) ?? 'snacks';
  const setDraftSlot = useMealStore((state) => state.setDraftSlot);

  useEffect(() => {
    if (isMealSlot(slotParam)) {
      setDraftSlot(slotParam);
    }
  }, [slotParam, setDraftSlot]);

  const handleFoodPress = (food: Food) => {
    router.push(`/food/${food.id}`);
  };

  const renderContent = () => {
    if (isLoading && results.length === 0) {
      return <LoadingState message="Searching foods..." />;
    }

    if (error && results.length === 0) {
      return <ErrorState message={error} onRetry={() => searchFoods(query)} />;
    }

    if (!isLoading && query.length > 0 && results.length === 0) {
      return <EmptyState message="No foods matched your search." />;
    }
    
    if (query.length === 0) {
      return (
        <EmptyState 
          icon="nutrition-outline" 
          message="Search for an ingredient, branded food, or meal to see its nutrition info." 
        />
      );
    }

    return (
      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <FoodCard food={item} onPress={handleFoodPress} />
        )}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      />
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.searchHeader}>
        <SearchBar 
          value={query}
          onChangeText={setQuery}
          onClear={() => setQuery('')}
          placeholder="Search foods (e.g. Apple, Chicken)"
        />
        <Text style={styles.slotHint}>Adding to {getMealSlotLabel(draftSlot)}</Text>
      </View>
      <View style={styles.bannerWrap}>
        <DraftMealBanner />
      </View>
      
      <View style={styles.content}>
        {renderContent()}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchHeader: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  slotHint: {
    ...typography.caption,
    color: colors.primaryDark,
    fontWeight: '700',
    marginTop: spacing.sm,
  },
  bannerWrap: {
    paddingHorizontal: spacing.md,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  listContent: {
    padding: spacing.md,
  },
});
