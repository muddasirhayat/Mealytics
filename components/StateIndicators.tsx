import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

export const LoadingState = ({
  message = 'Loading...',
  compact = false,
}: {
  message?: string;
  compact?: boolean;
}) => {
  const { colors } = useTheme();
  return (
    <View style={[styles.container, compact && styles.compact]}>
      <ActivityIndicator size="large" color={colors.accent} />
      <Text style={[styles.message, { color: colors.inkSecondary }]}>{message}</Text>
    </View>
  );
};

export const ErrorState = ({
  message = 'Something went wrong.',
  onRetry,
  compact = false,
}: {
  message?: string;
  onRetry?: () => void;
  compact?: boolean;
}) => {
  const { colors } = useTheme();
  return (
    <View style={[styles.container, compact && styles.compact]}>
      <Ionicons name="alert-circle-outline" size={48} color={colors.danger} />
      <Text style={[styles.errorText, { color: colors.danger }]}>{message}</Text>
      {onRetry ? (
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: colors.accent }]}
          onPress={onRetry}
          accessibilityRole="button"
        >
          <Text style={[styles.retryText, { color: colors.onAccent }]}>Try again</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

export const EmptyState = ({
  message = 'No results found.',
  icon = 'search-outline',
  compact = false,
}: {
  message?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  compact?: boolean;
}) => {
  const { colors } = useTheme();
  return (
    <View style={[styles.container, compact && styles.compact]}>
      <Ionicons name={icon} size={48} color={colors.inkMuted} />
      <Text style={[styles.message, { color: colors.inkSecondary }]}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    minHeight: 200,
  },
  compact: {
    flex: 0,
    justifyContent: 'flex-start',
    minHeight: 0,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  message: {
    ...typography.bodyLarge,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  errorText: {
    ...typography.bodyLarge,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 12,
  },
  retryText: {
    ...typography.title,
  },
});
