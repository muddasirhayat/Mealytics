import React from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { useThemeColors } from '@/hooks/useThemeColors';
import { radius } from '@/theme/radius';
import { glassShadow } from '@/utils/shadow';

type GlassCardProps = {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: number;
  radiusValue?: number;
};

export const GlassCard = ({ children, style, padding = 18, radiusValue = radius.glass }: GlassCardProps) => {
  const colors = useThemeColors();
  return (
    <View
      style={[
        styles.card,
        glassShadow(),
        {
          padding,
          borderRadius: radiusValue,
          backgroundColor: colors.glass,
          borderColor: colors.glassBorder,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
  },
});
