import React from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { radius } from '@/theme/radius';
import { glassShadow } from '@/utils/shadow';

type GlassCardProps = {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: number;
  radiusValue?: number;
};

export const GlassCard = ({ children, style, padding = 18, radiusValue = radius.glass }: GlassCardProps) => {
  const { colors, isDark } = useTheme();
  return (
    <View
      style={[
        styles.card,
        glassShadow(),
        {
          padding,
          borderRadius: radiusValue,
          backgroundColor: isDark ? colors.surface : colors.glass,
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
  card: { borderWidth: 1 },
});
