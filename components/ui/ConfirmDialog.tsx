import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useThemeColors } from '@/hooks/useThemeColors';
import { fonts } from '@/theme/fonts';
import { typography } from '@/theme/typography';
import { RaisedCard } from '@/components/ui/RaisedCard';

export type ConfirmDialogAction = {
  label: string;
  onPress: () => void;
};

type ConfirmDialogProps = {
  visible: boolean;
  title: string;
  body: string;
  cancelLabel?: string;
  confirmLabel: string;
  destructive?: boolean;
  extraActions?: ConfirmDialogAction[];
  onCancel: () => void;
  onConfirm: () => void;
};

export const ConfirmDialog = ({
  visible,
  title,
  body,
  cancelLabel = 'Cancel',
  confirmLabel,
  destructive = false,
  extraActions,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) => {
  const colors = useThemeColors();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onCancel}
          accessibilityRole="button"
          accessibilityLabel="Dismiss"
        />
        <RaisedCard padding={22} radiusValue={24} style={styles.card}>
          <Text style={[styles.title, { color: colors.ink }]}>{title}</Text>
          <Text style={[styles.body, { color: colors.muted }]}>{body}</Text>
          {extraActions?.map((action) => (
            <Pressable
              key={action.label}
              onPress={action.onPress}
              accessibilityRole="button"
              accessibilityLabel={action.label}
              style={[styles.extra, { backgroundColor: colors.base }]}
            >
              <Text style={[styles.extraLabel, { color: colors.accent }]}>{action.label}</Text>
            </Pressable>
          ))}
          <View style={styles.row}>
            <Pressable
              onPress={onCancel}
              accessibilityRole="button"
              accessibilityLabel={cancelLabel}
              style={[styles.cancel, { backgroundColor: colors.base }]}
            >
              <Text style={[styles.cancelLabel, { color: colors.accent }]}>{cancelLabel}</Text>
            </Pressable>
            <Pressable
              onPress={onConfirm}
              accessibilityRole="button"
              accessibilityLabel={confirmLabel}
              style={[
                styles.confirm,
                { backgroundColor: destructive ? colors.danger : colors.accent },
              ]}
            >
              <Text style={[styles.confirmLabel, { color: colors.textInverse }]}>{confirmLabel}</Text>
            </Pressable>
          </View>
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
  },
  title: {
    fontFamily: fonts.outfitBold,
    fontSize: 22,
    fontWeight: '700',
  },
  body: {
    ...typography.body,
  },
  extra: {
    height: 44,
    minHeight: 44,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  extraLabel: {
    fontFamily: fonts.outfitSemiBold,
    fontSize: 15,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  cancel: {
    flex: 1,
    height: 44,
    minHeight: 44,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelLabel: {
    fontFamily: fonts.outfitSemiBold,
    fontSize: 15,
    fontWeight: '600',
  },
  confirm: {
    flex: 1,
    height: 44,
    minHeight: 44,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmLabel: {
    fontFamily: fonts.outfitSemiBold,
    fontSize: 15,
    fontWeight: '600',
  },
});
