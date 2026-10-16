import React, { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { useThemeStore } from '@/store/themeStore';
import { resolveScheme } from '@/hooks/useTheme';
import { setActiveColors } from '@/theme/runtime';

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const preference = useThemeStore((s) => s.preference);
  const system = useColorScheme();
  const scheme = resolveScheme(preference, system);

  // Sync before paint so shadow helpers (isDarkScheme) match useTheme() on the same frame.
  setActiveColors(scheme);

  useEffect(() => {
    if (useThemeStore.persist.hasHydrated()) {
      useThemeStore.setState({ isHydrated: true });
    }
    return useThemeStore.persist.onFinishHydration(() => {
      useThemeStore.setState({ isHydrated: true });
    });
  }, []);

  return <>{children}</>;
};
