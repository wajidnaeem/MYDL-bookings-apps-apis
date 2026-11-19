import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { VisitCard } from '@/components/VisitCard';
import { Screen } from '@/components/ui';
import { theme } from '@/constants/theme';
import { useProvider } from '@/context/ProviderContext';
import type { VisitStatus } from '@/lib/types';

const filters: { id: 'all' | VisitStatus; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Invitations' },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'completed', label: 'Completed' },
  { id: 'cancelled', label: 'Cancelled' },
];

export default function VisitsScreen() {
  const { appointments } = useProvider();
  const [filter, setFilter] = useState<(typeof filters)[number]['id']>('all');
  const visible = appointments.filter((item) => filter === 'all' || item.status === filter);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Screen title="Visits" subtitle="Pending, upcoming, completed, and cancelled.">
        <View style={styles.filters}>
          {filters.map((item) => (
            <Pressable key={item.id} onPress={() => setFilter(item.id)} style={[styles.chip, filter === item.id && styles.chipOn]}>
              <Text style={[styles.chipText, filter === item.id && styles.chipTextOn]}>{item.label}</Text>
            </Pressable>
          ))}
        </View>
        {visible.map((item) => (
          <VisitCard key={item.id} visit={item} onPress={() => router.push(`/visit/${item.id}`)} />
        ))}
      </Screen>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.bg },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderRadius: 999, borderWidth: 1, borderColor: theme.border, backgroundColor: theme.card, paddingHorizontal: 12, paddingVertical: 8 },
  chipOn: { backgroundColor: theme.accent, borderColor: theme.accent },
  chipText: { color: theme.text, fontSize: 13, fontWeight: '600' },
  chipTextOn: { color: '#FFFFFF' },
});
