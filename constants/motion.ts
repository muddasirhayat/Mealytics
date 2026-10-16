import { Easing } from 'react-native-reanimated';

export const motion = {
  spring: { damping: 18, stiffness: 220, mass: 0.9 },
  springSoft: { damping: 22, stiffness: 160, mass: 0.9 },
  duration: {
    fast: 150,
    base: 220,
    slow: 320,
  },
  easing: Easing.out(Easing.cubic),
  pressScale: 0.97,
  listStaggerMs: 30,
  listStaggerCap: 8,
  searchDebounceMs: 250,
  persistDebounceMs: 300,
} as const;
