import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icon } from '@/components/Icon';
import { Avatar, Card, Chips, EmptyState, Screen, SectionHeader, StatusPill } from '@/components/ui';
import { fonts, radius, theme } from '@/constants/theme';
import { useProvider } from '@/context/ProviderContext';
import { depositStatus, money, usd } from '@/lib/format';

type Outcome = 'Held' | 'Released' | 'Kept' | 'Refunded';
const outcomes: { id: Outcome; color: string; note: string }[] = [
  { id: 'Released', color: theme.success, note: 'Paid out after check-in' },
  { id: 'Held', color: theme.info, note: 'Waiting for the visit' },
  { id: 'Kept', color: theme.gold, note: 'Kept under your rules' },
  { id: 'Refunded', color: '#A9A49A', note: 'Returned to the client' },
];

export default function EarningsScreen() {
  const { appointments, business } = useProvider();
  const [filter, setFilter] = useState<'all' | Outcome>('all');
  const paid = appointments.filter((item) => item.depositPaid);
  const totals = outcomes.map((o) => {
    const items = paid.filter((item) => depositStatus(item) === o.id);
    return { ...o, count: items.length, sum: items.reduce((s, item) => s + money(item.deposit), 0) };
  });
  const earned = totals.filter((t) => t.id === 'Released' || t.id === 'Kept').reduce((s, t) => s + t.sum, 0);
  const all = totals.reduce((s, t) => s + t.sum, 0);
  const list = paid.filter((item) => filter === 'all' || depositStatus(item) === filter);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Screen title="Earnings" subtitle="Deposits held, released after attendance, kept, or refunded.">
        <View style={styles.hero}>
          <Text style={styles.heroLabel}>Released and kept</Text>
          <Text style={styles.heroValue}>{usd(earned)}</Text>
          <Text style={styles.heroNote}>From {paid.length} paid deposit{paid.length === 1 ? '' : 's'}</Text>
          <View style={styles.bar}>
            {all > 0
              ? totals.filter((t) => t.sum > 0).map((t) => <View key={t.id} style={{ flex: t.sum, backgroundColor: t.color }} />)
              : <View style={{ flex: 1, backgroundColor: 'rgba(245,240,230,0.12)' }} />}
          </View>
          <View style={styles.legend}>
            {totals.map((t) => (
              <View key={t.id} style={styles.legendItem}>
                <View style={[styles.dot, { backgroundColor: t.color }]} />
                <View>
                  <Text style={styles.legendLabel}>{t.id}</Text>
                  <Text style={styles.legendValue}>{usd(t.sum)}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <Pressable accessibilityRole="button" onPress={() => router.push('/payout')}>
          <Card style={styles.payout}>
            <View style={[styles.payoutIcon, business.payoutConnected && { backgroundColor: theme.successSoft }]}>
              <Icon name="bank" size={20} color={business.payoutConnected ? theme.success : theme.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.payoutTitle}>{business.payoutConnected ? 'Stripe payouts connected' : 'Connect payouts'}</Text>
              <Text style={styles.payoutSub}>
                {business.payoutConnected ? 'Released deposits are transferred to your account.' : 'Released deposits need a Stripe account to reach your bank.'}
              </Text>
            </View>
            <Icon name="chevron" size={18} color={theme.faint} />
          </Card>
        </Pressable>

        <SectionHeader title="Deposits" count={list.length} />
        <Chips
          options={[{ id: 'all' as const, label: 'All', count: paid.length }, ...totals.map((t) => ({ id: t.id, label: t.id, count: t.count }))]}
          value={filter}
          onChange={setFilter}
        />
        {list.length === 0 ? <EmptyState icon="wallet" title="No deposits yet." body="Paid deposits appear here with their current status." /> : null}
        {list.map((item) => (
          <Pressable key={item.id} accessibilityRole="button" onPress={() => router.push(`/visit/${item.id}`)}>
            <Card style={styles.item}>
              <Avatar name={item.clientName || 'Client'} size={40} />
              <View style={{ flex: 1 }}>
                <Text style={styles.itemTitle} numberOfLines={1}>{item.clientName || 'Client'}</Text>
                <Text style={styles.itemSub} numberOfLines={1}>{item.service} · {item.date}</Text>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 6 }}>
                <Text style={styles.amount}>{item.deposit}</Text>
                <StatusPill status={depositStatus(item)} />
              </View>
            </Card>
          </Pressable>
        ))}
      </Screen>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.bg },
  hero: { backgroundColor: theme.ink, borderRadius: radius.xl, padding: 20 },
  heroLabel: { color: theme.gold, fontSize: 12, fontWeight: '700', letterSpacing: 1.4, textTransform: 'uppercase' },
  heroValue: { fontFamily: fonts.serif, color: theme.onInk, fontSize: 44, fontWeight: '700', marginTop: 10 },
  heroNote: { color: theme.onInkMuted, fontSize: 14, marginTop: 2 },
  bar: { flexDirection: 'row', height: 10, borderRadius: 5, overflow: 'hidden', marginTop: 18, gap: 2 },
  legend: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 16, rowGap: 14 },
  legendItem: { width: '50%', flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  dot: { width: 8, height: 8, borderRadius: 4, marginTop: 6 },
  legendLabel: { color: theme.onInkMuted, fontSize: 12.5 },
  legendValue: { color: theme.onInk, fontSize: 16, fontWeight: '700', marginTop: 1 },
  payout: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  payoutIcon: { width: 42, height: 42, borderRadius: 13, backgroundColor: theme.goldSoft, alignItems: 'center', justifyContent: 'center' },
  payoutTitle: { color: theme.text, fontSize: 15.5, fontWeight: '700' },
  payoutSub: { color: theme.muted, fontSize: 13, lineHeight: 18, marginTop: 2 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 },
  itemTitle: { color: theme.text, fontSize: 15.5, fontWeight: '700' },
  itemSub: { color: theme.muted, fontSize: 13, marginTop: 2 },
  amount: { fontFamily: fonts.serif, color: theme.text, fontSize: 19, fontWeight: '700' },
});
