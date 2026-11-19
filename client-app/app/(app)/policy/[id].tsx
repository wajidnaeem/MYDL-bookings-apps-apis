import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button, Card, Screen } from '@/components/ui';
import { theme } from '@/constants/theme';
import { useClient } from '@/context/ClientContext';

export default function PolicyScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { appointments, policy } = useClient();
  const appointment = appointments.find((item) => item.id === id);
  const [accepted, setAccepted] = useState(false);

  if (!appointment) {
    return <Screen subtitle="This appointment is no longer available." />;
  }

  return (
    <Screen subtitle="Review the provider's terms before you pay the deposit. Your acceptance is recorded.">
      <Card>
        <Text style={styles.heading}>{appointment.provider}</Text>
        <Text style={styles.rule}>Late arrival</Text>
        <Text style={styles.body}>
          You are late {policy.lateAfterMinutes} minutes after {appointment.time}. The late fee is {policy.lateFee}.
        </Text>
        <Text style={styles.rule}>No-show</Text>
        <Text style={styles.body}>{policy.noShow}</Text>
        <Text style={styles.rule}>Cancellation</Text>
        <Text style={styles.body}>{policy.cancellation}</Text>
      </Card>
      <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: accepted }} onPress={() => setAccepted((value) => !value)} style={styles.checkRow}>
        <View style={[styles.box, accepted && styles.boxOn]} />
        <Text style={styles.checkLabel}>I accept these late, cancellation, and no-show terms.</Text>
      </Pressable>
      <Button label="Continue to payment" disabled={!accepted} onPress={() => router.push(`/checkout/${appointment.id}`)} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  heading: { color: theme.text, fontSize: 18, fontWeight: '700' },
  rule: { color: theme.text, fontSize: 15, fontWeight: '700', marginTop: 6 },
  body: { color: theme.muted, fontSize: 15, lineHeight: 21 },
  checkRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  box: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: theme.accent },
  boxOn: { backgroundColor: theme.accent },
  checkLabel: { flex: 1, color: theme.text, fontSize: 15, lineHeight: 21 },
});
