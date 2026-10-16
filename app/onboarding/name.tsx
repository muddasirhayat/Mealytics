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
  const { colors, isDark } = useTheme();
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
          isDark
            ? {
                backgroundColor: colors.surfaceRaised,
                borderWidth: focused ? 1.5 : 1,
                borderColor: focused ? colors.accent : colors.border,
                boxShadow: focused
                  ? [
                      {
                        offsetX: 0,
                        offsetY: 0,
                        blurRadius: 0,
                        spreadDistance: 4,
                        color: 'rgba(124,128,255,0.18)',
                      },
                    ]
                  : [{ offsetX: 0, offsetY: 2, blurRadius: 6, color: 'rgba(0,0,0,0.45)', inset: true }],
              }
            : [inset(), { backgroundColor: colors.base }],
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
