import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppointmentCard } from '@/components/AppointmentCard';
import { Screen } from '@/components/ui';
import { theme } from '@/constants/theme';
import { useClient } from '@/context/ClientContext';
import type { AppointmentStatus } from '@/data/sample';

const filters: { id: 'all' | AppointmentStatus; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Invitations' },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'completed', label: 'Completed' },
  { id: 'cancelled', label: 'Cancelled' },
];

export default function AppointmentsScreen() {
  const { appointments } = useClient();
  const [filter, setFilter] = useState<(typeof filters)[number]['id']>('all');
  const visible = appointments.filter((item) => filter === 'all' || item.status === filter);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Screen title="Visits" subtitle="Pending, upcoming, completed, and cancelled appointments.">
        <View style={styles.filters}>
          {filters.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => setFilter(item.id)}
              style={[styles.chip, filter === item.id && styles.chipOn]}>
              <Text style={[styles.chipText, filter === item.id && styles.chipTextOn]}>{item.label}</Text>
            </Pressable>
          ))}
        </View>
        {visible.length === 0 ? <Text style={styles.empty}>Nothing in this list.</Text> : null}
        {visible.map((item) => (
          <AppointmentCard key={item.id} appointment={item} onPress={() => router.push(`/appointment/${item.id}`)} />
        ))}
      </Screen>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.bg },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.card,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipOn: { backgroundColor: theme.accent, borderColor: theme.accent },
  chipText: { color: theme.text, fontSize: 13, fontWeight: '600' },
  chipTextOn: { color: '#FFFFFF' },
  empty: { color: theme.muted, fontSize: 15 },
});
