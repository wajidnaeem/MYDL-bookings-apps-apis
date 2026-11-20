import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { Button, Card, Screen } from '@/components/ui';
import { theme } from '@/constants/theme';
import { useClient } from '@/context/ClientContext';

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

  return (
    <Screen>
      <Card>
        <Text style={styles.title}>{error ? 'Payment not confirmed' : ready ? 'Deposit paid' : 'Confirming payment…'}</Text>
        <Text style={styles.body}>
          {error || (appointment
            ? `${appointment.deposit} for ${appointment.provider} is held until attendance is confirmed.`
            : 'Your deposit is held until attendance is confirmed.')}
        </Text>
      </Card>
      {receipt ? <Button label="View receipt" variant="secondary" onPress={() => router.push(`/receipt/${receipt.id}`)} /> : null}
      <Button label="Back to home" onPress={() => router.replace('/')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: theme.text, fontSize: 22, fontWeight: '700' },
  body: { color: theme.muted, fontSize: 16, lineHeight: 22 },
});
