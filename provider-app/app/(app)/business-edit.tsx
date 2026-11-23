import { router } from 'expo-router';
import { useState } from 'react';

import { Button, FormSection, Notice, Screen, TextField } from '@/components/ui';
import { useProvider } from '@/context/ProviderContext';
import { useFillOnce } from '@/lib/format';

export default function BusinessEditScreen() {
  const { business, saveSettings } = useProvider();
  const [businessName, setBusinessName] = useState(business.businessName);
  const [serviceDetails, setServiceDetails] = useState(business.serviceDetails);
  const [location, setLocation] = useState(business.location);
  const [contact, setContact] = useState(business.contact);
  useFillOnce(Boolean(business.businessName), () => {
    setBusinessName(business.businessName);
    setServiceDetails(business.serviceDetails);
    setLocation(business.location);
    setContact(business.contact);
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  return (
    <Screen subtitle="Clients see this name on their invitations.">
      <FormSection title="Profile">
        <TextField label="Business name" value={businessName} onChangeText={setBusinessName} />
        <TextField label="Services" value={serviceDetails} onChangeText={setServiceDetails} multiline hint="A short line about what you offer." />
      </FormSection>
      <FormSection title="Location & contact">
        <TextField label="Location" value={location} onChangeText={setLocation} hint="Used as the default location for new visits." />
        <TextField label="Contact" value={contact} onChangeText={setContact} keyboardType="phone-pad" />
      </FormSection>
      {error ? <Notice text={error} /> : null}
      <Button
        label="Save"
        loading={busy}
        disabled={busy}
        onPress={async () => {
          setBusy(true);
          setError('');
          try {
            await saveSettings({ businessName, serviceDetails, location, contact });
            router.back();
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not save.');
          } finally {
            setBusy(false);
          }
        }}
      />
    </Screen>
  );
}
