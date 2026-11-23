import { router } from 'expo-router';
import { useState } from 'react';

import { Button, Notice, Screen, TextField } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';

export default function ForgotPasswordScreen() {
  const { requestReset } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!email.includes('@')) {
      setError('Enter the email on the provider account.');
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
      {error ? <Notice text={error} /> : null}
      <Button label={busy ? 'Sending…' : 'Send reset code'} loading={busy} disabled={busy} onPress={submit} />
    </Screen>
  );
}
