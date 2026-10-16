import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Meal, MealSlot } from '@/types/meal';
import { MEAL_SLOTS, getMealSlot } from '@/utils/mealSlot';
import { useTheme } from '@/hooks/useTheme';
import { fonts } from '@/theme/fonts';
import { typography } from '@/theme/typography';
import { RaisedCard } from '@/components/ui/RaisedCard';
import { IconSquare } from '@/components/ui/IconSquare';
import { PlusButton } from '@/components/ui/PlusButton';
import { PressableScale } from '@/components/ui/PressableScale';

const SLOT_ICON: Record<MealSlot, keyof typeof Feather.glyphMap> = {
  breakfast: 'coffee',
  lunch: 'sun',
  dinner: 'moon',
  snacks: 'star',
};

type MealSlotListProps = {
  meals: Meal[];
  targetCalories?: number;
};

const SlotRow = memo(function SlotRow({
  slotId,
  title,
  kcal,
}: {
  slotId: MealSlot;
  title: string;
  kcal: number;
}) {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  return (
    <RaisedCard padding={14} radiusValue={22} style={styles.card}>
      <IconSquare
        name={SLOT_ICON[slotId]}
        insetStyle={isDark}
        color={colors.ink}
        accessibilityLabel={title}
      />
      <View style={styles.copy}>
        <Text style={[styles.title, { color: colors.ink }]}>{title}</Text>
        <Text style={[styles.kcal, { color: colors.accent }]}>{Math.round(kcal)} kcal</Text>
      </View>
      <PlusButton
        onPress={() => router.push({ pathname: '/search', params: { slot: slotId } })}
        accessibilityLabel={`Add food to ${title}`}
      />
    </RaisedCard>
  );
});

export const MealSlotList = ({ meals }: MealSlotListProps) => {
  const router = useRouter();
  const { colors } = useTheme();

  return (
    <View style={styles.wrap}>
      <Text style={[styles.heading, { color: colors.ink }]}>Today&apos;s meals</Text>
      {MEAL_SLOTS.map((slot) => {
        const slotMeals = meals.filter((meal) => getMealSlot(meal) === slot.id);
        const kcal = slotMeals.reduce((sum, meal) => sum + meal.totalCalories, 0);
        return <SlotRow key={slot.id} slotId={slot.id} title={slot.title} kcal={kcal} />;
      })}
      <PressableScale
        onPress={() => router.push('/search')}
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
  link: { minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  linkText: { ...typography.body, fontFamily: fonts.outfitSemiBold, fontWeight: '600' },
});
