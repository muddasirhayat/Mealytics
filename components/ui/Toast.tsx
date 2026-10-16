import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useThemeColors } from '@/hooks/useThemeColors';
import { radius } from '@/theme/radius';
import { typography } from '@/theme/typography';
import { raiseSm } from '@/utils/shadow';
import { useTabBarSpace } from '@/constants/layout';

export type ToastAction = {
  label: string;
  onPress: () => void;
};

type ToastState = {
  message: string;
  action?: ToastAction;
};

type ToastContextValue = {
  show: (message: string, action?: ToastAction) => void;
};

const ToastContext = createContext<ToastContextValue>({ show: () => {} });

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toast, setToast] = useState<ToastState | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tabSpace = useTabBarSpace();
  const colors = useThemeColors();

  const hide = useCallback(() => {
    setToast(null);
  }, []);

  const show = useCallback((message: string, action?: ToastAction) => {
    if (timer.current) {
      clearTimeout(timer.current);
    }
    setToast({ message, action });
    timer.current = setTimeout(hide, 3000);
  }, [hide]);

  useEffect(() => {
    return () => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
    };
  }, []);

  const value = useMemo(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast ? (
        <View
          style={[
            styles.wrap,
            raiseSm(),
            { bottom: tabSpace + 8, backgroundColor: colors.base },
          ]}
          accessibilityLiveRegion="polite"
        >
          <Text style={[styles.message, { color: colors.ink }]}>{toast.message}</Text>
          {toast.action ? (
            <Pressable
              onPress={() => {
                toast.action?.onPress();
                hide();
              }}
              accessibilityRole="button"
              accessibilityLabel={toast.action.label}
              hitSlop={8}
            >
              <Text style={[styles.action, { color: colors.accent }]}>{toast.action.label}</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </ToastContext.Provider>
  );
};

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 24,
    right: 24,
    zIndex: 50,
    borderRadius: radius.card,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  message: {
    ...typography.body,
    flex: 1,
  },
  action: {
    ...typography.chip,
  },
});
