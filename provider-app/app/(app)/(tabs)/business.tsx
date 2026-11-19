import { router } from 'expo-router';
import { StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Card, Row, Screen } from '@/components/ui';
import { theme } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useProvider } from '@/context/ProviderContext';

export default function BusinessScreen() {
  const { signOut } = useAuth();
  const { business, policy, profile } = useProvider();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Screen title="Business" subtitle={profile.email}>
        <Card>
          <Text style={styles.name}>{business.businessName}</Text>
          <Row label="Services" value={business.serviceDetails || 'Not set'} />
          <Row label="Location" value={business.location || 'Not set'} />
          <Row label="Contact" value={business.contact || profile.phone} />
          <Row label="Payout" value={business.payoutMethod || 'Not set'} />
          <Row label="Late fee" value={`${policy.lateFee} after ${policy.lateAfterMinutes} min`} />
        </Card>
        <Button label="Edit business" variant="secondary" onPress={() => router.push('/business-edit')} />
        <Button label="Policies" variant="secondary" onPress={() => router.push('/policy')} />
        <Button label="Payout method" variant="secondary" onPress={() => router.push('/payout')} />
        <Button label="Disputes" variant="secondary" onPress={() => router.push('/disputes')} />
        <Button label="Log out" variant="danger" onPress={signOut} />
      </Screen>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.bg },
  name: { color: theme.text, fontSize: 20, fontWeight: '700' },
});
