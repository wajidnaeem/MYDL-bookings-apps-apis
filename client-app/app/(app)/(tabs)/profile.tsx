import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar, Card, ListItem, Row, Screen, SectionHeader, shadow } from '@/components/ui';
import { fonts, radius, theme } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useClient } from '@/context/ClientContext';
import { Text } from '@/components/Text';

export default function ProfileScreen() {
  const { signOut } = useAuth();
  const { profile, disputes, appointments } = useClient();
  const open = disputes.filter((item) => item.status === 'In review').length;
  const done = appointments.filter((item) => item.status === 'completed').length;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Screen
        hero
        eyebrow="Your account"
        heroContent={
        <View style={styles.hero}>
          <Avatar name={profile.name} size={68} dark />
          <View style={{ flex: 1 }}>
            <Text style={styles.name} numberOfLines={2}>{profile.name}</Text>
            <Text style={styles.sub}>Your client account · {done} completed visit{done === 1 ? '' : 's'}</Text>
          </View>
        </View>
        }>

        <Card style={{ gap: 0, paddingVertical: 6 }}>
          <Row icon="mail" label="Email" value={profile.email} />
          <Row icon="phone" label="Phone" value={profile.phone} last />
        </Card>

        <SectionHeader title="Account" />
        <View style={styles.menu}>
          <ListItem icon="edit" title="Edit profile" subtitle="Name, email and phone" onPress={() => router.push('/profile-edit')} />
          <ListItem icon="scale" title="Disputes" subtitle={open ? `${open} in review` : 'No open disputes'} onPress={() => router.push('/disputes')} last />
        </View>
        <View style={[styles.menu, { marginTop: 6 }]}>
          <ListItem icon="logout" title="Log out" danger onPress={signOut} last />
        </View>
      </Screen>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.ink },
  hero: { flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: -6 },
  name: { fontFamily: fonts.serif, color: theme.onInk, fontSize: 34, lineHeight: 38, fontWeight: '700' },
  sub: { color: theme.onInkMuted, fontSize: 13.5, marginTop: 3 },
  menu: { backgroundColor: theme.card, borderRadius: radius.lg, borderWidth: 1, borderColor: theme.border, overflow: 'hidden', ...shadow },
});
