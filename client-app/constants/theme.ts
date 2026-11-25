import { Platform } from 'react-native';

export const theme = {
  // Surfaces
  bg: '#F5F1EA',
  card: '#FFFFFF',
  cardMuted: '#FBF9F4',
  ink: '#0D1014',
  ink2: '#1A2029',
  ink3: '#262E39',
  ivory: '#F5F0E6',
  border: '#ECE5D8',
  borderSoft: '#F2EDE4',

  // Text
  text: '#14181D',
  muted: '#6B717A',
  faint: '#9AA0A8',
  onInk: '#F5F0E6',
  onInkMuted: '#A3A8B0',

  // Brand
  gold: '#C9A86A',
  goldLight: '#E2CB98',
  goldSoft: '#F4EBD8',
  accent: '#8A6A2F',
  accentSoft: '#F4EBD8',
  navy: '#0D1014',

  // Status
  danger: '#B83A34',
  dangerSoft: '#FBE9E8',
  warning: '#B8650F',
  warningSoft: '#FDF1E1',
  success: '#1F8F4E',
  successSoft: '#E5F4EB',
  info: '#2F5E9E',
  infoSoft: '#E8EFF8',
  neutralSoft: '#EFEDE8',
};

/** `fonts.serif` is a marker the Text wrapper turns into Cormorant Garamond. */
export const fonts = {
  serif: 'Display',
  display: 'CormorantGaramond_700Bold',
  displaySemi: 'CormorantGaramond_600SemiBold',
  sans: 'Inter_400Regular',
  sansMedium: 'Inter_500Medium',
  sansSemi: 'Inter_600SemiBold',
  sansBold: 'Inter_700Bold',
};

const webFallback = (family: string, serif: boolean) =>
  Platform.OS === 'web' ? `${family}, ${serif ? "'Cormorant Garamond', Georgia, serif" : "Inter, system-ui, -apple-system, 'Segoe UI', sans-serif"}` : family;

/** Picks the loaded font file that matches a style's family and weight. */
export function fontFor(family: unknown, weight: unknown) {
  if (typeof family === 'string' && family !== fonts.serif && family !== 'Display') return family;
  const w = Number(weight === 'bold' ? 700 : weight === 'normal' || weight == null ? 400 : weight);
  if (family === fonts.serif) return webFallback(w >= 700 ? fonts.display : fonts.displaySemi, true);
  if (w >= 700) return webFallback(fonts.sansBold, false);
  if (w >= 600) return webFallback(fonts.sansSemi, false);
  if (w >= 500) return webFallback(fonts.sansMedium, false);
  return webFallback(fonts.sans, false);
}

export const radius = { sm: 10, md: 16, lg: 22, xl: 28, pill: 999 };
