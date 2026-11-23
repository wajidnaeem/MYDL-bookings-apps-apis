import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { Card, EmptyState, Notice, Screen, StatusPill } from '@/components/ui';
import { fonts, theme } from '@/constants/theme';
import { useProvider } from '@/context/ProviderContext';

const steps = ['Submitted', 'In review', 'Decided'];

export default function DisputeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { disputes } = useProvider();
  const dispute = disputes.find((item) => item.id === id);
  if (!dispute) {
    return (
      <Screen>
        <EmptyState icon="scale" title="This dispute is not available." />
      </Screen>
    );
  }
  const decided = dispute.status !== 'In review';
  const reached = decided ? 3 : 2;

  return (
    <Screen>
      <Card>
        <StatusPill status={dispute.status} />
        <Text style={styles.title}>{dispute.title}</Text>
        <Text style={styles.detail}>{dispute.detail}</Text>
        {dispute.evidence ? (
          <View style={styles.evidence}>
            <Icon name="paperclip" size={16} color={theme.accent} />
            <Text style={styles.evidenceText}>Evidence attached</Text>
          </View>
        ) : null}
      </Card>

      <Card>
        <Text style={styles.label}>Progress</Text>
        {steps.map((step, i) => {
          const done = i < reached;
          return (
            <View key={step} style={styles.step}>
              <View style={styles.track}>
                <View style={[styles.dot, done && styles.dotOn]}>{done ? <Icon name="check" size={12} color={theme.onInk} strokeWidth={3} /> : null}</View>
                {i < steps.length - 1 ? <View style={[styles.line, i < reached - 1 && styles.lineOn]} /> : null}
              </View>
              <Text style={[styles.stepText, done && { color: theme.text, fontWeight: '700' }]}>
                {i === 2 && decided ? `Decided: ${dispute.status}` : step}
              </Text>
            </View>
          );
        })}
      </Card>

      {!decided ? <Notice tone="info" text="You will get an alert when an administrator decides." /> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: fonts.serif, color: theme.text, fontSize: 26, fontWeight: '700', marginTop: 4 },
  detail: { color: theme.muted, fontSize: 15, lineHeight: 22 },
  evidence: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: theme.goldSoft, alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  evidenceText: { color: theme.accent, fontWeight: '700', fontSize: 13.5 },
  label: { color: theme.muted, fontSize: 12.5, fontWeight: '600' },
  step: { flexDirection: 'row', gap: 12, minHeight: 40 },
  track: { alignItems: 'center', width: 22 },
  dot: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: theme.border, backgroundColor: theme.card, alignItems: 'center', justifyContent: 'center' },
  dotOn: { backgroundColor: theme.ink, borderColor: theme.ink },
  line: { flex: 1, width: 2, backgroundColor: theme.border, marginVertical: 2 },
  lineOn: { backgroundColor: theme.ink },
  stepText: { color: theme.muted, fontSize: 15, paddingTop: 1 },
});
