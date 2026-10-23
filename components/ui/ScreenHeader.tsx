import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useThemeColors } from '@/hooks/useThemeColors';
import { typography } from '@/theme/typography';

type ScreenHeaderProps = {
  title: string;
  right?: React.ReactNode;
};

export const ScreenHeader = ({ title, right }: ScreenHeaderProps) => {
  const colors = useThemeColors();
  return (
    <View style={styles.row}>
      <Text style={[styles.title, { color: colors.ink }]} numberOfLines={2}>
        {title}
      </Text>
      {right}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    ...typography.screenHeader,
    flex: 1,
    flexShrink: 1,
  },
});
