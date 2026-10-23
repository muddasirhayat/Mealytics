import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useUserStore } from '@/store/userStore';
import { mealStorage } from '@/storage/mealStorage';
import { celebrationStorage } from '@/storage/celebrationStorage';
import { Meal } from '@/types/meal';
import { MacroCardsGrid } from '@/components/MacroCardsGrid';
import { WaterTrackerCard } from '@/components/WaterTrackerCard';
import { MealSlotList } from '@/components/MealSlotList';
import { DraftMealBanner } from '@/components/DraftMealBanner';
import { GlassCard, LogoMark, RaisedCard, Ring, Screen } from '@/components/ui';
import { GoalCelebration } from '@/components/ui/GoalCelebration';
import { getBmiCategory } from '@/utils/bmi';
import { waterTargetMl as waterFromWeight } from '@/utils/goals';
import { useThemeColors } from '@/hooks/useThemeColors';
import { fonts } from '@/theme/fonts';
import { typography } from '@/theme/typography';
import { raiseSm } from '@/utils/shadow';
import { useTabBarSpace } from '@/constants/layout';
import type { ThemeColors } from '@/theme/palette';

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

const getGoalLabel = (goalType?: string) => {
  switch (goalType) {
    case 'lose':
      return 'Lose weight';
    case 'gain':
      return 'Gain muscle';
    case 'maintain':
      return 'Maintain';
    default:
      return 'Daily goal';
  }
};

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    content: {
      paddingHorizontal: 24,
      paddingTop: 10,
    },
    topRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    avatar: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.base,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: {
      fontFamily: fonts.outfitBold,
      fontSize: 16,
      fontWeight: '700',
      color: colors.accent,
    },
    greeting: {
      ...typography.greeting,
      color: colors.ink,
      marginTop: 22,
      letterSpacing: -0.6,
      flexShrink: 1,
    },
    sub: {
      fontFamily: fonts.manropeSemiBold,
      fontSize: 14,
      fontWeight: '600',
      color: colors.muted,
      marginTop: 2,
      marginBottom: 16,
    },
    hero: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 4,
    },
    heroStats: {
      marginLeft: 22,
      gap: 16,
      flex: 1,
    },
    statLabel: {
      fontFamily: fonts.manropeSemiBold,
      fontSize: 13,
      fontWeight: '600',
      color: colors.muted,
    },
    statValue: {
      fontFamily: fonts.outfitSemiBold,
      fontSize: 26,
      fontWeight: '600',
      color: colors.ink,
    },
    leftValue: {
      fontFamily: fonts.outfitBold,
      fontSize: 32,
      fontWeight: '700',
      letterSpacing: -1,
      color: colors.ink,
    },
    leftLabel: {
      fontFamily: fonts.manropeBold,
      fontSize: 12,
      fontWeight: '700',
      color: colors.inkSecondary,
      marginTop: 3,
    },
    macroWrap: {
      marginTop: 22,
    },
    water: {
      marginTop: 18,
    },
    setupTitle: {
      fontFamily: fonts.outfitBold,
      fontSize: 20,
      fontWeight: '700',
      color: colors.ink,
    },
    setupBody: {
      ...typography.body,
      color: colors.muted,
      marginTop: 8,
    },
    setupCta: {
      fontFamily: fonts.outfitSemiBold,
      fontSize: 16,
      fontWeight: '600',
      color: colors.accent,
      marginTop: 12,
    },
  });

