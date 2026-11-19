import type { ReactNode } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type PressableProps,
  type TextInputProps,
} from 'react-native';

import { theme } from '@/constants/theme';
import type { AppointmentStatus } from '@/data/sample';

export function Screen({
  title,
  subtitle,
  children,
}: {
  title?: string;
  subtitle?: string;
  children?: ReactNode;
}) {
  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled">
      {title ? <Text style={styles.title}>{title}</Text> : null}
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      {children}
    </ScrollView>
  );
}

export function Button({
  label,
  variant = 'primary',
  ...rest
}: PressableProps & { label: string; variant?: 'primary' | 'secondary' | 'danger' }) {
  return (
    <Pressable
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.button,
        variant === 'primary' && styles.primary,
        variant === 'secondary' && styles.secondary,
        variant === 'danger' && styles.danger,
        pressed && styles.pressed,
        rest.disabled && styles.disabled,
      ]}
      {...rest}>
      <Text
        style={[
          styles.buttonLabel,
          variant === 'secondary' && styles.secondaryLabel,
          variant === 'danger' && styles.dangerLabel,
        ]}>
        {label}
      </Text>
    </Pressable>
  );
}

export function TextField({ label, ...props }: TextInputProps & { label: string }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        placeholderTextColor={theme.muted}
        style={[styles.input, props.multiline && styles.multiline]}
        {...props}
      />
    </View>
  );
}

export function Card({ children }: { children: ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

export function StatusPill({ status }: { status: AppointmentStatus | string }) {
  return (
    <View style={styles.pill}>
      <Text style={styles.pillText}>{status}</Text>
    </View>
  );
}

export function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: theme.bg },
  content: { padding: 20, gap: 12, paddingBottom: 40, width: '100%' },
  title: { fontSize: 28, fontWeight: '700', color: theme.text },
  subtitle: { fontSize: 16, lineHeight: 22, color: theme.muted, marginBottom: 8 },
  button: {
    minHeight: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    alignSelf: 'stretch',
  },
  primary: { backgroundColor: theme.accent },
  secondary: { backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border },
  danger: { backgroundColor: '#F8E8E8' },
  pressed: { opacity: 0.85 },
  disabled: { opacity: 0.5 },
  buttonLabel: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  secondaryLabel: { color: theme.text },
  dangerLabel: { color: theme.danger },
  field: { gap: 6 },
  fieldLabel: { color: theme.text, fontSize: 14, fontWeight: '600' },
  input: {
    backgroundColor: theme.card,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: theme.text,
  },
  multiline: { minHeight: 120, textAlignVertical: 'top' },
  card: {
    backgroundColor: theme.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 16,
    gap: 8,
  },
  pill: {
    alignSelf: 'flex-start',
    backgroundColor: theme.accentSoft,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  pillText: { color: theme.accent, fontSize: 12, fontWeight: '700', textTransform: 'capitalize' },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  rowLabel: { color: theme.muted, fontSize: 14 },
  rowValue: { color: theme.text, fontSize: 14, fontWeight: '600', flexShrink: 1, textAlign: 'right' },
});
