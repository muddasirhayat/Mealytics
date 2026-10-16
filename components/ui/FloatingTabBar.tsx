import React from 'react';
import { Platform, Pressable, StyleSheet, Text, type View as RNView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useResolvedScheme, useThemeColors } from '@/hooks/useThemeColors';
import { radius } from '@/theme/radius';
import { typography } from '@/theme/typography';
import { centerTabShadow } from '@/utils/shadow';
import {
  TAB_BAR_BOTTOM_OFFSET,
  TAB_BAR_HEIGHT,
  TAB_BAR_SIDE_INSET,
} from '@/constants/layout';

type TabItem = {
  routeName: string;
  label: string;
  icon: keyof typeof Feather.glyphMap;
};

const ITEMS: TabItem[] = [
  { routeName: 'index', label: 'Today', icon: 'home' },
  { routeName: 'logs', label: 'Logs', icon: 'list' },
  { routeName: 'add', label: 'Add', icon: 'plus' },
  { routeName: 'quickmeals', label: 'Quick', icon: 'zap' },
  { routeName: 'profile', label: 'Profile', icon: 'user' },
];

type TabRoute = { key: string; name: string; params?: object };

type FloatingTabBarProps = {
  state: { index: number; routes: TabRoute[] };
  navigation: {
    emit: (event: { type: 'tabPress'; target: string; canPreventDefault: true }) => {
      defaultPrevented: boolean;
    };
    navigate: (name: string, params?: object) => void;
  };
  blurTargetRef: React.RefObject<RNView | null>;
};

function FloatingTabBarInner({ state, navigation, blurTargetRef }: FloatingTabBarProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const colors = useThemeColors();
  const scheme = useResolvedScheme();

  return (
    <BlurView
      tint={scheme === 'dark' ? 'dark' : 'light'}
      intensity={Platform.OS === 'android' ? 22 : 40}
      blurTarget={blurTargetRef}
      blurMethod="dimezisBlurViewSdk31Plus"
      style={[
        styles.bar,
        {
          bottom: TAB_BAR_BOTTOM_OFFSET + insets.bottom,
          backgroundColor: colors.glass,
          borderColor: colors.glassBorder,
        },
      ]}
    >
      {ITEMS.map((item) => {
        const routeIndex = state.routes.findIndex((route) => route.name === item.routeName);
        const focused = state.index === routeIndex;
        const color = focused ? colors.accent : colors.muted;

        if (item.routeName === 'add') {
          return (
            <Pressable
              key={item.routeName}
              onPress={() => router.push('/search')}
              accessibilityRole="button"
              accessibilityLabel="Add food"
              hitSlop={6}
              style={[styles.center, centerTabShadow(), { backgroundColor: colors.accent }]}
            >
              <Feather name="plus" size={28} color={colors.textInverse} accessible={false} />
            </Pressable>
          );
        }

        return (
          <Pressable
            key={item.routeName}
            onPress={() => {
              const route = state.routes[routeIndex];
              if (!route) return;
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true as const,
              });
              if (!focused && !event.defaultPrevented) {
                navigation.navigate(route.name, route.params);
              }
            }}
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={item.label}
            style={styles.item}
          >
            <Feather name={item.icon} size={23} color={color} accessible={false} />
            <Text style={[styles.label, { color }]}>{item.label}</Text>
          </Pressable>
        );
      })}
    </BlurView>
  );
}

export const FloatingTabBar = React.memo(FloatingTabBarInner);

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: TAB_BAR_SIDE_INSET,
    right: TAB_BAR_SIDE_INSET,
    height: TAB_BAR_HEIGHT,
    borderRadius: radius.tabBar,
    overflow: 'hidden',
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 6,
  },
  item: {
    width: 60,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    minHeight: 44,
  },
  label: {
    ...typography.tabLabel,
  },
  center: {
    width: 58,
    height: 58,
    borderRadius: radius.centerTab,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
