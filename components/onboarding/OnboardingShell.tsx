import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Screen } from '@/components/ui/Screen';
import { IconSquare } from '@/components/ui/IconSquare';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { useThemeColors } from '@/hooks/useThemeColors';
import { fonts } from '@/theme/fonts';
import { typography } from '@/theme/typography';
import type { Feather } from '@expo/vector-icons';

const STEPS = 7;

type OnboardingShellProps = {
  step?: number;
  title: string;
  subtitle?: string;
  blobs?: 'default' | 'B1' | 'B2';
  cta: string;
  ctaIcon?: keyof typeof Feather.glyphMap;
  onBack?: () => void;
  onContinue: () => void;
  continueDisabled?: boolean;
  loading?: boolean;
  /** False on screens that already host a FlatList (age wheel, rulers). */
  scroll?: boolean;
  children: React.ReactNode;
};

export const OnboardingShell = ({
  step,
  title,
  subtitle,
  blobs = 'B1',
  cta,
  ctaIcon,
  onBack,
  onContinue,
  continueDisabled,
  loading,
  scroll = true,
  children,
}: OnboardingShellProps) => {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const body = (
    <>
      <Text style={[styles.title, { color: colors.ink }]}>{title}</Text>
      {subtitle ? <Text style={[styles.subtitle, { color: colors.muted }]}>{subtitle}</Text> : null}
      <View style={styles.content}>{children}</View>
    </>
  );
  return (
    <Screen blobs={blobs} padded={false} edges={{ top: true, bottom: false }}>
      <View style={styles.body}>
        {step != null ? (
          <View style={styles.progressRow}>
            {onBack ? (
              <IconSquare
                name="chevron-left"
                onPress={onBack}
                accessibilityLabel="Go back"
              />
            ) : (
              <View style={styles.backSpacer} />
            )}
            <View style={styles.bar}>
              <ProgressBar progress={step / STEPS} gradient height={12} />
            </View>
            <Text style={[styles.stepLabel, { color: colors.muted }]} accessibilityLabel={`Step ${step} of ${STEPS}`}>
              {step} / {STEPS}
            </Text>
          </View>
        ) : null}
        {scroll ? (
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {body}
          </ScrollView>
        ) : (
          <View style={styles.scroll} collapsable={false}>
            {body}
          </View>
        )}
      </View>
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 24) }]}>
        <PrimaryButton
          label={cta}
          icon={ctaIcon}
          onPress={onContinue}
          disabled={continueDisabled}
          loading={loading}
        />
      </View>
    </Screen>
  );
};

export const SecondaryLink = ({ label, onPress }: { label: string; onPress: () => void }) => {
  const colors = useThemeColors();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} style={styles.secondary}>
      <Text style={[styles.secondaryText, { color: colors.accent }]}>{label}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  body: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 10,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  bar: {
    flex: 1,
  },
  backSpacer: {
    width: 46,
    height: 46,
  },
  stepLabel: {
    fontFamily: fonts.manropeBold,
    fontSize: 13,
    fontWeight: '700',
    minWidth: 36,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 16,
  },
  title: {
    ...typography.question,
    marginTop: 40,
    flexShrink: 1,
  },
  subtitle: {
    ...typography.body,
    marginTop: 12,
    flexShrink: 1,
  },
  content: {
    flexGrow: 1,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  secondary: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  secondaryText: {
    ...typography.bodyMedium,
    fontFamily: fonts.manropeBold,
    fontWeight: '700',
  },
});
