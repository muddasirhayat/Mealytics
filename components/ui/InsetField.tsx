import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View, type KeyboardTypeOptions } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { radius } from '@/theme/radius';
import { typography } from '@/theme/typography';
import { inset } from '@/utils/shadow';

type InsetFieldProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  suffix?: string;
  error?: string;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  autoFocus?: boolean;
  height?: number;
  accessibilityLabel?: string;
  fullWidth?: boolean;
};

export const InsetField = ({
  label,
  value,
  onChangeText,
  suffix,
  error,
  placeholder,
  keyboardType = 'default',
  autoFocus,
  height = 48,
  accessibilityLabel,
  fullWidth = false,
}: InsetFieldProps) => {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.wrap, fullWidth && styles.fullWidth]}>
      <Text style={[styles.label, { color: colors.inkSecondary }]}>{label}</Text>
      <View
        style={[
          styles.field,
          inset(),
          {
            backgroundColor: colors.base,
            borderWidth: focused ? 1 : StyleSheet.hairlineWidth,
            borderColor: focused ? colors.accent : colors.border,
          },
          { height: Math.max(height, 44) },
        ]}
      >
        <TextInput
          style={[
            styles.input,
            { color: colors.ink, minWidth: Math.max(48, value.length * 10 + 8) },
            !suffix && styles.inputGrow,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.inkMuted}
          selectionColor={colors.accent}
          cursorColor={colors.accent}
          keyboardType={keyboardType}
          autoFocus={autoFocus}
          accessibilityLabel={accessibilityLabel ?? label}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {suffix ? <Text style={[styles.suffix, { color: colors.inkMuted }]}>{suffix}</Text> : null}
      </View>
      {error ? <Text style={[styles.error, { color: colors.danger }]}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { flex: 1, minWidth: 152 },
  fullWidth: { width: '100%', flexBasis: '100%', minWidth: '100%' },
  label: { ...typography.fieldLabel, marginBottom: 7, marginLeft: 4 },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.field,
    paddingHorizontal: 16,
  },
  input: { ...typography.fieldValue, flexGrow: 0, flexShrink: 1, paddingVertical: 0, paddingRight: 0 },
  inputGrow: { flex: 1 },
  suffix: { ...typography.fieldLabel, marginLeft: 4 },
  error: {
    ...typography.caption,
    fontFamily: typography.fieldLabel.fontFamily,
    fontWeight: '700',
    marginTop: 6,
    marginLeft: 4,
  },
});
