import { router } from 'expo-router';
import { StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppointmentCard } from '@/components/AppointmentCard';
import { Screen } from '@/components/ui';
import { theme } from '@/constants/theme';
import { useClient } from '@/context/ClientContext';

export default function HomeScreen() {
  const { profile, appointments } = useClient();
  const upcoming = appointments.filter((item) => item.status === 'upcoming');
  const pending = appointments.filter((item) => item.status === 'pending');

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Screen title={`Hello, ${profile.name.split(' ')[0]}`} subtitle="Upcoming visits and invitations waiting for you.">
        <Text style={styles.section}>Invitations</Text>
        {pending.length === 0 ? <Text style={styles.empty}>No invitations right now.</Text> : null}
        {pending.map((item) => (
          <AppointmentCard key={item.id} appointment={item} onPress={() => router.push(`/appointment/${item.id}`)} />
        ))}
        <Text style={styles.section}>Upcoming</Text>
        {upcoming.length === 0 ? <Text style={styles.empty}>No upcoming visits.</Text> : null}
        {upcoming.map((item) => (
          <AppointmentCard key={item.id} appointment={item} onPress={() => router.push(`/appointment/${item.id}`)} />
        ))}
      </Screen>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.bg },
  section: { marginTop: 8, color: theme.text, fontSize: 18, fontWeight: '700' },
  empty: { color: theme.muted, fontSize: 15 },
});
