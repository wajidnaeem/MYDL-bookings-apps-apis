import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { Button, Screen, TextField } from '@/components/ui';
import { theme } from '@/constants/theme';
import { useProvider } from '@/context/ProviderContext';

export default function PolicyScreen() {
  const { policy, saveSettings } = useProvider();
  const [lateAfterMinutes, setLateAfterMinutes] = useState(String(policy.lateAfterMinutes));
  const [lateFee, setLateFee] = useState(policy.lateFee);
  const [noShow, setNoShow] = useState(policy.noShow);
  const [cancellation, setCancellation] = useState(policy.cancellation);
  const [error, setError] = useState('');

  return (
    <Screen subtitle="These rules are saved for your business and applied to new visits.">
      <TextField label="Minutes before a client is late" value={lateAfterMinutes} onChangeText={setLateAfterMinutes} keyboardType="number-pad" />
      <TextField label="Late fee" value={lateFee} onChangeText={setLateFee} />
      <TextField label="No-show rule" value={noShow} onChangeText={setNoShow} multiline />
      <TextField label="Cancellation rule" value={cancellation} onChangeText={setCancellation} multiline />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button
        label="Save policies"
        onPress={async () => {
          try {
            await saveSettings({ lateAfterMinutes: Number(lateAfterMinutes) || 15, lateFee, noShow, cancellation });
            router.back();
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not save.');
          }
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({ error: { color: theme.danger, fontSize: 14 } });
