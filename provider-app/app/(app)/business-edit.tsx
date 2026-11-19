import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { Button, Screen, TextField } from '@/components/ui';
import { theme } from '@/constants/theme';
import { useProvider } from '@/context/ProviderContext';

export default function BusinessEditScreen() {
  const { business, saveSettings } = useProvider();
  const [businessName, setBusinessName] = useState(business.businessName);
  const [serviceDetails, setServiceDetails] = useState(business.serviceDetails);
  const [location, setLocation] = useState(business.location);
  const [contact, setContact] = useState(business.contact);
  const [error, setError] = useState('');

  return (
    <Screen subtitle="Clients see this name on their invitations.">
      <TextField label="Business name" value={businessName} onChangeText={setBusinessName} />
      <TextField label="Services" value={serviceDetails} onChangeText={setServiceDetails} multiline />
      <TextField label="Location" value={location} onChangeText={setLocation} />
      <TextField label="Contact" value={contact} onChangeText={setContact} />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button
        label="Save"
        onPress={async () => {
          try {
            await saveSettings({ businessName, serviceDetails, location, contact });
            router.back();
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not save.');
          }
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({ error: { color: theme.danger, fontSize: 14 } });
