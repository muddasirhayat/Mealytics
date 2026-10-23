import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { useMealStore } from '@/store/mealStore';
import { useTheme } from '@/hooks/useTheme';
import { fonts } from '@/theme/fonts';
import { formatLogDate, isTodayMs } from '@/utils/date';

export const LoggingDateNote = () => {
  const draftDate = useMealStore((state) => state.draftDate);
  const { colors } = useTheme();
  if (isTodayMs(draftDate)) return null;
  return (
    <Text style={[styles.note, { color: colors.accent }]} accessibilityLiveRegion="polite">
      Logging for {formatLogDate(draftDate)}
    </Text>
  );
};

const styles = StyleSheet.create({
  note: {
    fontFamily: fonts.outfitSemiBold,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
});
