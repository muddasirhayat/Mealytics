import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Constants from 'expo-constants';
import { Feather } from '@expo/vector-icons';
import { type Href, useRouter } from 'expo-router';
import { useUserStore } from '@/store/userStore';
import { useMealStore } from '@/store/mealStore';
import { useOnboardingStore } from '@/store/onboardingStore';
import { wipeMealyticsKeys } from '@/storage/wipe';
import { UserProfile, Gender, ActivityLevel, GoalType, UnitSystem } from '@/types/user';
import { getBmiCategory } from '@/utils/bmi';
import { parseDecimal, parseInteger, sanitizeDecimalInput, sanitizeIntegerInput } from '@/utils/number';
import { cmToFtIn, ftInToCm, kgToLbs, lbsToKg } from '@/utils/units';
import { ACTIVITY_OPTIONS, AGE_MAX, AGE_MIN } from '@/constants/profileOptions';
import { openExternalUrl } from '@/utils/linking';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useThemeStore } from '@/store/themeStore';
import type { ThemeColors, ThemePreference } from '@/theme/palette';
import { fonts } from '@/theme/fonts';
import { typography } from '@/theme/typography';
import { useTabBarSpace } from '@/constants/layout';
import { CODIXR_URL, PRIVACY_POLICY_URL, SUPPORT_EMAIL, TERMS_URL } from '@/constants/links';
import {
  Chip,
  ConfirmDialog,
  GlassCard,
  InsetField,
  LogoMark,
  PrimaryButton,
  RaisedCard,
  Screen,
  ScreenHeader,
  Segmented,
} from '@/components/ui';
import { useToast } from '@/components/ui/Toast';
import { raiseSm } from '@/utils/shadow';

type FormFields = {
  name: string;
  age: string;
  gender: Gender;
  unitSystem: UnitSystem;
  heightCm: string;
  heightFt: string;
  heightIn: string;
  weightDisplay: string;
  activityLevel: ActivityLevel;
  goalType: GoalType;
};

const emptyForm = (): FormFields => ({
  name: '',
  age: '',
  gender: 'male',
  unitSystem: 'metric',
  heightCm: '',
  heightFt: '',
  heightIn: '',
  weightDisplay: '',
  activityLevel: 'moderate',
  goalType: 'maintain',
});

const fieldsFromProfile = (next: UserProfile | null): FormFields => {
  if (!next) return emptyForm();
  const sys = next.unitSystem ?? 'metric';
  if (sys === 'imperial') {
    const { ft, inches } = cmToFtIn(next.heightCm);
    return {
      name: next.name,
      age: String(next.age),
      gender: next.gender,
      unitSystem: sys,
      heightCm: String(next.heightCm),
      heightFt: String(ft),
      heightIn: String(inches),
      weightDisplay: String(kgToLbs(next.weightKg)),
      activityLevel: next.activityLevel,
      goalType: next.goalType,
    };
  }
  return {
    name: next.name,
    age: String(next.age),
    gender: next.gender,
    unitSystem: sys,
    heightCm: String(next.heightCm),
    heightFt: '',
    heightIn: '',
    weightDisplay: String(next.weightKg),
    activityLevel: next.activityLevel,
    goalType: next.goalType,
  };
};

const ACTIVITY = ACTIVITY_OPTIONS.map((item) => ({
  label: item.shortLabel,
  value: item.value,
}));

const GOALS: { label: string; value: GoalType }[] = [
  { label: 'Lose', value: 'lose' },
  { label: 'Maintain', value: 'maintain' },
  { label: 'Gain muscle', value: 'gain' },
];

