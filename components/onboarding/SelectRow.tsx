import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { IconSquare } from '@/components/ui/IconSquare';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/fonts';
import { typography } from '@/theme/typography';
import { inset, raiseSm } from '@/utils/shadow';

type SelectRowProps = {
  label: string;
  description: string;
  icon: keyof typeof Feather.glyphMap;
  selected: boolean;
  onPress: () => void;
};

export const SelectRow = ({ label, description, icon, selected, onPress }: SelectRowProps) => (
  <Pressable
    onPress={onPress}
    accessibilityRole="button"
    accessibilityState={{ selected }}
    accessibilityLabel={`${label}. ${description}`}
    style={[styles.row, selected ? inset() : raiseSm(), { minHeight: 78 }]}
  >
    <IconSquare name={icon} insetStyle={!selected} color={selected ? colors.accent : colors.muted} size={46} />
    <View style={styles.copy}>
      <Text style={[styles.label, selected && styles.labelOn]}>{label}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
    <View style={[styles.radio, selected ? styles.radioOn : inset()]}>
      {selected ? <Feather name="check" size={15} color={colors.textInverse} accessible={false} /> : null}
    </View>
  </Pressable>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderRadius: 24,
    backgroundColor: colors.base,
    paddingHorizontal: 20,
    marginTop: 16,
  },
  copy: {
    flex: 1,
  },
  label: {
    fontFamily: fonts.outfitSemiBold,
    fontSize: 17,
    fontWeight: '600',
    color: colors.ink,
  },
  labelOn: {
    color: colors.accent,
  },
  description: {
    ...typography.caption,
    fontFamily: fonts.manropeBold,
    fontWeight: '600',
    color: colors.muted,
    marginTop: 2,
  },
  radio: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.base,
  },
  radioOn: {
    backgroundColor: colors.accent,
  },
});
