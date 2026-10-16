import React, { useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Chip, GlassCard, LogoMark, PrimaryButton, RaisedCard, Screen } from '@/components/ui';
import { IconSquare } from '@/components/ui/IconSquare';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/fonts';
import { inset, raiseSm } from '@/utils/shadow';

const SLIDES = [
  {
    title: 'Find any food\nin seconds',
    subtitle: 'A built-in food database that works offline, plus online search when you need more.',
    blobs: 'B2' as const,
  },
  {
    title: 'Every macro,\none glance',
    subtitle: 'Protein, carbs, fat and fiber against your goal, plus water in one tap.',
    blobs: 'B1' as const,
  },
  {
    title: 'Out of ideas?\nTry quick meals',
    subtitle: 'Ideas that fit your calories left, and every day saved in Logs.',
    blobs: 'B2' as const,
  },
];

const SearchVisual = () => (
  <View>
    <View style={[styles.searchFake, inset()]} accessible={false}>
      <Feather name="search" size={20} color={colors.muted} />
      <Text style={styles.searchText}>biryani</Text>
    </View>
    <GlassCard padding={18} radiusValue={26} style={styles.visualCard}>
      {[
        { n: 'Chicken biryani', p: '1 plate · 610 kcal' },
        { n: 'Tuna salad', p: '1 bowl · 320 kcal' },
        { n: 'Banana', p: '1 medium · 105 kcal' },
      ].map((row) => (
        <View key={row.n} style={styles.foodRow}>
          <View style={styles.flex}>
            <Text style={styles.foodName}>{row.n}</Text>
            <Text style={styles.foodMeta}>{row.p}</Text>
          </View>
          <View style={[styles.miniPlus, raiseSm()]}>
            <Feather name="plus" size={16} color={colors.accent} />
          </View>
        </View>
      ))}
    </GlassCard>
    <View style={styles.chipRow}>
      <Chip label="Offline database" selected />
      <Chip label="Online search" />
    </View>
  </View>
);

const MacroVisual = () => (
  <View>
    <GlassCard padding={12} radiusValue={28} style={styles.visualCard}>
      <View style={styles.macroRow}>
        {[
          { l: 'Protein', v: '68g', c: colors.protein },
          { l: 'Carbs', v: '142g', c: colors.carbs },
          { l: 'Fat', v: '38g', c: colors.fat },
          { l: 'Fiber', v: '14g', c: colors.fiber },
        ].map((m) => (
          <View key={m.l} style={styles.macroItem}>
            <View style={[styles.macroRing, inset()]}>
              <Text style={styles.macroVal}>{m.v}</Text>
            </View>
            <Text style={styles.macroLbl}>{m.l}</Text>
          </View>
        ))}
      </View>
    </GlassCard>
    <RaisedCard padding={18} radiusValue={26} style={styles.waterCard}>
      <View style={styles.glasses}>
        {[86, 86, 45, 0].map((fill, i) => (
          <View key={i} style={[styles.glass, inset()]}>
            <View style={[styles.glassFill, { height: `${fill}%` }]} />
          </View>
        ))}
      </View>
      <View style={styles.waterBtn}>
        <Text style={styles.waterBtnText}>+ 250 ml</Text>
      </View>
    </RaisedCard>
  </View>
);

const QuickVisual = () => (
  <View>
    <GlassCard padding={18} radiusValue={22} style={styles.quickHead}>
      <Text style={styles.foodName}>10 ideas for today</Text>
      <Text style={styles.foodMeta}>1,801 kcal left</Text>
    </GlassCard>
    {[
      { n: 'Grilled chicken & rice', t: 'High protein', k: '612', ic: 'target' as const },
      { n: 'Greek yogurt parfait', t: 'Breakfast', k: '326', ic: 'sun' as const },
      { n: 'Chickpea Buddha bowl', t: 'Vegan', k: '498', ic: 'heart' as const },
    ].map((m) => (
      <RaisedCard key={m.n} padding={16} radiusValue={22} style={styles.mealCard}>
        <View style={styles.mealRow}>
          <IconSquare name={m.ic} size={48} color={colors.accent} />
          <View style={styles.flex}>
            <Text style={styles.foodName}>{m.n}</Text>
            <Text style={styles.foodMeta}>{m.t}</Text>
          </View>
          <Text style={styles.kcal}>{m.k} kcal</Text>
        </View>
      </RaisedCard>
    ))}
  </View>
);

