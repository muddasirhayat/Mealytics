import { emitSelectionHaptic, emitTick } from '@/hooks/useTickFeedback';
import { usePreferencesStore } from '@/store/preferencesStore';

const enabled = () => usePreferencesStore.getState().soundsAndHaptics;

export const tickFeedback = (options?: { haptic?: boolean; sound?: boolean }) => {
  if (!enabled()) return;
  // sound + haptic bundled in emitTick; options kept for call-site compat
  if (options?.haptic === false && options?.sound === false) return;
  emitTick('normal', true);
};

export const successFeedback = () => {
  if (!enabled()) return;
  emitSelectionHaptic(true);
  emitTick('major', true);
};
