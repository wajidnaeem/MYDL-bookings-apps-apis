import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text } from 'react-native';

import { Button, Card, Row, Screen, StatusPill } from '@/components/ui';
import { theme } from '@/constants/theme';
import { useClient } from '@/context/ClientContext';

export default function AppointmentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { appointments, declineInvitation } = useClient();
  const appointment = appointments.find((item) => item.id === id);

  if (!appointment) {
    return <Screen title="Appointment" subtitle="This appointment is no longer available." />;
  }

  return (
    <Screen>
      <Card>
        <StatusPill status={appointment.status === 'pending' ? 'Invitation' : appointment.status} />
        <Text style={styles.provider}>{appointment.provider}</Text>
        <Text style={styles.service}>{appointment.service}</Text>
        <Row label="Date" value={appointment.date} />
        <Row label="Time" value={appointment.time} />
        <Row label="Duration" value={appointment.duration} />
        <Row label="Location" value={appointment.location} />
        <Row label="Service price" value={appointment.price} />
        <Row label="Deposit" value={appointment.deposit} />
        <Row label="Deposit status" value={appointment.depositPaid ? 'Paid and held' : 'Not paid'} />
        {appointment.attended ? <Row label="Attendance" value="Confirmed" /> : null}
      </Card>
      {appointment.status === 'pending' ? (
        <>
          <Button label="Accept invitation" onPress={() => router.push(`/policy/${appointment.id}`)} />
          <Button
            label="Decline"
            variant="secondary"
            onPress={async () => {
              await declineInvitation(appointment.id);
              router.back();
            }}
          />
        </>
      ) : null}
      {appointment.status === 'upcoming' ? (
        <>
          <Button label="Scan attendance QR" onPress={() => router.push(`/scan?id=${appointment.id}`)} />
          <Button label="Cancel appointment" variant="secondary" onPress={() => router.push(`/cancel/${appointment.id}`)} />
          <Button label="Report provider no-show" variant="danger" onPress={() => router.push(`/report-no-show/${appointment.id}`)} />
        </>
      ) : null}
      {appointment.status === 'completed' || appointment.status === 'cancelled' ? (
        <Button label="Raise a dispute" variant="secondary" onPress={() => router.push(`/dispute/new?id=${appointment.id}`)} />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  provider: { color: theme.text, fontSize: 22, fontWeight: '700' },
  service: { color: theme.muted, fontSize: 16 },
});
