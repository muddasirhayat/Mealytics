import React from 'react';
import { useRouter } from 'expo-router';
import { OnboardingShell } from '@/components/onboarding/OnboardingShell';
import { AgeWheel } from '@/components/onboarding/AgeWheel';
import { useOnboardingStore } from '@/store/onboardingStore';
import { safeBack } from '@/utils/navigation';

export default function OnboardingAge() {
  const router = useRouter();
  const age = useOnboardingStore((s) => s.age);
  const patch = useOnboardingStore((s) => s.patch);

  return (
    <OnboardingShell
      step={4}
      title="How old are you?"
      subtitle="Age changes how much energy your body uses."
      cta="Continue"
      onBack={() => safeBack('/onboarding')}
      onContinue={() => router.push('/onboarding/height')}
    >
      <AgeWheel value={age} onChange={(next) => patch({ age: next })} />
    </OnboardingShell>
  );
}
