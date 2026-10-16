import React, { useEffect } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useThemeColors } from '@/hooks/useThemeColors';
import { fonts } from '@/theme/fonts';
import { typography } from '@/theme/typography';
import { RaisedCard } from '@/components/ui/RaisedCard';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { inset, raise } from '@/utils/shadow';
import { successFeedback } from '@/utils/feedback';

type GoalCelebrationProps = {
  visible: boolean;
  title: string;
  body: string;
  onClose: () => void;
};

export const GoalCelebration = ({ visible, title, body, onClose }: GoalCelebrationProps) => {
  const colors = useThemeColors();

  useEffect(() => {
    if (visible) successFeedback();
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Dismiss" />
        <RaisedCard padding={24} radiusValue={28} style={styles.card}>
          <View style={[styles.outer, raise()]} accessible={false}>
            <View style={[styles.inner, inset()]}>
              <View style={[styles.check, { backgroundColor: colors.mint }]}>
                <Feather name="check" size={36} color={colors.textInverse} />
              </View>
            </View>
          </View>
          <Text style={[styles.title, { color: colors.ink }]}>{title}</Text>
          <Text style={[styles.body, { color: colors.muted }]}>{body}</Text>
          <PrimaryButton label="Nice" onPress={onClose} />
        </RaisedCard>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(30,37,51,0.4)',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    gap: 14,
    alignItems: 'center',
    zIndex: 1,
  },
  outer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  check: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: fonts.outfitBold,
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  body: {
    ...typography.body,
    textAlign: 'center',
  },
});
