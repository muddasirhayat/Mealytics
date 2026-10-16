import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Meal, MealSlot } from '@/types/meal';
import { MEAL_SLOTS, getMealSlot } from '@/utils/mealSlot';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/fonts';
import { typography } from '@/theme/typography';
import { RaisedCard } from '@/components/ui/RaisedCard';
import { IconSquare } from '@/components/ui/IconSquare';
import { PlusButton } from '@/components/ui/PlusButton';

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

export const MealSlotList = ({ meals }: MealSlotListProps) => {
  const router = useRouter();

  return (
    <View style={styles.wrap}>
      <Text style={styles.heading}>Today&apos;s meals</Text>
      {MEAL_SLOTS.map((slot) => {
        const slotMeals = meals.filter((meal) => getMealSlot(meal) === slot.id);
        const kcal = slotMeals.reduce((sum, meal) => sum + meal.totalCalories, 0);
        return (
          <RaisedCard key={slot.id} padding={14} radiusValue={22} style={styles.card}>
            <IconSquare name={SLOT_ICON[slot.id]} insetStyle accessibilityLabel={slot.title} />
            <View style={styles.copy}>
              <Text style={styles.title}>{slot.title}</Text>
              <Text style={styles.kcal}>{Math.round(kcal)} kcal</Text>
            </View>
            <PlusButton
              onPress={() => router.push({ pathname: '/search', params: { slot: slot.id } })}
              accessibilityLabel={`Add food to ${slot.title}`}
            />
          </RaisedCard>
        );
      })}
      <Pressable
        onPress={() => router.push('/search')}
        accessibilityRole="button"
        accessibilityLabel="Search foods"
        style={styles.link}
      >
        <Text style={styles.linkText}>Search foods</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    gap: 12,
    marginTop: 8,
  },
  heading: {
    ...typography.topTitle,
    color: colors.ink,
    marginBottom: 4,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  copy: {
    flex: 1,
  },
  title: {
    fontFamily: fonts.outfitSemiBold,
    fontSize: 16,
    fontWeight: '600',
    color: colors.ink,
  },
  kcal: {
    ...typography.caption,
    fontFamily: fonts.outfitSemiBold,
    color: colors.accent,
    fontWeight: '600',
    marginTop: 2,
  },
  link: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkText: {
    ...typography.body,
    color: colors.accent,
    fontFamily: fonts.outfitSemiBold,
    fontWeight: '600',
  },
});
