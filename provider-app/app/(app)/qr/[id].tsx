import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { Icon } from '@/components/Icon';
import { Button, EmptyState, Notice, Screen, shadow } from '@/components/ui';
import { fonts, radius, theme } from '@/constants/theme';
import { useProvider } from '@/context/ProviderContext';
import { apiBase } from '@/lib/api';

const LIFETIME = 10 * 60 * 1000;

function Countdown({ expiresAt }: { expiresAt: number }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  const left = Math.max(0, expiresAt - now);
  const mins = Math.floor(left / 60000);
  const secs = Math.floor((left % 60000) / 1000);
  const size = 64;
  const r = 27;
  const c = 2 * Math.PI * r;
  const frac = Math.min(1, left / LIFETIME);
  const expired = left === 0;
  return (
    <View style={styles.countRow}>
      <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        <Svg width={size} height={size} style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
          <Circle cx={size / 2} cy={size / 2} r={r} stroke={theme.borderSoft} strokeWidth={5} fill="none" />
          <Circle cx={size / 2} cy={size / 2} r={r} stroke={expired ? theme.danger : theme.gold} strokeWidth={5} fill="none" strokeLinecap="round" strokeDasharray={`${c} ${c}`} strokeDashoffset={c * (1 - frac)} />
        </Svg>
        <Icon name={expired ? 'alert' : 'timer'} size={20} color={expired ? theme.danger : theme.accent} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.countLabel}>{expired ? 'Code expired' : 'Expires in'}</Text>
        <Text style={[styles.countValue, expired && { color: theme.danger }]}>
          {expired ? 'Refresh to continue' : `${mins}:${String(secs).padStart(2, '0')}`}
        </Text>
      </View>
    </View>
  );
}

export default function QrScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { appointments, makeQr } = useProvider();
  const visit = appointments.find((item) => item.id === id);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [version, setVersion] = useState(0);
  const [code, setCode] = useState<{ token: string; expiresAt?: number } | null>(null);

  if (!visit) {
    return (
      <Screen>
        <EmptyState icon="qr" title="This visit is no longer available." />
      </Screen>
    );
  }

  async function generate() {
    if (!visit) return;
    setBusy(true);
    setError('');
    try {
      setCode(await makeQr(visit.id));
      setVersion((value) => value + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create the code.');
    } finally {
      setBusy(false);
    }
  }

  const showing = visit.hasQr || version > 0;

  return (
    <Screen subtitle="Show this to the client when they arrive. It expires 10 minutes after you generate it.">
      <View style={styles.card}>
        <Text style={styles.client}>{visit.clientName || 'Client'}</Text>
        <Text style={styles.service}>{visit.service} · {visit.time}</Text>
        {showing ? (
          <View style={styles.qrFrame}>
            <Image source={{ uri: `${apiBase()}/demo/qr/${visit.id}.png?v=${version}` }} style={styles.image} accessibilityLabel="Attendance QR code" />
          </View>
        ) : (
          <View style={[styles.qrFrame, styles.placeholder]}>
            <Icon name="qr" size={56} color={theme.faint} strokeWidth={1.3} />
            <Text style={styles.hint}>Generate a code when the client is with you.</Text>
          </View>
        )}
        {code?.token ? (
          <View style={styles.tokenBox}>
            <Text style={styles.tokenLabel}>Or the client types</Text>
            <Text style={styles.token} selectable>{code.token}</Text>
          </View>
        ) : null}
      </View>

      {code?.expiresAt ? <View style={styles.countCard}><Countdown key={code.expiresAt} expiresAt={code.expiresAt} /></View> : null}

      {error ? <Notice text={error} /> : null}
      <Button
        label={busy ? 'Creating…' : visit.hasQr ? 'Refresh code' : 'Generate code'}
        icon={busy ? undefined : visit.hasQr ? 'refresh' : 'qr'}
        variant={visit.hasQr ? 'secondary' : 'primary'}
        loading={busy}
        disabled={busy}
        onPress={generate}
      />
      <Notice tone="info" text="When the client scans this code, attendance is confirmed for both of you and the held deposit is released." />
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: theme.ink, borderRadius: radius.xl, padding: 22, alignItems: 'center' },
  client: { fontFamily: fonts.serif, color: theme.onInk, fontSize: 26, fontWeight: '700', textAlign: 'center' },
  service: { color: theme.onInkMuted, fontSize: 14, marginTop: 4, marginBottom: 18, textAlign: 'center' },
  qrFrame: { backgroundColor: theme.ivory, borderRadius: radius.lg, padding: 16, alignItems: 'center', justifyContent: 'center', width: '100%', maxWidth: 300 },
  image: { width: 240, height: 240, backgroundColor: '#FFFFFF', borderRadius: 8 },
  placeholder: { height: 272, gap: 14, borderWidth: 1, borderStyle: 'dashed', borderColor: '#D9D1C2' },
  hint: { color: theme.muted, fontSize: 14.5, textAlign: 'center', paddingHorizontal: 20, lineHeight: 20 },
  tokenBox: { marginTop: 16, alignItems: 'center' },
  tokenLabel: { color: theme.onInkMuted, fontSize: 12.5 },
  token: { color: theme.goldLight, fontSize: 20, fontWeight: '700', letterSpacing: 2, marginTop: 4, fontFamily: 'monospace' },
  countCard: { backgroundColor: theme.card, borderRadius: radius.lg, borderWidth: 1, borderColor: theme.border, padding: 14, ...shadow },
  countRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  countLabel: { color: theme.muted, fontSize: 13 },
  countValue: { fontFamily: fonts.serif, color: theme.text, fontSize: 28, fontWeight: '700' },
});