export default function ProfileScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const themePreference = useThemeStore((s) => s.preference);
  const setThemePreference = useThemeStore((s) => s.setPreference);
  const { profile, goals, saveProfile, isLoading, resetUser } = useUserStore();
  const clearDraftMeal = useMealStore((s) => s.clearDraftMeal);
  const resetOnboarding = useOnboardingStore((s) => s.reset);
  const tabBarSpace = useTabBarSpace();
  const { show } = useToast();
  const styles = makeStyles(colors);
  const initial = fieldsFromProfile(profile);
  const [name, setName] = useState(initial.name);
  const [age, setAge] = useState(initial.age);
  const [gender, setGender] = useState<Gender>(initial.gender);
  const [unitSystem, setUnitSystem] = useState<UnitSystem>(initial.unitSystem);
  const [heightCm, setHeightCm] = useState(initial.heightCm);
  const [heightFt, setHeightFt] = useState(initial.heightFt);
  const [heightIn, setHeightIn] = useState(initial.heightIn);
  const [weightDisplay, setWeightDisplay] = useState(initial.weightDisplay);
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(initial.activityLevel);
  const [goalType, setGoalType] = useState<GoalType>(initial.goalType);
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [wipeOpen, setWipeOpen] = useState(false);
  const [hydratedProfile, setHydratedProfile] = useState(profile);
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  if (profile !== hydratedProfile) {
    setHydratedProfile(profile);
    const next = fieldsFromProfile(profile);
    setName(next.name);
    setAge(next.age);
    setGender(next.gender);
    setUnitSystem(next.unitSystem);
    setHeightCm(next.heightCm);
    setHeightFt(next.heightFt);
    setHeightIn(next.heightIn);
    setWeightDisplay(next.weightDisplay);
    setActivityLevel(next.activityLevel);
    setGoalType(next.goalType);
  }

  const handleUnitToggle = (newSystem: UnitSystem) => {
    if (newSystem === unitSystem) return;
    if (newSystem === 'imperial') {
      const cm = parseDecimal(heightCm);
      if (cm && cm > 0) {
        const { ft, inches } = cmToFtIn(cm);
        setHeightFt(String(ft));
        setHeightIn(String(inches));
      }
      const kg = parseDecimal(weightDisplay);
      setWeightDisplay(kg && kg > 0 ? String(kgToLbs(kg)) : '');
    } else {
      const ft = parseInteger(heightFt);
      const inches = parseInteger(heightIn) ?? 0;
      if (ft !== null) setHeightCm(String(ftInToCm(ft, inches)));
      const lbs = parseDecimal(weightDisplay);
      setWeightDisplay(lbs && lbs > 0 ? String(lbsToKg(lbs)) : '');
    }
    setUnitSystem(newSystem);
  };

  const ageNum = parseInteger(age);
  const heightCmNum = parseDecimal(heightCm);
  const heightFtNum = parseInteger(heightFt);
  const heightInNum = parseInteger(heightIn);
  const weightNum = parseDecimal(weightDisplay);
  const nameError = name.trim() ? undefined : 'Please enter your name.';
  const ageError =
    ageNum === null || ageNum < AGE_MIN || ageNum > AGE_MAX
      ? `Enter an age between ${AGE_MIN} and ${AGE_MAX}.`
      : undefined;
  const heightError = unitSystem === 'imperial'
    ? (heightFtNum === null || heightInNum === null || heightFtNum < 3 || heightFtNum > 8 ? 'Enter a valid height.' : undefined)
    : (heightCmNum === null || heightCmNum < 100 || heightCmNum > 250 ? 'Enter height in cm (100–250).' : undefined);
  const weightError = unitSystem === 'imperial'
    ? (weightNum === null || weightNum < 66 || weightNum > 660 ? 'Enter a valid weight in lbs.' : undefined)
    : (weightNum === null || weightNum < 30 || weightNum > 300 ? 'Enter weight in kg (30–300).' : undefined);
  const canSave = !nameError && !ageError && !heightError && !weightError;

  const handleSave = async () => {
    if (!canSave || ageNum === null || weightNum === null) return;
    let finalHeightCm: number;
    let finalWeightKg: number;
    if (unitSystem === 'imperial') {
      if (heightFtNum === null || heightInNum === null) return;
      finalHeightCm = ftInToCm(heightFtNum, heightInNum);
      finalWeightKg = lbsToKg(weightNum);
    } else {
      if (heightCmNum === null) return;
      finalHeightCm = heightCmNum;
      finalWeightKg = weightNum;
    }
    setSaving(true);
    try {
      await saveProfile({
        name: name.trim(),
        age: ageNum,
        gender,
        heightCm: finalHeightCm,
        weightKg: finalWeightKg,
        activityLevel,
        goalType,
        unitSystem,
        macroSplit: profile?.macroSplit,
      });
      setIsSaved(true);
      show('Saved ✓');
      if (savedTimer.current) clearTimeout(savedTimer.current);
      savedTimer.current = setTimeout(() => setIsSaved(false), 2000);
    } catch {
      show('Could not save');
    } finally {
      setSaving(false);
    }
  };

  const openLink = async (url: string) => {
    const ok = await openExternalUrl(url);
    if (!ok) show('Could not open link');
  };

  const bmiCategory = goals ? getBmiCategory(goals.bmi) : null;
  const displayName = profile?.name ?? name;
  const initialLetter = (displayName.length > 0 ? displayName : '?').trim().charAt(0).toUpperCase();
  const goalLabel = goalType === 'lose' ? 'Lose' : goalType === 'gain' ? 'Gain muscle' : 'Maintain';

  if (isLoading) {
    return (
      <Screen>
        <ActivityIndicator color={colors.accent} />
      </Screen>
    );
  }

  return (
    <Screen padded={false}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <ScreenHeader title="Profile" />
          <GlassCard padding={18} radiusValue={28} style={styles.identity}>
            <View style={[styles.avatar, raiseSm()]}>
              <Text style={styles.avatarText}>{initialLetter}</Text>
            </View>
            <Text style={styles.identityName}>{profile?.name || name || 'Your name'}</Text>
            <Text style={styles.identityMeta}>
              {goalLabel} · {goals ? `${goals.targetCalories}/day` : '—'} · BMI{' '}
              <Text style={{ color: bmiCategory?.color ?? colors.ink }}>{goals?.bmi ?? '—'}</Text>
            </Text>
            {goals ? (
              <View style={styles.macroRow}>
                {[
                  { c: colors.protein, v: goals.targetProtein, l: 'P' },
                  { c: colors.carbs, v: goals.targetCarbs, l: 'C' },
                  { c: colors.fat, v: goals.targetFat, l: 'F' },
                  { c: colors.fiber, v: goals.targetFiber, l: 'Fi' },
                ].map((item) => (
                  <View key={item.l} style={styles.macroItem}>
                    <View style={[styles.dot, { backgroundColor: item.c }]} />
                    <Text style={styles.macroText}>{item.v}{item.l}</Text>
                  </View>
                ))}
              </View>
            ) : null}
          </GlassCard>

          <Text style={styles.label}>Units</Text>
          <Segmented
            options={[{ label: 'Metric', value: 'metric' }, { label: 'Imperial', value: 'imperial' }]}
            value={unitSystem}
            onChange={handleUnitToggle}
          />

          <View style={styles.grid}>
            <InsetField
              label="Name"
              value={name}
              onChangeText={setName}
              error={name.length ? nameError : undefined}
              fullWidth
              height={56}
            />
            <InsetField
              label="Age"
              value={age}
              onChangeText={(text) => setAge(sanitizeIntegerInput(text))}
              keyboardType="number-pad"
              suffix="yrs"
              error={age.length ? ageError : undefined}
            />
            {unitSystem === 'metric' ? (
              <InsetField
                label="Height"
                value={heightCm}
                onChangeText={(text) => setHeightCm(sanitizeDecimalInput(text))}
                keyboardType="decimal-pad"
                suffix="cm"
                error={heightCm.length ? heightError : undefined}
              />
            ) : (
              <View style={styles.heightRow}>
                <InsetField label="Height" value={heightFt} onChangeText={(text) => setHeightFt(sanitizeIntegerInput(text))} keyboardType="number-pad" suffix="ft" />
                <InsetField label=" " value={heightIn} onChangeText={(text) => setHeightIn(sanitizeIntegerInput(text))} keyboardType="number-pad" suffix="in" error={heightError} />
              </View>
            )}
            <InsetField
              label="Weight"
              value={weightDisplay}
              onChangeText={(text) => setWeightDisplay(sanitizeDecimalInput(text))}
              keyboardType="decimal-pad"
              suffix={unitSystem === 'metric' ? 'kg' : 'lb'}
              error={weightDisplay.length ? weightError : undefined}
            />
          </View>

          <Text style={styles.label}>Appearance</Text>
          <Segmented
            options={[
              { label: 'System', value: 'system' },
              { label: 'Light', value: 'light' },
              { label: 'Dark', value: 'dark' },
            ]}
            value={themePreference}
            onChange={(next) => setThemePreference(next as ThemePreference)}
            accessibilityLabel="Appearance"
          />

          <Text style={styles.label}>Gender</Text>
          <Segmented
            options={[{ label: 'Male', value: 'male' }, { label: 'Female', value: 'female' }]}
            value={gender}
            onChange={setGender}
          />
          <Text style={styles.label}>Activity</Text>
          <View style={styles.chips}>
            {ACTIVITY.map((item) => (
              <Chip key={item.value} label={item.label} selected={activityLevel === item.value} onPress={() => setActivityLevel(item.value)} />
            ))}
          </View>
          <Text style={styles.label}>Goal</Text>
          <View style={styles.goalRow}>
            {GOALS.map((item) => (
              <Chip key={item.value} label={item.label} selected={goalType === item.value} onPress={() => setGoalType(item.value)} />
            ))}
          </View>

          <RaisedCard padding={8} radiusValue={22} style={styles.listCard}>
            <Row label="Privacy Policy" onPress={() => void openLink(PRIVACY_POLICY_URL)} colors={colors} styles={styles} />
            <Row label="Terms of Use" onPress={() => void openLink(TERMS_URL)} colors={colors} styles={styles} />
            <Row
              label="Delete all my data"
              danger
              onPress={() => setWipeOpen(true)}
              colors={colors}
              styles={styles}
            />
            <Row label="About Mealytics" onPress={() => setAboutOpen(true)} last colors={colors} styles={styles} />
          </RaisedCard>

          <View style={styles.footer}>
            <Pressable onPress={() => void openLink(CODIXR_URL)} accessibilityRole="link" style={styles.footerHit}>
              <Text style={styles.footerText}>
                v{Constants.expoConfig?.version ?? '1.0.0'} · Launched by Codixr.com
              </Text>
            </Pressable>
            <Text style={styles.footerText}>
              Your data stays on this device · Online food search uses Open Food Facts / USDA
            </Text>
          </View>
        </ScrollView>
        <View style={[styles.saveDock, { marginBottom: tabBarSpace }]}>
          <PrimaryButton
            label={isSaved ? 'Saved ✓' : 'Save'}
            onPress={() => void handleSave()}
            loading={saving}
            disabled={!canSave || saving}
          />
        </View>
      </KeyboardAvoidingView>

      <ConfirmDialog
        visible={wipeOpen}
        title="Delete all my data?"
        body="This removes your profile, meals, and settings from this device. It cannot be undone."
        confirmLabel="Delete everything"
        destructive
        onCancel={() => setWipeOpen(false)}
        onConfirm={() => {
          void (async () => {
            try {
              await wipeMealyticsKeys();
              resetUser();
              clearDraftMeal();
              resetOnboarding();
              setWipeOpen(false);
              router.replace('/onboarding' as Href);
            } catch {
              setWipeOpen(false);
              show('Could not delete data');
            }
          })();
        }}
      />

      <Modal visible={aboutOpen} transparent animationType="fade" onRequestClose={() => setAboutOpen(false)}>
        <Pressable style={styles.modalBg} onPress={() => setAboutOpen(false)}>
          <RaisedCard padding={22} radiusValue={24} style={styles.modalCard}>
            <LogoMark />
            <Text style={styles.identityName}>About Mealytics</Text>
            <Text style={styles.aboutBody}>Version {Constants.expoConfig?.version ?? '1.0.0'}</Text>
            <Text style={styles.aboutBody}>Food data: USDA FoodData Central; Open Food Facts (ODbL).</Text>
            <Text style={styles.aboutBody}>Developer: Muddasir Hayat</Text>
            <Text style={styles.aboutBody}>Launched by Codixr.com</Text>
            <Pressable onPress={() => void openLink(`mailto:${SUPPORT_EMAIL}`)} accessibilityRole="link">
              <Text style={styles.aboutBody}>Support: {SUPPORT_EMAIL}</Text>
            </Pressable>
            <PrimaryButton label="Close" onPress={() => setAboutOpen(false)} />
          </RaisedCard>
        </Pressable>
      </Modal>
    </Screen>
  );
}

