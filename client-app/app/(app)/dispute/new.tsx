import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button, Screen, TextField } from '@/components/ui';
import { theme } from '@/constants/theme';
import { useClient } from '@/context/ClientContext';

function pickEvidence(onFile: (file: { name: string; data: string }) => void) {
  const doc = (globalThis as { document?: { createElement: (tag: string) => any } }).document;
  if (Platform.OS !== 'web' || !doc) return;
  const input = doc.createElement('input');
  input.type = 'file';
  input.onchange = () => {
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const data = String(reader.result || '');
      onFile({ name: file.name, data: data.split(',')[1] || '' });
    };
    reader.readAsDataURL(file);
  };
  input.click();
}

export default function NewDisputeScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { appointments, raiseDispute } = useClient();
  const linked = appointments.find((item) => item.id === id);
  const [title, setTitle] = useState(linked ? `Issue with ${linked.provider}` : '');
  const [detail, setDetail] = useState('');
  const [evidence, setEvidence] = useState('');
  const [file, setFile] = useState<{ name: string; data: string } | null>(null);
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
      evidenceFile: file || undefined,
      appointmentId: linked?.id,
    });
    router.replace(`/dispute/${disputeId}`);
  }

  return (
    <Screen subtitle="Describe the problem and add any evidence you have.">
      <TextField label="Subject" value={title} onChangeText={setTitle} />
      <TextField label="Description" value={detail} onChangeText={setDetail} multiline placeholder="What should an administrator review?" />
      <TextField label="Evidence note" value={evidence} onChangeText={setEvidence} placeholder="Receipt number or a short note" />
      <Pressable onPress={() => pickEvidence(setFile)} style={styles.attach}>
        <View style={styles.dot} />
        <Text style={styles.attachText}>{file ? `Attached: ${file.name}` : 'Attach a file'}</Text>
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
