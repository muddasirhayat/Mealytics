import React, { useEffect } from 'react';
import { View, FlatList, StyleSheet, KeyboardAvoidingView, Platform, Text, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useFoodSearch } from '@/hooks/useFoodSearch';
import { SearchBar } from '@/components/SearchBar';
import { FoodCard } from '@/components/FoodCard';
import { LoadingState, ErrorState, EmptyState } from '@/components/StateIndicators';
import { DraftMealBanner } from '@/components/DraftMealBanner';
import { useMealStore } from '@/store/mealStore';
import { isMealSlot, getMealSlotLabel } from '@/utils/mealSlot';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { radius } from '@/theme/radius';
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
      return <EmptyState message="No foods matched. Try another name, or add a custom food above." />;
    }
    
    if (query.length === 0) {
      return (
        <EmptyState 
          icon="nutrition-outline" 
          message="Search for an ingredient, branded food, or meal — or add one manually." 
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
        <TouchableOpacity
          style={styles.customButton}
          onPress={() => router.push('/food/custom')}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Add a custom food manually"
        >
          <Ionicons name="create-outline" size={16} color={colors.primaryDark} />
          <Text style={styles.customButtonText}>Add custom food</Text>
        </TouchableOpacity>
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
  customButton: {
    marginTop: spacing.sm,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.round,
  },
  customButtonText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.primaryDark,
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
