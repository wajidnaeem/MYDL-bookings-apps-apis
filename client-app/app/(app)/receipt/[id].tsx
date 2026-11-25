import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { EmptyState, Screen, StatusPill, shadow } from '@/components/ui';
import { fonts, radius, theme } from '@/constants/theme';
import { useClient } from '@/context/ClientContext';
import { Text } from '@/components/Text';

export default function ReceiptScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { transactions, profile } = useClient();
  const transaction = transactions.find((item) => item.id === id);

  if (!transaction) {
    return (
      <Screen>
        <EmptyState icon="file" title="This receipt is not available." />
      </Screen>
    );
  }

  const lines: [string, string][] = [
    ['Type', transaction.title],
    ['Details', transaction.detail],
    ['Status', transaction.status],
    ['Billed to', profile.name],
    ['Reference', transaction.id.slice(0, 8).toUpperCase()],
  ];

  return (
    <Screen>
      <View style={styles.receipt}>
        <View style={styles.brand}>
          <View style={styles.mark}><Text style={styles.markText}>M</Text></View>
          <Text style={styles.brandText}>MYDL</Text>
          <View style={{ flex: 1 }} />
          <StatusPill status={transaction.status} />
        </View>
        <Text style={styles.label}>Amount</Text>
        <Text style={styles.amount}>{transaction.amount}</Text>
        <View style={styles.cut}>
          <View style={[styles.notch, { left: -31 }]} />
          <View style={styles.dash} />
          <View style={[styles.notch, { right: -31 }]} />
        </View>
        {lines.map(([k, v], i) => (
          <View key={k} style={[styles.line, i === lines.length - 1 && { borderBottomWidth: 0 }]}>
            <Text style={styles.k}>{k}</Text>
            <Text style={[styles.v, k === 'Reference' && styles.mono]}>{v}</Text>
          </View>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  receipt: { backgroundColor: theme.card, borderRadius: radius.lg, borderWidth: 1, borderColor: theme.border, padding: 22, ...shadow },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  mark: { width: 28, height: 28, borderRadius: 8, borderWidth: 1, borderColor: theme.gold, alignItems: 'center', justifyContent: 'center' },
  markText: { fontFamily: fonts.serif, color: theme.accent, fontWeight: '700', fontSize: 14 },
  brandText: { fontFamily: fonts.serif, color: theme.text, fontSize: 18, fontWeight: '700', letterSpacing: 1.5 },
  label: { color: theme.muted, fontSize: 13, marginTop: 24 },
  amount: { fontFamily: fonts.serif, color: theme.text, fontSize: 46, fontWeight: '700' },
  cut: { height: 30, justifyContent: 'center', marginVertical: 6 },
  notch: { position: 'absolute', width: 20, height: 20, borderRadius: 10, backgroundColor: theme.bg, borderWidth: 1, borderColor: theme.border },
  dash: { borderTopWidth: 1, borderStyle: 'dashed', borderColor: theme.border },
  line: { flexDirection: 'row', justifyContent: 'space-between', gap: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.borderSoft },
  k: { color: theme.muted, fontSize: 14 },
  v: { color: theme.text, fontSize: 14, fontWeight: '600', flexShrink: 1, textAlign: 'right' },
  mono: { fontFamily: 'monospace', letterSpacing: 1 },
});
