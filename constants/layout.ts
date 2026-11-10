import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const PRIMARY_BUTTON_HEIGHT = 62;
export const STICKY_CTA_TOP_PAD = 12;
export const STICKY_CTA_MIN_BOTTOM = 24;

/** Height of a pinned primary-button bar, including its own bottom inset padding. */
export const stickyCtaHeight = (bottomInset: number): number =>
  STICKY_CTA_TOP_PAD + PRIMARY_BUTTON_HEIGHT + Math.max(bottomInset, STICKY_CTA_MIN_BOTTOM);

/**
 * Scroll padding so the last line clears a pinned CTA.
 * Footer height, plus the safe-area inset once more.
 */
export const stickyCtaScrollPadding = (bottomInset: number, extra = 0): number =>
  stickyCtaHeight(bottomInset) + bottomInset + extra;

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
