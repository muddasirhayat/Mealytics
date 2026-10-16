import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { PrimaryButton, Screen } from '@/components/ui';
import { useOnboardingStore } from '@/store/onboardingStore';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/fonts';
import { inset, raise } from '@/utils/shadow';

export default function OnboardingDone() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const name = useOnboardingStore((s) => s.name);
  const reset = useOnboardingStore((s) => s.reset);
  const setCelebrating = useOnboardingStore((s) => s.setCelebrating);

  const finish = (href: '/' | '/search') => {
    router.replace(href);
    setCelebrating(false);
    reset();
  };

  return (
    <Screen blobs="B2" padded={false} edges={{ top: true, bottom: false }}>
      <View style={styles.body}>
        <View style={[styles.outer, raise()]} accessible={false}>
          <View style={[styles.inner, inset()]}>
            <View style={styles.check}>
              <Feather name="check" size={50} color={colors.textInverse} />
            </View>
          </View>
        </View>
        <Text style={styles.title}>
          You are all set,{'\n'}
          {name.trim() || 'there'}
        </Text>
        <Text style={styles.sub}>
          Log your first meal and we will keep count of{'\n'}calories, macros and water.
        </Text>
      </View>
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 24) }]}>
        <PrimaryButton label="Log my first meal" icon="plus" onPress={() => finish('/search')} />
        <Pressable
          onPress={() => finish('/')}
          accessibilityRole="button"
          accessibilityLabel="Go to Today"
          style={styles.secondary}
        >
          <Text style={styles.secondaryText}>Go to Today</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  outer: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: colors.base,
    marginTop: 110,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: {
    width: 152,
    height: 152,
    borderRadius: 76,
    backgroundColor: colors.base,
    alignItems: 'center',
    justifyContent: 'center',
  },
  check: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: fonts.outfitBold,
    fontSize: 36,
    fontWeight: '700',
    letterSpacing: -1.2,
    lineHeight: 42,
    textAlign: 'center',
    marginTop: 48,
    color: colors.ink,
  },
  sub: {
    fontFamily: fonts.manropeMedium,
    fontSize: 15.5,
    fontWeight: '500',
    lineHeight: 23,
    textAlign: 'center',
    marginTop: 14,
    color: colors.muted,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  secondary: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  secondaryText: {
    fontFamily: fonts.manropeBold,
    fontSize: 15,
    fontWeight: '700',
    color: colors.accent,
  },
});
