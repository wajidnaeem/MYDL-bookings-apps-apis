import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppointmentCard } from '@/components/AppointmentCard';
import { Icon } from '@/components/Icon';
import { Avatar, Button, EmptyState, Screen, SectionHeader, Stat, StatusPill } from '@/components/ui';
import { fonts, radius, theme } from '@/constants/theme';
import { useClient } from '@/context/ClientContext';
import { byStart, greeting, money, todayLabel, usd } from '@/lib/format';

export default function HomeScreen() {
  const { profile, appointments, transactions } = useClient();
  const upcoming = appointments.filter((item) => item.status === 'upcoming').sort(byStart);
  const pending = appointments.filter((item) => item.status === 'pending').sort(byStart);
  const held = transactions.filter((item) => item.status === 'Held').reduce((sum, item) => sum + money(item.amount), 0);
  const invite = pending[0];
  const next = upcoming[0];
  const firstName = profile.name.split(' ')[0];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Screen
        eyebrow={todayLabel()}
        title={firstName ? `Hello, ${firstName}` : greeting()}
        right={
          <Pressable accessibilityRole="button" accessibilityLabel="Profile" onPress={() => router.push('/profile')}>
            <Avatar name={profile.name || 'You'} size={44} />
          </Pressable>
        }>
        <Text style={styles.sub}>Upcoming visits and invitations waiting for you.</Text>

        {invite ? (
          <View style={styles.hero}>
            <View style={styles.ring} />
            <View style={styles.heroTop}>
              <Text style={styles.heroLabel}>New invitation</Text>
              <StatusPill status="Needs your reply" dark />
            </View>
            <Text style={styles.heroName} numberOfLines={1}>{invite.provider}</Text>
            <Text style={styles.heroService} numberOfLines={1}>{invite.service} · {invite.duration}</Text>
            <View style={styles.heroMeta}>
              <View style={styles.heroMetaItem}>
                <Icon name="clock" size={16} color={theme.goldLight} />
                <Text style={styles.heroMetaText}>{invite.date} · {invite.time}</Text>
              </View>
              <View style={styles.heroMetaItem}>
                <Icon name="wallet" size={16} color={theme.goldLight} />
                <Text style={styles.heroMetaText}>Deposit {invite.deposit}</Text>
              </View>
            </View>
            <View style={{ marginTop: 18 }}>
              <Button variant="gold" icon="check" label="Review invitation" onPress={() => router.push(`/appointment/${invite.id}`)} />
            </View>
          </View>
        ) : next ? (
          <View style={styles.hero}>
            <View style={styles.ring} />
            <View style={styles.heroTop}>
              <Text style={styles.heroLabel}>Next visit</Text>
              <StatusPill status={next.depositPaid ? 'Deposit held' : 'Not paid'} dark />
            </View>
            <Text style={styles.heroName} numberOfLines={1}>{next.provider}</Text>
            <Text style={styles.heroService} numberOfLines={1}>{next.service} · {next.duration}</Text>
            <View style={styles.heroMeta}>
              <View style={styles.heroMetaItem}>
                <Icon name="clock" size={16} color={theme.goldLight} />
                <Text style={styles.heroMetaText}>{next.date} · {next.time}</Text>
              </View>
              <View style={styles.heroMetaItem}>
                <Icon name="pin" size={16} color={theme.goldLight} />
                <Text style={styles.heroMetaText} numberOfLines={1}>{next.location}</Text>
              </View>
            </View>
            <View style={styles.heroActions}>
              <View style={{ flex: 1 }}>
                <Button variant="gold" icon="qr" label="Scan attendance QR" onPress={() => router.push(`/scan?id=${next.id}`)} />
              </View>
              <Pressable accessibilityRole="button" accessibilityLabel="Open visit" onPress={() => router.push(`/appointment/${next.id}`)} style={styles.heroIconBtn}>
                <Icon name="chevron" size={20} color={theme.onInk} />
              </Pressable>
            </View>
          </View>
        ) : (
          <View style={styles.hero}>
            <View style={styles.ring} />
            <Text style={styles.heroLabel}>Next visit</Text>
            <Text style={styles.heroName}>Nothing booked yet</Text>
            <Text style={styles.heroService}>When a provider invites you, the visit and its deposit terms will show here.</Text>
          </View>
        )}

        <View style={styles.stats}>
          <Stat label="Invitations" value={String(pending.length)} note="Waiting on you" />
          <Stat label="Upcoming" value={String(upcoming.length)} note="Visits" />
          <Stat label="Held" value={usd(held)} note="Deposits" />
        </View>

        <SectionHeader title="Invitations" count={pending.length} />
        {pending.length === 0 ? <EmptyState icon="mail" title="No invitations right now." /> : null}
        {pending.map((item) => (
          <AppointmentCard key={item.id} appointment={item} onPress={() => router.push(`/appointment/${item.id}`)} />
        ))}

        <SectionHeader title="Upcoming" count={upcoming.length} action={upcoming.length ? { label: 'All visits', onPress: () => router.push('/appointments') } : undefined} />
        {upcoming.length === 0 ? <EmptyState icon="calendar" title="No upcoming visits." /> : null}
        {upcoming.map((item) => (
          <AppointmentCard key={item.id} appointment={item} onPress={() => router.push(`/appointment/${item.id}`)} />
        ))}
      </Screen>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.bg },
  sub: { color: theme.muted, fontSize: 15, marginTop: -6 },
  hero: { backgroundColor: theme.ink, borderRadius: radius.xl, padding: 20, overflow: 'hidden', marginTop: 4 },
  ring: { position: 'absolute', right: -80, top: -80, width: 220, height: 220, borderRadius: 110, borderWidth: 1, borderColor: 'rgba(201,168,106,0.25)' },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  heroLabel: { color: theme.gold, fontSize: 12, fontWeight: '700', letterSpacing: 1.4, textTransform: 'uppercase' },
  heroName: { fontFamily: fonts.serif, color: theme.onInk, fontSize: 30, fontWeight: '700', marginTop: 14 },
  heroService: { color: theme.onInkMuted, fontSize: 15, marginTop: 4, lineHeight: 21 },
  heroMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(245,240,230,0.10)' },
  heroMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 7, maxWidth: '100%' },
  heroMetaText: { color: theme.onInk, fontSize: 14, fontWeight: '600' },
  heroActions: { flexDirection: 'row', gap: 10, marginTop: 18, alignItems: 'center' },
  heroIconBtn: { width: 52, height: 52, borderRadius: radius.md, borderWidth: 1, borderColor: 'rgba(245,240,230,0.18)', alignItems: 'center', justifyContent: 'center' },
  stats: { flexDirection: 'row', gap: 10 },
});
