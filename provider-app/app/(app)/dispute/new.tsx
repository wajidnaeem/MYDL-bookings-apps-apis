import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button, Screen, TextField } from '@/components/ui';
import { theme } from '@/constants/theme';
import { useProvider } from '@/context/ProviderContext';

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
  const { appointments, raiseDispute } = useProvider();
  const visit = appointments.find((item) => item.id === id);
  const [title, setTitle] = useState(visit ? `Issue with ${visit.clientName}` : '');
  const [detail, setDetail] = useState('');
  const [file, setFile] = useState<{ name: string; data: string } | null>(null);
  const [error, setError] = useState('');

  return (
    <Screen subtitle="Describe the problem for an administrator.">
      <TextField label="Subject" value={title} onChangeText={setTitle} />
      <TextField label="Description" value={detail} onChangeText={setDetail} multiline />
      <Pressable onPress={() => pickEvidence(setFile)} style={styles.attach}>
        <View style={styles.dot} />
        <Text style={styles.attachText}>{file ? `Attached: ${file.name}` : 'Attach a file'}</Text>
      </Pressable>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button
        label="Submit dispute"
        onPress={async () => {
          try {
            const disputeId = await raiseDispute({
              title: title || 'Dispute',
              detail: visit ? `${visit.clientName} · ${visit.service}. ${detail.trim()}` : detail.trim(),
              evidenceFile: file || undefined,
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

const styles = StyleSheet.create({
  attach: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: theme.accent },
  attachText: { color: theme.accent, fontSize: 15, fontWeight: '600' },
  error: { color: theme.danger, fontSize: 14 },
});
