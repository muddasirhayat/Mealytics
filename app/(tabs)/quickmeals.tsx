import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useUserStore } from '@/store/userStore';
import { mealStorage } from '@/storage/mealStorage';
import { quickMealsService } from '@/services/quickMeals/quickMealsService';
import { QuickMeal } from '@/types/quickMeal';
import { QuickMealCard } from '@/components/QuickMealCard';
import { DraftMealBanner } from '@/components/DraftMealBanner';
import { Chip, IconSquare, Screen, ScreenHeader } from '@/components/ui';
import { EmptyState, ErrorState } from '@/components/StateIndicators';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { useTabBarSpace } from '@/constants/layout';

const FILTERS = [
  { id: 'all', label: 'All', tag: null as string | null },
  { id: 'high-protein', label: 'High protein', tag: 'high-protein' },
  { id: 'vegan', label: 'Vegan', tag: 'vegan' },
  { id: 'low-carb', label: 'Low carb', tag: 'low-carb' },
] as const;

export default function QuickMealsScreen() {
  const tabBarSpace = useTabBarSpace();
  const goals = useUserStore((state) => state.goals);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]['id']>('all');
  const [meals, setMeals] = useState<QuickMeal[]>([]);
  const [todayKcal, setTodayKcal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      setIsLoading(true);
      const logged = await mealStorage.getMealsByDate(new Date());
      setTodayKcal(logged.reduce((sum, meal) => sum + meal.totalCalories, 0));
      if (filter === 'all') {
        setMeals(await quickMealsService.getDailyQuickMeals());
      } else {
        const tag = FILTERS.find((item) => item.id === filter)?.tag;
        setMeals(tag ? quickMealsService.getMealsByTag(tag) : []);
      }
    } catch {
      setError("Could not load today's meals.");
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  const kcalLeft = goals ? Math.max(0, goals.targetCalories - todayKcal) : undefined;
  const subtitle = useMemo(() => {
    if (kcalLeft === undefined) {
      return '10 meal ideas for today';
    }
    return `10 meal ideas for today · fit your ${kcalLeft} kcal left`;
  }, [kcalLeft]);

  return (
    <Screen padded={false}>
      <View style={styles.header}>
        <ScreenHeader
          title="Quick meals"
          right={<IconSquare name="sliders" onPress={() => setFilter('all')} accessibilityLabel="Filters" />}
        />
        <Text style={styles.sub}>{subtitle}</Text>
        <View style={styles.chips}>
          {FILTERS.map((item) => (
            <Chip
              key={item.id}
              label={item.label}
              selected={filter === item.id}
              onPress={() => setFilter(item.id)}
            />
          ))}
        </View>
        <DraftMealBanner />
      </View>
      {isLoading ? (
        <ActivityIndicator color={colors.accent} style={{ marginTop: 24 }} />
      ) : error ? (
        <ErrorState compact message={error} onRetry={() => void load()} />
      ) : (
        <FlatList
          data={meals}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <QuickMealCard meal={item} kcalLeft={kcalLeft} />}
          contentContainerStyle={[styles.list, { paddingBottom: tabBarSpace + 16 }]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<EmptyState compact message="No meals match this filter today." />}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 24,
    paddingTop: 10,
  },
  sub: {
    ...typography.body,
    color: colors.muted,
    marginBottom: 12,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  list: {
    paddingHorizontal: 24,
    paddingTop: 8,
  },
});
