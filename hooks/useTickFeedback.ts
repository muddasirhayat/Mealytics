import { useCallback, useRef } from 'react';
import { Platform } from 'react-native';
import { usePreferencesStore } from '@/store/preferencesStore';

type AudioPlayerLike = {
  volume: number;
  seekTo: (seconds: number) => Promise<void>;
  play: () => void;
};

type ExpoAudioModule = {
  createAudioPlayer: (source: number) => AudioPlayerLike;
  setAudioModeAsync: (mode: {
    playsInSilentMode: boolean;
    interruptionMode: 'mixWithOthers';
  }) => Promise<void>;
};

type ExpoHapticsModule = {
  selectionAsync: () => Promise<void>;
  impactAsync: (style: unknown) => Promise<void>;
  ImpactFeedbackStyle: { Light: unknown };
};

let sharedPlayer: AudioPlayerLike | null = null;
let audioTried = false;
let audioOk = false;

/** True only when the native ExpoAudio module is linked (dev client / rebuild). */
const hasExpoAudioNative = (): boolean => {
  if (Platform.OS === 'web') return false;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { requireOptionalNativeModule } = require('expo-modules-core') as {
      requireOptionalNativeModule: (name: string) => unknown;
    };
    return requireOptionalNativeModule('ExpoAudio') != null;
  } catch {
    return false;
  }
};

const ensurePlayer = async (): Promise<AudioPlayerLike | null> => {
  if (audioTried) return audioOk ? sharedPlayer : null;
  audioTried = true;
  if (!hasExpoAudioNative()) {
    audioOk = false;
    return null;
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const audio = require('expo-audio') as ExpoAudioModule;
    await audio.setAudioModeAsync({
      playsInSilentMode: false,
      interruptionMode: 'mixWithOthers',
    });
    sharedPlayer = audio.createAudioPlayer(require('@/assets/sounds/tick.wav'));
    sharedPlayer.volume = 0.35;
    audioOk = true;
    return sharedPlayer;
  } catch {
    sharedPlayer = null;
    audioOk = false;
    return null;
  }
};

const getHaptics = (): ExpoHapticsModule | null => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { requireOptionalNativeModule } = require('expo-modules-core') as {
      requireOptionalNativeModule: (name: string) => unknown;
    };
    if (requireOptionalNativeModule('ExpoHaptics') == null) return null;
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('expo-haptics') as ExpoHapticsModule;
  } catch {
    return null;
  }
};

let lastTickAt = 0;
const MIN_GAP_MS = 30;

export type TickKind = 'normal' | 'major';

/** Imperative tick (safe from runOnJS / scroll handlers). */
export const emitTick = (kind: TickKind = 'normal', enabled = true) => {
  if (!enabled) return;
  const now = Date.now();
  if (now - lastTickAt < MIN_GAP_MS) return;
  lastTickAt = now;

  const haptics = getHaptics();
  if (haptics) {
    if (kind === 'major') {
      void haptics.impactAsync(haptics.ImpactFeedbackStyle.Light).catch(() => {});
    } else {
      void haptics.selectionAsync().catch(() => {});
    }
  }

  void (async () => {
    const player = await ensurePlayer();
    if (!player) return;
    try {
      player.volume = kind === 'major' ? 0.5 : 0.35;
      await player.seekTo(0);
      player.play();
    } catch {
      // ignore
    }
  })();
};

export const emitSelectionHaptic = (enabled = true) => {
  if (!enabled) return;
  const haptics = getHaptics();
  void haptics?.selectionAsync().catch(() => {});
};

/** Tick helpers bound to the Profile Sounds & haptics toggle. No native preload. */
export const useTickFeedback = () => {
  const enabled = usePreferencesStore((s) => s.soundsAndHaptics);
  const lastValue = useRef<number | null>(null);

  const tickIfChanged = useCallback(
    (value: number, majorEvery = 5) => {
      if (!enabled) return;
      if (lastValue.current === value) return;
      lastValue.current = value;
      const isMajor = Math.abs(value % majorEvery) < 1e-6 || Math.abs((value / majorEvery) % 1) < 1e-6;
      const major =
        Number.isInteger(value) || Math.abs(value - Math.round(value)) < 1e-6
          ? Math.round(value) % majorEvery === 0
          : isMajor;
      emitTick(major ? 'major' : 'normal', true);
    },
    [enabled]
  );

  const selection = useCallback(() => {
    emitSelectionHaptic(enabled);
  }, [enabled]);

  return {
    enabled,
    tickIfChanged,
    selection,
    emitTick: (kind: TickKind = 'normal') => emitTick(kind, enabled),
  };
};
