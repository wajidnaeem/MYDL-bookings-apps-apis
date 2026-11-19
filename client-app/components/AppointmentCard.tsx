import { Pressable, StyleSheet, Text } from 'react-native';

import { StatusPill } from '@/components/ui';
import { theme } from '@/constants/theme';
import type { Appointment } from '@/data/sample';

export function AppointmentCard({
  appointment,
  onPress,
}: {
  appointment: Appointment;
  onPress: () => void;
}) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <StatusPill status={appointment.status === 'pending' ? 'Invitation' : appointment.status} />
      <Text style={styles.provider}>{appointment.provider}</Text>
      <Text style={styles.service}>{appointment.service}</Text>
      <Text style={styles.meta}>
        {appointment.date} · {appointment.time}
      </Text>
      <Text style={styles.meta}>Deposit {appointment.deposit}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 16,
    gap: 6,
  },
  pressed: { opacity: 0.85 },
  provider: { color: theme.text, fontSize: 18, fontWeight: '700' },
  service: { color: theme.text, fontSize: 15 },
  meta: { color: theme.muted, fontSize: 14 },
});
