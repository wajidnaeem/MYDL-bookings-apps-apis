import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icon, type IconName } from '@/components/Icon';
import { EmptyState, Screen, shadow } from '@/components/ui';
import { radius, theme } from '@/constants/theme';
import { useClient } from '@/context/ClientContext';
import { Text } from '@/components/Text';

function look(title: string): { icon: IconName; fg: string; bg: string } {
  const t = title.toLowerCase();
  if (t.includes('cancel')) return { icon: 'cancel', fg: theme.muted, bg: theme.neutralSoft };
  if (t.includes('no-show') || t.includes('late')) return { icon: 'alert', fg: theme.danger, bg: theme.dangerSoft };
  if (t.includes('dispute')) return { icon: 'scale', fg: theme.warning, bg: theme.warningSoft };
  if (t.includes('deposit') || t.includes('payout')) return { icon: 'wallet', fg: theme.success, bg: theme.successSoft };
  if (t.includes('invitation')) return { icon: 'mail', fg: theme.accent, bg: theme.goldSoft };
  if (t.includes('attendance')) return { icon: 'check', fg: theme.success, bg: theme.successSoft };
  if (t.includes('upcoming') || t.includes('visit')) return { icon: 'calendar', fg: theme.info, bg: theme.infoSoft };
  return { icon: 'bell', fg: theme.accent, bg: theme.goldSoft };
}

export default function NotificationsScreen() {
  const { notifications, appointments } = useClient();
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Screen hero eyebrow="Activity" title="Alerts" subtitle="Invitations, deposits, attendance, cancellations, and disputes.">
        {notifications.length === 0 ? <EmptyState icon="bell" title="No alerts yet." body="Invitations, deposit updates and dispute decisions will appear here." /> : null}
        <View style={notifications.length ? styles.list : undefined}>
          {notifications.map((item, index) => {
            const l = look(item.title);
            // Alerts about a visit open that visit, if it still exists.
            const visitId = item.appointmentId && appointments.some((a) => a.id === item.appointmentId) ? item.appointmentId : undefined;
            return (
              <Pressable
                key={item.id}
                disabled={!visitId}
                accessibilityRole={visitId ? 'button' : undefined}
                onPress={() => visitId && router.push(`/appointment/${visitId}`)}
                style={({ pressed }) => [styles.item, index === notifications.length - 1 && { borderBottomWidth: 0 }, pressed && styles.pressed]}>
                <View style={[styles.icon, { backgroundColor: l.bg }]}><Icon name={l.icon} size={18} color={l.fg} /></View>
                <View style={{ flex: 1 }}>
                  <View style={styles.top}>
                    <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
                    <Text style={styles.time}>{item.time}</Text>
                  </View>
                  <Text style={styles.body}>{item.body}</Text>
                </View>
                {visitId ? <View style={styles.chevron}><Icon name="chevron" size={16} color={theme.faint} /></View> : null}
              </Pressable>
            );
          })}
        </View>
      </Screen>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.ink },
  list: { backgroundColor: theme.card, borderRadius: radius.lg, borderWidth: 1, borderColor: theme.border, overflow: 'hidden', ...shadow },
  item: { flexDirection: 'row', gap: 14, padding: 16, borderBottomWidth: 1, borderBottomColor: theme.borderSoft },
  icon: { width: 40, height: 40, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  top: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, alignItems: 'baseline' },
  title: { flex: 1, color: theme.text, fontSize: 15.5, fontWeight: '700' },
  time: { color: theme.faint, fontSize: 12 },
  body: { color: theme.muted, fontSize: 14, lineHeight: 20, marginTop: 3 },
  pressed: { backgroundColor: theme.borderSoft },
  chevron: { alignSelf: 'center' },
});
