import { router } from 'expo-router';
import { StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { VisitCard } from '@/components/VisitCard';
import { Button, Screen } from '@/components/ui';
import { theme } from '@/constants/theme';
import { useProvider } from '@/context/ProviderContext';

export default function HomeScreen() {
  const { business, appointments } = useProvider();
  const pending = appointments.filter((item) => item.status === 'pending');
  const upcoming = appointments.filter((item) => item.status === 'upcoming');

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Screen title={business.businessName || 'Provider'} subtitle="Invitations waiting on clients, and visits coming up.">
        <Button label="New visit" onPress={() => router.push('/visit/new')} />
        <Text style={styles.section}>Waiting for the client</Text>
        {pending.length === 0 ? <Text style={styles.empty}>No open invitations.</Text> : null}
        {pending.map((item) => (
          <VisitCard key={item.id} visit={item} onPress={() => router.push(`/visit/${item.id}`)} />
        ))}
        <Text style={styles.section}>Upcoming</Text>
        {upcoming.length === 0 ? <Text style={styles.empty}>No upcoming visits.</Text> : null}
        {upcoming.map((item) => (
          <VisitCard key={item.id} visit={item} onPress={() => router.push(`/visit/${item.id}`)} />
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
