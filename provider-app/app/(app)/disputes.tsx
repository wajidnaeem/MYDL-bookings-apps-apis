import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { Button, Card, EmptyState, Screen, StatusPill } from '@/components/ui';
import { theme } from '@/constants/theme';
import { useProvider } from '@/context/ProviderContext';

export default function DisputesScreen() {
  const { disputes } = useProvider();
  return (
    <Screen subtitle="Claims about attendance, cancellations, and deposits.">
      <Button label="Raise a dispute" icon="plus" onPress={() => router.push('/dispute/new')} />
      {disputes.length === 0 ? <EmptyState icon="scale" title="No disputes yet." body="If something goes wrong with a visit, raise a dispute and an administrator will review it." /> : null}
      {disputes.map((item) => (
        <Pressable key={item.id} accessibilityRole="button" onPress={() => router.push(`/dispute/${item.id}`)}>
          <Card>
            <View style={styles.top}>
              <StatusPill status={item.status} />
              <Icon name="chevron" size={18} color={theme.faint} />
            </View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.detail} numberOfLines={2}>{item.detail}</Text>
          </Card>
        </Pressable>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { color: theme.text, fontSize: 16.5, fontWeight: '700' },
  detail: { color: theme.muted, fontSize: 14, lineHeight: 20 },
});
