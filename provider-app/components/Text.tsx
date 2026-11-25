import type { ComponentProps } from 'react';
import { Platform, Text as RNText, StyleSheet } from 'react-native';

import { fontFor, fonts } from '@/constants/theme';

/**
 * Drop-in replacement for React Native's Text that applies the app fonts
 * (Inter for body text, Cormorant Garamond where a style asks for fonts.serif).
 */
export function Text({ style, ...props }: ComponentProps<typeof RNText>) {
  const flat = StyleSheet.flatten(style) || {};
  const fontFamily = fontFor(flat.fontFamily, flat.fontWeight);
  // Custom fonts carry their own weight; native platforms render them wrong if fontWeight is also set.
  const base = Platform.OS === 'web' ? { fontFamily } : { fontFamily, fontWeight: 'normal' as const };
  // Cormorant defaults to old-style numbers (a "1" looks like an "I"); ask for lining numbers instead.
  const fix = flat.fontFamily === fonts.serif ? { ...base, fontVariant: ['lining-nums' as const] } : base;
  return <RNText {...props} style={[style, fix]} />;
}
