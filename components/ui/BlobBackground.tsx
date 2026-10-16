import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { useThemeColors } from '@/hooks/useThemeColors';
import type { ThemeColors } from '@/theme/palette';

type Blob = {
  size: number;
  color: string;
  opacity: number;
  style: { top?: number; left?: number; right?: number; bottom?: number };
};

const variantsFor = (colors: ThemeColors): Record<string, Blob[]> => ({
  default: [
    { size: 260, color: colors.blobMint, opacity: 0.75, style: { left: -60, top: 110 } },
    { size: 240, color: colors.blobViolet, opacity: 0.8, style: { right: -70, top: 60 } },
    { size: 220, color: colors.blobPeach, opacity: 0.7, style: { right: -30, top: 330 } },
  ],
  B1: [
    { size: 240, color: colors.blobViolet, opacity: 0.8, style: { right: -90, top: -40 } },
    { size: 220, color: colors.blobMint, opacity: 0.7, style: { left: -100, top: 300 } },
    { size: 200, color: colors.blobPeach, opacity: 0.7, style: { right: -60, bottom: 40 } },
  ],
  B2: [
    { size: 260, color: colors.blobMint, opacity: 0.8, style: { left: -80, top: 80 } },
    { size: 240, color: colors.blobViolet, opacity: 0.85, style: { right: -80, top: 40 } },
    { size: 200, color: colors.blobPeach, opacity: 0.8, style: { left: 100, bottom: -40 } },
  ],
});

const BlobCircle = ({ id, blob }: { id: string; blob: Blob }) => (
  <View
    pointerEvents="none"
    style={[styles.blob, blob.style, { width: blob.size, height: blob.size }]}
    accessible={false}
    importantForAccessibility="no-hide-descendants"
  >
    <Svg width={blob.size} height={blob.size}>
      <Defs>
        <RadialGradient id={id} cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor={blob.color} stopOpacity={blob.opacity} />
          <Stop offset="100%" stopColor={blob.color} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Circle cx={blob.size / 2} cy={blob.size / 2} r={blob.size / 2} fill={`url(#${id})`} />
    </Svg>
  </View>
);

export const BlobBackground = ({ variant = 'default' }: { variant?: 'default' | 'B1' | 'B2' }) => {
  const colors = useThemeColors();
  const blobs = useMemo(() => {
    const map = variantsFor(colors);
    return map[variant] ?? map.default;
  }, [colors, variant]);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill} accessible={false}>
      {blobs.map((blob, index) => (
        <BlobCircle key={`${variant}-${index}-${blob.color}`} id={`blob-${variant}-${index}`} blob={blob} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  blob: {
    position: 'absolute',
  },
});
