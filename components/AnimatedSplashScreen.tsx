import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import * as SplashScreen from 'expo-splash-screen';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/fonts';

SplashScreen.preventAutoHideAsync().catch(() => {});
SplashScreen.setOptions({ duration: 0, fade: false });

const TILE_FINAL = 84;
const TILE_START = 96;
const TILE_START_SCALE = TILE_START / TILE_FINAL;
const GAP_TILE_HEADLINE = 34;
const HEADLINE_LINE_HEIGHT = 50;
const HEADLINE_HEIGHT = HEADLINE_LINE_HEIGHT * 2;
const GAP_HEADLINE_WORDMARK = 24;
const WORDMARK_HEIGHT = 28;
const COLUMN_HEIGHT =
  TILE_FINAL + GAP_TILE_HEADLINE + HEADLINE_HEIGHT + GAP_HEADLINE_WORDMARK + WORDMARK_HEIGHT;
const START_TRANSLATE_Y = COLUMN_HEIGHT / 2 - TILE_FINAL / 2;

const WORDS = ['Eat', 'well,', 'track', 'softly'] as const;
const WORD_DELAYS = [80, 140, 200, 260];
const WORD_DURATION = 140;
const READY_TIMEOUT_MS = 1600;

type AnimatedSplashScreenProps = {
  onFinish?: () => void;
  children: React.ReactNode;
  ready?: boolean;
};

type SplashBlob = {
  size: number;
  color: string;
  left?: number;
  right?: number;
  top: `${number}%`;
};

const BLOBS: SplashBlob[] = [
  { size: 280, color: colors.blobMint, left: -70, top: '15%' },
  { size: 260, color: colors.blobViolet, right: -30, top: '29%' },
  { size: 240, color: colors.blobPeach, left: 90, top: '58%' },
];

const SplashBlobCircle = ({ blob, id }: { blob: SplashBlob; id: string }) => (
  <View
    pointerEvents="none"
    accessible={false}
    importantForAccessibility="no-hide-descendants"
    style={[
      styles.blob,
      {
        width: blob.size,
        height: blob.size,
        top: blob.top,
        left: blob.left,
        right: blob.right,
      },
    ]}
  >
    <Svg width={blob.size} height={blob.size}>
      <Defs>
        <RadialGradient id={id} cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor={blob.color} stopOpacity={0.68} />
          <Stop offset="100%" stopColor={blob.color} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Circle cx={blob.size / 2} cy={blob.size / 2} r={blob.size / 2} fill={`url(#${id})`} />
    </Svg>
  </View>
);

const AnimatedWord = ({
  text,
  opacity,
  translateY,
}: {
  text: string;
  opacity: SharedValue<number>;
  translateY: SharedValue<number>;
}) => {
  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));
  return (
    <Animated.Text style={[styles.headlineWord, style]} accessible={false}>
      {text}
    </Animated.Text>
  );
};

