import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MealSlot } from '@/types/meal';
import { MEAL_SLOTS } from '@/utils/mealSlot';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { radius } from '@/theme/radius';

interface MealSlotPickerProps {
  value: MealSlot;
  onChange: (slot: MealSlot) => void;
}

export const MealSlotPicker = ({ value, onChange }: MealSlotPickerProps) => {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>Log this meal as</Text>
      <View style={styles.row}>
        {MEAL_SLOTS.map((slot) => {
          const selected = slot.id === value;
          return (
            <TouchableOpacity
              key={slot.id}
              style={[styles.chip, selected && styles.chipSelected]}
              onPress={() => onChange(slot.id)}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityLabel={slot.title}
            >
              <Text style={styles.emoji}>{slot.emoji}</Text>
              <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                {slot.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    marginTop: spacing.md,
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.round,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs + 2,
    gap: 4,
  },
  chipSelected: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  emoji: {
    fontSize: 12,
  },
  chipText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  chipTextSelected: {
    color: colors.primaryDark,
  },
});
