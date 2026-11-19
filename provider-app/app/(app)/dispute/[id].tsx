import { useLocalSearchParams } from 'expo-router';

import { Card, Row, Screen, StatusPill } from '@/components/ui';
import { useProvider } from '@/context/ProviderContext';

export default function DisputeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { disputes } = useProvider();
  const dispute = disputes.find((item) => item.id === id);
  if (!dispute) return <Screen subtitle="This dispute is not available." />;

  return (
    <Screen subtitle="You will get an alert when an administrator decides.">
      <Card>
        <StatusPill status={dispute.status} />
        <Row label="Subject" value={dispute.title} />
        <Row label="Details" value={dispute.detail} />
        <Row label="Status" value={dispute.status} />
      </Card>
    </Screen>
  );
}
