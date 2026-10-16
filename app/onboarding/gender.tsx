import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { OnboardingShell } from '@/components/onboarding/OnboardingShell';
import { useOnboardingStore } from '@/store/onboardingStore';
import { safeBack } from '@/utils/navigation';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/fonts';
import { inset, raise, raiseSm } from '@/utils/shadow';
import type { Gender } from '@/types/user';

const OPTIONS: { value: Gender; label: string; icon: keyof typeof Feather.glyphMap }[] = [
  { value: 'male', label: 'Male', icon: 'user' },
  { value: 'female', label: 'Female', icon: 'user' },
];

export default function OnboardingGender() {
  const router = useRouter();
  const gender = useOnboardingStore((s) => s.gender);
  const patch = useOnboardingStore((s) => s.patch);

  return (
    <OnboardingShell
      step={3}
      title="Your gender"
      subtitle="It helps us calculate your calorie needs."
      blobs="B2"
      cta="Continue"
      onBack={() => safeBack('/onboarding')}
      onContinue={() => router.push('/onboarding/age')}
    >
      <View style={styles.row}>
        {OPTIONS.map((option) => {
          const selected = gender === option.value;
          return (
            <Pressable
              key={option.value}
              onPress={() => patch({ gender: option.value })}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityLabel={option.label}
              style={[styles.card, selected ? inset() : raise(), { minHeight: 180 }]}
            >
              <View style={[styles.avatar, selected ? raiseSm() : inset()]}>
                <Feather name={option.icon} size={32} color={selected ? colors.accent : colors.muted} accessible={false} />
              </View>
              <Text style={[styles.label, selected && styles.labelOn]}>{option.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 18,
    marginTop: 40,
  },
  card: {
    flex: 1,
    height: 180,
    borderRadius: 28,
    backgroundColor: colors.base,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.base,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: fonts.outfitSemiBold,
    fontSize: 18,
    fontWeight: '600',
    color: colors.ink,
  },
  labelOn: {
    color: colors.accent,
  },
});
