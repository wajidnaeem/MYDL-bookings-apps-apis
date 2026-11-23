import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icon, type IconName } from '@/components/Icon';
import { EmptyState, Screen, SectionHeader, StatusPill, shadow } from '@/components/ui';
import { fonts, radius, theme } from '@/constants/theme';
import { useClient } from '@/context/ClientContext';
import { money, usd } from '@/lib/format';

function iconFor(title: string): IconName {
  const t = title.toLowerCase();
  if (t.includes('refund')) return 'refresh';
  if (t.includes('late')) return 'timer';
  if (t.includes('kept')) return 'lock';
  return 'wallet';
}

export default function PaymentsScreen() {
  const { transactions } = useClient();
  const sum = (status: string) => transactions.filter((t) => t.status === status).reduce((s, t) => s + money(t.amount), 0);
  const held = sum('Held');
  const refunded = sum('Refunded');
  const released = sum('Released');

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Screen title="Payments" subtitle="Deposits, fees, and refunds.">
        <View style={styles.hero}>
          <Text style={styles.heroLabel}>Held right now</Text>
          <Text style={styles.heroValue}>{usd(held)}</Text>
          <Text style={styles.heroNote}>Paid to the provider after your QR check-in, or refunded under the agreed terms.</Text>
          <View style={styles.split}>
            <View style={styles.splitItem}>
              <Text style={styles.splitLabel}>Released</Text>
              <Text style={styles.splitValue}>{usd(released)}</Text>
            </View>
            <View style={styles.splitDivider} />
            <View style={styles.splitItem}>
              <Text style={styles.splitLabel}>Refunded to you</Text>
              <Text style={styles.splitValue}>{usd(refunded)}</Text>
            </View>
          </View>
        </View>

        <SectionHeader title="History" count={transactions.length} />
        {transactions.length === 0 ? <EmptyState icon="card" title="No payments yet." body="Deposits you pay will appear here with a receipt." /> : null}
        {transactions.length ? (
          <View style={styles.list}>
            {transactions.map((item, index) => (
              <Pressable
                key={item.id}
                accessibilityRole="button"
                onPress={() => router.push(`/receipt/${item.id}`)}
                style={({ pressed }) => [styles.row, index === transactions.length - 1 && { borderBottomWidth: 0 }, pressed && { backgroundColor: theme.cardMuted }]}>
                <View style={styles.rowIcon}><Icon name={iconFor(item.title)} size={18} color={theme.accent} /></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowTitle}>{item.title}</Text>
                  <Text style={styles.rowSub} numberOfLines={1}>{item.detail}</Text>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 6 }}>
                  <Text style={styles.amount}>{item.amount}</Text>
                  <StatusPill status={item.status} />
                </View>
              </Pressable>
            ))}
          </View>
        ) : null}
      </Screen>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.bg },
  hero: { backgroundColor: theme.ink, borderRadius: radius.xl, padding: 20 },
  heroLabel: { color: theme.gold, fontSize: 12, fontWeight: '700', letterSpacing: 1.4, textTransform: 'uppercase' },
  heroValue: { fontFamily: fonts.serif, color: theme.onInk, fontSize: 44, fontWeight: '700', marginTop: 10 },
  heroNote: { color: theme.onInkMuted, fontSize: 14, marginTop: 2, lineHeight: 20 },
  split: { flexDirection: 'row', marginTop: 18, paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(245,240,230,0.10)' },
  splitItem: { flex: 1 },
  splitDivider: { width: 1, backgroundColor: 'rgba(245,240,230,0.10)', marginHorizontal: 16 },
  splitLabel: { color: theme.onInkMuted, fontSize: 12.5 },
  splitValue: { color: theme.onInk, fontSize: 18, fontWeight: '700', marginTop: 2 },
  list: { backgroundColor: theme.card, borderRadius: radius.lg, borderWidth: 1, borderColor: theme.border, overflow: 'hidden', ...shadow },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderBottomWidth: 1, borderBottomColor: theme.borderSoft },
  rowIcon: { width: 40, height: 40, borderRadius: 13, backgroundColor: theme.goldSoft, alignItems: 'center', justifyContent: 'center' },
  rowTitle: { color: theme.text, fontSize: 15.5, fontWeight: '700' },
  rowSub: { color: theme.muted, fontSize: 13, marginTop: 2 },
  amount: { fontFamily: fonts.serif, color: theme.text, fontSize: 19, fontWeight: '700' },
});
