import { useLocalSearchParams } from 'expo-router';

import { Card, Row, Screen, StatusPill } from '@/components/ui';
import { useClient } from '@/context/ClientContext';

export default function DisputeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { disputes } = useClient();
  const dispute = disputes.find((item) => item.id === id);

  if (!dispute) {
    return <Screen subtitle="This dispute is not available." />;
  }

  return (
    <Screen subtitle="You will get an alert when an administrator decides.">
      <Card>
        <StatusPill status={dispute.status} />
        <Row label="Subject" value={dispute.title} />
        <Row label="Details" value={dispute.detail} />
        <Row label="Evidence" value={dispute.evidence || 'None attached'} />
        <Row label="Status" value={dispute.status} />
      </Card>
    </Screen>
  );
}
