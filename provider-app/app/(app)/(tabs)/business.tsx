import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icon } from '@/components/Icon';
import { Avatar, Card, ListItem, Row, Screen, SectionHeader, shadow } from '@/components/ui';
import { fonts, radius, theme } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useProvider } from '@/context/ProviderContext';
import { Text } from '@/components/Text';

export default function BusinessScreen() {
  const { signOut } = useAuth();
  const { business, policy, profile, disputes } = useProvider();
  const open = disputes.filter((item) => item.status === 'In review').length;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Screen
        hero
        eyebrow="Your business"
        heroContent={
        <View style={styles.hero}>
          <Avatar name={business.businessName} size={68} dark />
          <View style={{ flex: 1 }}>
            <Text style={styles.name} numberOfLines={2}>{business.businessName}</Text>
            <Text style={styles.email} numberOfLines={1}>{profile.email}</Text>
            <View style={[styles.payBadge, business.payoutConnected && styles.payOn]}>
              <Icon name={business.payoutConnected ? 'check' : 'bank'} size={14} color={business.payoutConnected ? theme.success : theme.goldLight} strokeWidth={2.2} />
              <Text style={[styles.payText, business.payoutConnected && { color: theme.success }]}>{business.payoutConnected ? 'Payouts on' : 'Payouts not connected'}</Text>
            </View>
          </View>
        </View>
        }>

        <Card style={{ gap: 0, paddingVertical: 6 }}>
          <Row icon="tag" label="Services" value={business.serviceDetails || 'Not set'} />
          <Row icon="pin" label="Location" value={business.location || 'Not set'} />
          <Row icon="phone" label="Contact" value={business.contact || profile.phone} />
          <Row icon="bank" label="Payout" value={business.payoutMethod || 'Not set'} />
          <Row icon="timer" label="Late fee" value={`${policy.lateFee} after ${policy.lateAfterMinutes} min`} last />
        </Card>

        <SectionHeader title="Manage" />
        <View style={styles.menu}>
          <ListItem icon="edit" title="Edit business" subtitle="Name, services, location and contact" onPress={() => router.push('/business-edit')} />
          <ListItem icon="shield" title="Policies" subtitle="Late, no-show and cancellation rules" onPress={() => router.push('/policy')} />
          <ListItem icon="bank" title="Payout method" subtitle={business.payoutConnected ? 'Stripe connected' : 'Connect Stripe to get paid'} onPress={() => router.push('/payout')} />
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
  email: { color: theme.onInkMuted, fontSize: 13.5, marginTop: 3 },
  payBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: 'rgba(245,240,230,0.08)', alignSelf: 'flex-start', marginTop: 10 },
  payOn: { backgroundColor: theme.successSoft },
  payText: { color: theme.goldLight, fontSize: 11.5, fontWeight: '700' },
  menu: { backgroundColor: theme.card, borderRadius: radius.lg, borderWidth: 1, borderColor: theme.border, overflow: 'hidden', ...shadow },
});
