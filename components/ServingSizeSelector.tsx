import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Segmented } from '@/components/ui';
import { isMassOrVolumeUnit, servingUnitOptions } from '@/constants/servings';
import { useTheme } from '@/hooks/useTheme';
import { spacing } from '@/theme/spacing';
import { radius } from '@/theme/radius';
import { typography } from '@/theme/typography';
import { parseDecimal, sanitizeDecimalInput } from '@/utils/number';

interface ServingSizeSelectorProps {
  amount: number;
  unit: string;
  baseAmount: number;
  onChange: (amount: number) => void;
  onUnitChange?: (unit: string) => void;
}

const MASS_PRESETS = [50, 100, 150, 200];
const PORTION_PRESETS = [0.5, 1, 1.5, 2];

export const ServingSizeSelector = ({
  amount,
  unit,
  baseAmount,
  onChange,
  onUnitChange,
}: ServingSizeSelectorProps) => {
  const { colors } = useTheme();
  const massLike = isMassOrVolumeUnit(unit);
  const step = massLike ? 10 : 0.5;
  const minAmount = massLike ? 1 : 0.1;
  const presets = massLike ? MASS_PRESETS : PORTION_PRESETS;
  const amountText = String(Math.round(amount * 10) / 10);
  const [text, setText] = useState(amountText);
  const [syncedAmount, setSyncedAmount] = useState(amount);
  const [error, setError] = useState<string | null>(null);

  if (amount !== syncedAmount) {
    setSyncedAmount(amount);
    setText(amountText);
    setError(null);
  }

  const handleChangeText = (raw: string) => {
    const nextText = sanitizeDecimalInput(raw);
    setText(nextText);
    const parsed = parseDecimal(nextText);
    if (parsed !== null && parsed > 0) {
      setError(null);
      onChange(Math.round(parsed * 10) / 10);
      return;
    }
    setError(nextText ? 'Enter a valid serving greater than 0' : 'Enter a serving size');
  };

  const commitText = (raw: string) => {
    const parsed = parseDecimal(raw);
    if (parsed === null || parsed <= 0) {
      setText(amountText);
      setError(null);
      return;
    }
    const next = Math.round(parsed * 10) / 10;
    onChange(next);
    setText(String(next));
    setError(null);
  };

  const bump = (delta: number) => {
    const next = Math.max(minAmount, Math.round((amount + delta) * 10) / 10);
    onChange(next);
  };

  const fieldBg = colors.background;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
    >
      <Text style={[styles.label, { color: colors.ink }]}>Your serving</Text>
      <Text style={[styles.hint, { color: colors.inkSecondary }]}>
        Values are per {Math.round(baseAmount * 10) / 10} {unit}. Nutrition below updates for the
        amount you enter.
      </Text>

      {onUnitChange ? (
        <View style={styles.units}>
          <Segmented
            options={servingUnitOptions(unit)}
            value={unit}
            onChange={onUnitChange}
            accessibilityLabel="Serving unit"
          />
        </View>
      ) : null}

      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: fieldBg }]}
          onPress={() => bump(-step)}
          disabled={amount <= minAmount}
          accessibilityRole="button"
          accessibilityLabel={`Decrease serving by ${step}${unit}`}
        >
          <Ionicons name="remove" size={22} color={amount <= minAmount ? colors.border : colors.accent} />
        </TouchableOpacity>

        <View style={[styles.inputWrap, { backgroundColor: fieldBg, borderColor: colors.borderStrong }]}>
          <TextInput
            style={[
              styles.input,
              { color: colors.ink, minWidth: Math.max(36, text.length * 14) },
            ]}
            value={text}
            onChangeText={handleChangeText}
            onBlur={() => commitText(text)}
            onSubmitEditing={() => commitText(text)}
            keyboardType="decimal-pad"
            inputMode="decimal"
            placeholderTextColor={colors.inkMuted}
            selectionColor={colors.accent}
            cursorColor={colors.accent}
            accessibilityLabel="Serving size"
          />
          <Text style={[styles.unit, { color: colors.inkMuted }]}>{unit}</Text>
        </View>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: fieldBg }]}
          onPress={() => bump(step)}
          accessibilityRole="button"
          accessibilityLabel={`Increase serving by ${step}${unit}`}
        >
          <Ionicons name="add" size={22} color={colors.accent} />
        </TouchableOpacity>
      </View>
      {error ? <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text> : null}

      <View style={styles.presets}>
        {presets.map((preset) => {
          const selected = Math.abs(amount - preset) < 0.05;
          return (
            <TouchableOpacity
              key={preset}
              style={[
                styles.preset,
                {
                  backgroundColor: selected ? colors.primaryLight : fieldBg,
                  borderColor: selected ? colors.accent : colors.border,
                },
              ]}
              onPress={() => onChange(preset)}
              accessibilityRole="button"
              accessibilityState={{ selected }}
            >
              <Text
                style={[
                  styles.presetText,
                  { color: selected ? colors.accent : colors.inkSecondary },
                ]}
              >
                {preset}
                {massLike ? unit : ` ${unit}`}
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
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  label: {
    ...typography.bodyLarge,
    fontWeight: '700',
  },
  hint: {
    ...typography.caption,
    marginTop: 4,
    marginBottom: spacing.sm,
  },
  units: {
    marginBottom: spacing.sm,
  },
  errorText: {
    ...typography.caption,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    height: 44,
  },
  input: {
    flexGrow: 0,
    flexShrink: 0,
    ...typography.title,
    paddingVertical: 0,
    paddingRight: 0,
  },
  unit: {
    ...typography.bodyMedium,
    fontWeight: '700',
    marginLeft: 4,
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
    borderWidth: 1,
  },
  presetText: {
    ...typography.caption,
    fontWeight: '700',
  },
});
