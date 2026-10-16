import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { Screen } from '@/components/ui/Screen';
import { useTheme } from '@/hooks/useTheme';
import { fonts } from '@/theme/fonts';
import { typography } from '@/theme/typography';

export default function NotFoundScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  return (
    <Screen>
      <View style={styles.center}>
        <Text style={[styles.title, { color: colors.ink }]}>This page is not here</Text>
        <Text style={[styles.body, { color: colors.inkSecondary }]}>
          The link may be old, or that screen was moved. Head back to Today and keep logging.
        </Text>
        <PrimaryButton label="Go to Today" onPress={() => router.replace('/')} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    gap: 16,
  },
  title: {
    fontFamily: fonts.outfitBold,
    fontSize: 28,
    textAlign: 'center',
  },
  body: {
    ...typography.body,
    textAlign: 'center',
  },
});