export const AnimatedSplashScreen = ({
  onFinish,
  children,
  ready = true,
}: AnimatedSplashScreenProps) => {
  const [animationDone, setAnimationDone] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [laidOut, setLaidOut] = useState(false);
  const reduceMotion = useReducedMotion();
  const started = useRef(false);

  const overlayOpacity = useSharedValue(1);
  const blobOpacity = useSharedValue(0);
  const blobScale = useSharedValue(0.85);
  const tileTranslateY = useSharedValue(START_TRANSLATE_Y);
  const tileScale = useSharedValue(TILE_START_SCALE);
  const word0o = useSharedValue(0);
  const word1o = useSharedValue(0);
  const word2o = useSharedValue(0);
  const word3o = useSharedValue(0);
  const word0y = useSharedValue(12);
  const word1y = useSharedValue(12);
  const word2y = useSharedValue(12);
  const word3y = useSharedValue(12);
  const wordmarkOpacity = useSharedValue(0);

  const canPlay = ready || timedOut;

  const finish = useCallback(() => {
    setAnimationDone(true);
    onFinish?.();
  }, [onFinish]);

  useEffect(() => {
    const id = setTimeout(() => setTimedOut(true), READY_TIMEOUT_MS);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    if (!canPlay || !laidOut || started.current) {
      return;
    }
    started.current = true;

    const fadeWord = (opacity: SharedValue<number>, translateY: SharedValue<number>, delay: number) => {
      opacity.value = withDelay(
        delay,
        withTiming(1, { duration: WORD_DURATION, easing: Easing.out(Easing.quad) })
      );
      translateY.value = withDelay(
        delay,
        withTiming(0, { duration: WORD_DURATION, easing: Easing.out(Easing.quad) })
      );
    };

    requestAnimationFrame(() => {
      if (reduceMotion) {
        blobOpacity.value = 1;
        blobScale.value = 1;
        tileTranslateY.value = 0;
        tileScale.value = 1;
        word0o.value = 1;
        word1o.value = 1;
        word2o.value = 1;
        word3o.value = 1;
        word0y.value = 0;
        word1y.value = 0;
        word2y.value = 0;
        word3y.value = 0;
        wordmarkOpacity.value = 1;
        overlayOpacity.value = withTiming(0, { duration: 120, easing: Easing.in(Easing.quad) }, (finished) => {
          if (finished) runOnJS(finish)();
        });
        return;
      }

      blobOpacity.value = withTiming(1, { duration: 180, easing: Easing.out(Easing.cubic) });
      blobScale.value = withTiming(1, { duration: 180, easing: Easing.out(Easing.cubic) });
      tileTranslateY.value = withDelay(
        40,
        withTiming(0, { duration: 200, easing: Easing.out(Easing.back(1.2)) })
      );
      tileScale.value = withDelay(
        40,
        withTiming(1, { duration: 200, easing: Easing.out(Easing.back(1.2)) })
      );
      fadeWord(word0o, word0y, WORD_DELAYS[0]);
      fadeWord(word1o, word1y, WORD_DELAYS[1]);
      fadeWord(word2o, word2y, WORD_DELAYS[2]);
      fadeWord(word3o, word3y, WORD_DELAYS[3]);
      wordmarkOpacity.value = withDelay(320, withTiming(1, { duration: 120, easing: Easing.linear }));
      overlayOpacity.value = withDelay(
        420,
        withTiming(0, { duration: 160, easing: Easing.in(Easing.quad) }, (finished) => {
          if (finished) runOnJS(finish)();
        })
      );
    });
    // Shared values from useSharedValue are stable; listing them trips react-hooks/immutability.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reanimated shared values
  }, [canPlay, laidOut, reduceMotion, finish]);

  const overlayStyle = useAnimatedStyle(() => ({ opacity: overlayOpacity.value }));
  const blobsStyle = useAnimatedStyle(() => ({
    opacity: blobOpacity.value,
    transform: [{ scale: blobScale.value }],
  }));
  const tileStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: tileTranslateY.value }, { scale: tileScale.value }],
  }));
  const wordmarkStyle = useAnimatedStyle(() => ({ opacity: wordmarkOpacity.value }));

  return (
    <View style={styles.root}>
      {children}
      {!animationDone ? (
        <Animated.View
          style={[styles.overlay, overlayStyle]}
          pointerEvents="none"
          onLayout={() => {
            setLaidOut(true);
            SplashScreen.hideAsync().catch(() => {});
          }}
        >
          <Animated.View style={[StyleSheet.absoluteFill, blobsStyle]} accessible={false}>
            {BLOBS.map((blob, index) => (
              <SplashBlobCircle key={blob.color} blob={blob} id={`splash-blob-${index}`} />
            ))}
          </Animated.View>
          <View style={styles.column}>
            <Animated.View style={[styles.tile, tileStyle]}>
              <Image
                source={require('@/assets/brand/logo.png')}
                style={styles.tileImage}
                resizeMode="contain"
                accessibilityLabel="Mealytics logo"
              />
            </Animated.View>
            <View
              style={styles.headline}
              accessible
              accessibilityLabel="Eat well, track softly"
            >
              <View style={styles.headlineRow}>
                <AnimatedWord text={WORDS[0]} opacity={word0o} translateY={word0y} />
                <AnimatedWord text={WORDS[1]} opacity={word1o} translateY={word1y} />
              </View>
              <View style={styles.headlineRow}>
                <AnimatedWord text={WORDS[2]} opacity={word2o} translateY={word2y} />
                <AnimatedWord text={WORDS[3]} opacity={word3o} translateY={word3y} />
              </View>
            </View>
            <Animated.Text style={[styles.wordmark, wordmarkStyle]}>mealytics</Animated.Text>
          </View>
        </Animated.View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: colors.base,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 99999,
  },
  blob: {
    position: 'absolute',
  },
  column: {
    alignItems: 'center',
  },
  tile: {
    width: TILE_FINAL,
    height: TILE_FINAL,
    boxShadow: [{ offsetX: 0, offsetY: 10, blurRadius: 25, color: 'rgba(74,78,219,0.28)' }],
  },
  tileImage: {
    width: TILE_FINAL,
    height: TILE_FINAL,
  },
  headline: {
    marginTop: GAP_TILE_HEADLINE,
    alignItems: 'center',
  },
  headlineRow: {
    flexDirection: 'row',
    gap: 10,
  },
  headlineWord: {
    fontFamily: fonts.outfitBold,
    fontSize: 46,
    fontWeight: '700',
    letterSpacing: -1.6,
    lineHeight: HEADLINE_LINE_HEIGHT,
    color: colors.ink,
    textAlign: 'center',
  },
  wordmark: {
    marginTop: GAP_HEADLINE_WORDMARK,
    fontFamily: fonts.outfitBold,
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.6,
    lineHeight: WORDMARK_HEIGHT,
    color: colors.muted,
  },
});
