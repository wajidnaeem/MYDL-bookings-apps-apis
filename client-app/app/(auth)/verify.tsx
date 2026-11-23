import { Redirect, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { Button, Notice, Screen, TextField } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';

export default function VerifyScreen() {
  const { signedIn, verify } = useAuth();
  const params = useLocalSearchParams<{ email?: string }>();
  const email = String(params.email || '');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (signedIn) return <Redirect href="/(app)/(tabs)" />;

  async function submit() {
    setBusy(true);
    setError('');
    try {
      await verify(email, code.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not verify the account.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen subtitle={`Enter the code sent to ${email}.`}>
      <TextField label="Verification code" value={code} onChangeText={setCode} keyboardType="number-pad" maxLength={6} />
      {error ? <Notice text={error} /> : null}
      <Button label={busy ? 'Checking…' : 'Verify and continue'} loading={busy} disabled={busy} onPress={submit} />
    </Screen>
  );
}
