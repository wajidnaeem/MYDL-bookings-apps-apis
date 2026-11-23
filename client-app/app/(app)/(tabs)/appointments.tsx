import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppointmentCard } from '@/components/AppointmentCard';
import { Chips, EmptyState, Screen } from '@/components/ui';
import { theme } from '@/constants/theme';
import { useClient } from '@/context/ClientContext';
import type { AppointmentStatus } from '@/data/sample';
import { byStart } from '@/lib/format';

type Filter = 'all' | AppointmentStatus;

const filters: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Invitations' },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'completed', label: 'Completed' },
  { id: 'cancelled', label: 'Cancelled' },
];

export default function AppointmentsScreen() {
  const { appointments } = useClient();
  const [filter, setFilter] = useState<Filter>('all');
  const visible = appointments.filter((item) => filter === 'all' || item.status === filter).sort(byStart);
  const count = (id: Filter) => (id === 'all' ? appointments.length : appointments.filter((item) => item.status === id).length);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Screen title="Visits" subtitle="Pending, upcoming, completed, and cancelled appointments.">
        <Chips options={filters.map((item) => ({ ...item, count: count(item.id) }))} value={filter} onChange={setFilter} />
        {visible.length === 0 ? <EmptyState icon="calendar" title="Nothing in this list." /> : null}
        {visible.map((item) => (
          <AppointmentCard key={item.id} appointment={item} onPress={() => router.push(`/appointment/${item.id}`)} />
        ))}
      </Screen>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: theme.bg } });
