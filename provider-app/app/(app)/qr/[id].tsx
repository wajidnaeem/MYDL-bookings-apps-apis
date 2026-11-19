import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Image, StyleSheet, Text } from 'react-native';

import { Button, Screen } from '@/components/ui';
import { theme } from '@/constants/theme';
import { useProvider } from '@/context/ProviderContext';
import { apiBase } from '@/lib/api';

export default function QrScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { appointments, makeQr } = useProvider();
  const visit = appointments.find((item) => item.id === id);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [version, setVersion] = useState(0);

  if (!visit) return <Screen subtitle="This visit is no longer available." />;

  async function generate() {
    if (!visit) return;
    setBusy(true);
    setError('');
    try {
      await makeQr(visit.id);
      setVersion((value) => value + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create the code.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen subtitle="Show this to the client when they arrive. It expires 10 minutes after you generate it.">
      {visit.hasQr || version > 0 ? (
        <Image source={{ uri: `${apiBase()}/demo/qr/${visit.id}.png?v=${version}` }} style={styles.image} />
      ) : (
        <Text style={styles.hint}>Generate a code when the client is with you.</Text>
      )}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button label={busy ? 'Creating…' : visit.hasQr ? 'Refresh code' : 'Generate code'} disabled={busy} onPress={generate} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  image: { width: 260, height: 260, alignSelf: 'center', backgroundColor: '#FFFFFF' },
  hint: { color: theme.muted, fontSize: 15 },
  error: { color: theme.danger, fontSize: 14 },
});
