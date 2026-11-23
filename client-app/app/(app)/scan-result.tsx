import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { Button, Screen, shadow } from '@/components/ui';
import { fonts, radius, theme } from '@/constants/theme';
import { useClient } from '@/context/ClientContext';

export default function ScanResultScreen() {
  const { id, ok } = useLocalSearchParams<{ id: string; ok: string }>();
  const { appointments } = useClient();
  const appointment = appointments.find((item) => item.id === id);
  const success = ok === '1';

  return (
    <Screen>
      <View style={[styles.card, success ? styles.good : styles.bad]}>
        <View style={[styles.badge, { backgroundColor: success ? theme.successSoft : theme.dangerSoft }]}>
          <Icon name={success ? 'check' : 'alert'} size={34} color={success ? theme.success : theme.danger} strokeWidth={2.4} />
        </View>
        <Text style={styles.title}>{success ? 'Attendance confirmed' : 'Attendance not confirmed'}</Text>
        <Text style={styles.body}>
          {success
            ? `The QR match is recorded for you and ${appointment?.provider ?? 'the provider'}. Payment release can proceed under the agreed terms.`
            : 'The code was expired or invalid. If you cannot confirm attendance, the visit follows the no-show or dispute process.'}
        </Text>
      </View>
      {!success && appointment ? (
        <>
          <Button label="Try again" icon="qr" onPress={() => router.replace(`/scan?id=${appointment.id}`)} />
          <Button label="Report provider no-show" variant="secondary" onPress={() => router.push(`/report-no-show/${appointment.id}`)} />
        </>
      ) : null}
      <Button label="Back to home" variant={success ? 'primary' : 'ghost'} onPress={() => router.replace('/')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: theme.card, borderRadius: radius.xl, borderWidth: 1, padding: 26, alignItems: 'center', ...shadow },
  good: { borderColor: theme.border },
  bad: { borderColor: theme.border },
  badge: { width: 84, height: 84, borderRadius: 42, alignItems: 'center', justifyContent: 'center', marginBottom: 18 },
  title: { fontFamily: fonts.serif, color: theme.text, fontSize: 30, fontWeight: '700', textAlign: 'center' },
  body: { color: theme.muted, fontSize: 15.5, lineHeight: 22, textAlign: 'center', marginTop: 8 },
});
