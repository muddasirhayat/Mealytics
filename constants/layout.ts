import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const TAB_BAR_HEIGHT = 74;
export const TAB_BAR_BOTTOM_OFFSET = 8;
export const TAB_BAR_SIDE_INSET = 14;
/** Tab bar height + bottom offset. Add safe-area inset (see useTabBarSpace). */
export const TAB_BAR_SPACE = TAB_BAR_HEIGHT + TAB_BAR_BOTTOM_OFFSET;

export const tabBarSpace = (bottomInset: number): number =>
  TAB_BAR_HEIGHT + TAB_BAR_BOTTOM_OFFSET + bottomInset;

export const useTabBarSpace = (): number => {
  const insets = useSafeAreaInsets();
  return tabBarSpace(insets.bottom);
};
