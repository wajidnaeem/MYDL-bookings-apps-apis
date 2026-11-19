import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { Button, Screen, TextField } from '@/components/ui';
import { theme } from '@/constants/theme';
import { useClient } from '@/context/ClientContext';

export default function ProfileEditScreen() {
  const { profile, updateProfile } = useClient();
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [phone, setPhone] = useState(profile.phone);
  const [error, setError] = useState('');

  async function save() {
    if (!name.trim() || !email.trim() || !phone.trim()) {
      setError('Name, email, and phone are required.');
      return;
    }
    try {
      await updateProfile({ name: name.trim(), email: email.trim(), phone: phone.trim() });
      router.back();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save the profile.');
    }
  }

  return (
    <Screen subtitle="Update the personal information on your client account.">
      <TextField label="Full name" value={name} onChangeText={setName} />
      <TextField label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
      <TextField label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button label="Save" onPress={save} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  error: { color: theme.danger, fontSize: 14 },
});
