import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useUserStore } from '@/store/userStore';
import { mealStorage } from '@/storage/mealStorage';
import { Meal } from '@/types/meal';
import { MealTotalsCard } from '@/components/MealTotalsCard';
import { MacroCardsGrid } from '@/components/MacroCardsGrid';
import { WaterTrackerCard } from '@/components/WaterTrackerCard';
import { MealSlotList } from '@/components/MealSlotList';
import { DraftMealBanner } from '@/components/DraftMealBanner';
import { getBmiCategory } from '@/utils/bmi';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { radius } from '@/theme/radius';

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
};

const getGoalLabel = (goalType?: string) => {
  switch (goalType) {
    case 'lose':
      return '📉 Weight Loss';
    case 'gain':
      return '📈 Muscle Gain';
    case 'maintain':
      return '⚖️ Maintain';
    default:
      return '🎯 Daily Goal';
  }
};

export default function HomeScreen() {
  const router = useRouter();
  const { profile, goals } = useUserStore();

  const [meals, setMeals] = useState<Meal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadMeals = useCallback(async () => {
    setIsLoading(true);
    try {
      const dayMeals = await mealStorage.getMealsByDate(new Date());
      setMeals(dayMeals);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadMeals();
    }, [loadMeals])
  );

  const bmiCategory = goals ? getBmiCategory(goals.bmi) : null;
  const waterTargetMl = profile ? Math.round(profile.weightKg * 35) : 2000;

  const dailyTotals = meals.reduce(
    (acc, meal) => {
      acc.calories += meal.totalCalories;
      acc.protein += meal.totalProtein;
      acc.carbs += meal.totalCarbohydrates;
      acc.fat += meal.totalFat;
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <DraftMealBanner />
      {/* ─── Hero Header & Profile Status ──────────────────────────── */}
      <View style={styles.header}>
        <View style={styles.greetingLeft}>
          <Text style={styles.greetingText}>
            {getGreeting()}{profile?.name ? `, ${profile.name}` : ''}! 👋
          </Text>
          <Text style={styles.subtitleText}>
            {goals
              ? `${getGoalLabel(profile?.goalType)} · ${goals.targetCalories} kcal goal`
              : 'Set your profile for custom targets'}
          </Text>
        </View>

        {goals ? (
          <TouchableOpacity
            style={styles.bmiBadge}
            onPress={() => router.push('/profile')}
            activeOpacity={0.8}
          >
            <Text style={styles.bmiBadgeScore}>BMI {goals.bmi}</Text>
            <Text style={styles.bmiBadgeSub}>{bmiCategory?.label ?? 'View'}</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.setupBadge}
            onPress={() => router.push('/profile')}
            activeOpacity={0.8}
          >
            <Ionicons name="person-add" size={14} color={colors.primaryDark} />
            <Text style={styles.setupBadgeText}>Setup</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ─── 1. Hero Calorie Budget Widget ─────────────────────────── */}
      <View style={styles.section}>
        <MealTotalsCard
          calories={dailyTotals.calories}
          protein={dailyTotals.protein}
          carbs={dailyTotals.carbs}
          fat={dailyTotals.fat}
          targetCalories={goals?.targetCalories ?? 2000}
        />
      </View>

      {/* ─── 2. Side-by-Side Macro Breakdown ───────────────────────── */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Macro Targets</Text>
        <MacroCardsGrid
          protein={dailyTotals.protein}
          carbs={dailyTotals.carbs}
          fat={dailyTotals.fat}
          targetProtein={goals?.targetProtein ?? 150}
          targetCarbs={goals?.targetCarbs ?? 200}
          targetFat={goals?.targetFat ?? 65}
        />
      </View>

      {/* ─── 3. Quick Action Buttons ───────────────────────────────── */}
      <View style={styles.quickActionsRow}>
        <TouchableOpacity
          style={styles.actionPill}
          onPress={() => router.push('/search')}
          activeOpacity={0.7}
        >
          <View style={[styles.pillIcon, { backgroundColor: colors.primaryLight }]}>
            <Ionicons name="search" size={16} color={colors.primaryDark} />
          </View>
          <Text style={styles.pillText}>Search Food</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionPill}
          onPress={() => router.push('/quickmeals')}
          activeOpacity={0.7}
        >
          <View style={[styles.pillIcon, { backgroundColor: '#FEF3C7' }]}>
            <Ionicons name="sparkles" size={16} color="#D97706" />
          </View>
          <Text style={styles.pillText}>Quick Meals</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionPill}
          onPress={() => router.push('/logs')}
          activeOpacity={0.7}
        >
          <View style={[styles.pillIcon, { backgroundColor: '#E0E7FF' }]}>
            <Ionicons name="calendar-outline" size={16} color="#4F46E5" />
          </View>
          <Text style={styles.pillText}>History</Text>
        </TouchableOpacity>
      </View>

      {/* ─── 4. Daily Hydration Widget ─────────────────────────────── */}
      <View style={styles.section}>
        <WaterTrackerCard dailyTargetMl={waterTargetMl} />
      </View>

      {/* ─── 5. Categorized Meal Slots (Breakfast/Lunch/Dinner/Snacks) ─── */}
      <View style={styles.section}>
        {isLoading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.md }} />
        ) : (
          <MealSlotList meals={meals} targetCalories={goals?.targetCalories} />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: 130, // Room for floating tab bar
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.xs,
  },
  greetingLeft: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  greetingText: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.3,
  },
  subtitleText: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    marginTop: 2,
    fontSize: 13,
  },
  bmiBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  bmiBadgeScore: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  bmiBadgeSub: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.primaryDark,
    opacity: 0.8,
  },
  setupBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  setupBadgeText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.title,
    fontSize: 18,
    color: colors.text,
    marginBottom: spacing.sm + 2,
    paddingHorizontal: spacing.xs,
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  actionPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  pillIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pillText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.text,
    fontSize: 11,
    flexShrink: 1,
  },
});
