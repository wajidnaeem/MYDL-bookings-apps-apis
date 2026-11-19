import { router } from 'expo-router';
import { Pressable, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card, Screen, StatusPill } from '@/components/ui';
import { theme } from '@/constants/theme';
import { useClient } from '@/context/ClientContext';

export default function PaymentsScreen() {
  const { transactions } = useClient();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Screen title="Payments" subtitle="Deposits, fees, and refunds.">
        {transactions.map((item) => (
          <Pressable key={item.id} onPress={() => router.push(`/receipt/${item.id}`)}>
            <Card>
              <StatusPill status={item.status} />
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.detail}>{item.detail}</Text>
              <Text style={styles.amount}>{item.amount}</Text>
            </Card>
          </Pressable>
        ))}
      </Screen>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.bg },
  title: { color: theme.text, fontSize: 17, fontWeight: '700' },
  detail: { color: theme.muted, fontSize: 14 },
  amount: { color: theme.text, fontSize: 18, fontWeight: '700' },
});
