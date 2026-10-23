import React from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { radius } from '@/theme/radius';
import { raise, raiseSm } from '@/utils/shadow';

type RaisedCardProps = {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: number;
  radiusValue?: number;
  small?: boolean;
};

export const RaisedCard = ({
  children,
  style,
  padding = 16,
  radiusValue = radius.card,
  small = true,
}: RaisedCardProps) => {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.base },
        small ? raiseSm() : raise(),
        { padding, borderRadius: radiusValue },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {},
});
