import { StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card, Screen, StatusPill } from '@/components/ui';
import { theme } from '@/constants/theme';
import { useProvider } from '@/context/ProviderContext';

export default function EarningsScreen() {
  const { appointments } = useProvider();
  const paid = appointments.filter((item) => item.depositPaid);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Screen title="Earnings" subtitle="Deposits held, released after attendance, or refunded. Card payouts are not connected yet.">
        {paid.length === 0 ? <Text style={styles.empty}>No deposits yet.</Text> : null}
        {paid.map((item) => {
          const status = item.depositOutcome === 'kept' ? 'Kept' : item.status === 'cancelled' ? 'Refunded' : item.attended ? 'Released' : 'Held';
          return (
            <Card key={item.id}>
              <StatusPill status={status} />
              <Text style={styles.title}>{item.clientName || 'Client'}</Text>
              <Text style={styles.detail}>{item.service}</Text>
              <Text style={styles.amount}>{item.deposit}</Text>
            </Card>
          );
        })}
      </Screen>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.bg },
  title: { color: theme.text, fontSize: 17, fontWeight: '700' },
  detail: { color: theme.muted, fontSize: 14 },
  amount: { color: theme.text, fontSize: 18, fontWeight: '700' },
  empty: { color: theme.muted, fontSize: 15 },
});
