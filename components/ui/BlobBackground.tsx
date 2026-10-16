import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

const LIGHT = require('@/assets/brand/blobs-light.png');
const DARK = require('@/assets/brand/blobs-dark.png');

/**
 * Pre-rendered blob atmospheres (one PNG per theme) — avoids live BlurView cost.
 * Uses RN Image so the app boots on older native builds without ExpoImage linked.
 * `variant` kept for API compatibility; composition is baked into the asset.
 */
export const BlobBackground = ({ variant: _variant = 'default' }: { variant?: 'default' | 'B1' | 'B2' }) => {
  const { isDark } = useTheme();
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill} accessible={false}>
      <Image
        source={isDark ? DARK : LIGHT}
        style={styles.image}
        resizeMode="cover"
        accessible={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  image: {
    ...StyleSheet.absoluteFill,
    width: '100%',
    height: '100%',
  },
});
