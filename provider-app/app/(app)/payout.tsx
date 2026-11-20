import { router } from 'expo-router';
import { useState } from 'react';
import { Linking, Platform, StyleSheet, Text } from 'react-native';

import { Button, Screen, TextField } from '@/components/ui';
import { theme } from '@/constants/theme';
import { useProvider } from '@/context/ProviderContext';

export default function PayoutScreen() {
  const { business, saveSettings, connectPayout } = useProvider();
  const [payoutMethod, setPayoutMethod] = useState(business.payoutMethod);
  const [payoutDetails, setPayoutDetails] = useState(business.payoutDetails);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  return (
    <Screen subtitle={business.payoutConnected ? 'Stripe is connected. Released deposits can be transferred to this account.' : 'Connect a Stripe account so released deposits can be paid out.'}>
      <Button
        label={busy ? 'Opening Stripe…' : business.payoutConnected ? 'Update Stripe account' : 'Connect bank with Stripe'}
        disabled={busy}
        onPress={async () => {
          setBusy(true);
          setError('');
          try {
            const url = await connectPayout();
            if (Platform.OS === 'web') {
              window.location.assign(url);
              return;
            }
            await Linking.openURL(url);
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not open Stripe.');
          } finally {
            setBusy(false);
          }
        }}
      />
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
