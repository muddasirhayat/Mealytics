import React from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { spacing } from '@/theme/spacing';
import { BlobBackground } from '@/components/ui/BlobBackground';

type ScreenProps = {
  children: React.ReactNode;
  blobs?: 'default' | 'B1' | 'B2';
  padded?: boolean;
  style?: ViewStyle;
  edges?: { top?: boolean; bottom?: boolean };
};

export const Screen = ({
  children,
  blobs = 'default',
  padded = true,
  style,
  edges = { top: true, bottom: false },
}: ScreenProps) => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.root,
        {
          backgroundColor: colors.bg,
          paddingTop: edges.top ? insets.top : 0,
          paddingBottom: edges.bottom ? insets.bottom : 0,
        },
        style,
      ]}
    >
      <BlobBackground variant={blobs} />
      <View style={[styles.content, padded && styles.padded]}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { flex: 1 },
  padded: {
    paddingHorizontal: spacing.screenX,
    paddingTop: spacing.screenTop,
  },
});
