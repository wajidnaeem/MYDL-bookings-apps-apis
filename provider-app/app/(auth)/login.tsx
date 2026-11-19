import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Screen, TextField } from '@/components/ui';
import { theme } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';

export default function LoginScreen() {
  const { signedIn, signIn } = useAuth();
  const [email, setEmail] = useState('provider@mydl.app');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (signedIn) return <Redirect href="/(app)/(tabs)" />;

  async function submit() {
    setBusy(true);
    setError('');
    try {
      await signIn(email.trim(), password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not sign in.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Screen title="MYDL Provider" subtitle="Sign in to manage visits, policies, and attendance codes.">
        <TextField label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
        <TextField label="Password" value={password} onChangeText={setPassword} secureTextEntry />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button label={busy ? 'Signing in…' : 'Sign in'} disabled={busy} onPress={submit} />
        <Pressable onPress={() => router.push('/forgot-password')}>
          <Text style={styles.link}>Forgot password</Text>
        </Pressable>
        <Pressable onPress={() => router.push('/register')}>
          <Text style={styles.link}>Create a provider account</Text>
        </Pressable>
      </Screen>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.bg },
  link: { color: theme.accent, fontSize: 16, fontWeight: '600', paddingVertical: 6 },
  error: { color: theme.danger, fontSize: 14 },
});
