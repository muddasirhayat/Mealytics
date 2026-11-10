import { Platform, type TextStyle, type ViewStyle } from 'react-native';

/** Stops drag-to-select on wheels, rulers, and other controls. Web only. */
export const webNoSelect: ViewStyle & TextStyle =
  Platform.OS === 'web' ? { userSelect: 'none' } : {};