export default function OnboardingIntro() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);
  const [page, setPage] = useState(0);
  const slide = SLIDES[page] ?? SLIDES[0];

  const goNext = () => {
    if (page < SLIDES.length - 1) {
      const next = page + 1;
      scrollRef.current?.scrollTo({ x: next * width, animated: true });
      setPage(next);
      return;
    }
    router.push('/onboarding/name');
  };

  return (
    <Screen blobs={slide.blobs} padded={false} edges={{ top: true, bottom: false }}>
      <View style={styles.top}>
        <LogoMark />
        <Pressable
          onPress={() => router.push('/onboarding/name')}
          accessibilityRole="button"
          accessibilityLabel="Skip introduction"
          style={styles.skip}
        >
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>
      </View>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const next = Math.round(event.nativeEvent.contentOffset.x / width);
          setPage(next);
        }}
      >
        {SLIDES.map((item, index) => (
          <View key={item.title} style={[styles.page, { width }]}>
            <View style={styles.visual} accessible={false} importantForAccessibility="no-hide-descendants">
              {index === 0 ? <SearchVisual /> : index === 1 ? <MacroVisual /> : <QuickVisual />}
            </View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.sub}>{item.subtitle}</Text>
          </View>
        ))}
      </ScrollView>
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 24) }]}>
        <View style={styles.dots} accessible={false}>
          {SLIDES.map((item, index) => (
            <View key={item.title} style={[styles.dot, index === page ? styles.dotOn : styles.dotOff]} />
          ))}
        </View>
        <PrimaryButton label="Next" onPress={goNext} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 10,
  },
  skip: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  skipText: {
    fontFamily: fonts.manropeBold,
    fontSize: 14,
    fontWeight: '700',
    color: colors.muted,
  },
  page: {
    paddingHorizontal: 24,
    paddingTop: 30,
  },
  visual: {
    minHeight: 280,
  },
  title: {
    fontFamily: fonts.outfitBold,
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: -1,
    lineHeight: 39,
    color: colors.ink,
    marginTop: 28,
  },
  sub: {
    fontFamily: fonts.manropeMedium,
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 22.5,
    color: colors.muted,
    marginTop: 12,
  },
  footer: {
    paddingHorizontal: 24,
    gap: 16,
  },
  dots: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  dot: {
    height: 10,
    borderRadius: 6,
  },
  dotOn: {
    width: 26,
    backgroundColor: colors.accent,
  },
  dotOff: {
    width: 10,
    backgroundColor: colors.insetFill,
  },
  searchFake: {
    height: 54,
    borderRadius: 18,
    backgroundColor: colors.base,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
  },
  searchText: {
    fontFamily: fonts.outfitSemiBold,
    fontSize: 17,
    color: colors.ink,
  },
  visualCard: {
    marginTop: 16,
  },
  foodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  flex: { flex: 1 },
  foodName: {
    fontFamily: fonts.outfitSemiBold,
    fontSize: 15.5,
    fontWeight: '600',
    color: colors.ink,
  },
  foodMeta: {
    fontFamily: fonts.manropeBold,
    fontSize: 12.5,
    fontWeight: '600',
    color: colors.muted,
  },
  miniPlus: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.base,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  macroRow: {
    flexDirection: 'row',
  },
  macroItem: {
    flex: 1,
    alignItems: 'center',
  },
  macroRing: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.base,
    alignItems: 'center',
    justifyContent: 'center',
  },
  macroVal: {
    fontFamily: fonts.outfitBold,
    fontSize: 14,
    fontWeight: '700',
    color: colors.ink,
  },
  macroLbl: {
    fontFamily: fonts.manropeBold,
    fontSize: 12,
    fontWeight: '700',
    color: colors.muted,
    marginTop: 8,
  },
  waterCard: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  glasses: {
    flexDirection: 'row',
    gap: 8,
  },
  glass: {
    width: 42,
    height: 58,
    borderRadius: 8,
    backgroundColor: colors.base,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    padding: 4,
  },
  glassFill: {
    borderRadius: 6,
    backgroundColor: colors.carbs,
    width: '100%',
  },
  waterBtn: {
    height: 44,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  waterBtnText: {
    fontFamily: fonts.outfitSemiBold,
    fontSize: 14,
    fontWeight: '600',
    color: colors.textInverse,
  },
  quickHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mealCard: {
    marginTop: 14,
  },
  mealRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  kcal: {
    fontFamily: fonts.outfitBold,
    fontSize: 15,
    fontWeight: '700',
    color: colors.accent,
  },
});
