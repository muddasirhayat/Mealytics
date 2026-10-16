import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { OnboardingShell } from '@/components/onboarding/OnboardingShell';
import { useOnboardingStore } from '@/store/onboardingStore';
import { safeBack } from '@/utils/navigation';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/fonts';
import { inset } from '@/utils/shadow';

export default function OnboardingName() {
  const router = useRouter();
  const name = useOnboardingStore((s) => s.name);
  const patch = useOnboardingStore((s) => s.patch);

  return (
    <OnboardingShell
      step={1}
      title={'What should we\ncall you?'}
      subtitle="We use it to greet you in the app."
      cta="Continue"
      onBack={() => safeBack('/onboarding')}
      onContinue={() => router.push('/onboarding/goal')}
      continueDisabled={name.trim().length === 0}
    >
      <View style={[styles.field, inset()]}>
        <TextInput
          value={name}
          onChangeText={(text) => patch({ name: text })}
          placeholder="Your name"
          placeholderTextColor={colors.placeholder}
          autoFocus
          autoCapitalize="words"
          autoCorrect={false}
          accessibilityLabel="Your name"
          style={styles.input}
        />
      </View>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  field: {
    marginTop: 36,
    height: 64,
    borderRadius: 20,
    backgroundColor: colors.base,
    paddingHorizontal: 20,
    justifyContent: 'center',
    minHeight: 44,
  },
  input: {
    fontFamily: fonts.outfitSemiBold,
    fontSize: 20,
    fontWeight: '600',
    color: colors.ink,
    paddingVertical: 0,
  },
});
