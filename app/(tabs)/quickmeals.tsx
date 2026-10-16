import React, { useCallback, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import Animated, { FadeInDown, LinearTransition } from 'react-native-reanimated';
import { useFocusEffect } from 'expo-router';
import { useUserStore } from '@/store/userStore';
import { mealStorage } from '@/storage/mealStorage';
import { quickMealsService } from '@/services/quickMeals/quickMealsService';
import { QuickMeal } from '@/types/quickMeal';
import { QuickMealCard } from '@/components/QuickMealCard';
import { DraftMealBanner } from '@/components/DraftMealBanner';
import { Chip, IconSquare, Screen, ScreenHeader } from '@/components/ui';
import { EmptyState, ErrorState } from '@/components/StateIndicators';
import { useTheme } from '@/hooks/useTheme';
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
  const { colors } = useTheme();
  const goals = useUserStore((state) => state.goals);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]['id']>('all');
  const [meals, setMeals] = useState<QuickMeal[]>([]);
  const [todayKcal, setTodayKcal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const animateOnce = useRef(true);

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

  const renderItem = useCallback(
    ({ item, index }: { item: QuickMeal; index: number }) => {
      const shouldAnimate = animateOnce.current && index < 8;
      const card = <QuickMealCard meal={item} kcalLeft={kcalLeft} />;
      if (!shouldAnimate) return card;
      return (
        <Animated.View
          entering={FadeInDown.springify().damping(18).delay(index * 30)}
          layout={LinearTransition}
        >
          {card}
        </Animated.View>
      );
    },
    [kcalLeft]
  );

  useFocusEffect(
    useCallback(() => {
      const id = requestAnimationFrame(() => {
        animateOnce.current = false;
      });
      return () => cancelAnimationFrame(id);
    }, [])
  );

  return (
    <Screen padded={false}>
      <View style={styles.header}>
        <ScreenHeader
          title="Quick meals"
          right={<IconSquare name="sliders" onPress={() => setFilter('all')} accessibilityLabel="Filters" />}
        />
        <Text style={[styles.sub, { color: colors.inkSecondary }]}>{subtitle}</Text>
        <View style={styles.chips}>
          {FILTERS.map((item) => (
            <Chip
              key={item.id}
              label={item.label}
              selected={filter === item.id}
              onPress={() => {
                animateOnce.current = true;
                setFilter(item.id);
              }}
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
        <FlashList
          data={meals}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
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
