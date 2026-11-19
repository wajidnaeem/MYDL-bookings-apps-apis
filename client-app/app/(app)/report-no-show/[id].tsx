import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { Button, Screen, TextField } from '@/components/ui';
import { theme } from '@/constants/theme';
import { useClient } from '@/context/ClientContext';

export default function ReportNoShowScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { appointments, reportProviderNoShow } = useClient();
  const appointment = appointments.find((item) => item.id === id);
  const [note, setNote] = useState('');

  if (!appointment) {
    return <Screen subtitle="This appointment is no longer available." />;
  }

  return (
    <Screen subtitle={`Tell us what happened with ${appointment.provider} on ${appointment.date}.`}>
      <TextField
        label="What happened"
        value={note}
        onChangeText={setNote}
        multiline
        placeholder="The provider was not there at the scheduled time."
      />
      <Text style={styles.hint}>This opens a dispute an administrator can review.</Text>
      <Button
        label="Submit report"
        onPress={async () => {
          const disputeId = await reportProviderNoShow(appointment.id, note);
          router.replace(`/dispute/${disputeId}`);
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hint: { color: theme.muted, fontSize: 14, lineHeight: 20 },
});
