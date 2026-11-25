import { Pressable, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { Text } from '@/components/Text';
import { StatusPill, shadow } from '@/components/ui';
import { fonts, radius, theme } from '@/constants/theme';
import { dateParts, visitLabel } from '@/lib/format';
import type { Visit } from '@/lib/types';

export function VisitCard({ visit, onPress }: { visit: Visit; onPress: () => void }) {
  const name = visit.clientName || visit.clientEmail || 'Client';
  const d = dateParts(visit.date);
  const muted = visit.status === 'cancelled';
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={[styles.date, muted && styles.dateMuted]}>
        {d ? (
          <>
            <Text style={[styles.month, muted && { color: theme.faint }]}>{d.month}</Text>
            <Text style={[styles.day, muted && { color: theme.muted }]}>{d.day}</Text>
            <Text style={[styles.weekday, muted && { color: theme.faint }]}>{d.weekday}</Text>
          </>
        ) : (
          <Icon name="calendar" size={22} color={theme.gold} />
        )}
      </View>
      <View style={styles.body}>
        <View style={styles.top}>
          <Text style={styles.title} numberOfLines={1}>{name}</Text>
          <StatusPill status={visitLabel(visit.status)} />
        </View>
        <Text style={styles.service} numberOfLines={1}>{visit.service}</Text>
        <View style={styles.meta}>
          <View style={styles.metaItem}>
            <Icon name="clock" size={14} color={theme.faint} />
            <Text style={styles.metaText}>{visit.time} · {visit.duration}</Text>
          </View>
          <Text style={[styles.deposit, visit.depositPaid && { color: theme.success }]}>{visit.deposit}{visit.depositPaid ? ' paid' : ''}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', gap: 14, backgroundColor: theme.card, borderRadius: radius.lg, borderWidth: 1, borderColor: theme.borderSoft, padding: 12, ...shadow },
  pressed: { opacity: 0.92, transform: [{ scale: 0.995 }] },
  date: { width: 64, borderRadius: 16, backgroundColor: theme.ink, alignItems: 'center', justifyContent: 'center', paddingVertical: 10 },
  dateMuted: { backgroundColor: theme.neutralSoft },
  month: { color: theme.gold, fontSize: 10.5, fontWeight: '600', letterSpacing: 1.4, textTransform: 'uppercase' },
  day: { fontFamily: fonts.serif, color: theme.onInk, fontSize: 30, lineHeight: 32, fontWeight: '700' },
  weekday: { color: theme.onInkMuted, fontSize: 10.5, fontWeight: '500' },
  body: { flex: 1, paddingVertical: 4, paddingRight: 4, gap: 3 },
  top: { flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'space-between' },
  title: { flex: 1, color: theme.text, fontSize: 16, fontWeight: '600' },
  service: { color: theme.muted, fontSize: 13.5 },
  meta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6, gap: 8 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText: { color: theme.muted, fontSize: 13 },
  deposit: { color: theme.text, fontSize: 13.5, fontWeight: '600' },
});
