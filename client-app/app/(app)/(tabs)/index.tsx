import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppointmentCard } from '@/components/AppointmentCard';
import { Icon } from '@/components/Icon';
import { Text } from '@/components/Text';
import { Avatar, Button, EmptyState, Screen, SectionHeader, Stat } from '@/components/ui';
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
  const focus = invite || next;
  const firstName = profile.name.split(' ')[0];

  const heroContent = (
    <>
      <View style={styles.panel}>
        <View style={styles.panelTop}>
          <Text style={styles.panelLabel}>{invite ? 'New invitation' : next ? 'Next visit' : 'Nothing booked'}</Text>
          {focus ? (
            <View style={styles.tag}>
              <View style={[styles.dot, { backgroundColor: invite ? theme.goldLight : next?.depositPaid ? '#6FD49A' : theme.goldLight }]} />
              <Text style={styles.tagText}>{invite ? 'Needs your reply' : next?.depositPaid ? `${next.deposit} held` : 'Deposit not paid'}</Text>
            </View>
          ) : null}
        </View>
        {focus ? (
          <>
            <Text style={styles.name} numberOfLines={1}>{focus.provider}</Text>
            <Text style={styles.service} numberOfLines={1}>{focus.service} · {focus.duration}</Text>
            <View style={styles.metaRow}>
              <View style={styles.meta}>
                <Icon name="clock" size={15} color={theme.gold} />
                <Text style={styles.metaText}>{focus.date} · {focus.time}</Text>
              </View>
              {invite ? (
                <View style={styles.meta}>
                  <Icon name="wallet" size={15} color={theme.gold} />
                  <Text style={styles.metaText}>Deposit {invite.deposit}</Text>
                </View>
              ) : null}
            </View>
            <View style={styles.actions}>
              <View style={{ flex: 1 }}>
                {invite ? (
                  <Button variant="gold" icon="check" label="Review invitation" onPress={() => router.push(`/appointment/${invite.id}`)} />
                ) : (
                  <Button variant="gold" icon="qr" label="Scan attendance QR" onPress={() => router.push(`/scan?id=${next!.id}`)} />
                )}
              </View>
              {!invite ? (
                <Pressable accessibilityRole="button" accessibilityLabel="Open visit" onPress={() => router.push(`/appointment/${next!.id}`)} style={styles.iconBtn}>
                  <Icon name="chevron" size={20} color={theme.onInk} />
                </Pressable>
              ) : null}
            </View>
          </>
        ) : (
          <Text style={styles.service}>When a provider invites you, the visit and its deposit terms will show here.</Text>
        )}
      </View>
      <View style={styles.stats}>
        <Stat dark label="Invites" value={String(pending.length)} note="Waiting on you" />
        <Stat dark label="Upcoming" value={String(upcoming.length)} note="Visits" />
        <Stat dark label="Held" value={usd(held)} note="Deposits" />
      </View>
    </>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Screen
        hero
        eyebrow={todayLabel()}
        title={firstName ? `Hello, ${firstName}` : greeting()}
        subtitle="Upcoming visits and invitations waiting for you."
        right={
          <Pressable accessibilityRole="button" accessibilityLabel="Profile" onPress={() => router.push('/profile')}>
            <Avatar name={profile.name || 'You'} size={46} dark />
          </Pressable>
        }
        heroContent={heroContent}>
        <SectionHeader title="Invitations" count={pending.length} />
        {pending.length === 0 ? <EmptyState icon="mail" title="No invitations right now" /> : null}
        {pending.map((item) => (
          <AppointmentCard key={item.id} appointment={item} onPress={() => router.push(`/appointment/${item.id}`)} />
        ))}

        <SectionHeader title="Upcoming" count={upcoming.length} action={upcoming.length ? { label: 'All visits', onPress: () => router.push('/appointments') } : undefined} />
        {upcoming.length === 0 ? <EmptyState icon="calendar" title="No upcoming visits" /> : null}
        {upcoming.map((item) => (
          <AppointmentCard key={item.id} appointment={item} onPress={() => router.push(`/appointment/${item.id}`)} />
        ))}
      </Screen>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.ink },
  panel: { backgroundColor: theme.ink2, borderRadius: radius.lg, borderWidth: 1, borderColor: 'rgba(201,168,106,0.28)', padding: 18 },
  panelTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  panelLabel: { color: theme.gold, fontSize: 11, fontWeight: '600', letterSpacing: 1.8, textTransform: 'uppercase' },
  tag: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  tagText: { color: theme.onInk, fontSize: 12.5, fontWeight: '500' },
  name: { fontFamily: fonts.serif, color: theme.onInk, fontSize: 32, lineHeight: 36, fontWeight: '700', marginTop: 12 },
  service: { color: theme.onInkMuted, fontSize: 14.5, marginTop: 2, lineHeight: 21 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginTop: 14 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  metaText: { color: theme.onInk, fontSize: 14, fontWeight: '500' },
  actions: { flexDirection: 'row', gap: 10, marginTop: 16, alignItems: 'center' },
  iconBtn: { width: 56, height: 56, borderRadius: radius.md, borderWidth: 1, borderColor: 'rgba(245,240,230,0.16)', alignItems: 'center', justifyContent: 'center' },
  stats: { flexDirection: 'row', gap: 10 },
});
