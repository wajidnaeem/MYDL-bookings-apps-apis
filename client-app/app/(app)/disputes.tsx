import { router } from 'expo-router';
import { Pressable, StyleSheet, Text } from 'react-native';

import { Button, Card, Screen, StatusPill } from '@/components/ui';
import { theme } from '@/constants/theme';
import { useClient } from '@/context/ClientContext';

export default function DisputesScreen() {
  const { disputes } = useClient();

  return (
    <Screen subtitle="Track claims about attendance, cancellations, refunds, and deposits.">
      <Button label="Raise a dispute" onPress={() => router.push('/dispute/new')} />
      {disputes.length === 0 ? <Text style={styles.empty}>No disputes yet.</Text> : null}
      {disputes.map((item) => (
        <Pressable key={item.id} onPress={() => router.push(`/dispute/${item.id}`)}>
          <Card>
            <StatusPill status={item.status} />
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.detail}>{item.detail}</Text>
          </Card>
        </Pressable>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: theme.text, fontSize: 17, fontWeight: '700' },
  detail: { color: theme.muted, fontSize: 14, lineHeight: 20 },
  empty: { color: theme.muted, fontSize: 15 },
});
