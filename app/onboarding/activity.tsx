import React from 'react';
import { ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { OnboardingShell } from '@/components/onboarding/OnboardingShell';
import { SelectRow } from '@/components/onboarding/SelectRow';
import { useOnboardingStore } from '@/store/onboardingStore';
import { safeBack } from '@/utils/navigation';
import { ACTIVITY_OPTIONS } from '@/constants/profileOptions';

export default function OnboardingActivity() {
  const router = useRouter();
  const activityLevel = useOnboardingStore((s) => s.activityLevel);
  const patch = useOnboardingStore((s) => s.patch);

  return (
    <OnboardingShell
      step={7}
      title="How active are you?"
      subtitle="Think about a normal week."
      blobs="B2"
      cta="See my plan"
      onBack={() => safeBack('/onboarding')}
      onContinue={() => router.push('/onboarding/results')}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View>
          {ACTIVITY_OPTIONS.map((option) => (
            <SelectRow
              key={option.value}
              label={option.label}
              description={option.description}
              icon={option.icon}
              selected={activityLevel === option.value}
              onPress={() => patch({ activityLevel: option.value })}
            />
          ))}
        </View>
      </ScrollView>
    </OnboardingShell>
  );
}
