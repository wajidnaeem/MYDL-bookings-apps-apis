import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icon } from '@/components/Icon';
import { VisitCard } from '@/components/VisitCard';
import { Avatar, Button, EmptyState, Screen, SectionHeader, Stat, StatusPill } from '@/components/ui';
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

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Screen
        eyebrow={todayLabel()}
        title={greeting()}
        right={
          <Pressable accessibilityRole="button" accessibilityLabel="Business" onPress={() => router.push('/business')}>
            <Avatar name={business.businessName || 'MYDL'} size={44} />
          </Pressable>
        }>
        <Text style={styles.business}>{business.businessName || 'Provider'}</Text>

        <View style={styles.hero}>
          <View style={styles.heroGlow} />
          {next ? (
            <>
              <View style={styles.heroTop}>
                <Text style={styles.heroLabel}>Next visit</Text>
                <StatusPill status={next.depositPaid ? 'Deposit held' : 'Not paid'} dark />
              </View>
              <Text style={styles.heroName} numberOfLines={1}>{next.clientName || next.clientEmail || 'Client'}</Text>
              <Text style={styles.heroService} numberOfLines={1}>{next.service} · {next.duration}</Text>
              <View style={styles.heroMeta}>
                <View style={styles.heroMetaItem}>
                  <Icon name="clock" size={16} color={theme.goldLight} />
                  <Text style={styles.heroMetaText}>{next.date} · {next.time}</Text>
                </View>
                <View style={styles.heroMetaItem}>
                  <Icon name="wallet" size={16} color={theme.goldLight} />
                  <Text style={styles.heroMetaText}>{next.deposit}</Text>
                </View>
              </View>
              <View style={styles.heroActions}>
                <View style={{ flex: 1 }}>
                  <Button variant="gold" icon="qr" label={next.hasQr ? 'Show attendance QR' : 'Generate attendance QR'} onPress={() => router.push(`/qr/${next.id}`)} />
                </View>
                <Pressable accessibilityRole="button" accessibilityLabel="Open visit" onPress={() => router.push(`/visit/${next.id}`)} style={styles.heroIconBtn}>
                  <Icon name="chevron" size={20} color={theme.onInk} />
                </Pressable>
              </View>
            </>
          ) : (
            <>
              <Text style={styles.heroLabel}>Next visit</Text>
              <Text style={styles.heroName}>Nothing booked yet</Text>
              <Text style={styles.heroService}>Invite a client and their visit will show here once the deposit is paid.</Text>
              <View style={{ marginTop: 16 }}>
                <Button variant="gold" icon="plus" label="New visit" onPress={() => router.push('/visit/new')} />
              </View>
            </>
          )}
        </View>

        <View style={styles.stats}>
          <Stat label="Invitations" value={String(pending.length)} note="Waiting on clients" />
          <Stat label="Upcoming" value={String(upcoming.length)} note={`${completed} completed`} />
          <Stat label="Held" value={usd(held)} note="Deposits" />
        </View>

        {next ? <Button label="New visit" icon="plus" onPress={() => router.push('/visit/new')} /> : null}

        <SectionHeader title="Waiting for the client" count={pending.length} />
        {pending.length === 0 ? (
          <EmptyState icon="mail" title="No open invitations." body="Invitations you send appear here until the client pays the deposit." />
        ) : null}
        {pending.map((item) => (
          <VisitCard key={item.id} visit={item} onPress={() => router.push(`/visit/${item.id}`)} />
        ))}

        <SectionHeader title="Upcoming" count={upcoming.length} action={upcoming.length ? { label: 'All visits', onPress: () => router.push('/visits') } : undefined} />
        {upcoming.length === 0 ? <EmptyState icon="calendar" title="No upcoming visits." /> : null}
        {upcoming.map((item) => (
          <VisitCard key={item.id} visit={item} onPress={() => router.push(`/visit/${item.id}`)} />
        ))}
      </Screen>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.bg },
  business: { color: theme.muted, fontSize: 15, marginTop: -6 },
  hero: { backgroundColor: theme.ink, borderRadius: radius.xl, padding: 20, overflow: 'hidden', marginTop: 4 },
  heroGlow: { position: 'absolute', right: -80, top: -80, width: 220, height: 220, borderRadius: 110, borderWidth: 1, borderColor: 'rgba(201,168,106,0.25)' },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  heroLabel: { color: theme.gold, fontSize: 12, fontWeight: '700', letterSpacing: 1.4, textTransform: 'uppercase' },
  heroName: { fontFamily: fonts.serif, color: theme.onInk, fontSize: 30, fontWeight: '700', marginTop: 14 },
  heroService: { color: theme.onInkMuted, fontSize: 15, marginTop: 4, lineHeight: 21 },
  heroMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(245,240,230,0.10)' },
  heroMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  heroMetaText: { color: theme.onInk, fontSize: 14, fontWeight: '600' },
  heroActions: { flexDirection: 'row', gap: 10, marginTop: 18, alignItems: 'center' },
  heroIconBtn: { width: 52, height: 52, borderRadius: radius.md, borderWidth: 1, borderColor: 'rgba(245,240,230,0.18)', alignItems: 'center', justifyContent: 'center' },
  stats: { flexDirection: 'row', gap: 10 },
});
