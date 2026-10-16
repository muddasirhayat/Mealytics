import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { OnboardingShell } from '@/components/onboarding/OnboardingShell';
import { Ruler } from '@/components/onboarding/Ruler';
import { Segmented } from '@/components/ui/Segmented';
import { useOnboardingStore } from '@/store/onboardingStore';
import { safeBack } from '@/utils/navigation';
import { HEIGHT_CM_MAX, HEIGHT_CM_MIN } from '@/constants/profileOptions';
import { cmToFtIn, formatFtIn, ftInToCm } from '@/utils/units';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/fonts';
import type { UnitSystem } from '@/types/user';

export default function OnboardingHeight() {
  const router = useRouter();
  const heightCm = useOnboardingStore((s) => s.heightCm);
  const unitSystem = useOnboardingStore((s) => s.unitSystem);
  const patch = useOnboardingStore((s) => s.patch);

  const imperial = unitSystem === 'imperial';
  const { ft, inches } = cmToFtIn(heightCm);
  const totalInches = ft * 12 + inches;
  const display = imperial ? formatFtIn(heightCm) : String(Math.round(heightCm));
  const unit = imperial ? '' : 'cm';

  const setUnit = (next: UnitSystem) => patch({ unitSystem: next });

  return (
    <OnboardingShell
      step={5}
      title="How tall are you?"
      subtitle="Slide the ruler. Switch units any time."
      blobs="B2"
      cta="Continue"
      onBack={() => safeBack('/onboarding')}
      onContinue={() => router.push('/onboarding/weight')}
    >
      <View style={styles.center}>
        <Text style={styles.value} accessibilityLiveRegion="polite">
          {display}
          {unit ? <Text style={styles.unit}> {unit}</Text> : null}
        </Text>
        <View style={styles.seg}>
          <Segmented
            options={[
              { label: 'cm', value: 'metric' },
              { label: 'ft / in', value: 'imperial' },
            ]}
            value={unitSystem}
            onChange={setUnit}
            accessibilityLabel="Height units"
          />
        </View>
      </View>
      {imperial ? (
        <Ruler
          key="height-in"
          value={totalInches}
          min={39}
          max={98}
          step={1}
          majorEvery={6}
          accessibilityLabel="Height in inches"
          onChange={(next) => {
            const nextFt = Math.floor(next / 12);
            const nextIn = next % 12;
            patch({ heightCm: Math.min(HEIGHT_CM_MAX, Math.max(HEIGHT_CM_MIN, ftInToCm(nextFt, nextIn))) });
          }}
        />
      ) : (
        <Ruler
          key="height-cm"
          value={Math.round(heightCm)}
          min={HEIGHT_CM_MIN}
          max={HEIGHT_CM_MAX}
          step={1}
          majorEvery={5}
          accessibilityLabel="Height in centimeters"
          onChange={(next) => patch({ heightCm: next })}
        />
      )}
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
    color: colors.ink,
  },
  unit: {
    fontFamily: fonts.outfitSemiBold,
    fontSize: 20,
    fontWeight: '600',
    color: colors.muted,
  },
  seg: {
    width: 180,
    marginTop: 14,
  },
});
