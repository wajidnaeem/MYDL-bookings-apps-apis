import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text } from 'react-native';

import { Button, Card, Screen } from '@/components/ui';
import { theme } from '@/constants/theme';
import { useClient } from '@/context/ClientContext';

export default function CancelScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { appointments, cancelAppointment } = useClient();
  const appointment = appointments.find((item) => item.id === id);

  if (!appointment) {
    return <Screen subtitle="This appointment is no longer available." />;
  }

  const start = Date.parse(`${appointment.date.replace(/^[A-Za-z]+,\s*/, '')} ${appointment.time}`);
  const refunds = !Number.isNaN(start) && start - Date.now() >= 24 * 60 * 60 * 1000;
  const refund = !appointment.depositPaid
    ? 'No deposit has been paid, so nothing is refunded.'
    : Number.isNaN(start) || refunds
      ? `This is at least 24 hours before the visit. Refund amount: ${appointment.deposit}.`
      : `This is inside 24 hours of the visit. The ${appointment.deposit} deposit is kept.`;

  return (
    <Screen subtitle={`${appointment.provider} · ${appointment.date} at ${appointment.time}`}>
      <Card>
        <Text style={styles.body}>{refund}</Text>
      </Card>
      <Button
        label="Confirm cancellation"
        variant="danger"
        onPress={async () => {
          await cancelAppointment(appointment.id);
          router.replace('/');
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { color: theme.text, fontSize: 16, lineHeight: 22 },
});
