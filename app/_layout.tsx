import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Stack, type ErrorBoundaryProps } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { AnimatedSplashScreen } from '@/components/AnimatedSplashScreen';
import { useUserStore } from '@/store/userStore';

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorTitle}>Something went wrong</Text>
      <Text style={styles.errorMessage}>{error.message}</Text>
      <Pressable onPress={retry} style={styles.retryButton} accessibilityRole="button">
        <Text style={styles.retryText}>Try again</Text>
      </Pressable>
    </View>
  );
}

export default function RootLayout() {
  const loadProfile = useUserStore((state) => state.loadProfile);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  return (
    <AnimatedSplashScreen>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.surface,
          },
          headerTintColor: colors.text,
          headerShadowVisible: false,
          contentStyle: {
            backgroundColor: colors.background,
          },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="search" options={{ title: 'Search Food' }} />
        <Stack.Screen name="meal/draft" options={{ title: 'Current Meal' }} />
        <Stack.Screen name="food/custom" options={{ title: 'Custom food' }} />
        <Stack.Screen name="food/[id]" options={{ title: 'Food Details', presentation: 'modal' }} />
        <Stack.Screen name="+not-found" options={{ title: 'Not found' }} />
      </Stack>
    </AnimatedSplashScreen>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  errorTitle: {
    ...typography.header,
    color: colors.text,
    textAlign: 'center',
  },
  errorMessage: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  retryButton: {
    marginTop: spacing.lg,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 12,
  },
  retryText: {
    ...typography.title,
    color: colors.surface,
  },
});
