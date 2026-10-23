import React, { useEffect, useRef } from 'react';
import { useColorScheme } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useThemeStore } from '@/store/themeStore';
import { resolveScheme } from '@/hooks/useTheme';
import { paletteFor } from '@/theme/palette';
import { setActiveColors } from '@/theme/runtime';
import { applySystemChrome } from '@/utils/systemChrome';
import { motion } from '@/constants/motion';

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const preference = useThemeStore((s) => s.preference);
  const system = useColorScheme();
  const scheme = resolveScheme(preference, system);
  const colors = paletteFor(scheme);

  setActiveColors(scheme);

  const fade = useSharedValue(0);
  useEffect(() => {
    applySystemChrome(colors, scheme);
  }, [colors, scheme]);

  const firstScheme = useRef(true);
  useEffect(() => {
    if (firstScheme.current) {
      firstScheme.current = false;
      return;
    }
    fade.value = 0.18;
    fade.value = withTiming(0, { duration: motion.duration.base });
  }, [scheme, fade]);

  useEffect(() => {
    if (useThemeStore.persist.hasHydrated()) {
      useThemeStore.setState({ isHydrated: true });
    }
    return useThemeStore.persist.onFinishHydration(() => {
      useThemeStore.setState({ isHydrated: true });
    });
  }, []);

  const fadeStyle = useAnimatedStyle(() => ({
    opacity: fade.value,
    backgroundColor: colors.bg,
  }));

  return (
    <Animated.View style={{ flex: 1, backgroundColor: colors.bg }}>
      {children}
      <Animated.View pointerEvents="none" style={[StyleSheetAbsolute, fadeStyle]} />
    </Animated.View>
  );
};

const StyleSheetAbsolute = {
  position: 'absolute' as const,
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
};
