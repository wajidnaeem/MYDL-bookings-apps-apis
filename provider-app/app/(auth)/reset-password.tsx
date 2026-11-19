import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { Button, Screen, TextField } from '@/components/ui';
import { theme } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';

export default function ResetPasswordScreen() {
  const { resetPassword } = useAuth();
  const params = useLocalSearchParams<{ email?: string }>();
  const email = String(params.email || '');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (password.length < 6) return setError('Use at least 6 characters.');
    if (password !== confirm) return setError('Those passwords do not match.');
    setBusy(true);
    setError('');
    try {
      await resetPassword(email, code.trim(), password);
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not reset the password.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen subtitle={`Choose a new password for ${email}.`}>
      <TextField label="Reset code" value={code} onChangeText={setCode} keyboardType="number-pad" />
      <TextField label="New password" value={password} onChangeText={setPassword} secureTextEntry />
      <TextField label="Confirm password" value={confirm} onChangeText={setConfirm} secureTextEntry />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {done ? <Text style={styles.ok}>Password updated. You can sign in now.</Text> : null}
      {done ? <Button label="Back to sign in" onPress={() => router.replace('/login')} /> : <Button label={busy ? 'Saving…' : 'Save password'} disabled={busy} onPress={submit} />}
    </Screen>
  );
}

const styles = StyleSheet.create({
  error: { color: theme.danger, fontSize: 14 },
  ok: { color: theme.success, fontSize: 15 },
});
