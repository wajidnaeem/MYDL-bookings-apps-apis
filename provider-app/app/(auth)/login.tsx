import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icon } from '@/components/Icon';
import { Button, Notice, TextField } from '@/components/ui';
import { fonts, radius, theme } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { Text } from '@/components/Text';

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
    <View style={styles.root}>
      <SafeAreaView edges={['top']} style={styles.top}>
        <View style={styles.ring} />
        <View style={styles.ring2} />
        <View style={styles.brand}>
          <View style={styles.mark}><Text style={styles.markText}>M</Text></View>
          <Text style={styles.brandText}>MYDL</Text>
          <View style={styles.tag}><Text style={styles.tagText}>PROVIDER</Text></View>
        </View>
        <Text style={styles.heroTitle}>Your visits,{'\n'}protected.</Text>
        <Text style={styles.heroSub}>Sign in to manage visits, policies, and attendance codes.</Text>
      </SafeAreaView>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView style={styles.sheet} contentContainerStyle={styles.sheetContent} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>MYDL Provider</Text>
          <TextField label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" autoComplete="email" />
          <TextField label="Password" value={password} onChangeText={setPassword} secureTextEntry autoComplete="password" onSubmitEditing={submit} />
          <Pressable onPress={() => router.push('/forgot-password')} style={styles.forgot} hitSlop={8}>
            <Text style={styles.link}>Forgot password</Text>
          </Pressable>
          {error ? <Notice text={error} /> : null}
          <Button label={busy ? 'Signing in…' : 'Sign in'} loading={busy} disabled={busy} onPress={submit} />
          <View style={styles.divider}>
            <View style={styles.line} />
            <Text style={styles.or}>New to MYDL?</Text>
            <View style={styles.line} />
          </View>
          <Button label="Create a provider account" variant="secondary" icon="briefcase" onPress={() => router.push('/register')} />
          <View style={styles.trust}>
            <Icon name="lock" size={14} color={theme.faint} />
            <Text style={styles.trustText}>Deposits are processed securely by Stripe.</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.ink },
  top: { paddingHorizontal: 24, paddingBottom: 34, overflow: 'hidden' },
  ring: { position: 'absolute', right: -90, top: -40, width: 260, height: 260, borderRadius: 130, borderWidth: 1, borderColor: 'rgba(201,168,106,0.28)' },
  ring2: { position: 'absolute', right: -30, top: 20, width: 160, height: 160, borderRadius: 80, borderWidth: 1, borderColor: 'rgba(201,168,106,0.18)' },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 18 },
  mark: { width: 34, height: 34, borderRadius: 10, borderWidth: 1, borderColor: theme.gold, alignItems: 'center', justifyContent: 'center' },
  markText: { fontFamily: fonts.serif, color: theme.gold, fontSize: 17, fontWeight: '700' },
  brandText: { fontFamily: fonts.serif, color: theme.onInk, fontSize: 24, fontWeight: '700', letterSpacing: 2 },
  tag: { borderWidth: 1, borderColor: 'rgba(201,168,106,0.45)', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 },
  tagText: { color: theme.gold, fontSize: 10, fontWeight: '700', letterSpacing: 1.6 },
  heroTitle: { fontFamily: fonts.serif, color: theme.onInk, fontSize: 40, lineHeight: 44, fontWeight: '700', marginTop: 34 },
  heroSub: { color: theme.onInkMuted, fontSize: 15, lineHeight: 22, marginTop: 10, maxWidth: 320 },
  sheet: { flex: 1, backgroundColor: theme.bg, borderTopLeftRadius: radius.xl + 4, borderTopRightRadius: radius.xl + 4 },
  sheetContent: { padding: 24, gap: 14, paddingBottom: 40 },
  title: { fontFamily: fonts.serif, color: theme.text, fontSize: 28, fontWeight: '700', marginBottom: 4 },
  forgot: { alignSelf: 'flex-end', marginTop: -4 },
  link: { color: theme.accent, fontSize: 14.5, fontWeight: '700' },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 6 },
  line: { flex: 1, height: 1, backgroundColor: theme.border },
  or: { color: theme.faint, fontSize: 13 },
  trust: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 6 },
  trustText: { color: theme.faint, fontSize: 12.5 },
});
