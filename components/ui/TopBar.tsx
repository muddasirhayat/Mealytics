import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useThemeColors } from '@/hooks/useThemeColors';
import { typography } from '@/theme/typography';
import { IconSquare } from '@/components/ui/IconSquare';
import { safeBack } from '@/utils/navigation';

type TopBarProps = {
  title: string;
  onBack?: () => void;
  right?: React.ReactNode;
};

export const TopBar = ({ title, onBack, right }: TopBarProps) => {
  const colors = useThemeColors();
  return (
    <View style={styles.row}>
      <IconSquare
        name="chevron-left"
        onPress={onBack ?? (() => safeBack())}
        accessibilityLabel="Go back"
      />
      <Text style={[styles.title, { color: colors.ink }]}>{title}</Text>
      <View style={styles.right}>{right ?? <View style={styles.spacer} />}</View>
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
    ...typography.topTitle,
    flex: 1,
    textAlign: 'center',
  },
  right: {
    width: 46,
    alignItems: 'flex-end',
  },
  spacer: {
    width: 46,
    height: 46,
  },
});
