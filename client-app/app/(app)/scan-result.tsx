import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text } from 'react-native';

import { Button, Card, Screen } from '@/components/ui';
import { theme } from '@/constants/theme';
import { useClient } from '@/context/ClientContext';

export default function ScanResultScreen() {
  const { id, ok } = useLocalSearchParams<{ id: string; ok: string }>();
  const { appointments } = useClient();
  const appointment = appointments.find((item) => item.id === id);
  const success = ok === '1';

  return (
    <Screen>
      <Card>
        <Text style={styles.title}>{success ? 'Attendance confirmed' : 'Attendance not confirmed'}</Text>
        <Text style={styles.body}>
          {success
            ? `The QR match is recorded for you and ${appointment?.provider ?? 'the provider'}. Payment release can proceed under the agreed terms.`
            : 'The code was expired or invalid. If you cannot confirm attendance, the visit follows the no-show or dispute process.'}
        </Text>
      </Card>
      {!success && appointment ? (
        <Button label="Report provider no-show" variant="secondary" onPress={() => router.push(`/report-no-show/${appointment.id}`)} />
      ) : null}
      <Button label="Back to home" onPress={() => router.replace('/')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: theme.text, fontSize: 22, fontWeight: '700' },
  body: { color: theme.muted, fontSize: 16, lineHeight: 22 },
});
