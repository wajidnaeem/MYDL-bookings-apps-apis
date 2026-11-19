import { StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card, Screen } from '@/components/ui';
import { theme } from '@/constants/theme';
import { useClient } from '@/context/ClientContext';

export default function NotificationsScreen() {
  const { notifications } = useClient();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Screen title="Alerts" subtitle="Invitations, deposits, attendance, cancellations, and disputes.">
        {notifications.length === 0 ? <Text style={styles.empty}>No alerts yet.</Text> : null}
        {notifications.map((item) => (
          <Card key={item.id}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.body}>{item.body}</Text>
            <Text style={styles.time}>{item.time}</Text>
          </Card>
        ))}
      </Screen>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.bg },
  title: { color: theme.text, fontSize: 16, fontWeight: '700' },
  body: { color: theme.text, fontSize: 15, lineHeight: 21 },
  time: { color: theme.muted, fontSize: 13 },
  empty: { color: theme.muted, fontSize: 15 },
});
