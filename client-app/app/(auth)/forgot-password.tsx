import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { Button, Screen, TextField } from '@/components/ui';
import { theme } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';

export default function ForgotPasswordScreen() {
  const { requestReset } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!email.trim().includes('@')) {
      setError('Enter the email on your account.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await requestReset(email.trim());
      router.push({ pathname: '/reset-password', params: { email: email.trim() } });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start the reset.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen subtitle="We will send a reset code to this email.">
      <TextField label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button label={busy ? 'Sending…' : 'Send reset code'} disabled={busy} onPress={submit} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  error: { color: theme.danger, fontSize: 14 },
});
