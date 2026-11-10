import React, { useCallback, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { stickyCtaScrollPadding } from '@/constants/layout';
import { Feather } from '@expo/vector-icons';
import { useMealStore } from '@/store/mealStore';
import { useUserStore } from '@/store/userStore';
import { mealStorage } from '@/storage/mealStorage';
import { EmptyState } from '@/components/StateIndicators';
import { LoggingDateNote } from '@/components/LoggingDateNote';
import {
  ConfirmDialog,
  GlassCard,
  MacroDots,
  PrimaryButton,
  RaisedCard,
  Screen,
  Segmented,
  TopBar,
} from '@/components/ui';
import { useToast } from '@/components/ui/Toast';
import { getMealSlotLabel } from '@/utils/mealSlot';
import { formatFoodServing } from '@/utils/nutrition';
import { createId } from '@/utils/id';
import { formatLogDate, isTodayMs, mealTimestampForDate } from '@/utils/date';
import { pushFoodEdit } from '@/utils/foodEdit';
import { MealSlot } from '@/types/meal';
import { useTheme } from '@/hooks/useTheme';
import type { ThemeColors } from '@/theme/palette';
import { fonts } from '@/theme/fonts';
import { typography } from '@/theme/typography';
import { inset } from '@/utils/shadow';

const SLOTS: { label: string; value: MealSlot }[] = [
  { label: 'Breakfast', value: 'breakfast' },
  { label: 'Lunch', value: 'lunch' },
  { label: 'Dinner', value: 'dinner' },
  { label: 'Snacks', value: 'snacks' },
];

export default function DraftMealScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const { draftMeal, draftSlot, draftDate, setDraftSlot, removeFoodFromMeal, clearDraftMeal } =
    useMealStore();
  const goals = useUserStore((state) => state.goals);
  const { show } = useToast();
  const [loggedKcal, setLoggedKcal] = useState(0);
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);
  const [pendingDelete, setPendingDelete] = useState<{ id: string; name: string } | null>(null);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      void mealStorage.getMealsByDate(new Date(draftDate)).then((dayMeals) => {
        if (!cancelled) {
          setLoggedKcal(dayMeals.reduce((sum, meal) => sum + meal.totalCalories, 0));
        }
      });
      return () => {
        cancelled = true;
      };
    }, [draftDate])
  );

  const totals = draftMeal.reduce(
    (acc, food) => {
      acc.calories += food.calories || 0;
      acc.protein += food.protein || 0;
      acc.carbs += food.carbohydrates || 0;
      acc.fat += food.fat || 0;
      acc.fiber += food.fiber || 0;
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
  );

  const leftover = goals
    ? Math.round(goals.targetCalories - loggedKcal - totals.calories)
    : null;

  const handleSave = async () => {
    if (savingRef.current || draftMeal.length === 0) return;
    savingRef.current = true;
    setSaving(true);
    const loggingToday = isTodayMs(draftDate);
    const newMeal = {
      id: createId(),
      timestamp: mealTimestampForDate(draftDate),
      slot: draftSlot,
      foods: draftMeal,
      totalCalories: Math.round(totals.calories),
      totalProtein: Math.round(totals.protein),
      totalCarbohydrates: Math.round(totals.carbs),
      totalFat: Math.round(totals.fat),
    };
    const success = await mealStorage.saveMeal(newMeal);
    if (success) {
      clearDraftMeal();
      show(
        loggingToday
          ? `${getMealSlotLabel(draftSlot)} saved`
          : `${getMealSlotLabel(draftSlot)} saved for ${formatLogDate(draftDate)}`
      );
      router.replace(
        loggingToday ? '/' : { pathname: '/(tabs)/logs', params: { date: String(draftDate) } }
      );
    } else {
      show('Could not save');
    }
    savingRef.current = false;
    setSaving(false);
  };

  const handleRemove = (id: string, name: string) => {
    setPendingDelete({ id, name });
  };

  return (
    <Screen blobs="B1" edges={{ top: true, bottom: true }}>
      <TopBar title="Current meal" />
      <LoggingDateNote />
      {draftMeal.length === 0 ? (
        <View style={styles.empty}>
          <EmptyState compact icon="restaurant-outline" message="Your meal is empty." />
          <PrimaryButton label="Search foods" onPress={() => router.push('/search')} />
        </View>
      ) : (
        <>
          <ScrollView
            style={styles.scroller}
            contentContainerStyle={[styles.scroll, { paddingBottom: stickyCtaScrollPadding(insets.bottom) }]}
            showsVerticalScrollIndicator={false}
          >
            <GlassCard padding={20} radiusValue={28}>
              <Text style={styles.meta}>
                {getMealSlotLabel(draftSlot)} · {draftMeal.length} item{draftMeal.length === 1 ? '' : 's'}
              </Text>
              <Text style={styles.kcal}>{Math.round(totals.calories)}</Text>
              <MacroDots
                protein={totals.protein}
                carbs={totals.carbs}
                fat={totals.fat}
                fiber={totals.fiber}
              />
              {goals && leftover !== null ? (
                <Text style={styles.left}>
                  {leftover >= 0
                    ? `Leaves ${leftover} kcal of your ${goals.targetCalories} goal`
                    : `${Math.abs(leftover)} kcal over your ${goals.targetCalories} goal`}
                  {isTodayMs(draftDate) ? ' today' : ` for ${formatLogDate(draftDate)}`}
                </Text>
              ) : null}
            </GlassCard>
            {draftMeal.map((food) => (
              <RaisedCard key={food.id} padding={14} radiusValue={22} style={styles.row}>
                <View style={styles.copy}>
                  <Text style={styles.name}>{food.name}</Text>
                  <Text style={styles.serving}>{formatFoodServing(food)}</Text>
                  <MacroDots
                    protein={food.protein}
                    carbs={food.carbohydrates}
                    fat={food.fat}
                    fiber={food.fiber}
                  />
                </View>
                <Text style={styles.rowKcal}>{Math.round(food.calories)}</Text>
                <Pressable
                  onPress={() => pushFoodEdit(router, food, { editDraftId: food.id })}
                  accessibilityRole="button"
                  accessibilityLabel={`Edit ${food.name}`}
                  hitSlop={8}
                  style={[styles.iconBtn, inset()]}
                >
                  <Feather name="edit-2" size={16} color={colors.ink} />
                </Pressable>
                <Pressable
                  onPress={() => handleRemove(food.id, food.name)}
                  accessibilityRole="button"
                  accessibilityLabel={`Delete ${food.name}`}
                  hitSlop={8}
                  style={[styles.iconBtn, inset()]}
                >
                  <Feather name="trash-2" size={16} color={colors.danger} />
                </Pressable>
              </RaisedCard>
            ))}
            <Pressable onPress={() => router.push('/search')} style={styles.link} accessibilityRole="button">
              <Text style={styles.linkText}>+ Add another food</Text>
            </Pressable>
            <Text style={styles.saveTo}>Save to</Text>
            <Segmented options={SLOTS} value={draftSlot} onChange={setDraftSlot} />
          </ScrollView>
          <PrimaryButton
            label="✓ Save meal"
            onPress={() => void handleSave()}
            loading={saving}
            disabled={saving}
          />
        </>
      )}
      <ConfirmDialog
        visible={pendingDelete !== null}
        title="Delete food"
        body={`Remove ${pendingDelete?.name ?? ''}?`}
        confirmLabel="Delete"
        destructive
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) removeFoodFromMeal(pendingDelete.id);
          setPendingDelete(null);
        }}
      />
    </Screen>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  empty: {
    flex: 1,
    justifyContent: 'center',
    gap: 16,
  },
  scroller: {
    flex: 1,
    minHeight: 0,
  },
  scroll: {
    gap: 12,
  },
  meta: {
    fontFamily: fonts.outfitSemiBold,
    fontSize: 16,
    color: colors.ink,
  },
  kcal: {
    fontFamily: fonts.outfitBold,
    fontSize: 48,
    letterSpacing: -1.5,
    color: colors.ink,
    marginVertical: 8,
  },
  left: {
    ...typography.body,
    color: colors.muted,
    marginTop: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  copy: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontFamily: fonts.outfitSemiBold,
    fontSize: 15.5,
    color: colors.ink,
  },
  serving: {
    ...typography.caption,
    color: colors.muted,
  },
  rowKcal: {
    fontFamily: fonts.outfitSemiBold,
    fontSize: 14,
    color: colors.ink,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.base,
  },
  link: {
    minHeight: 44,
    justifyContent: 'center',
  },
  linkText: {
    fontFamily: fonts.outfitSemiBold,
    fontSize: 16,
    color: colors.accent,
  },
  saveTo: {
    ...typography.fieldLabel,
    color: colors.muted,
    marginTop: 8,
  },
});
