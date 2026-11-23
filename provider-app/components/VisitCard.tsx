import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { Avatar, StatusPill, shadow } from '@/components/ui';
import { radius, theme } from '@/constants/theme';
import { visitLabel } from '@/lib/format';
import type { Visit } from '@/lib/types';

export function VisitCard({ visit, onPress }: { visit: Visit; onPress: () => void }) {
  const name = visit.clientName || visit.clientEmail || 'Client';
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.top}>
        <Avatar name={name} size={42} />
        <View style={{ flex: 1 }}>
          <Text style={styles.title} numberOfLines={1}>{name}</Text>
          <Text style={styles.service} numberOfLines={1}>{visit.service} · {visit.duration}</Text>
        </View>
        <StatusPill status={visitLabel(visit.status)} />
      </View>
      <View style={styles.bottom}>
        <View style={styles.meta}>
          <Icon name="calendar" size={15} color={theme.faint} />
          <Text style={styles.metaText}>{visit.date} · {visit.time}</Text>
        </View>
        <View style={styles.meta}>
          <Icon name="wallet" size={15} color={visit.depositPaid ? theme.success : theme.faint} />
          <Text style={[styles.metaText, styles.deposit]}>{visit.deposit}{visit.depositPaid ? ' paid' : ''}</Text>
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
