import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { PrimaryButton, Screen } from '@/components/ui';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/fonts';
import { typography } from '@/theme/typography';

export default function NotFoundScreen() {
  const router = useRouter();
  return (
    <Screen>
      <View style={styles.center}>
        <Text style={styles.title}>This page is not here</Text>
        <Text style={styles.body}>The link may be old, or that screen was moved. Head back to Today and keep logging.</Text>
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
    color: colors.ink,
    textAlign: 'center',
  },
  body: {
    ...typography.body,
    color: colors.muted,
    textAlign: 'center',
  },
});
