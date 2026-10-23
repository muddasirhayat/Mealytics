import React, { useCallback, useEffect, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import Animated, { Easing, runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import * as SplashScreen from 'expo-splash-screen';
import { useTheme } from '@/hooks/useTheme';

SplashScreen.preventAutoHideAsync().catch(() => {});
SplashScreen.setOptions({ duration: 280, fade: true });

type AnimatedSplashScreenProps = {
  onFinish?: () => void;
  children: React.ReactNode;
  ready?: boolean;
};

export const AnimatedSplashScreen = ({ onFinish, children, ready = true }: AnimatedSplashScreenProps) => {
  const { colors } = useTheme();
  const [animationDone, setAnimationDone] = useState(false);
  const overlayOpacity = useSharedValue(1);

  const finish = useCallback(() => {
    setAnimationDone(true);
    onFinish?.();
  }, [onFinish]);

  useEffect(() => {
    if (!ready || animationDone) return;
    let cancelled = false;
    const hide = async () => {
      await SplashScreen.hideAsync().catch(() => {});
      if (cancelled) return;
      overlayOpacity.value = withTiming(0, { duration: 220, easing: Easing.out(Easing.quad) }, (finished) => {
        if (finished) runOnJS(finish)();
      });
    };
    void hide();
    return () => {
      cancelled = true;
    };
  }, [ready, animationDone, finish, overlayOpacity]);

  const overlayStyle = useAnimatedStyle(() => ({ opacity: overlayOpacity.value }));

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      {children}
      {!animationDone ? (
        <Animated.View
          style={[styles.overlay, overlayStyle, { backgroundColor: colors.bg }]} 
          pointerEvents="none"
        >
          <Image
            source={require('@/assets/brand/logo.png')}
            style={styles.logo}
            resizeMode="contain"
            accessibilityLabel="Mealytics"
          />
        </Animated.View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 99999,
  },
  logo: {
    width: 96,
    height: 96,
  },
});
