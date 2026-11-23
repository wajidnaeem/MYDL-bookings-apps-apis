import { Platform } from 'react-native';

export const theme = {
  // Surfaces
  bg: '#F6F3EC',
  card: '#FFFFFF',
  cardMuted: '#FBF9F4',
  ink: '#0D1014',
  ink2: '#1A2029',
  ink3: '#262E39',
  ivory: '#F5F0E6',
  border: '#E8E2D6',
  borderSoft: '#F0EBE2',

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

export const fonts = {
  serif: Platform.select({ ios: 'Georgia', android: 'serif', default: "Georgia, 'Times New Roman', serif" }),
};

export const radius = { sm: 10, md: 14, lg: 20, xl: 26, pill: 999 };
