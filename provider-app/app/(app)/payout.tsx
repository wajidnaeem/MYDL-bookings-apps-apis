import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { Button, Screen, TextField } from '@/components/ui';
import { theme } from '@/constants/theme';
import { useProvider } from '@/context/ProviderContext';

export default function PayoutScreen() {
  const { business, saveSettings } = useProvider();
  const [payoutMethod, setPayoutMethod] = useState(business.payoutMethod);
  const [payoutDetails, setPayoutDetails] = useState(business.payoutDetails);
  const [error, setError] = useState('');

  return (
    <Screen subtitle="Where released deposits should be sent. The payment provider is not connected yet.">
      <TextField label="Method" value={payoutMethod} onChangeText={setPayoutMethod} placeholder="Bank transfer" />
      <TextField label="Account details" value={payoutDetails} onChangeText={setPayoutDetails} placeholder="Account ending 4421" />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button
        label="Save payout method"
        onPress={async () => {
          try {
            await saveSettings({ payoutMethod, payoutDetails });
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
