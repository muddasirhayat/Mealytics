import { Platform, type ViewStyle } from 'react-native';
import { getActiveColors, isDarkScheme } from '@/theme/runtime';

/**
 * Soft-UI shadows. Light and dark use the SAME neumorphic geometry;
 * only the token colours differ (shadowLight / shadowDark / glass*).
 * Light output is unchanged from the original implementation.
 */

const androidVersion = Platform.OS === 'android' ? Number(Platform.Version) : 99;
const canOutset = Platform.OS !== 'android' || androidVersion >= 28;
const canInset = Platform.OS !== 'android' || androidVersion >= 29;

export const raise = (): ViewStyle => {
  const colors = getActiveColors();
  if (!canOutset) {
    return { borderWidth: 1, borderColor: colors.fallbackBorder };
  }
  return {
    boxShadow: [
      { offsetX: -8, offsetY: -8, blurRadius: 18, color: colors.shadowLight },
      { offsetX: 8, offsetY: 8, blurRadius: 18, color: colors.shadowDark },
    ],
  };
};

export const raiseSm = (): ViewStyle => {
  const colors = getActiveColors();
  if (!canOutset) {
    return { borderWidth: 1, borderColor: colors.fallbackBorder };
  }
  return {
    boxShadow: [
      { offsetX: -5, offsetY: -5, blurRadius: 12, color: colors.shadowLight },
      { offsetX: 5, offsetY: 5, blurRadius: 12, color: colors.shadowDark },
    ],
  };
};

/** Cheapest raised look for long lists (same look as raiseSm). */
export const raiseList = (): ViewStyle => raiseSm();

export const inset = (): ViewStyle => {
  const colors = getActiveColors();
  if (!canInset) {
    return {
      borderWidth: 1,
      borderColor: colors.fallbackBorder,
      backgroundColor: colors.insetFill,
    };
  }
  return {
    boxShadow: [
      { offsetX: -5, offsetY: -5, blurRadius: 10, color: colors.shadowLight, inset: true },
      { offsetX: 5, offsetY: 5, blurRadius: 10, color: colors.shadowDark, inset: true },
    ],
  };
};

export const primaryButtonShadow = (): ViewStyle => {
  const colors = getActiveColors();
  if (!canOutset) {
    return { borderWidth: 1, borderColor: colors.fallbackBorder };
  }
  return {
    boxShadow: [
      { offsetX: 6, offsetY: 6, blurRadius: 16, color: colors.accentShadow },
      { offsetX: -6, offsetY: -6, blurRadius: 14, color: colors.shadowLight },
    ],
  };
};

export const plusShadow = (): ViewStyle => primaryButtonShadow();

export const centerTabShadow = (): ViewStyle => {
  const colors = getActiveColors();
  if (!canOutset) {
    return { borderWidth: 1, borderColor: colors.fallbackBorder };
  }
  return {
    boxShadow: [
      {
        offsetX: 0,
        offsetY: 8,
        blurRadius: 18,
        color: isDarkScheme() ? colors.accentShadow : 'rgba(91,95,239,0.45)',
      },
    ],
  };
};

export const glassShadow = (): ViewStyle => {
  const colors = getActiveColors();
  if (!canOutset) {
    return { borderWidth: 1, borderColor: colors.fallbackBorder };
  }
  return {
    boxShadow: [
      { offsetX: 0, offsetY: 1, blurRadius: 0, color: colors.glassHighlight, inset: canInset },
      { offsetX: 0, offsetY: 12, blurRadius: 32, color: colors.glassShadow },
    ],
  };
};
