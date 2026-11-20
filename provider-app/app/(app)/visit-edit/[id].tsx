import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { Button, Screen, TextField } from '@/components/ui';
import { theme } from '@/constants/theme';
import { useProvider } from '@/context/ProviderContext';

export default function EditVisitScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { appointments, updateVisit } = useProvider();
  const visit = appointments.find((item) => item.id === id);
  const [service, setService] = useState(visit?.service || '');
  const [date, setDate] = useState(visit?.date || '');
  const [time, setTime] = useState(visit?.time || '');
  const [timezone, setTimezone] = useState(visit?.timezone || 'UTC');
  const [duration, setDuration] = useState(visit?.duration || '');
  const [location, setLocation] = useState(visit?.location || '');
  const [price, setPrice] = useState(visit?.price || '');
  const [deposit, setDeposit] = useState(visit?.deposit || '');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (!visit) return <Screen subtitle="This visit is no longer available." />;

  async function save() {
    setBusy(true);
    setError('');
    try {
      await updateVisit(visit!.id, { service, date, time, timezone, duration, location, price, deposit });
      router.back();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save the visit.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen subtitle="The client is notified when the visit changes.">
      <TextField label="Service" value={service} onChangeText={setService} />
      <TextField label="Date" value={date} onChangeText={setDate} />
      <TextField label="Time" value={time} onChangeText={setTime} />
      <TextField label="Time zone" value={timezone} onChangeText={setTimezone} autoCapitalize="none" />
      <TextField label="Duration" value={duration} onChangeText={setDuration} />
      <TextField label="Location" value={location} onChangeText={setLocation} />
      <TextField label="Price" value={price} onChangeText={setPrice} />
      <TextField label="Deposit" value={deposit} onChangeText={setDeposit} />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button label={busy ? 'Saving…' : 'Save changes'} disabled={busy} onPress={save} />
    </Screen>
  );
}

const styles = StyleSheet.create({ error: { color: theme.danger, fontSize: 14 } });
