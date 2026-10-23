import React, { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { OnboardingShell } from '@/components/onboarding/OnboardingShell';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useTheme } from '@/hooks/useTheme';
import { safeBack } from '@/utils/navigation';
import { fonts } from '@/theme/fonts';
import { inset } from '@/utils/shadow';

export default function OnboardingName() {
  const router = useRouter();
  const { colors } = useTheme();
  const name = useOnboardingStore((s) => s.name);
  const patch = useOnboardingStore((s) => s.patch);
  const [focused, setFocused] = useState(false);
  const canContinue = name.trim().length > 0;

  const goNext = () => {
    if (!canContinue) return;
    router.push('/onboarding/goal');
  };

  return (
    <OnboardingShell
      step={1}
      title={'What should we\ncall you?'}
      subtitle="We use it to greet you in the app."
      cta="Continue"
      onBack={() => safeBack('/onboarding')}
      onContinue={goNext}
      continueDisabled={!canContinue}
    >
      <View
        style={[
          styles.field,
          inset(),
          {
            backgroundColor: colors.base,
            borderWidth: focused ? 1 : 0,
            borderColor: focused ? colors.accent : 'transparent',
          },
        ]}
      >
        <TextInput
          value={name}
          onChangeText={(text) => patch({ name: text })}
          placeholder="Your name"
          placeholderTextColor={colors.inkMuted}
          selectionColor={colors.accent}
          cursorColor={colors.accent}
          autoFocus
          autoCapitalize="words"
          autoCorrect={false}
          returnKeyType="next"
          onSubmitEditing={goNext}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          accessibilityLabel="Your name"
          style={[styles.input, { color: colors.ink }]}
        />
      </View>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  field: {
    marginTop: 36,
    height: 60,
    borderRadius: 18,
    paddingHorizontal: 20,
    justifyContent: 'center',
    minHeight: 44,
  },
  input: {
    fontFamily: fonts.manropeSemiBold,
    fontSize: 17,
    fontWeight: '600',
    paddingVertical: 0,
  },
});
