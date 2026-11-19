import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { Button, Screen, TextField } from '@/components/ui';
import { theme } from '@/constants/theme';
import { useProvider } from '@/context/ProviderContext';

export default function NewDisputeScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { appointments, raiseDispute } = useProvider();
  const visit = appointments.find((item) => item.id === id);
  const [title, setTitle] = useState(visit ? `Issue with ${visit.clientName}` : '');
  const [detail, setDetail] = useState('');
  const [error, setError] = useState('');

  return (
    <Screen subtitle="Describe the problem for an administrator.">
      <TextField label="Subject" value={title} onChangeText={setTitle} />
      <TextField label="Description" value={detail} onChangeText={setDetail} multiline />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button
        label="Submit dispute"
        onPress={async () => {
          try {
            const disputeId = await raiseDispute({
              title: title || 'Dispute',
              detail: visit ? `${visit.clientName} · ${visit.service}. ${detail.trim()}` : detail.trim(),
              appointmentId: visit?.id,
            });
            router.replace(`/dispute/${disputeId}`);
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not submit.');
          }
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({ error: { color: theme.danger, fontSize: 14 } });
