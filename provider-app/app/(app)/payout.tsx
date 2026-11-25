import { router } from 'expo-router';
import { useState } from 'react';
import { Linking, Platform, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { Button, FormSection, Notice, Screen, TextField } from '@/components/ui';
import { fonts, radius, theme } from '@/constants/theme';
import { useProvider } from '@/context/ProviderContext';
import { goBack } from '@/lib/nav';
import { useFillOnce } from '@/lib/format';
import { Text } from '@/components/Text';

export default function PayoutScreen() {
  const { business, profile, saveSettings, connectPayout } = useProvider();
  const [payoutMethod, setPayoutMethod] = useState(business.payoutMethod);
  const [payoutDetails, setPayoutDetails] = useState(business.payoutDetails);
  useFillOnce(Boolean(profile.email), () => {
    setPayoutMethod(business.payoutMethod);
    setPayoutDetails(business.payoutDetails);
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const connected = Boolean(business.payoutConnected);

  return (
    <Screen>
      <View style={styles.hero}>
        <View style={[styles.heroIcon, connected && { backgroundColor: 'rgba(31,143,78,0.18)' }]}>
          <Icon name={connected ? 'check' : 'bank'} size={22} color={connected ? '#6FD49A' : theme.gold} strokeWidth={2} />
        </View>
        <Text style={styles.heroTitle}>{connected ? 'Stripe is connected' : 'Get paid with Stripe'}</Text>
        <Text style={styles.heroBody}>
          {connected ? 'Stripe is connected. Released deposits can be transferred to this account.' : 'Connect a Stripe account so released deposits can be paid out.'}
        </Text>
        <View style={{ marginTop: 18, alignSelf: 'stretch' }}>
          <Button
            variant="gold"
            icon={busy ? undefined : 'lock'}
            loading={busy}
            label={busy ? 'Opening Stripe…' : connected ? 'Update Stripe account' : 'Connect bank with Stripe'}
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
        </View>
      </View>

      {error ? <Notice text={error} /> : null}

      <FormSection title="Payout note">
        <TextField label="Method" value={payoutMethod} onChangeText={setPayoutMethod} placeholder="Bank transfer" />
        <TextField label="Account details" value={payoutDetails} onChangeText={setPayoutDetails} placeholder="Account ending 4421" hint="For your reference only. Never enter a full account number here." />
      </FormSection>
      <Button
        label="Save payout method"
        variant="secondary"
        loading={saving}
        disabled={saving}
        onPress={async () => {
          setSaving(true);
          setError('');
          try {
            await saveSettings({ payoutMethod, payoutDetails });
            goBack('/business');
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not save.');
          } finally {
            setSaving(false);
          }
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { backgroundColor: theme.ink, borderRadius: radius.xl, padding: 22, alignItems: 'flex-start' },
  heroIcon: { width: 48, height: 48, borderRadius: 15, backgroundColor: 'rgba(201,168,106,0.14)', alignItems: 'center', justifyContent: 'center' },
  heroTitle: { fontFamily: fonts.serif, color: theme.onInk, fontSize: 28, fontWeight: '700', marginTop: 16 },
  heroBody: { color: theme.onInkMuted, fontSize: 14.5, lineHeight: 21, marginTop: 6 },
});
