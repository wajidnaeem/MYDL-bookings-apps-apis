import { router } from 'expo-router';
import { StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Card, Row, Screen } from '@/components/ui';
import { theme } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useClient } from '@/context/ClientContext';

export default function ProfileScreen() {
  const { signOut } = useAuth();
  const { profile } = useClient();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Screen title="Profile" subtitle="Your client account.">
        <Card>
          <Text style={styles.name}>{profile.name}</Text>
          <Row label="Email" value={profile.email} />
          <Row label="Phone" value={profile.phone} />
        </Card>
        <Button label="Edit profile" variant="secondary" onPress={() => router.push('/profile-edit')} />
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
