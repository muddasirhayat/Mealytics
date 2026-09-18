import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

export const LoadingState = ({ message = 'Loading...' }: { message?: string }) => (
  <View style={styles.container}>
    <ActivityIndicator size="large" color={colors.primary} />
    <Text style={styles.message}>{message}</Text>
  </View>
);

export const ErrorState = ({
  message = 'Something went wrong.',
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) => (
  <View style={styles.container}>
    <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
    <Text style={styles.errorText}>{message}</Text>
    {onRetry ? (
      <TouchableOpacity style={styles.retryButton} onPress={onRetry} accessibilityRole="button">
        <Text style={styles.retryText}>Try again</Text>
      </TouchableOpacity>
    ) : null}
  </View>
);

export const EmptyState = ({
  message = 'No results found.',
  icon = 'search-outline',
}: {
  message?: string;
  icon?: keyof typeof Ionicons.glyphMap;
}) => (
  <View style={styles.container}>
    <Ionicons name={icon} size={48} color={colors.textMuted} />
    <Text style={styles.message}>{message}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    minHeight: 200,
  },
  message: {
    ...typography.bodyLarge,
    color: colors.textSecondary,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  errorText: {
    ...typography.bodyLarge,
    color: colors.error,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: spacing.md,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 12,
  },
  retryText: {
    ...typography.bodyMedium,
    color: colors.surface,
    fontWeight: '700',
  },
});
