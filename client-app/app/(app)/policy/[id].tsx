import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Icon, type IconName } from '@/components/Icon';
import { Steps } from '@/components/Steps';
import { Avatar, Button, EmptyState, Notice, Screen, shadow } from '@/components/ui';
import { fonts, radius, theme } from '@/constants/theme';
import { useClient } from '@/context/ClientContext';
import { Text } from '@/components/Text';

function Rule({ icon, title, body, last }: { icon: IconName; title: string; body: string; last?: boolean }) {
  return (
    <View style={[styles.rule, last && { borderBottomWidth: 0, paddingBottom: 0 }]}>
      <View style={styles.ruleIcon}><Icon name={icon} size={18} color={theme.accent} /></View>
      <View style={{ flex: 1 }}>
        <Text style={styles.ruleTitle}>{title}</Text>
        <Text style={styles.ruleBody}>{body}</Text>
      </View>
    </View>
  );
}

export default function PolicyScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { appointments, policy, acceptPolicy } = useClient();
  const appointment = appointments.find((item) => item.id === id);
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (!appointment) {
    return (
      <Screen>
        <EmptyState icon="calendar" title="This appointment is no longer available." />
      </Screen>
    );
  }

  return (
    <Screen>
      <Steps current={0} />
      <Text style={styles.lead}>Review the provider's terms before you pay the deposit. Your acceptance is recorded.</Text>

      <View style={styles.card}>
        <View style={styles.head}>
          <Avatar name={appointment.provider} size={44} />
          <View style={{ flex: 1 }}>
            <Text style={styles.heading}>{appointment.provider}</Text>
            <Text style={styles.sub}>{appointment.service} · {appointment.date} · {appointment.time}</Text>
          </View>
        </View>
        <Rule icon="timer" title="Late arrival" body={`You are late ${policy.lateAfterMinutes} minutes after ${appointment.time}. The late fee is ${policy.lateFee}.`} />
        <Rule icon="alert" title="No-show" body={policy.noShow} />
        <Rule icon="calendar" title="Cancellation" body={policy.cancellation} last />
      </View>

      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: accepted }}
        onPress={() => setAccepted((value) => !value)}
        style={({ pressed }) => [styles.checkRow, accepted && styles.checkRowOn, pressed && { opacity: 0.9 }]}>
        <View style={[styles.box, accepted && styles.boxOn]}>
          {accepted ? <Icon name="check" size={14} color={theme.onInk} strokeWidth={3} /> : null}
        </View>
        <Text style={styles.checkLabel}>I accept these late, cancellation, and no-show terms.</Text>
      </Pressable>

      {error ? <Notice text={error} /> : null}
      <Button
        label="Continue to payment"
        icon={busy ? undefined : 'card'}
        loading={busy}
        disabled={!accepted || busy}
        onPress={async () => {
          setBusy(true);
          setError('');
          try {
            await acceptPolicy(appointment.id);
            router.push(`/checkout/${appointment.id}`);
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not save your acceptance.');
          } finally {
            setBusy(false);
          }
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  lead: { color: theme.muted, fontSize: 15, lineHeight: 22 },
  card: { backgroundColor: theme.card, borderRadius: radius.lg, borderWidth: 1, borderColor: theme.border, padding: 18, gap: 14, ...shadow },
  head: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: theme.borderSoft },
  heading: { fontFamily: fonts.serif, color: theme.text, fontSize: 22, fontWeight: '700' },
  sub: { color: theme.muted, fontSize: 13, marginTop: 2 },
  rule: { flexDirection: 'row', gap: 12, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: theme.borderSoft },
  ruleIcon: { width: 36, height: 36, borderRadius: 11, backgroundColor: theme.goldSoft, alignItems: 'center', justifyContent: 'center' },
  ruleTitle: { color: theme.text, fontSize: 15, fontWeight: '700' },
  ruleBody: { color: theme.muted, fontSize: 14.5, lineHeight: 21, marginTop: 2 },
  checkRow: { flexDirection: 'row', gap: 12, alignItems: 'center', padding: 16, borderRadius: radius.md, borderWidth: 1, borderColor: theme.border, backgroundColor: theme.card },
  checkRowOn: { borderColor: theme.ink },
  box: { width: 24, height: 24, borderRadius: 7, borderWidth: 2, borderColor: theme.faint, alignItems: 'center', justifyContent: 'center' },
  boxOn: { backgroundColor: theme.ink, borderColor: theme.ink },
  checkLabel: { flex: 1, color: theme.text, fontSize: 15, lineHeight: 21, fontWeight: '500' },
});
