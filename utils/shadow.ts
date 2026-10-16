import { Platform, type ViewStyle } from 'react-native';
import { getActiveColors, isDarkScheme } from '@/theme/runtime';

const androidVersion = Platform.OS === 'android' ? Number(Platform.Version) : 99;
const canOutset = Platform.OS !== 'android' || androidVersion >= 28;
const canInset = Platform.OS !== 'android' || androidVersion >= 29;

export const raise = (): ViewStyle => {
  const colors = getActiveColors();
  if (isDarkScheme()) {
    return {
      borderWidth: 1,
      borderColor: colors.border,
      boxShadow: canOutset
        ? [{ offsetX: 0, offsetY: 10, blurRadius: 24, color: 'rgba(0,0,0,0.40)' }]
        : undefined,
    };
  }
  if (!canOutset) {
    return { borderWidth: 1, borderColor: colors.fallbackBorder };
  }
  // Never emit a white highlight when the active palette has no light shadow.
  if (!colors.shadowLight || colors.shadowLight === 'transparent') {
    return {
      borderWidth: 1,
      borderColor: colors.border,
      boxShadow: canOutset
        ? [{ offsetX: 0, offsetY: 10, blurRadius: 24, color: 'rgba(0,0,0,0.40)' }]
        : undefined,
    };
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
  if (isDarkScheme()) {
    return {
      borderWidth: 1,
      borderColor: colors.border,
      boxShadow: canOutset
        ? [{ offsetX: 0, offsetY: 6, blurRadius: 16, color: 'rgba(0,0,0,0.35)' }]
        : undefined,
    };
  }
  if (!canOutset) {
    return { borderWidth: 1, borderColor: colors.fallbackBorder };
  }
  if (!colors.shadowLight || colors.shadowLight === 'transparent') {
    return {
      borderWidth: 1,
      borderColor: colors.border,
      boxShadow: canOutset
        ? [{ offsetX: 0, offsetY: 6, blurRadius: 16, color: 'rgba(0,0,0,0.35)' }]
        : undefined,
    };
  }
  return {
    boxShadow: [
      { offsetX: -5, offsetY: -5, blurRadius: 12, color: colors.shadowLight },
      { offsetX: 5, offsetY: 5, blurRadius: 12, color: colors.shadowDark },
    ],
  };
};

/** Cheapest raised look for long lists. */
export const raiseList = (): ViewStyle => {
  const colors = getActiveColors();
  if (isDarkScheme()) {
    return { borderWidth: 1, borderColor: colors.border };
  }
  return raiseSm();
};

export const inset = (): ViewStyle => {
  const colors = getActiveColors();
  if (isDarkScheme() || !colors.shadowLight || colors.shadowLight === 'transparent') {
    return {
      backgroundColor: colors.surfaceRaised,
      borderWidth: 1,
      borderColor: colors.border,
      boxShadow: canInset
        ? [{ offsetX: 0, offsetY: 2, blurRadius: 6, color: 'rgba(0,0,0,0.45)', inset: true }]
        : undefined,
    };
  }
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
  if (isDarkScheme() || !colors.shadowLight || colors.shadowLight === 'transparent') {
    return {
      boxShadow: canOutset
        ? [{ offsetX: 0, offsetY: 8, blurRadius: 20, color: colors.accentShadow }]
        : undefined,
    };
  }
  if (!canOutset) {
    return { borderWidth: 1, borderColor: colors.fallbackBorder };
  }
  return {
    boxShadow: [
      { offsetX: 6, offsetY: 6, blurRadius: 16, color: 'rgba(91,95,239,0.4)' },
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
  if (isDarkScheme()) {
    return {
      borderWidth: 1,
      borderColor: colors.glassBorder,
      boxShadow: canOutset
        ? [{ offsetX: 0, offsetY: 8, blurRadius: 20, color: 'rgba(0,0,0,0.35)' }]
        : undefined,
    };
  }
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
