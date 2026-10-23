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
import { lightColors } from '@/theme/palette';
import { useThemeStore } from '@/store/themeStore';
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
  const c = lightColors;
  return (
    <View style={[styles.errorContainer, { backgroundColor: c.bg }]}>
      <Text style={[styles.errorTitle, { color: c.ink }]}>Something went wrong</Text>
      <Text style={[styles.errorFriendly, { color: c.inkSecondary }]}>
        Mealytics hit an unexpected problem. Your food log is still on this device.
      </Text>
      {__DEV__ ? (
        <Text style={[styles.errorMessage, { color: c.inkMuted }]}>{error.message}</Text>
      ) : null}
      <Pressable
        onPress={retry}
        style={[styles.retryButton, { backgroundColor: c.accent }]}
        accessibilityRole="button"
      >
        <Text style={[styles.retryText, { color: c.onAccent }]}>Try again</Text>
      </Pressable>
      <Pressable
        onPress={() => router.replace('/')}
        style={styles.secondaryButton}
        accessibilityRole="button"
      >
        <Text style={[styles.secondaryText, { color: c.accent }]}>Go to Today</Text>
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
  const themeHydrated = useThemeStore((state) => state.isHydrated);
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

  const ready =
    (fontsLoaded || Boolean(fontError)) && isHydrated && onboardingHydrated && themeHydrated;
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
              backgroundColor: colors.bg,
            },
            headerTintColor: colors.ink,
            headerShadowVisible: false,
            contentStyle: {
              backgroundColor: colors.bg,
            },
            animation: 'slide_from_right',
            animationDuration: 280,
            gestureEnabled: true,
          }}
        >
          <Stack.Protected guard={showOnboarding}>
            <Stack.Screen name="onboarding" options={{ headerShown: false }} />
          </Stack.Protected>
          <Stack.Protected guard={hasOnboarded}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="search"
              options={{ headerShown: false, animation: 'fade_from_bottom' }}
            />
            <Stack.Screen name="meal/draft" options={{ headerShown: false }} />
            <Stack.Screen
              name="food/custom"
              options={{ headerShown: false, animation: 'fade_from_bottom' }}
            />
            <Stack.Screen
              name="food/[id]"
              options={{ headerShown: false, animation: 'fade_from_bottom' }}
            />
          </Stack.Protected>
          <Stack.Screen name="+not-found" options={{ headerShown: false }} />
        </Stack>
      </ToastProvider>
    </AnimatedSplashScreen>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={[styles.flex, { backgroundColor: lightColors.bg }]}>
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
  },
  errorTitle: {
    ...typography.header,
    textAlign: 'center',
  },
  errorFriendly: {
    ...typography.bodyMedium,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  errorMessage: {
    ...typography.caption,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  retryButton: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 12,
  },
  retryText: {
    ...typography.title,
  },
  secondaryButton: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  secondaryText: {
    ...typography.bodyMedium,
    fontWeight: '700',
  },
});
