import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { Button, Notice, Screen, TextField } from '@/components/ui';
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
    if (password.trim().length < 6) {
      setError('Use at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Those passwords do not match.');
      return;
    }
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
      {error ? <Notice text={error} /> : null}
      {done ? <Notice tone="success" text="Password updated. You can sign in with it now." /> : null}
      {done ? (
        <Button label="Back to sign in" onPress={() => router.replace('/login')} />
      ) : (
        <Button label={busy ? 'Saving…' : 'Save password'} loading={busy} disabled={busy} onPress={submit} />
      )}
    </Screen>
  );
}
