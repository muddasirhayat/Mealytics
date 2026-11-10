import React from 'react';
import { useRouter } from 'expo-router';
import { OnboardingShell } from '@/components/onboarding/OnboardingShell';
import { AgeWheel } from '@/components/onboarding/AgeWheel';
import { useOnboardingStore } from '@/store/onboardingStore';
import { safeBack } from '@/utils/navigation';
import { AGE_MIN, AGE_MAX, ageValidationMessage } from '@/constants/profileOptions';

export default function OnboardingAge() {
  const router = useRouter();
  const age = useOnboardingStore((s) => s.age);
  const patch = useOnboardingStore((s) => s.patch);

  return (
    <OnboardingShell
      step={4}
      title="How old are you?"
      subtitle={`Mealytics is for ages ${AGE_MIN}–${AGE_MAX}. Age changes how much energy your body uses.`}
      cta="Continue"
      onBack={() => safeBack('/onboarding')}
      continueDisabled={Boolean(ageValidationMessage(age))}
      onContinue={() => {
        if (ageValidationMessage(age)) return;
        router.push('/onboarding/height');
      }}
      scroll={false}
    >
      <AgeWheel value={age} onChange={(next) => patch({ age: next })} />
    </OnboardingShell>
  );
}
