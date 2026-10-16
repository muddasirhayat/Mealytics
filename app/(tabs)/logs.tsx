import React, { memo, useCallback, useMemo, useState } from 'react';
import { SectionList, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { mealStorage } from '@/storage/mealStorage';
import { useUserStore } from '@/store/userStore';
import { Meal } from '@/types/meal';
import { Food } from '@/types/food';
import { EmptyState } from '@/components/StateIndicators';
import {
  ConfirmDialog,
  GlassCard,
  IconSquare,
  MacroDots,
  PressableScale,
  RaisedCard,
  Screen,
  ScreenHeader,
} from '@/components/ui';
import { MEAL_SLOTS, getMealSlot, getMealSlotLabel } from '@/utils/mealSlot';
import { formatFoodServing } from '@/utils/nutrition';
import { useTheme } from '@/hooks/useTheme';
import { fonts } from '@/theme/fonts';
import { typography } from '@/theme/typography';
import { inset, raiseList, raiseSm } from '@/utils/shadow';
import { useTabBarSpace } from '@/constants/layout';
import type { ThemeColors } from '@/theme/palette';

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const startOfWeek = (anchor: Date): Date => {
  const day = new Date(anchor);
  day.setHours(0, 0, 0, 0);
  day.setDate(day.getDate() - day.getDay());
  return day;
};

const getWeek = (anchor: Date): Date[] => {
  const start = startOfWeek(anchor);
  return Array.from({ length: 7 }, (_, index) => {
    const next = new Date(start);
    next.setDate(start.getDate() + index);
    return next;
  });
};

type FoodRow = {
  mealId: string;
  index: number;
  food: Food;
};

type SlotSection = {
  title: string;
  slotKcal: number;
  data: FoodRow[];
};

const FoodRowItem = memo(function FoodRowItem({
  item,
  colors,
  isDark,
  onDelete,
}: {
  item: FoodRow;
  colors: ThemeColors;
  isDark: boolean;
  onDelete: (mealId: string, index: number, name: string) => void;
}) {
  return (
    <View style={styles.foodRow}>
      <View style={styles.foodCopy}>
        <Text style={[styles.foodName, { color: colors.ink }]}>{item.food.name}</Text>
        <Text style={[styles.foodServing, { color: colors.inkSecondary }]}>
          {formatFoodServing(item.food)}
        </Text>
        <MacroDots
          protein={item.food.protein}
          carbs={item.food.carbohydrates}
          fat={item.food.fat}
          fiber={item.food.fiber}
        />
      </View>
      <Text style={[styles.foodKcal, { color: colors.ink }]}>{Math.round(item.food.calories)}</Text>
      <PressableScale
        onPress={() => onDelete(item.mealId, item.index, item.food.name)}
        accessibilityRole="button"
        accessibilityLabel={`Delete ${item.food.name}`}
        hitSlop={8}
        style={[
          styles.trash,
          inset(),
          { backgroundColor: isDark ? colors.surfaceRaised : colors.base },
        ]}
      >
        <Feather name="trash-2" size={16} color={colors.danger} />
      </PressableScale>
    </View>
  );
});

export default function LogsScreen() {
  const router = useRouter();
  const tabBarSpace = useTabBarSpace();
  const { colors, isDark } = useTheme();
  const goals = useUserStore((state) => state.goals);
  const today = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now;
  }, []);
  const [selectedDate, setSelectedDate] = useState(today);
  const [weekAnchor, setWeekAnchor] = useState(today);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [weekKcal, setWeekKcal] = useState<number[]>(Array(7).fill(0));
  const [daysWithMeals, setDaysWithMeals] = useState<Set<string>>(new Set());
  const [pendingDelete, setPendingDelete] = useState<{
    mealId: string;
    index: number;
    name: string;
  } | null>(null);

  const week = getWeek(weekAnchor);
  const goal = goals?.targetCalories ?? 0;

  const load = useCallback(async () => {
    const dayMeals = await mealStorage.getMealsByDate(selectedDate);
    setMeals(dayMeals);
    const currentWeek = getWeek(weekAnchor);
    const results = await Promise.all(
      currentWeek.map(async (day) => {
        const dayList = await mealStorage.getMealsByDate(day);
        const kcal = dayList.reduce((sum, meal) => sum + meal.totalCalories, 0);
        return { key: day.toDateString(), kcal, has: dayList.length > 0 };
      })
    );
    setWeekKcal(results.map((item) => item.kcal));
    setDaysWithMeals(new Set(results.filter((item) => item.has).map((item) => item.key)));
  }, [selectedDate, weekAnchor]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  const shiftWeek = (direction: -1 | 1) => {
    const next = new Date(weekAnchor);
    next.setDate(weekAnchor.getDate() + direction * 7);
    if (direction > 0 && startOfWeek(next) > startOfWeek(today)) {
      return;
    }
    setWeekAnchor(next);
    const nextSelected = new Date(selectedDate);
    nextSelected.setDate(selectedDate.getDate() + direction * 7);
    if (nextSelected > today) {
      setSelectedDate(today);
    } else {
      setSelectedDate(nextSelected);
    }
  };

  const loggedDays = weekKcal.filter((kcal) => kcal > 0);
  const avg = loggedDays.length
    ? Math.round(loggedDays.reduce((sum, kcal) => sum + kcal, 0) / loggedDays.length)
    : 0;

  const dayTotals = useMemo(
    () =>
      meals.reduce(
        (acc, meal) => {
          acc.kcal += meal.totalCalories;
          acc.protein += meal.totalProtein;
          acc.carbs += meal.totalCarbohydrates;
          acc.fat += meal.totalFat;
          acc.fiber += meal.foods.reduce((sum, food) => sum + (food.fiber ?? 0), 0);
          return acc;
        },
        { kcal: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
      ),
    [meals]
  );

  const sections: SlotSection[] = useMemo(
    () =>
      MEAL_SLOTS.map((slot) => {
        const slotMeals = meals.filter((meal) => getMealSlot(meal) === slot.id);
        const data: FoodRow[] = [];
        slotMeals.forEach((meal) => {
          meal.foods.forEach((food, index) => {
            data.push({ mealId: meal.id, index, food });
          });
        });
        return {
          title: getMealSlotLabel(slot.id),
          slotKcal: slotMeals.reduce((sum, meal) => sum + meal.totalCalories, 0),
          data,
        };
      }).filter((section) => section.data.length > 0),
    [meals]
  );

  const dateLabel = selectedDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const handleDeleteFood = useCallback((mealId: string, index: number, name: string) => {
    setPendingDelete({ mealId, index, name });
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: FoodRow }) => (
      <FoodRowItem item={item} colors={colors} isDark={isDark} onDelete={handleDeleteFood} />
    ),
    [colors, handleDeleteFood, isDark]
  );

  return (
    <Screen padded={false}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => `${item.mealId}-${item.index}`}
        contentContainerStyle={[styles.list, { paddingBottom: tabBarSpace + 16 }]}
        stickySectionHeadersEnabled={false}
        ListHeaderComponent={
          <View>
            <ScreenHeader
              title="Logs"
              right={<IconSquare name="calendar" accessibilityLabel="Calendar" />}
            />
            <GlassCard padding={18} radiusValue={28} style={styles.weekCard}>
              <Text style={[styles.weekTitle, { color: colors.ink }]}>This week</Text>
              <Text style={[styles.weekMeta, { color: colors.inkSecondary }]}>
                Avg {avg.toLocaleString()} · Goal {goal ? goal.toLocaleString() : '—'}
              </Text>
              <View style={styles.bars}>
                {week.map((day, index) => {
                  const selected = isSameDay(day, selectedDate);
                  const fill = goal > 0 ? Math.min(1, weekKcal[index] / goal) : 0;
                  return (
                    <View key={day.toDateString()} style={styles.barCol}>
                      <View
                        style={[
                          styles.barTrack,
                          inset(),
                          {
                            backgroundColor: isDark ? colors.surfaceRaised : colors.base,
                          },
                        ]}
                      >
                        <View
                          style={[
                            styles.barFill,
                            {
                              height: `${Math.max(6, fill * 100)}%`,
                              backgroundColor: selected ? colors.accent : colors.mint,
                            },
                          ]}
                        />
                      </View>
                      <Text style={[styles.barLabel, { color: colors.inkSecondary }]}>
                        {DAY_LABELS[day.getDay()]}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </GlassCard>

            <View style={styles.stripRow}>
              <PressableScale
                onPress={() => shiftWeek(-1)}
                accessibilityRole="button"
                accessibilityLabel="Previous week"
                hitSlop={8}
                style={styles.arrow}
              >
                <Feather name="chevron-left" size={20} color={colors.ink} />
              </PressableScale>
              {week.map((day) => {
                const selected = isSameDay(day, selectedDate);
                const future = day > today;
                const hasMeals = daysWithMeals.has(day.toDateString());
                return (
                  <PressableScale
                    key={day.toDateString()}
                    disabled={future}
                    onPress={() => {
                      setSelectedDate(day);
                      setWeekAnchor(day);
                    }}
                    accessibilityRole="button"
                    accessibilityState={{ selected, disabled: future }}
                    accessibilityLabel={`${day.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}${hasMeals ? ', has meals' : ''}`}
                    style={[
                      styles.dayTile,
                      selected
                        ? isDark
                          ? { backgroundColor: colors.accent }
                          : inset()
                        : isDark
                          ? [{ backgroundColor: colors.surfaceRaised }, raiseList()]
                          : [raiseSm(), { backgroundColor: colors.base }],
                      future && styles.dayDisabled,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayName,
                        {
                          color: selected
                            ? isDark
                              ? colors.onAccent
                              : colors.accent
                            : colors.inkSecondary,
                        },
                      ]}
                    >
                      {DAY_LABELS[day.getDay()]}
                    </Text>
                    <Text
                      style={[
                        styles.dayNum,
                        {
                          color: selected
                            ? isDark
                              ? colors.onAccent
                              : colors.accent
                            : colors.ink,
                        },
                      ]}
                    >
                      {day.getDate()}
                    </Text>
                    <View
                      style={[
                        styles.dot,
                        hasMeals && { backgroundColor: colors.mint },
                        selected && isDark && { backgroundColor: colors.onAccent },
                        selected && !isDark && { backgroundColor: colors.accent },
                      ]}
                    />
                  </PressableScale>
                );
              })}
              <PressableScale
                onPress={() => shiftWeek(1)}
                accessibilityRole="button"
                accessibilityLabel="Next week"
                hitSlop={8}
                style={styles.arrow}
              >
                <Feather name="chevron-right" size={20} color={colors.ink} />
              </PressableScale>
            </View>

            <RaisedCard padding={16} radiusValue={22} style={styles.summary}>
              <Text style={[styles.summaryDate, { color: colors.ink }]}>{dateLabel}</Text>
              <Text style={[styles.summaryKcal, { color: colors.ink }]}>
                {Math.round(dayTotals.kcal)} / {goal || '—'} kcal
              </Text>
              <MacroDots
                protein={dayTotals.protein}
                carbs={dayTotals.carbs}
                fat={dayTotals.fat}
                fiber={dayTotals.fiber}
              />
            </RaisedCard>
          </View>
        }
        renderSectionHeader={({ section }) => (
          <RaisedCard padding={14} radiusValue={22} style={styles.slotHeader}>
            <IconSquare name="coffee" insetStyle={isDark} color={colors.ink} />
            <Text style={[styles.slotTitle, { color: colors.ink }]}>{section.title}</Text>
            <Text style={[styles.slotKcal, { color: colors.accent }]}>
              {Math.round(section.slotKcal)} kcal
            </Text>
          </RaisedCard>
        )}
        renderItem={renderItem}
        ListEmptyComponent={
          <EmptyState compact icon="restaurant-outline" message="No meals logged for this day." />
        }
        ListFooterComponent={
          sections.length === 0 ? (
            <PressableScale
              onPress={() => router.push('/search')}
              style={styles.cta}
              accessibilityRole="button"
              accessibilityLabel="Add food"
            >
              <Text style={[styles.ctaText, { color: colors.accent }]}>Add food</Text>
            </PressableScale>
          ) : null
        }
      />
      <ConfirmDialog
        visible={pendingDelete !== null}
        title="Delete food"
        body={`Remove ${pendingDelete?.name ?? ''} from this meal?`}
        confirmLabel="Delete"
        destructive
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (!pendingDelete) return;
          const { mealId, index } = pendingDelete;
          setPendingDelete(null);
          void mealStorage.removeFood(mealId, index).then(() => load());
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: 24,
    paddingTop: 10,
    gap: 8,
  },
  weekCard: {
    marginBottom: 16,
  },
  weekTitle: {
    fontFamily: fonts.outfitSemiBold,
    fontSize: 16,
    fontWeight: '600',
  },
  weekMeta: {
    ...typography.caption,
    marginTop: 4,
    marginBottom: 12,
  },
  bars: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 88,
  },
  barCol: {
    alignItems: 'center',
    flex: 1,
  },
  barTrack: {
    width: 18,
    flex: 1,
    borderRadius: 10,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 8,
  },
  barLabel: {
    fontFamily: fonts.outfitSemiBold,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 6,
  },
  stripRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  arrow: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayTile: {
    flex: 1,
    minHeight: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  dayDisabled: {
    opacity: 0.35,
  },
  dayName: {
    fontFamily: fonts.outfitSemiBold,
    fontSize: 11,
  },
  dayNum: {
    fontFamily: fonts.outfitBold,
    fontSize: 16,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 4,
    backgroundColor: 'transparent',
  },
  summary: {
    marginBottom: 16,
    gap: 6,
  },
  summaryDate: {
    fontFamily: fonts.outfitSemiBold,
    fontSize: 18,
    fontWeight: '600',
  },
  summaryKcal: {
    fontFamily: fonts.outfitSemiBold,
    fontSize: 16,
  },
  slotHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 12,
    marginBottom: 8,
  },
  slotTitle: {
    flex: 1,
    fontFamily: fonts.outfitSemiBold,
    fontSize: 16,
  },
  slotKcal: {
    fontFamily: fonts.outfitSemiBold,
    fontSize: 14,
  },
  foodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 8,
  },
  foodCopy: {
    flex: 1,
    gap: 4,
  },
  foodName: {
    fontFamily: fonts.outfitSemiBold,
    fontSize: 15.5,
  },
  foodServing: {
    ...typography.caption,
  },
  foodKcal: {
    fontFamily: fonts.outfitSemiBold,
    fontSize: 14,
  },
  trash: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cta: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  ctaText: {
    fontFamily: fonts.outfitSemiBold,
    fontSize: 16,
  },
});
