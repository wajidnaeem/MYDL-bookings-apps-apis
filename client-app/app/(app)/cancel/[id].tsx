import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { Avatar, Button, Card, EmptyState, Notice, Screen } from '@/components/ui';
import { fonts, radius, theme } from '@/constants/theme';
import { useClient } from '@/context/ClientContext';
import { goBack } from '@/lib/nav';
import { Text } from '@/components/Text';

export default function CancelScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { appointments, cancelAppointment } = useClient();
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

  const start = Date.parse(`${appointment.date.replace(/^[A-Za-z]+,\s*/, '')} ${appointment.time}`);
  const refunds = !Number.isNaN(start) && start - Date.now() >= 24 * 60 * 60 * 1000;
  const refund = !appointment.depositPaid
    ? 'No deposit has been paid, so nothing is refunded.'
    : Number.isNaN(start) || refunds
      ? `This is at least 24 hours before the visit. Refund amount: ${appointment.deposit}.`
      : `This is inside 24 hours of the visit. The ${appointment.deposit} deposit is kept.`;
  const good = !appointment.depositPaid || Number.isNaN(start) || refunds;

  return (
    <Screen subtitle={`${appointment.provider} · ${appointment.date} at ${appointment.time}`}>
      <Card style={styles.visit}>
        <Avatar name={appointment.provider} size={44} />
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{appointment.provider}</Text>
          <Text style={styles.sub}>{appointment.service}</Text>
        </View>
      </Card>

      <View style={[styles.outcome, { backgroundColor: good ? theme.successSoft : theme.warningSoft }]}>
        <View style={[styles.outcomeIcon, { backgroundColor: good ? 'rgba(31,143,78,0.14)' : 'rgba(184,101,15,0.14)' }]}>
          <Icon name={good ? 'refresh' : 'lock'} size={20} color={good ? theme.success : theme.warning} />
        </View>
        <Text style={styles.outcomeLabel}>{!appointment.depositPaid ? 'Nothing was paid' : good ? 'You get back' : 'Kept by the provider'}</Text>
        <Text style={[styles.outcomeValue, { color: good ? theme.success : theme.warning }]}>{appointment.depositPaid ? appointment.deposit : '$0.00'}</Text>
        <Text style={styles.outcomeBody}>{refund}</Text>
      </View>

      {error ? <Notice text={error} /> : null}
      <Button
        label="Confirm cancellation"
        variant="danger"
        icon={busy ? undefined : 'cancel'}
        loading={busy}
        disabled={busy}
        onPress={async () => {
          setBusy(true);
          setError('');
          try {
            await cancelAppointment(appointment.id);
            router.replace('/');
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not cancel the appointment.');
          } finally {
            setBusy(false);
          }
        }}
      />
      <Button label="Keep appointment" variant="ghost" onPress={() => goBack(`/appointment/${appointment.id}`)} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  visit: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  name: { color: theme.text, fontSize: 16, fontWeight: '700' },
  sub: { color: theme.muted, fontSize: 13.5, marginTop: 2 },
  outcome: { borderRadius: radius.lg, padding: 20, alignItems: 'center' },
  outcomeIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  outcomeLabel: { color: theme.muted, fontSize: 13.5, fontWeight: '600' },
  outcomeValue: { fontFamily: fonts.serif, fontSize: 40, fontWeight: '700', marginTop: 2 },
  outcomeBody: { color: theme.text, fontSize: 14.5, lineHeight: 21, textAlign: 'center', marginTop: 8 },
});
