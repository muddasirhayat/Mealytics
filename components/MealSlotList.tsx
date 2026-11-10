import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Meal, MealSlot } from '@/types/meal';
import { MEAL_SLOTS, MEAL_SLOT_ICON, getMealSlot } from '@/utils/mealSlot';
import { useTheme } from '@/hooks/useTheme';
import { fonts } from '@/theme/fonts';
import { typography } from '@/theme/typography';
import { RaisedCard } from '@/components/ui/RaisedCard';
import { IconSquare } from '@/components/ui/IconSquare';
import { PlusButton } from '@/components/ui/PlusButton';
import { PressableScale } from '@/components/ui/PressableScale';
import { useMealStore } from '@/store/mealStore';

type MealSlotListProps = {
  meals: Meal[];
  targetCalories?: number;
};

const SlotRow = memo(function SlotRow({
  slotId,
  title,
  kcal,
  foods,
}: {
  slotId: MealSlot;
  title: string;
  kcal: number;
  foods: string;
}) {
  const router = useRouter();
  const { colors } = useTheme();
  const logForToday = useMealStore((state) => state.logForToday);
  return (
    <RaisedCard padding={14} radiusValue={22} style={styles.card}>
      <IconSquare
        name={MEAL_SLOT_ICON[slotId]}
        insetStyle={false}
        color={colors.ink}
        accessibilityLabel={title}
      />
      <View style={styles.copy}>
        <Text style={[styles.title, { color: colors.ink }]}>{title}</Text>
        <Text style={[styles.kcal, { color: colors.accent }]}>{Math.round(kcal)} kcal</Text>
        {foods ? (
          <Text style={[styles.foods, { color: colors.inkSecondary }]} numberOfLines={2}>
            {foods}
          </Text>
        ) : null}
      </View>
      <PlusButton
        onPress={() => {
          logForToday();
          router.push({ pathname: '/search', params: { slot: slotId } });
        }}
        accessibilityLabel={`Add food to ${title}`}
      />
    </RaisedCard>
  );
});

export const MealSlotList = ({ meals }: MealSlotListProps) => {
  const router = useRouter();
  const { colors } = useTheme();
  const logForToday = useMealStore((state) => state.logForToday);

  return (
    <View style={styles.wrap}>
      <Text style={[styles.heading, { color: colors.ink }]}>Today&apos;s meals</Text>
      {MEAL_SLOTS.map((slot) => {
        const slotMeals = meals.filter((meal) => getMealSlot(meal) === slot.id);
        const kcal = slotMeals.reduce((sum, meal) => sum + meal.totalCalories, 0);
        const foods = slotMeals.flatMap((meal) => meal.foods.map((food) => food.name)).join(', ');
        return <SlotRow key={slot.id} slotId={slot.id} title={slot.title} kcal={kcal} foods={foods} />;
      })}
      <PressableScale
        onPress={() => {
          logForToday();
          router.push('/search');
        }}
        accessibilityRole="button"
        accessibilityLabel="Search foods"
        style={styles.link}
      >
        <Text style={[styles.linkText, { color: colors.accent }]}>Search foods</Text>
      </PressableScale>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { gap: 12, marginTop: 8 },
  heading: { ...typography.topTitle, marginBottom: 4 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  copy: { flex: 1 },
  title: { fontFamily: fonts.outfitSemiBold, fontSize: 16, fontWeight: '600' },
  kcal: {
    ...typography.caption,
    fontFamily: fonts.outfitSemiBold,
    fontWeight: '600',
    marginTop: 2,
  },
  foods: {
    ...typography.caption,
    marginTop: 2,
  },
  link: { minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  linkText: { ...typography.body, fontFamily: fonts.outfitSemiBold, fontWeight: '600' },
});
