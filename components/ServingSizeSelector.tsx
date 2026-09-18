import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { radius } from '@/theme/radius';
import { typography } from '@/theme/typography';

interface ServingSizeSelectorProps {
  amount: number;
  unit: string;
  baseAmount: number;
  onChange: (amount: number) => void;
}

const STEP = 10;
const PRESETS = [50, 100, 150, 200];

export const ServingSizeSelector = ({
  amount,
  unit,
  baseAmount,
  onChange,
}: ServingSizeSelectorProps) => {
  const [text, setText] = useState(String(Math.round(amount * 10) / 10));

  useEffect(() => {
    setText(String(Math.round(amount * 10) / 10));
  }, [amount]);

  const handleChangeText = (raw: string) => {
    setText(raw);
    const parsed = Number(raw.replace(',', '.').trim());
    if (Number.isFinite(parsed) && parsed > 0) {
      onChange(Math.round(parsed * 10) / 10);
    }
  };

  const commitText = (raw: string) => {
    const parsed = Number(raw.replace(',', '.').trim());
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setText(String(Math.round(amount * 10) / 10));
      return;
    }
    const next = Math.round(parsed * 10) / 10;
    onChange(next);
    setText(String(next));
  };

  const bump = (delta: number) => {
    const next = Math.max(1, Math.round((amount + delta) * 10) / 10);
    onChange(next);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Your serving</Text>
      <Text style={styles.hint}>
        Database values are per {Math.round(baseAmount)}
        {unit}. Nutrition below updates for the amount you enter.
      </Text>

      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => bump(-STEP)}
          disabled={amount <= 1}
          accessibilityRole="button"
          accessibilityLabel={`Decrease serving by ${STEP}${unit}`}
        >
          <Ionicons name="remove" size={22} color={amount <= 1 ? colors.border : colors.primary} />
        </TouchableOpacity>

        <View style={styles.inputWrap}>
          <TextInput
            style={styles.input}
            value={text}
            onChangeText={handleChangeText}
            onBlur={() => commitText(text)}
            onSubmitEditing={() => commitText(text)}
            keyboardType="decimal-pad"
            inputMode="decimal"
            accessibilityLabel="Serving size"
          />
          <Text style={styles.unit}>{unit}</Text>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={() => bump(STEP)}
          accessibilityRole="button"
          accessibilityLabel={`Increase serving by ${STEP}${unit}`}
        >
          <Ionicons name="add" size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.presets}>
        {PRESETS.map((preset) => {
          const selected = Math.abs(amount - preset) < 0.05;
          return (
            <TouchableOpacity
              key={preset}
              style={[styles.preset, selected && styles.presetSelected]}
              onPress={() => onChange(preset)}
              accessibilityRole="button"
              accessibilityState={{ selected }}
            >
              <Text style={[styles.presetText, selected && styles.presetTextSelected]}>
                {preset}
                {unit}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: {
    ...typography.bodyLarge,
    color: colors.text,
    fontWeight: '700',
  },
  hint: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 4,
    marginBottom: spacing.sm,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm,
    height: 44,
  },
  input: {
    flex: 1,
    ...typography.title,
    color: colors.text,
    paddingVertical: 0,
  },
  unit: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    fontWeight: '700',
    marginLeft: spacing.xs,
  },
  presets: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  preset: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.round,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  presetSelected: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  presetText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  presetTextSelected: {
    color: colors.primaryDark,
  },
});
