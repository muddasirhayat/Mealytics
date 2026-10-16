import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { OnboardingShell } from '@/components/onboarding/OnboardingShell';
import { SelectRow } from '@/components/onboarding/SelectRow';
import { useOnboardingStore } from '@/store/onboardingStore';
import { safeBack } from '@/utils/navigation';
import { GOAL_OPTIONS } from '@/constants/profileOptions';

export default function OnboardingGoal() {
  const router = useRouter();
  const goalType = useOnboardingStore((s) => s.goalType);
  const patch = useOnboardingStore((s) => s.patch);

  return (
    <OnboardingShell
      step={2}
      title={'What is your\nmain goal?'}
      subtitle="Pick one. You can change it later in Profile."
      blobs="B2"
      cta="Continue"
      onBack={() => safeBack('/onboarding')}
      onContinue={() => router.push('/onboarding/gender')}
    >
      <View>
        {GOAL_OPTIONS.map((option) => (
          <SelectRow
            key={option.value}
            label={option.label}
            description={option.description}
            icon={option.icon}
            selected={goalType === option.value}
            onPress={() => patch({ goalType: option.value })}
          />
        ))}
      </View>
    </OnboardingShell>
  );
}
