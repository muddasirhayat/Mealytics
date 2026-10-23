import React, { useEffect } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { fonts } from '@/theme/fonts';
import { typography } from '@/theme/typography';
import { RaisedCard } from '@/components/ui/RaisedCard';
import { successFeedback } from '@/utils/feedback';
import { motion } from '@/constants/motion';

type GoalCelebrationProps = {
  visible: boolean;
  title: string;
  body: string;
  onClose: () => void;
};

export const GoalCelebration = ({ visible, title, body, onClose }: GoalCelebrationProps) => {
  const { colors } = useTheme();
  const checkScale = useSharedValue(0.86);

  useEffect(() => {
    if (!visible) {
      checkScale.value = 0.86;
      return;
    }
    successFeedback();
    checkScale.value = withSpring(1, motion.springSoft);
  }, [visible, checkScale]);

  const badgeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
  }));

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Dismiss"
        />
        <RaisedCard padding={22} radiusValue={24} style={styles.card}>
          <Animated.View
            style={[styles.badge, { backgroundColor: colors.mint }, badgeStyle]}
            accessible={false}
          >
            <Feather name="check" size={26} color={colors.onAccent} />
          </Animated.View>
          <Text style={[styles.title, { color: colors.ink }]}>{title}</Text>
          <Text style={[styles.body, { color: colors.muted }]}>{body}</Text>
          <Pressable
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Nice"
            style={[styles.action, { backgroundColor: colors.accent }]}
          >
            <Text style={[styles.actionLabel, { color: colors.onAccent }]}>Nice</Text>
          </Pressable>
        </RaisedCard>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    gap: 12,
    zIndex: 1,
    alignItems: 'center',
  },
  badge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
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
  action: {
    alignSelf: 'stretch',
    height: 48,
    minHeight: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  actionLabel: {
    fontFamily: fonts.outfitSemiBold,
    fontSize: 16,
    fontWeight: '600',
  },
});
