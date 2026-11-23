import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icon } from '@/components/Icon';
import { VisitCard } from '@/components/VisitCard';
import { Chips, EmptyState, Screen } from '@/components/ui';
import { radius, theme } from '@/constants/theme';
import { useProvider } from '@/context/ProviderContext';
import { byStart } from '@/lib/format';
import type { VisitStatus } from '@/lib/types';

type Filter = 'all' | VisitStatus;

const filters: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Invitations' },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'completed', label: 'Completed' },
  { id: 'cancelled', label: 'Cancelled' },
];

export default function VisitsScreen() {
  const { appointments } = useProvider();
  const [filter, setFilter] = useState<Filter>('all');
  const visible = appointments.filter((item) => filter === 'all' || item.status === filter).sort(byStart);
  const count = (id: Filter) => (id === 'all' ? appointments.length : appointments.filter((item) => item.status === id).length);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Screen
        title="Visits"
        subtitle="Pending, upcoming, completed, and cancelled."
        right={
          <Pressable accessibilityRole="button" accessibilityLabel="New visit" onPress={() => router.push('/visit/new')} style={styles.add}>
            <Icon name="plus" size={22} color={theme.onInk} strokeWidth={2.2} />
          </Pressable>
        }>
        <Chips options={filters.map((item) => ({ ...item, count: count(item.id) }))} value={filter} onChange={setFilter} />
        {visible.length === 0 ? (
          <EmptyState icon="calendar" title="Nothing in this list." body={filter === 'all' ? 'Create a visit to invite your first client.' : undefined} />
        ) : null}
        {visible.map((item) => (
          <VisitCard key={item.id} visit={item} onPress={() => router.push(`/visit/${item.id}`)} />
        ))}
      </Screen>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.bg },
  add: { width: 46, height: 46, borderRadius: radius.md, backgroundColor: theme.ink, alignItems: 'center', justifyContent: 'center' },
});
