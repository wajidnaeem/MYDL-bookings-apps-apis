import { router, useLocalSearchParams } from 'expo-router';

import { Button, Card, Row, Screen } from '@/components/ui';
import { useClient } from '@/context/ClientContext';

export default function CheckoutScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { appointments, payDeposit } = useClient();
  const appointment = appointments.find((item) => item.id === id);

  if (!appointment) {
    return <Screen subtitle="This appointment is no longer available." />;
  }

  async function pay() {
    await payDeposit(appointment!.id);
    router.replace(`/payment-result?id=${appointment!.id}`);
  }

  return (
    <Screen subtitle="Check the amount before you confirm. The deposit is held until the visit is completed or refunded.">
      <Card>
        <Row label="Provider" value={appointment.provider} />
        <Row label="Service" value={appointment.service} />
        <Row label="Deposit" value={appointment.deposit} />
        <Row label="Processing fee" value="$0.00" />
        <Row label="Total due now" value={appointment.deposit} />
      </Card>
      {appointment.depositPaid ? (
        <Button label="Deposit already paid" disabled />
      ) : (
        <Button label={`Pay ${appointment.deposit}`} onPress={pay} />
      )}
    </Screen>
  );
}
