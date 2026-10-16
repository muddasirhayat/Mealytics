import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useThemeColors } from '@/hooks/useThemeColors';
import { typography } from '@/theme/typography';

type MacroDotsProps = {
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
};

const Item = ({ color, value, suffix, textColor }: { color: string; value: number; suffix: string; textColor: string }) => (
  <View style={styles.item}>
    <View style={[styles.dot, { backgroundColor: color }]} accessible={false} />
    <Text style={[styles.text, { color: textColor }]}>
      {Math.round(value)}
      {suffix}
    </Text>
  </View>
);

export const MacroDots = ({ protein, carbs, fat, fiber }: MacroDotsProps) => {
  const colors = useThemeColors();
  return (
    <View style={styles.row}>
      <Item color={colors.protein} value={protein} suffix="P" textColor={colors.muted} />
      <Item color={colors.carbs} value={carbs} suffix="C" textColor={colors.muted} />
      <Item color={colors.fat} value={fat} suffix="F" textColor={colors.muted} />
      {fiber !== undefined ? (
        <Item color={colors.fiber} value={fiber} suffix="Fi" textColor={colors.muted} />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  text: {
    ...typography.caption,
    fontFamily: typography.fieldLabel.fontFamily,
    fontWeight: '700',
  },
});
