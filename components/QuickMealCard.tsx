import React, { memo, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { QuickMeal } from '@/types/quickMeal';
import { Food } from '@/types/food';
import { useMealStore } from '@/store/mealStore';
import { createId } from '@/utils/id';
import { useTheme } from '@/hooks/useTheme';
import { fonts } from '@/theme/fonts';
import { typography } from '@/theme/typography';
import { RaisedCard, IconSquare, MacroDots, PlusButton } from '@/components/ui';
import { useToast } from '@/components/ui/Toast';
import { PressableScale } from '@/components/ui/PressableScale';

const iconForTags = (tags: string[]): keyof typeof Feather.glyphMap => {
  if (tags.includes('high-protein')) return 'zap';
  if (tags.includes('vegan')) return 'sun';
  if (tags.includes('low-carb')) return 'minus';
  return 'coffee';
};

type QuickMealCardProps = {
  meal: QuickMeal;
  kcalLeft?: number;
};

export const QuickMealCard = memo(function QuickMealCard({ meal, kcalLeft }: QuickMealCardProps) {
  const router = useRouter();
  const { colors } = useTheme();
  const addFoodToMeal = useMealStore((state) => state.addFoodToMeal);
  const { show } = useToast();
  const [added, setAdded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const overBudget = kcalLeft !== undefined && meal.calories > kcalLeft;

  const handleAdd = () => {
    const foodItem: Food = {
      id: createId(),
      name: meal.name,
      dataSource: 'custom',
      calories: meal.calories,
      protein: meal.protein,
      carbohydrates: meal.carbs,
      fat: meal.fat,
      fiber: meal.fiber,
      servingSize: 1,
      servingUnit: 'serving',
      servingLabel: meal.servingSize,
      nutrients: [],
    };
    addFoodToMeal(foodItem);
    setAdded(true);
    show(`Added ${meal.name}`, {
      label: 'View meal',
      onPress: () => router.push('/meal/draft'),
    });
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), 2500);
  };

  return (
    <PressableScale>
      <RaisedCard padding={16} radiusValue={22} style={styles.card}>
        <View style={styles.top}>
          <IconSquare name={iconForTags(meal.tags)} insetStyle color={colors.ink} />
          <View style={styles.nameWrap}>
            <Text style={[styles.name, { color: colors.ink }]}>{meal.name}</Text>
            <Text style={[styles.serving, { color: colors.inkSecondary }]}>{meal.servingSize}</Text>
          </View>
          <Text style={[styles.kcal, { color: colors.accent }]}>{meal.calories}</Text>
        </View>
        <MacroDots protein={meal.protein} carbs={meal.carbs} fat={meal.fat} fiber={meal.fiber} />
        <View style={styles.tags}>
          {meal.tags.slice(0, 3).map((tag) => (
            <View
              key={tag}
              style={[
                styles.tag,
                { backgroundColor: colors.insetFill },
              ]}
            >
              <Text style={[styles.tagText, { color: colors.inkSecondary }]}>
                {tag === 'quick' ? 'Quick' : tag}
              </Text>
            </View>
          ))}
        </View>
        {overBudget ? (
          <Text style={[styles.over, { color: colors.warning }]}>Over today&apos;s budget</Text>
        ) : null}
        <View style={styles.footer}>
          <PlusButton
            checked={added}
            onPress={added ? () => router.push('/meal/draft') : handleAdd}
            accessibilityLabel={added ? `Added ${meal.name}` : `Add ${meal.name}`}
          />
          <Text style={[styles.addLabel, { color: colors.inkSecondary }]}>
            {added ? 'Added ✓' : 'Add'}
          </Text>
        </View>
      </RaisedCard>
    </PressableScale>
  );
});

const styles = StyleSheet.create({
  card: { marginBottom: 14, gap: 10 },
  top: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  nameWrap: { flex: 1 },
  name: { fontFamily: fonts.outfitSemiBold, fontSize: 16, fontWeight: '600' },
  serving: { ...typography.caption, marginTop: 2 },
  kcal: { fontFamily: fonts.outfitSemiBold, fontSize: 16, fontWeight: '600' },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  tagText: { fontFamily: fonts.manropeBold, fontSize: 11, fontWeight: '700' },
  over: { ...typography.caption, fontFamily: fonts.manropeBold, fontWeight: '700' },
  footer: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 },
  addLabel: { fontFamily: fonts.outfitSemiBold, fontSize: 14, fontWeight: '600' },
});
