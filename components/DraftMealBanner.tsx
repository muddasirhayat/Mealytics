import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useMealStore } from '@/store/mealStore';
import { getMealSlotLabel } from '@/utils/mealSlot';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/fonts';
import { typography } from '@/theme/typography';
import { GlassCard } from '@/components/ui/GlassCard';

export const DraftMealBanner = () => {
  const router = useRouter();
  const count = useMealStore((state) => state.draftMeal.length);
  const draftSlot = useMealStore((state) => state.draftSlot) ?? 'snacks';
  const slotLabel = getMealSlotLabel(draftSlot);

  if (count === 0) {
    return null;
  }

  return (
    <Pressable
      onPress={() => router.push('/meal/draft')}
      accessibilityRole="button"
      accessibilityLabel={`Review current meal, ${count} items`}
      style={styles.press}
    >
      <GlassCard padding={14} radiusValue={22}>
        <View style={styles.row}>
          <View style={styles.copy}>
            <Text style={styles.title}>
              {slotLabel} · {count} item{count === 1 ? '' : 's'}
            </Text>
            <Text style={styles.sub}>Tap to review and save</Text>
          </View>
          <Text style={styles.cta}>View</Text>
        </View>
      </GlassCard>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  press: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
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
  sub: {
    ...typography.caption,
    color: colors.muted,
    marginTop: 2,
  },
  cta: {
    fontFamily: fonts.outfitSemiBold,
    fontSize: 14,
    fontWeight: '600',
    color: colors.accent,
  },
});
