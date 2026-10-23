import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { fonts } from '@/theme/fonts';

export const LogoMark = ({ size = 40, withWordmark = true }: { size?: number; withWordmark?: boolean }) => {
  const { colors } = useTheme();
  return (
    <View style={styles.row} accessible accessibilityLabel="mealytics">
      <Image
        source={require('@/assets/brand/logo.png')}
        style={{ width: size, height: size }}
        resizeMode="contain"
        accessible={false}
      />
      {withWordmark ? <Text style={[styles.wordmark, { color: colors.ink }]}>mealytics</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexShrink: 1,
  },
  wordmark: {
    fontFamily: fonts.outfitBold,
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.5,
    flexShrink: 1,
  },
});
