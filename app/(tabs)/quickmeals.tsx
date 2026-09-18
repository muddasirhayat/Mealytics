import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { quickMealsService } from '@/services/quickMeals/quickMealsService';
import { QuickMeal } from '@/types/quickMeal';
import { QuickMealCard } from '@/components/QuickMealCard';
import { DraftMealBanner } from '@/components/DraftMealBanner';
import { EmptyState, ErrorState } from '@/components/StateIndicators';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { radius } from '@/theme/radius';

export default function QuickMealsScreen() {
  const [meals, setMeals] = useState<QuickMeal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDailyMeals = useCallback(async () => {
    try {
      setError(null);
      setIsLoading(true);
      const daily = await quickMealsService.getDailyQuickMeals();
      setMeals(daily);
    } catch {
      setError('Could not load today\'s meals.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadDailyMeals();
    }, [loadDailyMeals])
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const daily = await quickMealsService.getDailyQuickMeals();
      setMeals(daily);
      setError(null);
    } catch {
      setError('Could not refresh meals.');
    } finally {
      setIsRefreshing(false);
    }
  };

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Daily Healthy Meals</Text>
          <Text style={styles.subtitle}>10 nutritious meal ideas for today</Text>
        </View>

        <View style={styles.dateBadge}>
          <Ionicons name="calendar" size={12} color={colors.primaryDark} />
          <Text style={styles.dateText}>{todayFormatted}</Text>
        </View>
      </View>

      <View style={styles.bannerWrap}>
        <DraftMealBanner />
      </View>

      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Selecting today{"'"}s healthy meals...</Text>
        </View>
      ) : error ? (
        <ErrorState message={error} onRetry={() => void loadDailyMeals()} />
      ) : (
        <FlatList
          data={meals}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => <QuickMealCard meal={item} index={index} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <EmptyState
              icon="restaurant-outline"
              message="No meals available today. Pull to refresh."
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  bannerWrap: {
    paddingHorizontal: spacing.md,
  },
  title: {
    ...typography.title,
    fontSize: 20,
    color: colors.text,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
    fontSize: 13,
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 5,
    borderRadius: radius.md,
  },
  dateText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.primaryDark,
    fontSize: 11,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: 130,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  loadingText: {
    ...typography.bodyMedium,
    color: colors.textMuted,
    marginTop: spacing.md,
  },
});
