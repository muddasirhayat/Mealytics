import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Image,
} from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';

// Prevent native splash screen from auto-hiding until we take over
SplashScreen.preventAutoHideAsync().catch(() => {});

interface AnimatedSplashScreenProps {
  onFinish?: () => void;
  children: React.ReactNode;
}

export const AnimatedSplashScreen = ({
  onFinish,
  children,
}: AnimatedSplashScreenProps) => {
  const [animationDone, setAnimationDone] = useState(false);

  // Animation values — lazy useState keeps a stable Animated.Value without reading refs during render
  const [logoScale] = useState(() => new Animated.Value(0.7));
  const [logoOpacity] = useState(() => new Animated.Value(0));
  const [pulseRingScale] = useState(() => new Animated.Value(0.8));
  const [pulseRingOpacity] = useState(() => new Animated.Value(0.6));
  const [textOpacity] = useState(() => new Animated.Value(0));
  const [textTranslateY] = useState(() => new Animated.Value(20));
  const [splashContainerOpacity] = useState(() => new Animated.Value(1));

  useEffect(() => {
    // Hide the static native splash as soon as our React component is mounted
    SplashScreen.hideAsync().catch(() => {});

    // Run entrance sequence
    Animated.parallel([
      // 1. Logo Scale & Pop
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 40,
        friction: 5,
        useNativeDriver: true,
      }),
      // 2. Logo Fade In
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      // 3. Pulse Glow Ring
      Animated.sequence([
        Animated.delay(200),
        Animated.parallel([
          Animated.timing(pulseRingScale, {
            toValue: 1.4,
            duration: 900,
            useNativeDriver: true,
          }),
          Animated.timing(pulseRingOpacity, {
            toValue: 0,
            duration: 900,
            useNativeDriver: true,
          }),
        ]),
      ]),
      // 4. Text Slide Up & Fade In
      Animated.sequence([
        Animated.delay(350),
        Animated.parallel([
          Animated.timing(textOpacity, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(textTranslateY, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ]).start(() => {
      // Hold for a brief second so user sees the beautiful branding, then smoothly fade out
      setTimeout(() => {
        Animated.timing(splashContainerOpacity, {
          toValue: 0,
          duration: 450,
          useNativeDriver: true,
        }).start(() => {
          setAnimationDone(true);
          onFinish?.();
        });
      }, 900);
    });
  }, [
    logoOpacity,
    logoScale,
    onFinish,
    pulseRingOpacity,
    pulseRingScale,
    splashContainerOpacity,
    textOpacity,
    textTranslateY,
  ]);

  return (
    <View style={styles.root}>
      {children}

      {!animationDone && (
        <Animated.View
          style={[
            styles.splashOverlay,
            { opacity: splashContainerOpacity },
          ]}
          pointerEvents="none"
        >
          {/* Glowing Pulse Ring */}
          <Animated.View
            style={[
              styles.pulseRing,
              {
                transform: [{ scale: pulseRingScale }],
                opacity: pulseRingOpacity,
              },
            ]}
          />

          {/* Animated Logo */}
          <Animated.View
            style={[
              styles.logoWrapper,
              {
                transform: [{ scale: logoScale }],
                opacity: logoOpacity,
              },
            ]}
          >
            <Image
              source={require('@/assets/images/logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </Animated.View>

          {/* Animated Brand Typography */}
          <Animated.View
            style={[
              styles.textContainer,
              {
                opacity: textOpacity,
                transform: [{ translateY: textTranslateY }],
              },
            ]}
          >
            <Text style={styles.brandTitle}>Mealytics</Text>
            <Text style={styles.brandTagline}>Personal Nutrition & Meal Tracking</Text>
            <View style={styles.badgePill}>
              <View style={styles.greenDot} />
              <Text style={styles.badgeText}>On-device meal tracking</Text>
            </View>
          </Animated.View>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  splashOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 99999,
    elevation: 99999,
  },
  pulseRing: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(16, 185, 129, 0.25)',
  },
  logoWrapper: {
    width: 140,
    height: 140,
    borderRadius: 35,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
    marginBottom: 24,
  },
  logoImage: {
    width: 130,
    height: 130,
    borderRadius: 30,
  },
  textContainer: {
    alignItems: 'center',
    gap: 6,
  },
  brandTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: -0.5,
  },
  brandTagline: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginTop: 14,
    gap: 6,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primaryDark,
  },
  badgeText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.primaryDark,
    fontSize: 11,
  },
});
