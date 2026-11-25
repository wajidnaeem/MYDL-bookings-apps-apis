import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Share, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { Avatar, Button, Card, EmptyState, Notice, Row, Screen, StatusPill } from '@/components/ui';
import { fonts, radius, theme } from '@/constants/theme';
import { useProvider } from '@/context/ProviderContext';
import { goBack } from '@/lib/nav';
import { depositStatus, visitLabel } from '@/lib/format';
import { Text } from '@/components/Text';

export default function VisitScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { appointments, business, cancelVisit } = useProvider();
  const visit = appointments.find((item) => item.id === id);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (!visit) {
    return (
      <Screen>
        <EmptyState icon="calendar" title="This visit is no longer available." />
      </Screen>
    );
  }

  const message = `${business.businessName} invited you to ${visit.service} on ${visit.date} at ${visit.time} (${visit.timezone || 'UTC'}). Open your private link: ${process.env.EXPO_PUBLIC_CLIENT_URL || 'http://localhost:8081'}/appointment/${visit.id} Deposit ${visit.deposit}.`;
  const open = visit.status !== 'cancelled' && visit.status !== 'completed';
  const deposit = visit.depositPaid ? depositStatus(visit) : 'Not paid';

  return (
    <Screen>
      <View style={styles.hero}>
        <View style={styles.heroTop}>
          <Avatar name={visit.clientName || visit.clientEmail} size={52} dark />
          <View style={{ flex: 1 }}>
            <Text style={styles.name} numberOfLines={1}>{visit.clientName || visit.clientEmail}</Text>
            <Text style={styles.email} numberOfLines={1}>{visit.clientEmail}</Text>
          </View>
          <StatusPill status={visitLabel(visit.status)} dark />
        </View>
        <Text style={styles.service}>{visit.service}</Text>
        <View style={styles.whenRow}>
          <View style={styles.when}>
            <Icon name="calendar" size={16} color={theme.goldLight} />
            <Text style={styles.whenText}>{visit.date}</Text>
          </View>
          <View style={styles.when}>
            <Icon name="clock" size={16} color={theme.goldLight} />
            <Text style={styles.whenText}>{visit.time} · {visit.timezone || 'UTC'}</Text>
          </View>
        </View>
      </View>

      <Card style={styles.money}>
        <View style={styles.moneyCol}>
          <Text style={styles.moneyLabel}>Service price</Text>
          <Text style={styles.moneyValue}>{visit.price}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.moneyCol}>
          <Text style={styles.moneyLabel}>Deposit</Text>
          <Text style={styles.moneyValue}>{visit.deposit}</Text>
          <StatusPill status={deposit} />
        </View>
      </Card>

      <Card style={{ gap: 0, paddingVertical: 6 }}>
        <Row icon="timer" label="Duration" value={visit.duration} />
        <Row icon="pin" label="Location" value={visit.location || 'Not set'} />
        <Row icon="qr" label="Check-in" value={visit.attended ? 'Confirmed by QR' : visit.hasQr ? 'Code active' : 'Not yet'} last />
      </Card>

      {error ? <Notice text={error} /> : null}

      {visit.status === 'upcoming' ? (
        <Button variant="gold" icon="qr" label={visit.hasQr ? 'Show attendance QR' : 'Generate attendance QR'} onPress={() => router.push(`/qr/${visit.id}`)} />
      ) : null}
      <Button label="Share invitation" icon="share" variant="secondary" onPress={() => Share.share({ message })} />
      {open ? (
        <Button label="Edit visit" icon="edit" variant="secondary" onPress={() => router.push({ pathname: '/visit-edit/[id]', params: { id: visit.id } })} />
      ) : null}
      {visit.status === 'upcoming' ? <Button label="Report client no-show" icon="alert" variant="danger" onPress={() => router.push(`/no-show/${visit.id}`)} /> : null}
      {open ? (
        <Button
          label="Cancel visit"
          icon="cancel"
          variant="secondary"
          loading={busy}
          disabled={busy}
          onPress={async () => {
            setBusy(true);
            setError('');
            try {
              await cancelVisit(visit.id);
              goBack('/visits');
            } catch (err) {
              setError(err instanceof Error ? err.message : 'Could not cancel the visit.');
            } finally {
              setBusy(false);
            }
          }}
        />
      ) : null}
      <Button label="Raise a dispute" icon="scale" variant="ghost" onPress={() => router.push(`/dispute/new?id=${visit.id}`)} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { backgroundColor: theme.ink, borderRadius: radius.xl, padding: 20, gap: 4 },
  heroTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  name: { color: theme.onInk, fontSize: 18, fontWeight: '700' },
  email: { color: theme.onInkMuted, fontSize: 13, marginTop: 2 },
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
