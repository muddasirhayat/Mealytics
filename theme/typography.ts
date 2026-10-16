import { fonts } from '@/theme/fonts';

export const typography = {
  screenHeader: {
    fontFamily: fonts.outfitBold,
    fontSize: 30,
    fontWeight: '700' as const,
    letterSpacing: -0.8,
    lineHeight: 36,
  },
  header: {
    fontFamily: fonts.outfitBold,
    fontSize: 30,
    fontWeight: '700' as const,
    letterSpacing: -0.8,
    lineHeight: 36,
  },
  topTitle: {
    fontFamily: fonts.outfitSemiBold,
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 26,
  },
  title: {
    fontFamily: fonts.outfitSemiBold,
    fontSize: 22,
    fontWeight: '600' as const,
    lineHeight: 28,
  },
  question: {
    fontFamily: fonts.outfitBold,
    fontSize: 34,
    fontWeight: '700' as const,
    letterSpacing: -1,
    lineHeight: 39,
  },
  greeting: {
    fontFamily: fonts.outfitSemiBold,
    fontSize: 28,
    fontWeight: '600' as const,
    lineHeight: 34,
  },
  subtitle: {
    fontFamily: fonts.outfitSemiBold,
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
  bodyLarge: {
    fontFamily: fonts.manropeMedium,
    fontSize: 16,
    fontWeight: '500' as const,
    lineHeight: 24,
  },
  body: {
    fontFamily: fonts.manropeMedium,
    fontSize: 15,
    fontWeight: '500' as const,
    lineHeight: 22.5,
  },
  bodyMedium: {
    fontFamily: fonts.manropeMedium,
    fontSize: 15,
    fontWeight: '500' as const,
    lineHeight: 22.5,
  },
  fieldLabel: {
    fontFamily: fonts.manropeBold,
    fontSize: 12.5,
    fontWeight: '700' as const,
    lineHeight: 16,
  },
  fieldValue: {
    fontFamily: fonts.outfitSemiBold,
    fontSize: 17,
    fontWeight: '600' as const,
    lineHeight: 22,
  },
  button: {
    fontFamily: fonts.outfitSemiBold,
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
  chip: {
    fontFamily: fonts.outfitSemiBold,
    fontSize: 14,
    fontWeight: '600' as const,
    lineHeight: 18,
  },
  tabLabel: {
    fontFamily: fonts.outfitSemiBold,
    fontSize: 12,
    fontWeight: '600' as const,
    lineHeight: 16,
  },
  caption: {
    fontFamily: fonts.manropeMedium,
    fontSize: 12.5,
    fontWeight: '500' as const,
    lineHeight: 16,
  },
  label: {
    fontFamily: fonts.manropeBold,
    fontSize: 12.5,
    fontWeight: '700' as const,
    lineHeight: 16,
  },
  bigNumber: {
    fontFamily: fonts.outfitBold,
    fontSize: 58,
    fontWeight: '700' as const,
    letterSpacing: -2,
    lineHeight: 64,
  },
};

export type Typography = typeof typography;
