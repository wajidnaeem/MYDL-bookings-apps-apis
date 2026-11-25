import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { Avatar, Button, Card, EmptyState, Notice, Row, Screen, StatusPill } from '@/components/ui';
import { fonts, radius, theme } from '@/constants/theme';
import { useClient } from '@/context/ClientContext';
import { goBack } from '@/lib/nav';
import { visitLabel } from '@/lib/format';
import { Text } from '@/components/Text';

export default function AppointmentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { appointments, declineInvitation } = useClient();
  const appointment = appointments.find((item) => item.id === id);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (!appointment) {
    return (
      <Screen>
        <EmptyState icon="calendar" title="This appointment is no longer available." />
      </Screen>
    );
  }

  const depositState = appointment.depositPaid ? 'Paid and held' : 'Not paid';

  return (
    <Screen>
      <View style={styles.hero}>
        <View style={styles.heroTop}>
          <Avatar name={appointment.provider} size={52} dark />
          <View style={{ flex: 1 }}>
            <Text style={styles.provider} numberOfLines={1}>{appointment.provider}</Text>
            <View style={styles.locRow}>
              <Icon name="pin" size={14} color={theme.onInkMuted} />
              <Text style={styles.loc} numberOfLines={1}>{appointment.location}</Text>
            </View>
          </View>
          <StatusPill status={visitLabel(appointment.status)} dark />
        </View>
        <Text style={styles.service}>{appointment.service}</Text>
        <View style={styles.whenRow}>
          <View style={styles.when}>
            <Icon name="calendar" size={16} color={theme.goldLight} />
            <Text style={styles.whenText}>{appointment.date}</Text>
          </View>
          <View style={styles.when}>
            <Icon name="clock" size={16} color={theme.goldLight} />
            <Text style={styles.whenText}>{appointment.time}{appointment.timezone ? ` · ${appointment.timezone}` : ''}</Text>
          </View>
        </View>
      </View>

      <Card style={styles.money}>
        <View style={styles.moneyCol}>
          <Text style={styles.moneyLabel}>Service price</Text>
          <Text style={styles.moneyValue}>{appointment.price}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.moneyCol}>
          <Text style={styles.moneyLabel}>Deposit</Text>
          <Text style={styles.moneyValue}>{appointment.deposit}</Text>
          <StatusPill status={depositState} />
        </View>
      </Card>

      <Card style={{ gap: 0, paddingVertical: 6 }}>
        <Row icon="timer" label="Duration" value={appointment.duration} />
        <Row icon="shield" label="Terms" value={appointment.policyAccepted ? 'Accepted' : 'Not accepted yet'} />
        <Row icon="qr" label="Attendance" value={appointment.attended ? 'Confirmed' : 'Not confirmed'} last />
      </Card>

      {appointment.status === 'pending' ? <Notice tone="info" text="Accepting means you review the provider's terms and pay the deposit. It is held until your visit." /> : null}
      {error ? <Notice text={error} /> : null}

      {appointment.status === 'pending' ? (
        <>
          <Button label="Accept invitation" icon="check" onPress={() => router.push(`/policy/${appointment.id}`)} />
          <Button
            label="Decline"
            variant="secondary"
            loading={busy}
            disabled={busy}
            onPress={async () => {
              setBusy(true);
              setError('');
              try {
                await declineInvitation(appointment.id);
                goBack('/');
              } catch (err) {
                setError(err instanceof Error ? err.message : 'Could not decline the invitation.');
              } finally {
                setBusy(false);
              }
            }}
          />
        </>
      ) : null}
      {appointment.status === 'upcoming' ? (
        <>
          <Button label="Scan attendance QR" variant="gold" icon="qr" onPress={() => router.push(`/scan?id=${appointment.id}`)} />
          <Button label="Cancel appointment" icon="cancel" variant="secondary" onPress={() => router.push(`/cancel/${appointment.id}`)} />
          <Button label="Report provider no-show" icon="alert" variant="danger" onPress={() => router.push(`/report-no-show/${appointment.id}`)} />
        </>
      ) : null}
      {appointment.status === 'completed' || appointment.status === 'cancelled' ? (
        <Button label="Raise a dispute" icon="scale" variant="secondary" onPress={() => router.push(`/dispute/new?id=${appointment.id}`)} />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { backgroundColor: theme.ink, borderRadius: radius.xl, padding: 20, gap: 4 },
  heroTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  provider: { color: theme.onInk, fontSize: 18, fontWeight: '700' },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 3 },
  loc: { color: theme.onInkMuted, fontSize: 13, flexShrink: 1 },
  service: { fontFamily: fonts.serif, color: theme.onInk, fontSize: 30, fontWeight: '700', marginTop: 18 },
  whenRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginTop: 12 },
  when: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  whenText: { color: theme.onInk, fontSize: 14, fontWeight: '600' },
  money: { flexDirection: 'row', alignItems: 'stretch', gap: 0 },
  moneyCol: { flex: 1, gap: 6 },
  moneyLabel: { color: theme.muted, fontSize: 13 },
  moneyValue: { fontFamily: fonts.serif, color: theme.text, fontSize: 28, fontWeight: '700' },
  divider: { width: 1, backgroundColor: theme.borderSoft, marginHorizontal: 16 },
});
