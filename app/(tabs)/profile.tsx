import React, { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, Alert, KeyboardAvoidingView, Platform, Linking, Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUserStore } from '@/store/userStore';
import { UserProfile, Gender, ActivityLevel, GoalType, UnitSystem } from '@/types/user';
import { getBmiCategory } from '@/utils/bmi';
import Constants from 'expo-constants';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { radius } from '@/theme/radius';

// ─── Unit Conversion Helpers ───────────────────────────────────────────────
const cmToFtIn = (cm: number) => {
  const totalInches = cm / 2.54;
  const ft = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return { ft, inches };
};
const ftInToCm = (ft: number, inches: number) => Math.round((ft * 12 + inches) * 2.54);
const kgToLbs = (kg: number) => Math.round(kg * 2.2046);
const lbsToKg = (lbs: number) => parseFloat((lbs / 2.2046).toFixed(1));


// ─── Chip Selector Component ───────────────────────────────────────────────
const ChipGroup = <T extends string>({
  label,
  options,
  value,
  onSelect,
}: {
  label: string;
  options: { label: string; value: T; icon?: string }[];
  value: T;
  onSelect: (v: T) => void;
}) => (
  <View style={styles.fieldGroup}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <View style={styles.chipRow}>
      {options.map((opt) => (
        <TouchableOpacity
          key={opt.value}
          style={[styles.chip, value === opt.value && styles.chipActive]}
          onPress={() => onSelect(opt.value)}
          activeOpacity={0.7}
        >
          {opt.icon ? <Text style={styles.chipIcon}>{opt.icon}</Text> : null}
          <Text style={[styles.chipText, value === opt.value && styles.chipTextActive]}>
            {opt.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

// ─── Text Input Field Component ────────────────────────────────────────────
const InputField = ({
  label, value, onChangeText, keyboardType = 'default', suffix,
}: {
  label: string; value: string; onChangeText: (v: string) => void;
  keyboardType?: 'default' | 'numeric'; suffix?: string;
}) => (
  <View style={styles.fieldGroup}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <View style={styles.inputRow}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        placeholderTextColor={colors.textMuted}
        placeholder="Enter value"
      />
      {suffix ? <Text style={styles.inputSuffix}>{suffix}</Text> : null}
    </View>
  </View>
);

// ─── Profile screen ────────────────────────────────────────────────────────
export default function ProfileScreen() {
  const { profile, goals, saveProfile } = useUserStore();

  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<Gender>('male');
  const [unitSystem, setUnitSystem] = useState<UnitSystem>('metric');

  // Height state — metric: cm string | imperial: ft + inches strings
  const [heightCm, setHeightCm] = useState('');
  const [heightFt, setHeightFt] = useState('');
  const [heightIn, setHeightIn] = useState('');

  // Weight state — metric: kg | imperial: lbs
  const [weightDisplay, setWeightDisplay] = useState(''); // what user sees

  const [activityLevel, setActivityLevel] = useState<ActivityLevel>('moderate');
  const [goalType, setGoalType] = useState<GoalType>('maintain');
  const [isSaved, setIsSaved] = useState(false);
  const [hydratedProfile, setHydratedProfile] = useState(profile);
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reset local form fields when the stored profile identity changes (React 19-safe, no effect).
  if (profile !== hydratedProfile) {
    setHydratedProfile(profile);
    if (profile) {
      setName(profile.name);
      setAge(String(profile.age));
      setGender(profile.gender);
      setActivityLevel(profile.activityLevel);
      setGoalType(profile.goalType);
      const sys = profile.unitSystem ?? 'metric';
      setUnitSystem(sys);
      if (sys === 'imperial') {
        const { ft, inches } = cmToFtIn(profile.heightCm);
        setHeightFt(String(ft));
        setHeightIn(String(inches));
        setWeightDisplay(String(kgToLbs(profile.weightKg)));
      } else {
        setHeightCm(String(profile.heightCm));
        setWeightDisplay(String(profile.weightKg));
      }
    }
  }

  // ── Unit toggle: convert current values to new system ──────────────────
  const handleUnitToggle = (newSystem: UnitSystem) => {
    if (newSystem === unitSystem) return;
    if (newSystem === 'imperial') {
      // cm → ft/in
      const cm = parseFloat(heightCm);
      if (!isNaN(cm) && cm > 0) {
        const { ft, inches } = cmToFtIn(cm);
        setHeightFt(String(ft));
        setHeightIn(String(inches));
      } else { setHeightFt(''); setHeightIn(''); }
      // kg → lbs
      const kg = parseFloat(weightDisplay);
      setWeightDisplay(!isNaN(kg) && kg > 0 ? String(kgToLbs(kg)) : '');
    } else {
      // ft/in → cm
      const ft = parseInt(heightFt, 10);
      const inches = parseInt(heightIn, 10);
      if (!isNaN(ft) && !isNaN(inches)) {
        setHeightCm(String(ftInToCm(ft, inches)));
      } else { setHeightCm(''); }
      // lbs → kg
      const lbs = parseFloat(weightDisplay);
      setWeightDisplay(!isNaN(lbs) && lbs > 0 ? String(lbsToKg(lbs)) : '');
    }
    setUnitSystem(newSystem);
  };

  // ── Save ────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!name.trim()) { Alert.alert('Missing Info', 'Please enter your name.'); return; }
    const ageNum = parseInt(age, 10);
    if (!ageNum || ageNum < 10 || ageNum > 120) { Alert.alert('Invalid Age', 'Please enter a valid age.'); return; }

    // Always save height/weight internally as metric
    let finalHeightCm: number;
    let finalWeightKg: number;

    if (unitSystem === 'imperial') {
      const ft = parseInt(heightFt, 10);
      const inches = parseInt(heightIn, 10);
      if (isNaN(ft) || isNaN(inches) || ft < 3 || ft > 8) {
        Alert.alert('Invalid Height', 'Enter a valid height (e.g. 5 ft 9 in).'); return;
      }
      finalHeightCm = ftInToCm(ft, inches);
      const lbs = parseFloat(weightDisplay);
      if (isNaN(lbs) || lbs < 66 || lbs > 660) {
        Alert.alert('Invalid Weight', 'Enter a valid weight in lbs (e.g. 154).'); return;
      }
      finalWeightKg = lbsToKg(lbs);
    } else {
      finalHeightCm = parseFloat(heightCm);
      finalWeightKg = parseFloat(weightDisplay);
      if (!finalHeightCm || finalHeightCm < 100 || finalHeightCm > 250) {
        Alert.alert('Invalid Height', 'Enter height in cm (e.g. 170).'); return;
      }
      if (!finalWeightKg || finalWeightKg < 30 || finalWeightKg > 300) {
        Alert.alert('Invalid Weight', 'Enter weight in kg (e.g. 70).'); return;
      }
    }

    const updatedProfile: UserProfile = {
      name: name.trim(), age: ageNum, gender,
      heightCm: finalHeightCm, weightKg: finalWeightKg,
      activityLevel, goalType, unitSystem,
    };
    try {
      await saveProfile(updatedProfile);
      setIsSaved(true);
      if (savedTimer.current) {
        clearTimeout(savedTimer.current);
      }
      savedTimer.current = setTimeout(() => setIsSaved(false), 2000);
    } catch {
      Alert.alert('Could not save', 'Please try again.');
    }
  };

  const bmiCategory = goals ? getBmiCategory(goals.bmi) : null;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

        {/* ── BMI Card ─────────────────────────────────────────────────── */}
        {goals && (
          <View style={styles.bmiCard}>
            <View style={styles.bmiLeft}>
              <Text style={styles.bmiValue}>{goals.bmi}</Text>
              <Text style={styles.bmiLabel}>BMI</Text>
            </View>
            <View style={styles.bmiDivider} />
            <View style={styles.bmiRight}>
              <View style={[styles.bmiPill, { backgroundColor: bmiCategory!.color + '22' }]}>
                <Text style={[styles.bmiPillText, { color: bmiCategory!.color }]}>
                  {bmiCategory!.label}
                </Text>
              </View>
              <Text style={styles.bmiTargetLine}>
                🔥 {goals.targetCalories} kcal / day
              </Text>
              <Text style={styles.bmiMacroLine}>
                P {goals.targetProtein}g  ·  C {goals.targetCarbs}g  ·  F {goals.targetFat}g
              </Text>
            </View>
          </View>
        )}

        {/* ── Unit System ───────────────────────────────────────────────── */}
        <Text style={styles.sectionHeader}>Units</Text>
        <View style={styles.unitToggleRow}>
          {(['metric', 'imperial'] as UnitSystem[]).map((sys) => (
            <TouchableOpacity
              key={sys}
              style={[styles.unitButton, unitSystem === sys && styles.unitButtonActive]}
              onPress={() => handleUnitToggle(sys)}
              activeOpacity={0.7}
            >
              <Text style={styles.unitIcon}>
                {sys === 'metric' ? '🌍' : '🇺🇸'}
              </Text>
              <Text style={[styles.unitButtonText, unitSystem === sys && styles.unitButtonTextActive]}>
                {sys === 'metric' ? 'Metric (kg, cm)' : 'Imperial (lbs, ft)'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Personal Info ─────────────────────────────────────────────── */}
        <Text style={styles.sectionHeader}>Personal Info</Text>

        <InputField label="Your Name" value={name} onChangeText={setName} />
        <InputField label="Age" value={age} onChangeText={setAge} keyboardType="numeric" suffix="yrs" />

        <ChipGroup<Gender>
          label="Gender"
          value={gender}
          onSelect={setGender}
          options={[
            { label: 'Male', value: 'male', icon: '♂️' },
            { label: 'Female', value: 'female', icon: '♀️' },
          ]}
        />

        {/* Height — shows different inputs based on unit */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Height</Text>
          {unitSystem === 'metric' ? (
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                value={heightCm}
                onChangeText={setHeightCm}
                keyboardType="numeric"
                placeholder="e.g. 175"
                placeholderTextColor={colors.textMuted}
              />
              <Text style={styles.inputSuffix}>cm</Text>
            </View>
          ) : (
            <View style={styles.imperialHeightRow}>
              <View style={[styles.inputRow, { flex: 1 }]}>
                <TextInput
                  style={styles.input}
                  value={heightFt}
                  onChangeText={setHeightFt}
                  keyboardType="numeric"
                  placeholder="5"
                  placeholderTextColor={colors.textMuted}
                />
                <Text style={styles.inputSuffix}>ft</Text>
              </View>
              <View style={[styles.inputRow, { flex: 1 }]}>
                <TextInput
                  style={styles.input}
                  value={heightIn}
                  onChangeText={setHeightIn}
                  keyboardType="numeric"
                  placeholder="9"
                  placeholderTextColor={colors.textMuted}
                />
                <Text style={styles.inputSuffix}>in</Text>
              </View>
            </View>
          )}
        </View>

        {/* Weight */}
        <InputField
          label="Weight"
          value={weightDisplay}
          onChangeText={setWeightDisplay}
          keyboardType="numeric"
          suffix={unitSystem === 'metric' ? 'kg' : 'lbs'}
        />

        {/* ── Lifestyle ────────────────────────────────────────────────── */}
        <Text style={styles.sectionHeader}>Lifestyle</Text>

        <ChipGroup<ActivityLevel>
          label="Activity Level"
          value={activityLevel}
          onSelect={setActivityLevel}
          options={[
            { label: 'Sedentary', value: 'sedentary', icon: '🪑' },
            { label: 'Light',     value: 'light',     icon: '🚶' },
            { label: 'Moderate',  value: 'moderate',  icon: '🏃' },
            { label: 'Active',    value: 'active',    icon: '🏋️' },
            { label: 'Very Active', value: 'very_active', icon: '⚡' },
          ]}
        />

        {/* ── My Goal ──────────────────────────────────────────────────── */}
        <Text style={styles.sectionHeader}>My Goal</Text>

        <ChipGroup<GoalType>
          label="What do you want to do?"
          value={goalType}
          onSelect={setGoalType}
          options={[
            { label: 'Lose Weight', value: 'lose',     icon: '📉' },
            { label: 'Maintain',    value: 'maintain', icon: '⚖️' },
            { label: 'Gain Muscle', value: 'gain',     icon: '📈' },
          ]}
        />

        {/* ── Save Button ──────────────────────────────────────────────── */}
        <TouchableOpacity
          style={[styles.saveButton, isSaved && styles.saveButtonSuccess]}
          onPress={handleSave}
          activeOpacity={0.8}
        >
          <Ionicons
            name={isSaved ? 'checkmark-circle' : 'save'}
            size={20}
            color={colors.surface}
            style={{ marginRight: spacing.sm }}
          />
          <Text style={styles.saveButtonText}>
            {isSaved ? 'Saved!' : 'Save Profile'}
          </Text>
        </TouchableOpacity>

        {/* ── Footer / Developer & Brand Info ─────────────────────────── */}
        <View style={styles.footerContainer}>
          <View style={styles.footerLogoRow}>
            <Image
              source={require('@/assets/images/logo.png')}
              style={styles.footerAppLogo}
              resizeMode="contain"
            />
            <Text style={styles.footerAppName}>Mealytics</Text>
            <View style={styles.versionBadge}>
              <Text style={styles.versionText}>v{Constants.expoConfig?.version ?? '1.0.0'}</Text>
            </View>
          </View>

          <Text style={styles.footerAuthor}>
            Developed by <Text style={styles.footerAuthorHighlight}>Muddasir Hayat</Text>
          </Text>

          <TouchableOpacity
            onPress={() => Linking.openURL('https://codixr.com')}
            activeOpacity={0.7}
            style={styles.launchedByRow}
          >
            <Text style={styles.footerLaunched}>Launched by </Text>
            <Text style={styles.footerCodixr}>Codixr.com</Text>
            <Ionicons name="open-outline" size={12} color={colors.primaryDark} style={{ marginLeft: 3 }} />
          </TouchableOpacity>

          <View style={styles.privacyPill}>
            <Ionicons name="shield-checkmark-outline" size={13} color={colors.textSecondary} />
            <Text style={styles.privacyPillText}>On-device meal log · USDA search needs internet</Text>
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md },

  // BMI card
  bmiCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  bmiLeft: { alignItems: 'center', paddingRight: spacing.lg },
  bmiValue: { fontSize: 40, fontWeight: '800', color: colors.primary },
  bmiLabel: { ...typography.caption, color: colors.textSecondary, fontWeight: '600' },
  bmiDivider: { width: 1, height: '80%', backgroundColor: colors.border, marginRight: spacing.lg },
  bmiRight: { flex: 1 },
  bmiPill: {
    alignSelf: 'flex-start', borderRadius: 20,
    paddingHorizontal: spacing.md, paddingVertical: 4, marginBottom: spacing.xs,
  },
  bmiPillText: { ...typography.bodyMedium, fontWeight: '700' },
  bmiTargetLine: { ...typography.bodyMedium, color: colors.text, fontWeight: '600', marginBottom: 2 },
  bmiMacroLine: { ...typography.caption, color: colors.textSecondary },

  // Section
  sectionHeader: {
    ...typography.title, color: colors.text,
    marginBottom: spacing.md, marginTop: spacing.lg,
    paddingLeft: spacing.xs,
  },

  // Field
  fieldGroup: { marginBottom: spacing.md },
  fieldLabel: { ...typography.bodyMedium, color: colors.textSecondary, fontWeight: '600', marginBottom: spacing.xs },

  // Input
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md, borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: spacing.md,
  },
  input: {
    flex: 1, height: 50,
    ...typography.bodyLarge, color: colors.text,
  },
  inputSuffix: { ...typography.bodyMedium, color: colors.textMuted, fontWeight: '600' },

  // Chips
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 20, borderWidth: 1.5, borderColor: colors.border,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
  },
  chipActive: { backgroundColor: colors.primaryLight, borderColor: colors.primary },
  chipIcon: { fontSize: 14, marginRight: 4 },
  chipText: { ...typography.bodyMedium, color: colors.textSecondary, fontWeight: '600' },
  chipTextActive: { color: colors.primaryDark },

  // Unit toggle
  unitToggleRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  unitButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    gap: spacing.xs,
  },
  unitButtonActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  unitIcon: { fontSize: 18 },
  unitButtonText: { ...typography.bodyMedium, color: colors.textSecondary, fontWeight: '600' },
  unitButtonTextActive: { color: colors.primaryDark },

  // Imperial height row (ft + in side by side)
  imperialHeightRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },

  // Save
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  saveButtonSuccess: { backgroundColor: colors.success },
  saveButtonText: { ...typography.title, color: colors.surface },

  // Footer / Developer Info
  footerContainer: {
    alignItems: 'center',
    marginTop: spacing.xxl,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    gap: spacing.xs,
  },
  footerLogoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: 2,
  },
  footerAppLogo: {
    width: 24,
    height: 24,
    borderRadius: 6,
    marginRight: 4,
  },
  footerAppName: {
    ...typography.title,
    fontSize: 16,
    color: colors.text,
    letterSpacing: 0.5,
  },
  versionBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
    marginLeft: 4,
  },
  versionText: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  footerAuthor: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    fontSize: 13,
  },
  footerAuthorHighlight: {
    fontWeight: '700',
    color: colors.text,
  },
  launchedByRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
  },
  footerLaunched: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    fontSize: 13,
  },
  footerCodixr: {
    ...typography.bodyMedium,
    fontWeight: '700',
    color: colors.primaryDark,
    fontSize: 13,
    textDecorationLine: 'underline',
  },
  privacyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: spacing.sm,
    gap: 4,
  },
  privacyPillText: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '500',
  },
});

