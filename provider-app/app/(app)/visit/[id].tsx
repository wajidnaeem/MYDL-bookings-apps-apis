import { router, useLocalSearchParams } from 'expo-router';
import { Share, StyleSheet, Text } from 'react-native';

import { Button, Card, Row, Screen, StatusPill } from '@/components/ui';
import { theme } from '@/constants/theme';
import { useProvider } from '@/context/ProviderContext';

export default function VisitScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { appointments, business, cancelVisit } = useProvider();
  const visit = appointments.find((item) => item.id === id);

  if (!visit) return <Screen subtitle="This visit is no longer available." />;

  const message = `${business.businessName} invited you to ${visit.service} on ${visit.date} at ${visit.time}. Open the MYDL client app to accept. Deposit ${visit.deposit}.`;

  return (
    <Screen>
      <Card>
        <StatusPill status={visit.status === 'pending' ? 'Invitation' : visit.status} />
        <Text style={styles.title}>{visit.clientName || visit.clientEmail}</Text>
        <Row label="Email" value={visit.clientEmail} />
        <Row label="Service" value={visit.service} />
        <Row label="When" value={`${visit.date} · ${visit.time}`} />
        <Row label="Duration" value={visit.duration} />
        <Row label="Location" value={visit.location} />
        <Row label="Price" value={visit.price} />
        <Row label="Deposit" value={visit.depositPaid ? `${visit.deposit} paid` : visit.deposit} />
      </Card>
      <Button label="Share invitation" variant="secondary" onPress={() => Share.share({ message })} />
      {visit.status === 'upcoming' ? <Button label={visit.hasQr ? 'Show attendance QR' : 'Generate attendance QR'} onPress={() => router.push(`/qr/${visit.id}`)} /> : null}
      {visit.status === 'upcoming' ? <Button label="Report client no-show" variant="danger" onPress={() => router.push(`/no-show/${visit.id}`)} /> : null}
      {visit.status !== 'cancelled' && visit.status !== 'completed' ? (
        <Button
          label="Cancel visit"
          variant="secondary"
          onPress={async () => {
            await cancelVisit(visit.id);
            router.back();
          }}
        />
      ) : null}
      <Button label="Raise a dispute" variant="secondary" onPress={() => router.push(`/dispute/new?id=${visit.id}`)} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: theme.text, fontSize: 22, fontWeight: '700' },
});
