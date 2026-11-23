import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Avatar, Button, Card, EmptyState, Notice, Screen, TextField } from '@/components/ui';
import { theme } from '@/constants/theme';
import { useClient } from '@/context/ClientContext';

export default function ReportNoShowScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { appointments, reportProviderNoShow } = useClient();
  const appointment = appointments.find((item) => item.id === id);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (!appointment) {
    return (
      <Screen>
        <EmptyState icon="calendar" title="This appointment is no longer available." />
      </Screen>
    );
  }

  return (
    <Screen subtitle={`Tell us what happened with ${appointment.provider} on ${appointment.date}.`}>
      <Card style={styles.visit}>
        <Avatar name={appointment.provider} size={44} />
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{appointment.provider}</Text>
          <Text style={styles.sub}>{appointment.service} · {appointment.date} · {appointment.time}</Text>
        </View>
        <Text style={styles.deposit}>{appointment.deposit}</Text>
      </Card>
      <TextField label="What happened" value={note} onChangeText={setNote} multiline placeholder="The provider was not there at the scheduled time." />
      <Notice tone="info" text="This opens a dispute an administrator can review." />
      {error ? <Notice text={error} /> : null}
      <Button
        label="Submit report"
        icon={busy ? undefined : 'alert'}
        loading={busy}
        disabled={busy}
        onPress={async () => {
          setBusy(true);
          setError('');
          try {
            const disputeId = await reportProviderNoShow(appointment.id, note);
            router.replace(`/dispute/${disputeId}`);
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not submit the report.');
          } finally {
            setBusy(false);
          }
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  visit: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  name: { color: theme.text, fontSize: 16, fontWeight: '700' },
  sub: { color: theme.muted, fontSize: 13, marginTop: 2 },
  deposit: { color: theme.text, fontSize: 16, fontWeight: '700' },
});