export default function HomeScreen() {
  const router = useRouter();
  const tabBarSpace = useTabBarSpace();
  const colors = useThemeColors();
  const styles = makeStyles(colors);
  const { profile, goals } = useUserStore();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [celebrateCalories, setCelebrateCalories] = useState(false);
  const [celebrateMacro, setCelebrateMacro] = useState(false);
  const checkedRef = useRef(false);
  const macroCheckedRef = useRef(false);

  useFocusEffect(
    useCallback(() => {
      checkedRef.current = false;
      macroCheckedRef.current = false;
      void mealStorage.getMealsByDate(new Date()).then(setMeals);
    }, [])
  );

  const bmiCategory = goals ? getBmiCategory(goals.bmi) : null;
  const waterTargetMl = profile ? waterFromWeight(profile.weightKg) : 2000;
  const dailyTotals = meals.reduce(
    (acc, meal) => {
      acc.calories += meal.totalCalories;
      acc.protein += meal.totalProtein;
      acc.carbs += meal.totalCarbohydrates;
      acc.fat += meal.totalFat;
      acc.fiber += meal.foods.reduce((sum, food) => sum + (food.fiber ?? 0), 0);
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
  );

  const calorieDelta = goals ? dailyTotals.calories - goals.targetCalories : 0;
  const overGoal = Boolean(goals && calorieDelta > 0);
  const left = goals ? Math.max(0, -calorieDelta) : 0;
  const progress = goals ? Math.min(1, dailyTotals.calories / Math.max(1, goals.targetCalories)) : 0;
  const initial = (profile?.name?.trim()?.[0] ?? '?').toUpperCase();

  useEffect(() => {
    if (!goals || checkedRef.current) return;
    if (dailyTotals.calories < goals.targetCalories) return;
    checkedRef.current = true;
    void (async () => {
      const already = await celebrationStorage.hasCalorieGoalCelebrated();
      if (already) return;
      await celebrationStorage.markCalorieGoalCelebrated();
      setCelebrateCalories(true);
    })();
  }, [dailyTotals.calories, goals]);

  useEffect(() => {
    if (!goals || macroCheckedRef.current) return;
    const hit =
      dailyTotals.protein >= goals.targetProtein ||
      dailyTotals.carbs >= goals.targetCarbs ||
      dailyTotals.fat >= goals.targetFat ||
      dailyTotals.fiber >= goals.targetFiber;
    if (!hit) return;
    macroCheckedRef.current = true;
    void (async () => {
      const already = await celebrationStorage.hasMacroGoalCelebrated();
      if (already) return;
      await celebrationStorage.markMacroGoalCelebrated();
      setCelebrateMacro(true);
    })();
  }, [dailyTotals, goals]);

  return (
    <Screen padded={false}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: tabBarSpace + 16 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topRow}>
          <LogoMark />
          <Pressable
            onPress={() => router.push('/profile')}
            accessibilityRole="button"
            accessibilityLabel={profile ? `Profile, ${profile.name}` : 'Open profile'}
            style={[styles.avatar, raiseSm()]}
          >
            <Text style={styles.avatarText}>{initial}</Text>
          </Pressable>
        </View>

        <Text style={styles.greeting}>
          {getGreeting()}
          {profile?.name ? `, ${profile.name}` : ''}
        </Text>
        {goals && bmiCategory ? (
          <Text style={styles.sub}>
            {getGoalLabel(profile?.goalType)} · BMI{' '}
            <Text style={{ color: bmiCategory.color }}>{goals.bmi}</Text>
          </Text>
        ) : (
          <Text style={styles.sub}>Set your profile for custom targets</Text>
        )}

        <DraftMealBanner />

        {goals ? (
          <>
            <GlassCard padding={22} radiusValue={32} style={styles.hero}>
              <Ring size={160} stroke={14} progress={progress} over={overGoal}>
                <Text style={[styles.leftValue, overGoal && { color: colors.danger }]}>
                  {Math.round(overGoal ? calorieDelta : left).toLocaleString()}
                </Text>
                <Text style={styles.leftLabel}>{overGoal ? 'kcal over' : 'kcal left'}</Text>
              </Ring>
              <View style={styles.heroStats}>
                <View>
                  <Text style={styles.statLabel}>Eaten</Text>
                  <Text style={styles.statValue}>{Math.round(dailyTotals.calories).toLocaleString()}</Text>
                </View>
                <View>
                  <Text style={styles.statLabel}>Goal</Text>
                  <Text style={styles.statValue}>{goals.targetCalories.toLocaleString()}</Text>
                </View>
              </View>
            </GlassCard>

            <View style={styles.macroWrap}>
              <MacroCardsGrid
                protein={dailyTotals.protein}
                carbs={dailyTotals.carbs}
                fat={dailyTotals.fat}
                fiber={dailyTotals.fiber}
                targetProtein={goals.targetProtein}
                targetCarbs={goals.targetCarbs}
                targetFat={goals.targetFat}
                targetFiber={goals.targetFiber}
              />
            </View>
          </>
        ) : (
          <Pressable
            onPress={() => router.push('/profile')}
            accessibilityRole="button"
            accessibilityLabel="Set up your profile"
          >
            <RaisedCard padding={22} radiusValue={24}>
              <Text style={styles.setupTitle}>Set up your profile</Text>
              <Text style={styles.setupBody}>
                Add your age, height, weight and activity so Mealytics can set calorie and macro targets.
              </Text>
              <Text style={styles.setupCta}>Open Profile</Text>
            </RaisedCard>
          </Pressable>
        )}

        {profile ? (
          <View style={styles.water}>
            <WaterTrackerCard dailyTargetMl={waterTargetMl} />
          </View>
        ) : null}

        <MealSlotList meals={meals} targetCalories={goals?.targetCalories} />
      </ScrollView>
      <GoalCelebration
        visible={celebrateCalories}
        title="Calorie goal reached"
        body="You hit today’s calorie target. Great logging."
        onClose={() => setCelebrateCalories(false)}
      />
      <GoalCelebration
        visible={celebrateMacro && !celebrateCalories}
        title="Macro goal reached"
        body="You hit a daily macro target. Nice work."
        onClose={() => setCelebrateMacro(false)}
      />
    </Screen>
  );
}
