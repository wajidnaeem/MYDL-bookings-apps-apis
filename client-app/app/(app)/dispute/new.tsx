import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { Button, FormSection, Notice, Screen, TextField } from '@/components/ui';
import { radius, theme } from '@/constants/theme';
import { useClient } from '@/context/ClientContext';
import { useFillOnce } from '@/lib/format';
import { Text } from '@/components/Text';

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
  useFillOnce(Boolean(linked), () => setTitle((t) => t || `Issue with ${linked?.provider}`));
  const [detail, setDetail] = useState('');
  const [evidence, setEvidence] = useState('');
  const [file, setFile] = useState<{ name: string; data: string } | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (detail.trim().length < 8) {
      setError('Describe the issue in a sentence or two.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const disputeId = await raiseDispute({
        title: title || 'Dispute',
        detail: linked ? `${linked.provider} · ${linked.service}. ${detail.trim()}` : detail.trim(),
        evidence,
        evidenceFile: file || undefined,
        appointmentId: linked?.id,
      });
      router.replace(`/dispute/${disputeId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not submit the dispute.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen subtitle="Describe the problem and add any evidence you have.">
      {linked ? (
        <View style={styles.linked}>
          <Icon name="calendar" size={16} color={theme.accent} />
          <Text style={styles.linkedText} numberOfLines={1}>{linked.provider} · {linked.service} · {linked.date}</Text>
        </View>
      ) : null}
      <FormSection title="Details">
        <TextField label="Subject" value={title} onChangeText={setTitle} />
        <TextField label="Description" value={detail} onChangeText={setDetail} multiline placeholder="What should an administrator review?" />
      </FormSection>
      <FormSection title="Evidence">
        <TextField label="Evidence note" value={evidence} onChangeText={setEvidence} placeholder="Receipt number or a short note" />
        {Platform.OS === 'web' ? (
          <Pressable accessibilityRole="button" onPress={() => pickEvidence(setFile)} style={({ pressed }) => [styles.attach, file && styles.attachOn, pressed && { opacity: 0.85 }]}>
            <View style={styles.attachIcon}><Icon name={file ? 'check' : 'paperclip'} size={18} color={file ? theme.success : theme.accent} /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.attachTitle}>{file ? `Attached: ${file.name}` : 'Attach a file'}</Text>
              <Text style={styles.attachSub}>{file ? 'Tap to choose a different file' : 'A photo, receipt or message screenshot'}</Text>
            </View>
          </Pressable>
        ) : null}
      </FormSection>
      {error ? <Notice text={error} /> : null}
      <Button label="Submit dispute" loading={busy} disabled={busy} onPress={submit} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  linked: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: theme.goldSoft, borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 12 },
  linkedText: { flex: 1, color: theme.text, fontSize: 14, fontWeight: '600' },
  attach: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderStyle: 'dashed', borderColor: '#D9D1C2', borderRadius: radius.md, padding: 14, backgroundColor: theme.card },
  attachOn: { borderStyle: 'solid', borderColor: theme.success, backgroundColor: theme.successSoft },
  attachIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: theme.card, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.border },
  attachTitle: { color: theme.text, fontSize: 15, fontWeight: '700' },
  attachSub: { color: theme.muted, fontSize: 13, marginTop: 2 },
});
