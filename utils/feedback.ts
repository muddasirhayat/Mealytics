import { Platform } from 'react-native';

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
  notificationAsync: (type: unknown) => Promise<void>;
  NotificationFeedbackType: { Success: unknown };
};

let player: AudioPlayerLike | null = null;
let audioTried = false;
let audioAvailable = false;
let hapticsModule: ExpoHapticsModule | null | undefined;
let lastTickAt = 0;
const MIN_TICK_GAP_MS = 45;

const getHaptics = (): ExpoHapticsModule | null => {
  if (hapticsModule !== undefined) return hapticsModule;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    hapticsModule = require('expo-haptics') as ExpoHapticsModule;
  } catch {
    hapticsModule = null;
  }
  return hapticsModule;
};

const ensureAudio = async () => {
  if (audioTried) return;
  audioTried = true;
  if (Platform.OS === 'web') return;
  try {
    // Lazy require so older dev clients without ExpoAudio still boot.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const audio = require('expo-audio') as ExpoAudioModule;
    await audio.setAudioModeAsync({
      playsInSilentMode: false,
      interruptionMode: 'mixWithOthers',
    });
    player = audio.createAudioPlayer(require('@/assets/sounds/tick.wav'));
    player.volume = 0.35;
    audioAvailable = true;
  } catch {
    player = null;
    audioAvailable = false;
  }
};

export const tickFeedback = (options?: { haptic?: boolean; sound?: boolean }) => {
  const wantHaptic = options?.haptic !== false;
  const wantSound = options?.sound !== false;
  const now = Date.now();
  if (now - lastTickAt < MIN_TICK_GAP_MS) return;
  lastTickAt = now;

  if (wantHaptic) {
    const haptics = getHaptics();
    void haptics?.selectionAsync().catch(() => {});
  }

  if (wantSound && Platform.OS !== 'web') {
    void (async () => {
      await ensureAudio();
      if (!audioAvailable || !player) return;
      try {
        await player.seekTo(0);
        player.play();
      } catch {
        // ignore missing native audio / decode errors
      }
    })();
  }
};

export const successFeedback = () => {
  const haptics = getHaptics();
  if (haptics) {
    void haptics
      .notificationAsync(haptics.NotificationFeedbackType.Success)
      .catch(() => {});
  }
  tickFeedback({ haptic: false, sound: true });
};
