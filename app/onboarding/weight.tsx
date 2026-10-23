import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { OnboardingShell } from '@/components/onboarding/OnboardingShell';
import { Ruler } from '@/components/onboarding/Ruler';
import { Segmented } from '@/components/ui/Segmented';
import { useOnboardingStore } from '@/store/onboardingStore';
import { safeBack } from '@/utils/navigation';
import { HEIGHT_CM_MAX, HEIGHT_CM_MIN, WEIGHT_KG_MAX, WEIGHT_KG_MIN } from '@/constants/profileOptions';
import { getBmiCategory } from '@/utils/bmi';
import { kgToLbs, lbsToKg } from '@/utils/units';
import { useTheme } from '@/hooks/useTheme';
import { fonts } from '@/theme/fonts';
import type { UnitSystem } from '@/types/user';

export default function OnboardingWeight() {
  const router = useRouter();
  const { colors } = useTheme();
  const weightKg = useOnboardingStore((s) => s.weightKg);
  const heightCm = useOnboardingStore((s) => s.heightCm);
  const unitSystem = useOnboardingStore((s) => s.unitSystem);
  const patch = useOnboardingStore((s) => s.patch);

  const imperial = unitSystem === 'imperial';
  const lbs = kgToLbs(weightKg);
  const heightM = Math.min(HEIGHT_CM_MAX, Math.max(HEIGHT_CM_MIN, heightCm)) / 100;
  const bmi = Number((weightKg / (heightM * heightM)).toFixed(1));
  const category = getBmiCategory(bmi);

  const setUnit = (next: UnitSystem) => patch({ unitSystem: next });

  return (
    <OnboardingShell
      step={6}
      title={'What do you\nweigh now?'}
      subtitle="Your starting point, kept private on your phone."
      cta="Continue"
      onBack={() => safeBack('/onboarding')}
      onContinue={() => router.push('/onboarding/activity')}
      scroll={false}
    >
      <View style={styles.center}>
        <Text style={[styles.value, { color: colors.ink }]} accessibilityLiveRegion="polite">
          {imperial ? Math.round(lbs) : weightKg.toFixed(1)}
          <Text style={[styles.unit, { color: colors.inkMuted }]}> {imperial ? 'lb' : 'kg'}</Text>
        </Text>
        <View style={styles.seg}>
          <Segmented
            options={[
              { label: 'kg', value: 'metric' },
              { label: 'lb', value: 'imperial' },
            ]}
            value={unitSystem}
            onChange={setUnit}
            accessibilityLabel="Weight units"
          />
        </View>
      </View>
      {imperial ? (
        <Ruler
          key="weight-lb"
          value={Math.round(lbs)}
          min={66}
          max={660}
          step={1}
          majorEvery={10}
          accessibilityLabel="Weight in pounds"
          onChange={(next) => {
            patch({ weightKg: Math.min(WEIGHT_KG_MAX, Math.max(WEIGHT_KG_MIN, lbsToKg(next))) });
          }}
        />
      ) : (
        <Ruler
          key="weight-kg"
          value={weightKg}
          min={WEIGHT_KG_MIN}
          max={WEIGHT_KG_MAX}
          step={0.1}
          majorEvery={5}
          accessibilityLabel="Weight in kilograms"
          onChange={(next) => patch({ weightKg: next })}
        />
      )}
      <Text style={[styles.bmi, { color: colors.inkSecondary }]}>
        BMI {bmi} · {category.label.toLowerCase()}, we will set a steady, healthy pace
      </Text>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    marginTop: 40,
  },
  value: {
    fontFamily: fonts.outfitBold,
    fontSize: 64,
    fontWeight: '700',
    letterSpacing: -2,
  },
  unit: {
    fontFamily: fonts.outfitSemiBold,
    fontSize: 20,
    fontWeight: '600',
  },
  seg: {
    width: 180,
    marginTop: 14,
  },
  bmi: {
    fontFamily: fonts.manropeBold,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 18,
  },
});
