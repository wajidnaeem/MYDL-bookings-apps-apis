import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { Button, Screen, TextField } from '@/components/ui';
import { theme } from '@/constants/theme';
import { useProvider } from '@/context/ProviderContext';

export default function NewVisitScreen() {
  const { business, createVisit } = useProvider();
  const [clientEmail, setClientEmail] = useState('amina@example.com');
  const [service, setService] = useState('Consultation');
  const [date, setDate] = useState('Thu, 27 Nov 2026');
  const [time, setTime] = useState('3:00 PM');
  const [duration, setDuration] = useState('45 min');
  const [location, setLocation] = useState(business.location);
  const [price, setPrice] = useState('$80.00');
  const [deposit, setDeposit] = useState('$25.00');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    setError('');
    try {
      const id = await createVisit({ clientEmail, service, date, time, duration, location, price, deposit });
      router.replace(`/visit/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create the visit.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen subtitle="The client must already have a MYDL account. They will get an invitation.">
      <TextField label="Client email" value={clientEmail} onChangeText={setClientEmail} autoCapitalize="none" keyboardType="email-address" />
      <TextField label="Service" value={service} onChangeText={setService} />
      <TextField label="Date" value={date} onChangeText={setDate} />
      <TextField label="Time" value={time} onChangeText={setTime} />
      <TextField label="Duration" value={duration} onChangeText={setDuration} />
      <TextField label="Location" value={location} onChangeText={setLocation} />
      <TextField label="Price" value={price} onChangeText={setPrice} />
      <TextField label="Deposit" value={deposit} onChangeText={setDeposit} />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button label={busy ? 'Sending…' : 'Send invitation'} disabled={busy} onPress={submit} />
    </Screen>
  );
}

const styles = StyleSheet.create({ error: { color: theme.danger, fontSize: 14 } });
