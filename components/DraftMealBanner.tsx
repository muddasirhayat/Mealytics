import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useMealStore } from '@/store/mealStore';
import { getMealSlotLabel } from '@/utils/mealSlot';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { radius } from '@/theme/radius';

export const DraftMealBanner = () => {
  const router = useRouter();
  const count = useMealStore((state) => state.draftMeal.length);
  const draftSlot = useMealStore((state) => state.draftSlot) ?? 'snacks';
  const slotLabel = getMealSlotLabel(draftSlot);

  if (count === 0) {
    return null;
  }

  return (
    <TouchableOpacity
      style={styles.banner}
      onPress={() => router.push('/meal/draft')}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={`Review current meal, ${count} items`}
    >
      <View style={styles.iconWrap}>
        <Ionicons name="restaurant" size={18} color={colors.surface} />
      </View>
      <View style={styles.copy}>
        <Text style={styles.title}>{slotLabel} · {count} item{count === 1 ? '' : 's'}</Text>
        <Text style={styles.subtitle}>Review and save to {slotLabel.toLowerCase()}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.primaryDark} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: radius.lg,
    padding: spacing.sm,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
  },
  title: {
    ...typography.bodyMedium,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  subtitle: {
    ...typography.caption,
    color: colors.primaryDark,
    opacity: 0.8,
  },
});
