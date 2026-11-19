import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { Button, Screen, TextField } from '@/components/ui';
import { theme } from '@/constants/theme';
import { useProvider } from '@/context/ProviderContext';

export default function NoShowScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { appointments, reportNoShow } = useProvider();
  const visit = appointments.find((item) => item.id === id);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  if (!visit) return <Screen subtitle="This visit is no longer available." />;

  return (
    <Screen subtitle={`Report that ${visit.clientName || 'the client'} did not attend ${visit.service}.`}>
      <TextField label="What happened" value={note} onChangeText={setNote} multiline placeholder="They did not arrive within the allowed time." />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button
        label="Submit claim"
        onPress={async () => {
          try {
            const disputeId = await reportNoShow(visit.id, note);
            router.replace(`/dispute/${disputeId}`);
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not submit the claim.');
          }
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({ error: { color: theme.danger, fontSize: 14 } });
