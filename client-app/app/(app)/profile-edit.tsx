import { router } from 'expo-router';
import { useState } from 'react';

import { Button, FormSection, Notice, Screen, TextField } from '@/components/ui';
import { useClient } from '@/context/ClientContext';
import { goBack } from '@/lib/nav';
import { useFillOnce } from '@/lib/format';

export default function ProfileEditScreen() {
  const { profile, updateProfile } = useClient();
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [phone, setPhone] = useState(profile.phone);
  useFillOnce(Boolean(profile.email), () => {
    setName(profile.name);
    setEmail(profile.email);
    setPhone(profile.phone);
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function save() {
    if (!name.trim() || !email.trim() || !phone.trim()) {
      setError('Name, email, and phone are required.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await updateProfile({ name: name.trim(), email: email.trim(), phone: phone.trim() });
      goBack('/profile');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save the profile.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen subtitle="Update the personal information on your client account.">
      <FormSection title="Personal details">
        <TextField label="Full name" value={name} onChangeText={setName} autoComplete="name" />
        <TextField label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" autoComplete="email" hint="Providers invite you using this email." />
        <TextField label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" autoComplete="tel" />
      </FormSection>
      {error ? <Notice text={error} /> : null}
      <Button label="Save" loading={busy} disabled={busy} onPress={save} />
    </Screen>
  );
}
