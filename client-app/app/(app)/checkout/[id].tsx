import { useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { Steps } from '@/components/Steps';
import { Button, EmptyState, Notice, Screen, shadow } from '@/components/ui';
import { fonts, radius, theme } from '@/constants/theme';
import { useClient } from '@/context/ClientContext';
import { Text } from '@/components/Text';

export default function CheckoutScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { appointments, payDeposit } = useClient();
  const appointment = appointments.find((item) => item.id === id);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (!appointment) {
    return (
      <Screen>
        <EmptyState icon="calendar" title="This appointment is no longer available." />
      </Screen>
    );
  }

  async function pay() {
    setBusy(true);
    setError('');
    try {
      const url = await payDeposit(appointment!.id);
      if (Platform.OS === 'web') {
        window.location.assign(url);
        return;
      }
      await WebBrowser.openBrowserAsync(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start the card payment.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      <Steps current={1} />
      <Text style={styles.lead}>Check the amount before you confirm. Stripe holds the deposit until the visit is completed or refunded.</Text>

      <View style={styles.receipt}>
        <Text style={styles.label}>Deposit for</Text>
        <Text style={styles.provider}>{appointment.provider}</Text>
        <Text style={styles.service}>{appointment.service} · {appointment.date} · {appointment.time}</Text>
        <View style={styles.lines}>
          <View style={styles.line}><Text style={styles.lineLabel}>Deposit</Text><Text style={styles.lineValue}>{appointment.deposit}</Text></View>
          <View style={styles.line}><Text style={styles.lineLabel}>Processing fee</Text><Text style={styles.lineValue}>$0.00</Text></View>
        </View>
        <View style={styles.total}>
          <Text style={styles.totalLabel}>Total due now</Text>
          <Text style={styles.totalValue}>{appointment.deposit}</Text>
        </View>
        <Text style={styles.note}>Service price {appointment.price}. Only the deposit is charged now.</Text>
      </View>

      <View style={styles.secure}>
        <Icon name="lock" size={16} color={theme.success} />
        <Text style={styles.secureText}>Card payment by Stripe. MYDL never sees your card number.</Text>
      </View>

      {error ? <Notice text={error} /> : null}
      {appointment.depositPaid ? (
        <Button label="Deposit already paid" icon="check" disabled />
      ) : (
        <Button label={busy ? 'Opening Stripe…' : `Pay ${appointment.deposit}`} icon={busy ? undefined : 'lock'} loading={busy} disabled={busy} onPress={pay} />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  lead: { color: theme.muted, fontSize: 15, lineHeight: 22 },
  receipt: { backgroundColor: theme.card, borderRadius: radius.lg, borderWidth: 1, borderColor: theme.border, padding: 20, ...shadow },
  label: { color: theme.accent, fontSize: 12, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase' },
  provider: { fontFamily: fonts.serif, color: theme.text, fontSize: 26, fontWeight: '700', marginTop: 8 },
  service: { color: theme.muted, fontSize: 14, marginTop: 2 },
  lines: { marginTop: 18, paddingTop: 14, borderTopWidth: 1, borderTopColor: theme.borderSoft, borderStyle: 'dashed', gap: 10 },
  line: { flexDirection: 'row', justifyContent: 'space-between' },
  lineLabel: { color: theme.muted, fontSize: 15 },
  lineValue: { color: theme.text, fontSize: 15, fontWeight: '600' },
  total: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: theme.border },
  totalLabel: { color: theme.text, fontSize: 16, fontWeight: '700' },
  totalValue: { fontFamily: fonts.serif, color: theme.text, fontSize: 32, fontWeight: '700' },
  note: { color: theme.faint, fontSize: 12.5, lineHeight: 18, marginTop: 10 },
  secure: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: theme.successSoft, borderRadius: radius.md, padding: 12 },
  secureText: { flex: 1, color: theme.success, fontSize: 13.5, fontWeight: '600' },
});
