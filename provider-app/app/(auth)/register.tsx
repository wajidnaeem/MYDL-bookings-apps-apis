import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { Button, Screen, TextField } from '@/components/ui';
import { theme } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';

export default function RegisterScreen() {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!name.trim() || !email.includes('@') || !phone.trim() || password.trim().length < 6) {
      setError('Enter the business name, email, phone, and a password of at least 6 characters.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await register({ name: name.trim(), email: email.trim(), phone: phone.trim(), password });
      router.push({ pathname: '/verify', params: { email: email.trim() } });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create the account.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen subtitle="This account is for the business, not for clients.">
      <TextField label="Business name" value={name} onChangeText={setName} />
      <TextField label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
      <TextField label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
      <TextField label="Password" value={password} onChangeText={setPassword} secureTextEntry />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button label={busy ? 'Saving…' : 'Continue'} disabled={busy} onPress={submit} />
    </Screen>
  );
}

const styles = StyleSheet.create({ error: { color: theme.danger, fontSize: 14 } });
