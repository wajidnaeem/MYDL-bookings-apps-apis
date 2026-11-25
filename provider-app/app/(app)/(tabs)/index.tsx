import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icon } from '@/components/Icon';
import { Text } from '@/components/Text';
import { VisitCard } from '@/components/VisitCard';
import { Avatar, Button, EmptyState, Screen, SectionHeader, Stat } from '@/components/ui';
import { fonts, radius, theme } from '@/constants/theme';
import { useProvider } from '@/context/ProviderContext';
import { byStart, depositStatus, greeting, money, todayLabel, usd } from '@/lib/format';

export default function HomeScreen() {
  const { business, appointments } = useProvider();
  const pending = appointments.filter((item) => item.status === 'pending').sort(byStart);
  const upcoming = appointments.filter((item) => item.status === 'upcoming').sort(byStart);
  const next = upcoming[0];
  const held = appointments.filter((item) => item.depositPaid && depositStatus(item) === 'Held').reduce((sum, item) => sum + money(item.deposit), 0);
  const completed = appointments.filter((item) => item.status === 'completed').length;

  const heroContent = (
    <>
      <View style={styles.next}>
        <View style={styles.nextTop}>
          <Text style={styles.nextLabel}>{next ? 'Next visit' : 'No visits booked'}</Text>
          {next ? (
            <View style={styles.depositTag}>
              <View style={[styles.dot, { backgroundColor: next.depositPaid ? '#6FD49A' : theme.goldLight }]} />
              <Text style={styles.depositTagText}>{next.depositPaid ? `${next.deposit} held` : 'Deposit not paid'}</Text>
            </View>
          ) : null}
        </View>
        {next ? (
          <>
            <Text style={styles.nextName} numberOfLines={1}>{next.clientName || next.clientEmail || 'Client'}</Text>
            <Text style={styles.nextService} numberOfLines={1}>{next.service} · {next.duration}</Text>
            <View style={styles.nextWhen}>
              <Icon name="clock" size={15} color={theme.gold} />
              <Text style={styles.nextWhenText}>{next.date} · {next.time}</Text>
            </View>
            <View style={styles.nextActions}>
              <View style={{ flex: 1 }}>
                <Button variant="gold" icon="qr" label={next.hasQr ? 'Show attendance QR' : 'Generate attendance QR'} onPress={() => router.push(`/qr/${next.id}`)} />
              </View>
              <Pressable accessibilityRole="button" accessibilityLabel="Open visit" onPress={() => router.push(`/visit/${next.id}`)} style={styles.iconBtn}>
                <Icon name="chevron" size={20} color={theme.onInk} />
              </Pressable>
            </View>
          </>
        ) : (
          <>
            <Text style={styles.nextService}>Invite a client and their visit appears here once the deposit is paid.</Text>
            <View style={{ marginTop: 16 }}>
              <Button variant="gold" icon="plus" label="New visit" onPress={() => router.push('/visit/new')} />
            </View>
          </>
        )}
      </View>
      <View style={styles.stats}>
        <Stat dark label="Invites" value={String(pending.length)} note="Awaiting clients" />
        <Stat dark label="Upcoming" value={String(upcoming.length)} note={`${completed} completed`} />
        <Stat dark label="Held" value={usd(held)} note="In deposits" />
      </View>
    </>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Screen
        hero
        eyebrow={todayLabel()}
        title={greeting()}
        subtitle={business.businessName || 'Provider'}
        right={
          <Pressable accessibilityRole="button" accessibilityLabel="Business" onPress={() => router.push('/business')}>
            <Avatar name={business.businessName || 'MYDL'} size={46} dark />
          </Pressable>
        }
        heroContent={heroContent}>
        {next ? <Button label="New visit" icon="plus" onPress={() => router.push('/visit/new')} /> : null}

        <SectionHeader title="Awaiting clients" count={pending.length} />
        {pending.length === 0 ? <EmptyState icon="mail" title="No open invitations" body="Invitations you send stay here until the client pays the deposit." /> : null}
        {pending.map((item) => (
          <VisitCard key={item.id} visit={item} onPress={() => router.push(`/visit/${item.id}`)} />
        ))}

        <SectionHeader title="Upcoming" count={upcoming.length} action={upcoming.length ? { label: 'All visits', onPress: () => router.push('/visits') } : undefined} />
        {upcoming.length === 0 ? <EmptyState icon="calendar" title="No upcoming visits" /> : null}
        {upcoming.map((item) => (
          <VisitCard key={item.id} visit={item} onPress={() => router.push(`/visit/${item.id}`)} />
        ))}
      </Screen>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.ink },
  next: { backgroundColor: theme.ink2, borderRadius: radius.lg, borderWidth: 1, borderColor: 'rgba(201,168,106,0.28)', padding: 18 },
  nextTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  nextLabel: { color: theme.gold, fontSize: 11, fontWeight: '600', letterSpacing: 1.8, textTransform: 'uppercase' },
  depositTag: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  depositTagText: { color: theme.onInk, fontSize: 12.5, fontWeight: '500' },
  nextName: { fontFamily: fonts.serif, color: theme.onInk, fontSize: 32, lineHeight: 36, fontWeight: '700', marginTop: 12 },
  nextService: { color: theme.onInkMuted, fontSize: 14.5, marginTop: 2, lineHeight: 21 },
  nextWhen: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 14 },
  nextWhenText: { color: theme.onInk, fontSize: 14, fontWeight: '500' },
  nextActions: { flexDirection: 'row', gap: 10, marginTop: 16, alignItems: 'center' },
  iconBtn: { width: 56, height: 56, borderRadius: radius.md, borderWidth: 1, borderColor: 'rgba(245,240,230,0.16)', alignItems: 'center', justifyContent: 'center' },
  stats: { flexDirection: 'row', gap: 10 },
});
