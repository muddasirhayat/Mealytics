import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GlassCard, LogoMark, PrimaryButton, Screen } from '@/components/ui';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/fonts';
import { inset, raise } from '@/utils/shadow';
import { openExternalUrl } from '@/utils/linking';
import { PRIVACY_POLICY_URL, TERMS_URL } from '@/constants/links';
import { useToast } from '@/components/ui/Toast';
import Svg, { Circle, Path } from 'react-native-svg';

export default function OnboardingWelcome() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { show } = useToast();

  const openLink = async (url: string) => {
    const ok = await openExternalUrl(url);
    if (!ok) show('Could not open link');
  };

  return (
    <Screen blobs="default" padded={false} edges={{ top: true, bottom: false }}>
      <View style={styles.body}>
        <View style={styles.logoWrap}>
          <LogoMark />
        </View>
        <GlassCard padding={0} radiusValue={36} style={styles.hero}>
          <View style={[styles.outerRing, raise()]} accessible={false} />
          <View style={[styles.innerRing, inset()]} accessible={false}>
            <Svg width={64} height={64} viewBox="0 0 24 24">
              <Circle cx="12" cy="12" r="8.5" fill="none" stroke={colors.accent} strokeWidth="2.6" />
              <Path d="M12 3.5A8.5 8.5 0 0 1 20.5 12H12z" fill={colors.mint} />
            </Svg>
          </View>
          <View style={styles.chipLeft}>
            <Text style={styles.chipText}>2,987 kcal goal</Text>
          </View>
          <View style={styles.chipRight}>
            <Text style={styles.chipText}>P 224 · C 336 · F 83</Text>
          </View>
        </GlassCard>
        <Text style={styles.title}>Eat well,{'\n'}track softly</Text>
        <Text style={styles.sub}>
          Calories, macros and water,{'\n'}calm and clear in one place.
        </Text>
      </View>
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 24) }]}>
        <PrimaryButton label="Get started" onPress={() => router.push('/onboarding/intro')} />
        <Text style={styles.footnote}>Your data stays on this device</Text>
        <View style={styles.legalRow}>
          <Pressable onPress={() => void openLink(PRIVACY_POLICY_URL)} accessibilityRole="link" style={styles.legalHit}>
            <Text style={styles.legal}>Privacy Policy</Text>
          </Pressable>
          <Text style={styles.legalDot}>·</Text>
          <Pressable onPress={() => void openLink(TERMS_URL)} accessibilityRole="link" style={styles.legalHit}>
            <Text style={styles.legal}>Terms</Text>
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  logoWrap: {
    alignItems: 'center',
  },
  hero: {
    height: 300,
    marginTop: 44,
    marginHorizontal: 6,
    overflow: 'hidden',
  },
  outerRing: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: colors.base,
    left: '50%',
    top: '50%',
    marginLeft: -90,
    marginTop: -90,
  },
  innerRing: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: colors.base,
    left: '50%',
    top: '50%',
    marginLeft: -65,
    marginTop: -65,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipLeft: {
    position: 'absolute',
    left: 18,
    top: 24,
    backgroundColor: colors.glass,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipRight: {
    position: 'absolute',
    right: 18,
    bottom: 26,
    backgroundColor: colors.glass,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipText: {
    fontFamily: fonts.outfitSemiBold,
    fontSize: 14,
    fontWeight: '600',
    color: colors.ink,
  },
  title: {
    fontFamily: fonts.outfitBold,
    fontSize: 36,
    fontWeight: '700',
    letterSpacing: -1.2,
    lineHeight: 42,
    textAlign: 'center',
    marginTop: 44,
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
  footnote: {
    fontFamily: fonts.manropeMedium,
    fontSize: 12.5,
    fontWeight: '500',
    color: colors.muted,
    textAlign: 'center',
    marginTop: 12,
  },
  legalRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  legalHit: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  legal: {
    fontFamily: fonts.manropeBold,
    fontSize: 12.5,
    fontWeight: '700',
    color: colors.accent,
  },
  legalDot: {
    fontFamily: fonts.manropeBold,
    fontSize: 12.5,
    color: colors.muted,
  },
});
