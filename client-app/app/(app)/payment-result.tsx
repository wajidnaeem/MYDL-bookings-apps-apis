import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { Steps } from '@/components/Steps';
import { Button, Screen, shadow } from '@/components/ui';
import { fonts, radius, theme } from '@/constants/theme';
import { useClient } from '@/context/ClientContext';
import { Text } from '@/components/Text';

export default function PaymentResultScreen() {
  const { id, session_id: sessionId } = useLocalSearchParams<{ id?: string; session_id?: string }>();
  const { appointments, transactions, confirmPayment } = useClient();
  const [error, setError] = useState('');
  const [ready, setReady] = useState(!sessionId);

  useEffect(() => {
    if (!sessionId) return;
    confirmPayment(String(sessionId))
      .then(() => setReady(true))
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not confirm the payment.'));
  }, [sessionId, confirmPayment]);

  const appointment = appointments.find((item) => item.id === id) || appointments.find((item) => item.depositPaid);
  const receipt = transactions.find((item) => item.title === 'Deposit' && item.detail.startsWith(appointment?.provider ?? '---'));
  const state = error ? 'error' : ready ? 'done' : 'loading';

  return (
    <Screen>
      {state === 'done' ? <Steps current={2} /> : null}
      <View style={styles.card}>
        <View style={[styles.badge, state === 'error' && { backgroundColor: theme.dangerSoft }, state === 'done' && { backgroundColor: theme.successSoft }]}>
          {state === 'loading' ? <ActivityIndicator color={theme.accent} /> : <Icon name={state === 'error' ? 'alert' : 'check'} size={30} color={state === 'error' ? theme.danger : theme.success} strokeWidth={2.4} />}
        </View>
        <Text style={styles.title}>{state === 'error' ? 'Payment not confirmed' : state === 'done' ? 'Deposit paid' : 'Confirming payment…'}</Text>
        <Text style={styles.body}>
          {error || (appointment
            ? `${appointment.deposit} for ${appointment.provider} is held until attendance is confirmed.`
            : 'Your deposit is held until attendance is confirmed.')}
        </Text>
        {state === 'done' && appointment ? (
          <View style={styles.next}>
            <Icon name="qr" size={18} color={theme.accent} />
            <Text style={styles.nextText}>When you arrive on {appointment.date}, scan the provider's QR code in the app to confirm attendance.</Text>
          </View>
        ) : null}
      </View>
      {receipt ? <Button label="View receipt" icon="file" variant="secondary" onPress={() => router.push(`/receipt/${receipt.id}`)} /> : null}
      <Button label="Back to home" onPress={() => router.replace('/')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: theme.card, borderRadius: radius.xl, borderWidth: 1, borderColor: theme.border, padding: 24, alignItems: 'center', ...shadow },
  badge: { width: 72, height: 72, borderRadius: 36, backgroundColor: theme.goldSoft, alignItems: 'center', justifyContent: 'center', marginBottom: 18 },
  title: { fontFamily: fonts.serif, color: theme.text, fontSize: 30, fontWeight: '700', textAlign: 'center' },
  body: { color: theme.muted, fontSize: 15.5, lineHeight: 22, textAlign: 'center', marginTop: 8 },
  next: { flexDirection: 'row', gap: 10, backgroundColor: theme.goldSoft, borderRadius: radius.md, padding: 14, marginTop: 20, alignSelf: 'stretch' },
  nextText: { flex: 1, color: theme.text, fontSize: 14, lineHeight: 20 },
});
