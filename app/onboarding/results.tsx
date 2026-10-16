import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { GlassCard, LogoMark, RaisedCard, Screen, Slider } from '@/components/ui';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useUserStore } from '@/store/userStore';
import { calculateGoals, goalLabel, percentsToSplit, rebalanceMacros, waterTargetMl } from '@/utils/goals';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/fonts';
import { typography } from '@/theme/typography';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { UserProfile } from '@/types/user';

export default function OnboardingResults() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const saveProfile = useUserStore((s) => s.saveProfile);
  const setHasOnboarded = useUserStore((s) => s.setHasOnboarded);
  const setCelebrating = useOnboardingStore((s) => s.setCelebrating);
  const name = useOnboardingStore((s) => s.name);
  const age = useOnboardingStore((s) => s.age);
  const gender = useOnboardingStore((s) => s.gender);
  const heightCm = useOnboardingStore((s) => s.heightCm);
  const weightKg = useOnboardingStore((s) => s.weightKg);
  const activityLevel = useOnboardingStore((s) => s.activityLevel);
  const goalType = useOnboardingStore((s) => s.goalType);
  const unitSystem = useOnboardingStore((s) => s.unitSystem);
  const macroPercents = useOnboardingStore((s) => s.macroPercents);
  const patch = useOnboardingStore((s) => s.patch);
  const [saving, setSaving] = useState(false);

  const profile: UserProfile = {
    name: name.trim(),
    age,
    gender,
    heightCm,
    weightKg,
    activityLevel,
    goalType,
    unitSystem,
    macroSplit: percentsToSplit(macroPercents),
  };
  const goals = calculateGoals(profile);
  const waterMl = waterTargetMl(weightKg);

  const handleLooksGood = async () => {
    setSaving(true);
    try {
      await saveProfile(profile);
      await setHasOnboarded(true);
      setCelebrating(true);
      router.push('/onboarding/done');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen blobs="B1" padded={false} edges={{ top: true, bottom: false }}>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.top}>
          <LogoMark />
          <Text style={styles.plan}>Your plan</Text>
        </View>
        <Text style={styles.title}>
          {name.trim() || 'You'}, your daily{'\n'}target is ready
        </Text>
        <GlassCard padding={20} radiusValue={30} style={styles.calCard}>
          <Text style={styles.calLabel}>Daily calories · {goalLabel(goalType)}</Text>
          <Text style={styles.calValue} accessibilityLabel={`${goals.targetCalories} kilocalories per day`}>
            {goals.targetCalories.toLocaleString()}
          </Text>
          <Text style={styles.calUnit}>kcal per day</Text>
        </GlassCard>
        <RaisedCard padding={20} radiusValue={26} style={styles.sliders}>
          {(
            [
              { key: 'protein' as const, label: 'Protein', grams: goals.targetProtein, color: colors.protein },
              { key: 'carbs' as const, label: 'Carbs', grams: goals.targetCarbs, color: colors.carbs },
              { key: 'fat' as const, label: 'Fat', grams: goals.targetFat, color: colors.fat },
            ]
          ).map((row) => (
            <View key={row.key} style={styles.sliderBlock}>
              <View style={styles.sliderHead}>
                <View style={styles.sliderLabel}>
                  <View style={[styles.dot, { backgroundColor: row.color }]} />
                  <Text style={styles.sliderName}>{row.label}</Text>
                </View>
                <Text style={styles.sliderVal}>
                  {row.grams} g · {macroPercents[row.key]}%
                </Text>
              </View>
              <Slider
                value={macroPercents[row.key]}
                min={10}
                max={60}
                step={1}
                color={row.color}
                accessibilityLabel={`${row.label} ${macroPercents[row.key]} percent`}
                onChange={(next) => patch({ macroPercents: rebalanceMacros(macroPercents, row.key, next) })}
              />
            </View>
          ))}
        </RaisedCard>
        <View style={styles.pills}>
          <RaisedCard padding={16} radiusValue={20} style={styles.pill}>
            <Feather name="zap" size={18} color={colors.fiber} accessible={false} />
            <Text style={styles.pillText}>
              <Text style={styles.pillStrong}>{goals.targetFiber} g</Text> fiber
            </Text>
          </RaisedCard>
          <RaisedCard padding={16} radiusValue={20} style={styles.pill}>
            <Feather name="droplet" size={18} color={colors.carbs} accessible={false} />
            <Text style={styles.pillText}>
              <Text style={styles.pillStrong}>{waterMl.toLocaleString()} ml</Text> water
            </Text>
          </RaisedCard>
        </View>
        <Text style={styles.hint}>Drag the sliders to fine-tune. Change any time in Profile.</Text>
      </ScrollView>
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 24) }]}>
        <PrimaryButton label="Looks good" onPress={() => void handleLooksGood()} loading={saving} disabled={saving} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 16,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  plan: {
    fontFamily: fonts.manropeBold,
    fontSize: 13,
    fontWeight: '700',
    color: colors.muted,
  },
  title: {
    fontFamily: fonts.outfitBold,
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -1,
    lineHeight: 37,
    color: colors.ink,
    marginTop: 26,
  },
  calCard: {
    marginTop: 20,
    alignItems: 'center',
  },
  calLabel: {
    ...typography.label,
    color: colors.muted,
  },
  calValue: {
    ...typography.bigNumber,
    color: colors.accent,
  },
  calUnit: {
    ...typography.body,
    fontFamily: fonts.manropeBold,
    fontWeight: '600',
    color: colors.muted,
  },
  sliders: {
    marginTop: 18,
    gap: 8,
  },
  sliderBlock: {
    marginTop: 16,
  },
  sliderHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sliderLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  sliderName: {
    fontFamily: fonts.outfitSemiBold,
    fontSize: 15,
    fontWeight: '600',
    color: colors.ink,
  },
  sliderVal: {
    fontFamily: fonts.outfitBold,
    fontSize: 15,
    fontWeight: '700',
    color: colors.ink,
  },
  pills: {
    flexDirection: 'row',
    gap: 14,
    marginTop: 16,
  },
  pill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pillText: {
    fontFamily: fonts.manropeMedium,
    fontSize: 15,
    color: colors.ink,
  },
  pillStrong: {
    fontFamily: fonts.outfitBold,
    fontWeight: '700',
  },
  hint: {
    ...typography.caption,
    fontFamily: fonts.manropeBold,
    fontWeight: '600',
    color: colors.muted,
    textAlign: 'center',
    marginTop: 12,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 12,
  },
});
