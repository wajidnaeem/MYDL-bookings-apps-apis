import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { Avatar, StatusPill, shadow } from '@/components/ui';
import { radius, theme } from '@/constants/theme';
import type { Appointment } from '@/data/sample';
import { visitLabel } from '@/lib/format';

export function AppointmentCard({ appointment, onPress }: { appointment: Appointment; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.top}>
        <Avatar name={appointment.provider} size={42} />
        <View style={{ flex: 1 }}>
          <Text style={styles.title} numberOfLines={1}>{appointment.provider}</Text>
          <Text style={styles.service} numberOfLines={1}>{appointment.service} · {appointment.duration}</Text>
        </View>
        <StatusPill status={visitLabel(appointment.status)} />
      </View>
      <View style={styles.bottom}>
        <View style={styles.meta}>
          <Icon name="calendar" size={15} color={theme.faint} />
          <Text style={styles.metaText}>{appointment.date} · {appointment.time}</Text>
        </View>
        <View style={styles.meta}>
          <Icon name="wallet" size={15} color={appointment.depositPaid ? theme.success : theme.faint} />
          <Text style={[styles.metaText, styles.deposit]}>Deposit {appointment.deposit}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: theme.card, borderRadius: radius.lg, borderWidth: 1, borderColor: theme.border, padding: 16, gap: 14, ...shadow },
  pressed: { opacity: 0.9, transform: [{ scale: 0.995 }] },
  top: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  title: { color: theme.text, fontSize: 16.5, fontWeight: '700' },
  service: { color: theme.muted, fontSize: 13.5, marginTop: 2 },
  bottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTopWidth: 1, borderTopColor: theme.borderSoft, gap: 10, flexWrap: 'wrap' },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { color: theme.muted, fontSize: 13.5 },
  deposit: { color: theme.text, fontWeight: '700' },
});
