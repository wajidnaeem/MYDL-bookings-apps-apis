import { Pressable, StyleSheet, Text } from 'react-native';

import { StatusPill } from '@/components/ui';
import { theme } from '@/constants/theme';
import type { Visit } from '@/lib/types';

export function VisitCard({ visit, onPress }: { visit: Visit; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <StatusPill status={visit.status === 'pending' ? 'Invitation' : visit.status} />
      <Text style={styles.title}>{visit.clientName || 'Client'}</Text>
      <Text style={styles.service}>{visit.service}</Text>
      <Text style={styles.meta}>{visit.date} · {visit.time}</Text>
      <Text style={styles.meta}>Deposit {visit.deposit}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: theme.card, borderRadius: 16, borderWidth: 1, borderColor: theme.border, padding: 16, gap: 6 },
  pressed: { opacity: 0.85 },
  title: { color: theme.text, fontSize: 18, fontWeight: '700' },
  service: { color: theme.text, fontSize: 15 },
  meta: { color: theme.muted, fontSize: 14 },
});
