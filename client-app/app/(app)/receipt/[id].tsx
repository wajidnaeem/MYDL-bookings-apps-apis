import { useLocalSearchParams } from 'expo-router';

import { Card, Row, Screen, StatusPill } from '@/components/ui';
import { useClient } from '@/context/ClientContext';

export default function ReceiptScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { transactions } = useClient();
  const transaction = transactions.find((item) => item.id === id);

  if (!transaction) {
    return <Screen subtitle="This receipt is not available." />;
  }

  return (
    <Screen>
      <Card>
        <StatusPill status={transaction.status} />
        <Row label="Type" value={transaction.title} />
        <Row label="Details" value={transaction.detail} />
        <Row label="Amount" value={transaction.amount} />
        <Row label="Status" value={transaction.status} />
      </Card>
    </Screen>
  );
}