const Row = ({
  label,
  onPress,
  danger,
  last,
  colors,
  styles,
}: {
  label: string;
  onPress: () => void;
  danger?: boolean;
  last?: boolean;
  colors: ThemeColors;
  styles: ReturnType<typeof makeStyles>;
}) => (
  <Pressable
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={label}
    style={[styles.rowItem, !last && styles.rowBorder]}
  >
    <Text style={[styles.rowLabel, danger && styles.danger]}>{label}</Text>
    <Feather name="chevron-right" size={18} color={danger ? colors.danger : colors.muted} />
  </Pressable>
);

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    flex: { flex: 1 },
    content: {
      paddingHorizontal: 24,
      paddingTop: 10,
      paddingBottom: 16,
      gap: 14,
    },
    identity: { alignItems: 'center' },
    avatar: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: colors.base,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 8,
    },
    avatarText: {
      fontFamily: fonts.outfitBold,
      fontSize: 24,
      color: colors.accent,
    },
    identityName: {
      fontFamily: fonts.outfitBold,
      fontSize: 22,
      color: colors.ink,
    },
    identityMeta: {
      ...typography.body,
      color: colors.muted,
      marginTop: 4,
      textAlign: 'center',
    },
    macroRow: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 12,
    },
    macroItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    dot: { width: 7, height: 7, borderRadius: 4 },
    macroText: {
      fontFamily: fonts.manropeBold,
      fontSize: 12.5,
      color: colors.muted,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    heightRow: {
      flexDirection: 'row',
      width: '100%',
      flexBasis: '100%',
      gap: 12,
    },
    saveDock: {
      paddingHorizontal: 24,
      paddingTop: 12,
      paddingBottom: 8,
    },
    label: {
      ...typography.fieldLabel,
      color: colors.muted,
      marginTop: 4,
    },
    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    goalRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    listCard: { marginTop: 8 },
    rowItem: {
      minHeight: 52,
      paddingHorizontal: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.divider },
    rowLabel: {
      fontFamily: fonts.outfitSemiBold,
      fontSize: 15,
      color: colors.ink,
    },
    danger: { color: colors.danger },
    footer: { alignItems: 'center', justifyContent: 'center', marginTop: 8, gap: 6 },
    footerHit: { minHeight: 44, justifyContent: 'center' },
    footerText: { ...typography.caption, color: colors.muted, textAlign: 'center' },
    modalBg: {
      flex: 1,
      backgroundColor: 'rgba(30,37,51,0.35)',
      justifyContent: 'center',
      padding: 24,
    },
    modalCard: { gap: 12 },
    aboutBody: { ...typography.body, color: colors.muted },
  });
