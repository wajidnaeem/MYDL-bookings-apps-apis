import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';

import { Button, Card, Row, Screen } from '@/components/ui';
import { useClient } from '@/context/ClientContext';

export default function CheckoutScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { appointments, payDeposit } = useClient();
  const appointment = appointments.find((item) => item.id === id);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (!appointment) {
    return <Screen subtitle="This appointment is no longer available." />;
  }

  async function pay() {
    setBusy(true);
    setError('');
    try {
      const url = await payDeposit(appointment!.id);
      if (Platform.OS === 'web') {
        window.location.assign(url);
        return;
      }
      await WebBrowser.openBrowserAsync(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start the card payment.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen subtitle="Check the amount before you confirm. Stripe holds the deposit until the visit is completed or refunded.">
      <Card>
        <Row label="Provider" value={appointment.provider} />
        <Row label="Service" value={appointment.service} />
        <Row label="Deposit" value={appointment.deposit} />
        <Row label="Processing fee" value="$0.00" />
        <Row label="Total due now" value={appointment.deposit} />
      </Card>
      {error ? <Row label="Payment" value={error} /> : null}
      {appointment.depositPaid ? (
        <Button label="Deposit already paid" disabled />
      ) : (
        <Button label={busy ? 'Opening Stripe…' : `Pay ${appointment.deposit}`} disabled={busy} onPress={pay} />
      )}
    </Screen>
  );
}
