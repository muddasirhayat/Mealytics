import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router, Stack, type ErrorBoundaryProps } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import {
  Outfit_500Medium,
  Outfit_600SemiBold,
  Outfit_700Bold,
} from '@expo-google-fonts/outfit';
import {
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
} from '@expo-google-fonts/manrope';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useThemeColors, useResolvedScheme } from '@/hooks/useThemeColors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { AnimatedSplashScreen } from '@/components/AnimatedSplashScreen';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { ToastProvider } from '@/components/ui/Toast';
import { useUserStore } from '@/store/userStore';
import { useOnboardingStore } from '@/store/onboardingStore';
import { runMigrations } from '@/storage/migrations';
import { prefetchLocalFoods } from '@/services/food/localFoods';

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorTitle}>Something went wrong</Text>
      <Text style={styles.errorFriendly}>
        Mealytics hit an unexpected problem. Your food log is still on this device.
      </Text>
      {__DEV__ ? (
        <Text style={styles.errorMessage}>{error.message}</Text>
      ) : null}
      <Pressable onPress={retry} style={styles.retryButton} accessibilityRole="button">
        <Text style={styles.retryText}>Try again</Text>
      </Pressable>
      <Pressable
        onPress={() => router.replace('/')}
        style={styles.secondaryButton}
        accessibilityRole="button"
      >
        <Text style={styles.secondaryText}>Go to Today</Text>
      </Pressable>
    </View>
  );
}

function RootNavigator() {
  const loadProfile = useUserStore((state) => state.loadProfile);
  const isHydrated = useUserStore((state) => state.isHydrated);
  const hasOnboarded = useUserStore((state) => state.hasOnboarded);
  const celebrating = useOnboardingStore((state) => state.celebrating);
  const onboardingHydrated = useOnboardingStore((state) => state.isHydrated);
  const colors = useThemeColors();
  const scheme = useResolvedScheme();
  const [fontsLoaded, fontError] = useFonts({
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
  });

  useEffect(() => {
    void (async () => {
      await runMigrations();
      await loadProfile();
    })();
  }, [loadProfile]);

  useEffect(() => {
    if (useOnboardingStore.persist.hasHydrated()) {
      useOnboardingStore.setState({ isHydrated: true });
    }
    return useOnboardingStore.persist.onFinishHydration(() => {
      useOnboardingStore.setState({ isHydrated: true });
    });
  }, []);

  const ready = (fontsLoaded || Boolean(fontError)) && isHydrated && onboardingHydrated;
  const showOnboarding = !hasOnboarded || celebrating;

  useEffect(() => {
    if (ready) prefetchLocalFoods();
  }, [ready]);

  return (
    <AnimatedSplashScreen ready={ready}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <ToastProvider>
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: colors.base,
            },
            headerTintColor: colors.ink,
            headerShadowVisible: false,
            contentStyle: {
              backgroundColor: colors.base,
            },
          }}
        >
          <Stack.Protected guard={showOnboarding}>
            <Stack.Screen name="onboarding" options={{ headerShown: false }} />
          </Stack.Protected>
          <Stack.Protected guard={hasOnboarded}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="search" options={{ headerShown: false }} />
            <Stack.Screen name="meal/draft" options={{ headerShown: false }} />
            <Stack.Screen name="food/custom" options={{ headerShown: false }} />
            <Stack.Screen name="food/[id]" options={{ headerShown: false }} />
          </Stack.Protected>
          <Stack.Screen name="+not-found" options={{ headerShown: false }} />
        </Stack>
      </ToastProvider>
    </AnimatedSplashScreen>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.flex}>
      <ThemeProvider>
        <RootNavigator />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    backgroundColor: '#E6EBF2',
  },
  errorTitle: {
    ...typography.header,
    color: '#1E2533',
    textAlign: 'center',
  },
  errorFriendly: {
    ...typography.bodyMedium,
    color: '#5F6B7E',
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  errorMessage: {
    ...typography.caption,
    color: '#7A8597',
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  retryButton: {
    marginTop: spacing.lg,
    backgroundColor: '#5B5FEF',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 12,
  },
  retryText: {
    ...typography.title,
    color: '#FFFFFF',
  },
  secondaryButton: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  secondaryText: {
    ...typography.bodyMedium,
    color: '#5B5FEF',
    fontWeight: '700',
  },
});
