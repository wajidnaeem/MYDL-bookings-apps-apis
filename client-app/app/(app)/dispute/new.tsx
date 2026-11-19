import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button, Screen, TextField } from '@/components/ui';
import { theme } from '@/constants/theme';
import { useClient } from '@/context/ClientContext';

export default function NewDisputeScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { appointments, raiseDispute } = useClient();
  const linked = appointments.find((item) => item.id === id);
  const [title, setTitle] = useState(linked ? `Issue with ${linked.provider}` : '');
  const [detail, setDetail] = useState('');
  const [evidence, setEvidence] = useState('');
  const [error, setError] = useState('');

  async function submit() {
    if (detail.trim().length < 8) {
      setError('Describe the issue in a sentence or two.');
      return;
    }
    const disputeId = await raiseDispute({
      title: title || 'Dispute',
      detail: linked ? `${linked.provider} · ${linked.service}. ${detail.trim()}` : detail.trim(),
      evidence,
      appointmentId: linked?.id,
    });
    router.replace(`/dispute/${disputeId}`);
  }

  return (
    <Screen subtitle="Describe the problem and add any evidence you have.">
      <TextField label="Subject" value={title} onChangeText={setTitle} />
      <TextField label="Description" value={detail} onChangeText={setDetail} multiline placeholder="What should an administrator review?" />
      <TextField label="Evidence note" value={evidence} onChangeText={setEvidence} placeholder="Receipt number, photo name, or message" />
      <Pressable onPress={() => setEvidence((value) => value || 'photo-evidence.jpg')} style={styles.attach}>
        <View style={styles.dot} />
        <Text style={styles.attachText}>{evidence ? `Attached: ${evidence}` : 'Attach a photo name'}</Text>
      </Pressable>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button label="Submit dispute" onPress={submit} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  attach: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: theme.accent },
  attachText: { color: theme.accent, fontSize: 15, fontWeight: '600' },
  error: { color: theme.danger, fontSize: 14 },
});
