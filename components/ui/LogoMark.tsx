import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/fonts';

export const LogoMark = ({ size = 40, withWordmark = true }: { size?: number; withWordmark?: boolean }) => (
  <View style={styles.row} accessible accessibilityLabel="mealytics">
    <Image
      source={require('@/assets/brand/logo.png')}
      style={{ width: size, height: size }}
      resizeMode="contain"
      accessible={false}
    />
    {withWordmark ? <Text style={styles.wordmark}>mealytics</Text> : null}
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  wordmark: {
    fontFamily: fonts.outfitBold,
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.5,
    color: colors.ink,
  },
});
