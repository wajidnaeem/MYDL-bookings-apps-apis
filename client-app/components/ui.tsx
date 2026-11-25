import { useFocusEffect } from 'expo-router';
import { setStatusBarStyle } from 'expo-status-bar';
import { useCallback, useState, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  type PressableProps,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';

import { Icon, type IconName } from '@/components/Icon';
import { Text } from '@/components/Text';
import { fontFor, fonts, radius, theme } from '@/constants/theme';

export const shadow: ViewStyle = Platform.OS === 'web'
  ? ({ boxShadow: '0 1px 1px rgba(20,24,29,0.03), 0 18px 40px -28px rgba(20,24,29,0.35)' } as ViewStyle)
  : { shadowColor: '#14181D', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.06, shadowRadius: 24, elevation: 2 };

/* ---------- Layout ---------- */

export function Screen({
  title,
  subtitle,
  eyebrow,
  right,
  hero,
  heroContent,
  children,
}: {
  title?: string;
  subtitle?: string;
  eyebrow?: string;
  right?: ReactNode;
  /** Draws the title in a dark ink band, like the website hero. */
  hero?: boolean;
  /** Extra content placed inside the dark band, under the title. */
  heroContent?: ReactNode;
  children?: ReactNode;
}) {
  useFocusEffect(
    useCallback(() => {
      if (!hero) return undefined;
      setStatusBarStyle('light');
      return () => setStatusBarStyle('dark');
    }, [hero]),
  );

  if (hero) {
    return (
      <ScrollView style={styles.heroScroll} contentContainerStyle={styles.heroContentWrap} keyboardShouldPersistTaps="handled">
        <View style={styles.band}>
          <View style={styles.ringA} pointerEvents="none" />
          <View style={styles.ringB} pointerEvents="none" />
          <View style={styles.headRow}>
            <View style={{ flex: 1 }}>
              {eyebrow ? <Text style={[styles.eyebrow, styles.eyebrowDark]}>{eyebrow}</Text> : null}
              {title ? <Text style={[styles.title, styles.titleDark]}>{title}</Text> : null}
            </View>
            {right}
          </View>
          {subtitle ? <Text style={styles.subtitleDark}>{subtitle}</Text> : null}
          {heroContent ? <View style={styles.bandContent}>{heroContent}</View> : null}
        </View>
        <View style={styles.sheet}>{children}</View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      {title || eyebrow || right ? (
        <View style={styles.headRow}>
          <View style={{ flex: 1 }}>
            {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
            {title ? <Text style={styles.title}>{title}</Text> : null}
          </View>
          {right}
        </View>
      ) : null}
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      {children}
    </ScrollView>
  );
}

export function SectionHeader({ title, count, action }: { title: string; count?: number; action?: { label: string; onPress: () => void } }) {
  return (
    <View style={styles.sectionRow}>
      <Text style={styles.section}>
        {title}
        {count != null ? <Text style={styles.sectionCount}>  {count}</Text> : null}
      </Text>
      {action ? (
        <Pressable onPress={action.onPress} hitSlop={8} accessibilityRole="button">
          <Text style={styles.sectionAction}>{action.label}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

/* ---------- Controls ---------- */

type Variant = 'primary' | 'secondary' | 'danger' | 'gold' | 'ghost';

export function Button({
  label,
  variant = 'primary',
  icon,
  loading,
  ...rest
}: PressableProps & { label: string; variant?: Variant; icon?: IconName; loading?: boolean }) {
  const fg = variant === 'primary' ? theme.onInk : variant === 'gold' ? theme.ink : variant === 'danger' ? theme.danger : theme.text;
  return (
    <Pressable
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.button,
        variant === 'primary' && styles.primary,
        variant === 'secondary' && styles.secondary,
        variant === 'danger' && styles.danger,
        variant === 'gold' && styles.gold,
        variant === 'ghost' && styles.ghost,
        pressed && styles.pressed,
        rest.disabled && styles.disabled,
      ]}
      {...rest}>
      {loading ? <ActivityIndicator color={fg} size="small" /> : icon ? <Icon name={icon} size={18} color={fg} strokeWidth={2} /> : null}
      <Text style={[styles.buttonLabel, { color: fg }]}>{label}</Text>
    </Pressable>
  );
}

export function TextField({ label, hint, ...props }: TextInputProps & { label: string; hint?: string }) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        placeholderTextColor={theme.faint}
        {...props}
        onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
        onBlur={(e) => { setFocused(false); props.onBlur?.(e); }}
        style={[styles.input, props.multiline && styles.multiline, focused && styles.inputFocused, props.style]}
      />
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

export function FieldRow({ children }: { children: ReactNode }) {
  return <View style={styles.fieldRow}>{children}</View>;
}

export function FieldCol({ children }: { children: ReactNode }) {
  return <View style={{ flex: 1 }}>{children}</View>;
}

export function Chips<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { id: T; label: string; count?: number }[];
  value: T;
  onChange: (id: T) => void;
}) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips} style={{ flexGrow: 0 }}>
      {options.map((item) => {
        const on = item.id === value;
        return (
          <Pressable
            key={item.id}
            accessibilityRole="button"
            accessibilityState={{ selected: on }}
            onPress={() => onChange(item.id)}
            style={[styles.chip, on && styles.chipOn]}>
            <Text style={[styles.chipText, on && styles.chipTextOn]}>{item.label}</Text>
            {item.count != null ? <Text style={[styles.chipCount, on && styles.chipCountOn]}>{item.count}</Text> : null}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

/* ---------- Content ---------- */

export function Card({ children, style, dark }: { children: ReactNode; style?: StyleProp<ViewStyle>; dark?: boolean }) {
  return <View style={[styles.card, dark && styles.cardDark, style]}>{children}</View>;
}

export function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.formSection}>
      <Text style={styles.formTitle}>{title}</Text>
      <View style={styles.formBody}>{children}</View>
    </View>
  );
}

type Tone = 'pending' | 'info' | 'success' | 'gold' | 'danger' | 'neutral';

export function toneFor(status: string): Tone {
  const value = status.toLowerCase();
  if (value.includes('no-show') || value.includes('fail')) return 'danger';
  if (value.includes('not paid') || value.includes('unpaid')) return 'pending';
  if (value.includes('pending') || value.includes('invitation') || value.includes('review') || value.includes('due')) return 'pending';
  if (value.includes('held') || value.includes('upcoming')) return 'info';
  if (value.includes('kept')) return 'gold';
  if (value.includes('complete') || value.includes('release') || value.includes('charg') || value.includes('paid') || value.includes('confirm')) return 'success';
  return 'neutral';
}

const toneColors: Record<Tone, { bg: string; fg: string }> = {
  pending: { bg: theme.warningSoft, fg: theme.warning },
  info: { bg: theme.infoSoft, fg: theme.info },
  success: { bg: theme.successSoft, fg: theme.success },
  gold: { bg: theme.goldSoft, fg: theme.accent },
  danger: { bg: theme.dangerSoft, fg: theme.danger },
  neutral: { bg: theme.neutralSoft, fg: '#4D535B' },
};

export function StatusPill({ status, dark }: { status: string; dark?: boolean }) {
  const tone = toneColors[toneFor(status)];
  const label = status.charAt(0).toUpperCase() + status.slice(1);
  return (
    <View style={[styles.pill, { backgroundColor: dark ? 'rgba(245,240,230,0.10)' : tone.bg }]}>
      <View style={[styles.pillDot, { backgroundColor: dark ? theme.goldLight : tone.fg }]} />
      <Text style={[styles.pillText, { color: dark ? theme.goldLight : tone.fg }]}>{label}</Text>
    </View>
  );
}

export function Row({ label, value, icon, last }: { label: string; value: string; icon?: IconName; last?: boolean }) {
  return (
    <View style={[styles.row, last && { borderBottomWidth: 0 }]}>
      <View style={styles.rowLeft}>
        {icon ? <Icon name={icon} size={16} color={theme.faint} /> : null}
        <Text style={styles.rowLabel}>{label}</Text>
      </View>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

export function Stat({ label, value, note, dark }: { label: string; value: string; note?: string; dark?: boolean }) {
  return (
    <View style={[styles.stat, dark && styles.statDark]}>
      <Text style={[styles.statLabel, dark && { color: theme.onInkMuted }]}>{label}</Text>
      <Text style={[styles.statValue, dark && { color: theme.onInk }]} numberOfLines={1} adjustsFontSizeToFit>{value}</Text>
      {note ? <Text style={[styles.statNote, dark && { color: theme.onInkMuted }]}>{note}</Text> : null}
    </View>
  );
}

export function Avatar({ name, size = 44, dark }: { name: string; size?: number; dark?: boolean }) {
  const letters = String(name || '?').trim().split(/\s+/).filter((w) => /[A-Za-z0-9]/.test(w)).slice(0, 2).map((p) => p.charAt(0)).join('').toUpperCase() || '?';
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }, dark && styles.avatarDark]}>
      <Text style={[styles.avatarText, { fontSize: size * 0.42 }, dark && { color: theme.goldLight }]}>{letters}</Text>
    </View>
  );
}

export function ListItem({
  icon,
  title,
  subtitle,
  onPress,
  danger,
  last,
}: {
  icon: IconName;
  title: string;
  subtitle?: string;
  onPress: () => void;
  danger?: boolean;
  last?: boolean;
}) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.listItem, last && { borderBottomWidth: 0 }, pressed && { backgroundColor: theme.cardMuted }]}>
      <View style={[styles.listIcon, danger && { backgroundColor: theme.dangerSoft }]}>
        <Icon name={icon} size={18} color={danger ? theme.danger : theme.accent} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.listTitle, danger && { color: theme.danger }]}>{title}</Text>
        {subtitle ? <Text style={styles.listSub} numberOfLines={1}>{subtitle}</Text> : null}
      </View>
      {!danger ? <Icon name="chevron" size={18} color={theme.faint} /> : null}
    </Pressable>
  );
}

