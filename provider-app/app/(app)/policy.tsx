import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Icon, type IconName } from '@/components/Icon';
import { Button, FormSection, Notice, Screen, TextField, shadow } from '@/components/ui';
import { fonts, radius, theme } from '@/constants/theme';
import { useProvider } from '@/context/ProviderContext';
import { useFillOnce } from '@/lib/format';

function PreviewRule({ icon, title, body }: { icon: IconName; title: string; body: string }) {
  return (
    <View style={styles.rule}>
      <View style={styles.ruleIcon}><Icon name={icon} size={16} color={theme.accent} /></View>
      <View style={{ flex: 1 }}>
        <Text style={styles.ruleTitle}>{title}</Text>
        <Text style={styles.ruleBody}>{body || 'Not set'}</Text>
      </View>
    </View>
  );
}

export default function PolicyScreen() {
  const { policy, saveSettings, business } = useProvider();
  const [lateAfterMinutes, setLateAfterMinutes] = useState(String(policy.lateAfterMinutes));
  const [lateFee, setLateFee] = useState(policy.lateFee);
  const [noShow, setNoShow] = useState(policy.noShow);
  const [cancellation, setCancellation] = useState(policy.cancellation);
  useFillOnce(Boolean(policy.noShow || policy.cancellation), () => {
    setLateAfterMinutes(String(policy.lateAfterMinutes));
    setLateFee(policy.lateFee);
    setNoShow(policy.noShow);
    setCancellation(policy.cancellation);
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  return (
    <Screen subtitle="These rules are saved for your business and applied to new visits.">
      <FormSection title="Late arrival">
        <TextField label="Minutes before a client is late" value={lateAfterMinutes} onChangeText={setLateAfterMinutes} keyboardType="number-pad" hint="Counted from the visit's start time." />
        <TextField label="Late fee" value={lateFee} onChangeText={setLateFee} />
      </FormSection>
      <FormSection title="No-show">
        <TextField label="No-show rule" value={noShow} onChangeText={setNoShow} multiline />
      </FormSection>
      <FormSection title="Cancellation">
        <TextField label="Cancellation rule" value={cancellation} onChangeText={setCancellation} multiline />
      </FormSection>

      <FormSection title="What clients see before paying">
        <View style={styles.preview}>
          <Text style={styles.previewName}>{business.businessName}</Text>
          <PreviewRule icon="timer" title="Late arrival" body={`You are late ${Number(lateAfterMinutes) || 15} minutes after the start time. The late fee is ${lateFee}.`} />
          <PreviewRule icon="alert" title="No-show" body={noShow} />
          <PreviewRule icon="calendar" title="Cancellation" body={cancellation} />
        </View>
      </FormSection>

      <Notice tone="info" text="Refunds when a client cancels follow MYDL's 24-hour rule: 24 hours or more before the visit, the deposit is refunded." />
      {error ? <Notice text={error} /> : null}
      <Button
        label="Save policies"
        loading={busy}
        disabled={busy}
        onPress={async () => {
          setBusy(true);
          setError('');
          try {
            await saveSettings({ lateAfterMinutes: Number(lateAfterMinutes) || 15, lateFee, noShow, cancellation });
            router.back();
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not save.');
          } finally {
            setBusy(false);
          }
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  preview: { backgroundColor: theme.card, borderRadius: radius.lg, borderWidth: 1, borderColor: theme.border, padding: 18, gap: 14, ...shadow },
  previewName: { fontFamily: fonts.serif, color: theme.text, fontSize: 22, fontWeight: '700' },
  rule: { flexDirection: 'row', gap: 12 },
  ruleIcon: { width: 32, height: 32, borderRadius: 10, backgroundColor: theme.goldSoft, alignItems: 'center', justifyContent: 'center' },
  ruleTitle: { color: theme.text, fontSize: 14.5, fontWeight: '700' },
  ruleBody: { color: theme.muted, fontSize: 14, lineHeight: 20, marginTop: 2 },
});
