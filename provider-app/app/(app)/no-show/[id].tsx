import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Avatar, Button, Card, EmptyState, Notice, Screen, TextField } from '@/components/ui';
import { theme } from '@/constants/theme';
import { useProvider } from '@/context/ProviderContext';

export default function NoShowScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { appointments, policy, reportNoShow } = useProvider();
  const visit = appointments.find((item) => item.id === id);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (!visit) {
    return (
      <Screen>
        <EmptyState icon="calendar" title="This visit is no longer available." />
      </Screen>
    );
  }

  return (
    <Screen subtitle={`Report that ${visit.clientName || 'the client'} did not attend ${visit.service}.`}>
      <Card style={styles.visit}>
        <Avatar name={visit.clientName || 'Client'} size={44} />
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{visit.clientName || 'Client'}</Text>
          <Text style={styles.sub}>{visit.service} · {visit.date} · {visit.time}</Text>
        </View>
        <Text style={styles.deposit}>{visit.deposit}</Text>
      </Card>

      <Notice tone="warning" text={visit.depositPaid ? `Submitting this keeps the ${visit.deposit} deposit under your no-show rule and opens a claim an administrator can review.` : 'No deposit was paid for this visit. The claim opens a dispute an administrator can review.'} />
      {policy.noShow ? (
        <Card>
          <Text style={styles.ruleLabel}>Your no-show rule</Text>
          <Text style={styles.rule}>{policy.noShow}</Text>
        </Card>
      ) : null}

      <TextField label="What happened" value={note} onChangeText={setNote} multiline placeholder="They did not arrive within the allowed time." />
      {error ? <Notice text={error} /> : null}
      <Button
        label="Submit claim"
        variant="primary"
        icon={busy ? undefined : 'alert'}
        loading={busy}
        disabled={busy}
        onPress={async () => {
          setBusy(true);
          setError('');
          try {
            const disputeId = await reportNoShow(visit.id, note);
            router.replace(`/dispute/${disputeId}`);
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not submit the claim.');
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
  ruleLabel: { color: theme.muted, fontSize: 12.5, fontWeight: '600' },
  rule: { color: theme.text, fontSize: 15, lineHeight: 22 },
});