export function EmptyState({ icon = 'inbox', title, body, action }: { icon?: IconName; title: string; body?: string; action?: ReactNode }) {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}><Icon name={icon} size={22} color={theme.accent} /></View>
      <Text style={styles.emptyTitle}>{title}</Text>
      {body ? <Text style={styles.emptyBody}>{body}</Text> : null}
      {action}
    </View>
  );
}

export function Notice({ text, tone = 'danger', icon }: { text: string; tone?: 'danger' | 'success' | 'warning' | 'info'; icon?: IconName }) {
  const map = {
    danger: { bg: theme.dangerSoft, fg: theme.danger, icon: 'alert' as IconName },
    success: { bg: theme.successSoft, fg: theme.success, icon: 'check' as IconName },
    warning: { bg: theme.warningSoft, fg: theme.warning, icon: 'alert' as IconName },
    info: { bg: theme.goldSoft, fg: theme.accent, icon: 'shield' as IconName },
  }[tone];
  return (
    <View style={[styles.notice, { backgroundColor: map.bg }]} accessibilityRole={tone === 'danger' ? 'alert' : undefined}>
      <Icon name={icon || map.icon} size={18} color={map.fg} />
      <Text style={[styles.noticeText, { color: tone === 'info' ? theme.text : map.fg }]}>{text}</Text>
    </View>
  );
}

