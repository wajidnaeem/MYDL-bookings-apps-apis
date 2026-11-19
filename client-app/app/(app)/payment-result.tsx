import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text } from 'react-native';

import { Button, Card, Screen } from '@/components/ui';
import { theme } from '@/constants/theme';
import { useClient } from '@/context/ClientContext';

export default function PaymentResultScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { appointments, transactions } = useClient();
  const appointment = appointments.find((item) => item.id === id);
  const receipt = transactions.find((item) => item.detail.startsWith(appointment?.provider ?? '---'));

  return (
    <Screen>
      <Card>
        <Text style={styles.title}>Deposit paid</Text>
        <Text style={styles.body}>
          {appointment
            ? `${appointment.deposit} for ${appointment.provider} is held until attendance is confirmed.`
            : 'Your deposit is held until attendance is confirmed.'}
        </Text>
      </Card>
      {receipt ? <Button label="View receipt" variant="secondary" onPress={() => router.push(`/receipt/${receipt.id}`)} /> : null}
      <Button label="Back to home" onPress={() => router.replace('/')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: theme.text, fontSize: 22, fontWeight: '700' },
  body: { color: theme.muted, fontSize: 16, lineHeight: 22 },
});