/* ---------- Styles ---------- */

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: theme.bg },
  content: { padding: 20, gap: 14, paddingBottom: 48, width: '100%' },
  heroScroll: { flex: 1, backgroundColor: theme.bg },
  heroContentWrap: { flexGrow: 1 },
  band: { backgroundColor: theme.ink, paddingHorizontal: 22, paddingTop: 14, paddingBottom: 44, overflow: 'hidden' },
  ringA: { position: 'absolute', right: -110, top: -120, width: 300, height: 300, borderRadius: 150, borderWidth: 1, borderColor: 'rgba(201,168,106,0.22)' },
  ringB: { position: 'absolute', right: -40, top: -50, width: 170, height: 170, borderRadius: 85, borderWidth: 1, borderColor: 'rgba(201,168,106,0.14)' },
  eyebrowDark: { color: theme.gold },
  titleDark: { color: theme.onInk },
  subtitleDark: { fontSize: 15, lineHeight: 22, color: theme.onInkMuted, marginTop: 8, maxWidth: 360 },
  bandContent: { marginTop: 22, gap: 14 },
  sheet: { flexGrow: 1, backgroundColor: theme.bg, borderTopLeftRadius: 30, borderTopRightRadius: 30, marginTop: -26, padding: 20, paddingTop: 24, gap: 14, paddingBottom: 48 },
  headRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 12, marginTop: 4 },
  eyebrow: { color: theme.accent, fontSize: 11.5, fontWeight: '600', letterSpacing: 1.8, textTransform: 'uppercase', marginBottom: 8 },
  title: { fontFamily: fonts.serif, fontSize: 40, lineHeight: 44, fontWeight: '700', color: theme.text, letterSpacing: -0.4 },
  subtitle: { fontSize: 15, lineHeight: 22, color: theme.muted, marginTop: -4, marginBottom: 2 },

  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 },
  section: { fontFamily: fonts.serif, color: theme.text, fontSize: 24, fontWeight: '700' },
  sectionCount: { fontFamily: fonts.serif, color: theme.faint, fontWeight: '600', fontSize: 20 },
  sectionAction: { color: theme.accent, fontSize: 13.5, fontWeight: '600' },

  button: { minHeight: 56, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, paddingHorizontal: 18, alignSelf: 'stretch' },
  primary: { backgroundColor: theme.ink },
  gold: { backgroundColor: theme.gold },
  secondary: { backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border },
  danger: { backgroundColor: theme.dangerSoft },
  ghost: { backgroundColor: 'transparent' },
  pressed: { opacity: 0.86, transform: [{ scale: 0.99 }] },
  disabled: { opacity: 0.5 },
  buttonLabel: { fontSize: 15.5, fontWeight: '600', letterSpacing: 0.2 },

  field: { gap: 7 },
  fieldLabel: { color: theme.muted, fontSize: 13, fontWeight: '500' },
  input: { backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, borderRadius: radius.md, paddingHorizontal: 16, paddingVertical: 15, fontSize: 16, color: theme.text, fontFamily: fontFor(undefined, 400) },
  inputFocused: { borderColor: theme.gold, ...(Platform.OS === 'web' ? ({ boxShadow: '0 0 0 4px rgba(201,168,106,0.18)', outlineStyle: 'none' } as object) : {}) },
  multiline: { minHeight: 112, textAlignVertical: 'top' },
  hint: { color: theme.faint, fontSize: 12.5, lineHeight: 17 },
  fieldRow: { flexDirection: 'row', gap: 12 },

  chips: { gap: 8, paddingRight: 4 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: radius.pill, borderWidth: 1, borderColor: theme.border, backgroundColor: theme.card, paddingHorizontal: 14, height: 38 },
  chipOn: { backgroundColor: theme.ink, borderColor: theme.ink },
  chipText: { color: theme.text, fontSize: 13.5, fontWeight: '500' },
  chipTextOn: { color: theme.onInk },
  chipCount: { color: theme.faint, fontSize: 12, fontWeight: '700' },
  chipCountOn: { color: theme.goldLight },

  card: { backgroundColor: theme.card, borderRadius: radius.lg, borderWidth: 1, borderColor: theme.borderSoft, padding: 20, gap: 10, ...shadow },
  cardDark: { backgroundColor: theme.ink, borderColor: theme.ink },

  formSection: { gap: 10 },
  formTitle: { color: theme.accent, fontSize: 11.5, fontWeight: '600', letterSpacing: 1.8, textTransform: 'uppercase', marginTop: 8 },
  formBody: { gap: 14 },

  pill: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 5 },
  pillDot: { width: 6, height: 6, borderRadius: 3 },
  pillText: { fontSize: 11.5, fontWeight: '600', letterSpacing: 0.2 },

  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: theme.borderSoft },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rowLabel: { color: theme.muted, fontSize: 14 },
  rowValue: { color: theme.text, fontSize: 14, fontWeight: '600', flexShrink: 1, textAlign: 'right' },

  stat: { flex: 1, backgroundColor: theme.card, borderRadius: radius.md, borderWidth: 1, borderColor: theme.borderSoft, padding: 14, gap: 4 },
  statDark: { backgroundColor: 'rgba(245,240,230,0.05)', borderColor: 'rgba(245,240,230,0.09)' },
  statLabel: { color: theme.muted, fontSize: 11, fontWeight: '600', letterSpacing: 1.2, textTransform: 'uppercase' },
  statValue: { fontFamily: fonts.serif, color: theme.text, fontSize: 26, fontWeight: '700' },
  statNote: { color: theme.faint, fontSize: 11.5 },

  avatar: { backgroundColor: theme.goldSoft, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(201,168,106,0.45)' },
  avatarDark: { backgroundColor: 'rgba(201,168,106,0.10)', borderColor: 'rgba(201,168,106,0.55)' },
  avatarText: { fontFamily: fonts.serif, color: theme.accent, fontWeight: '700' },

  listItem: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: theme.borderSoft },
  listIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: theme.goldSoft, alignItems: 'center', justifyContent: 'center' },
  listTitle: { color: theme.text, fontSize: 15.5, fontWeight: '500' },
  listSub: { color: theme.muted, fontSize: 13, marginTop: 2 },

  empty: { alignItems: 'center', paddingVertical: 30, paddingHorizontal: 24, gap: 6, backgroundColor: 'transparent', borderRadius: radius.lg, borderWidth: 1, borderColor: '#E2D9C8', borderStyle: 'dashed' },
  emptyIcon: { width: 48, height: 48, borderRadius: 16, backgroundColor: theme.goldSoft, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  emptyTitle: { fontFamily: fonts.serif, color: theme.text, fontSize: 20, fontWeight: '700', textAlign: 'center' },
  emptyBody: { color: theme.muted, fontSize: 14, lineHeight: 20, textAlign: 'center', marginBottom: 6 },

  notice: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', borderRadius: radius.md, padding: 14 },
  noticeText: { flex: 1, fontSize: 14, lineHeight: 20, fontWeight: '500' },
});
