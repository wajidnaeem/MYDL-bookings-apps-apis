import { StyleSheet, View } from 'react-native';

import { FieldCol, FieldRow, FormSection, TextField } from '@/components/ui';
import { fonts, radius, theme } from '@/constants/theme';
import { money, usd } from '@/lib/format';
import { Text } from '@/components/Text';

export type VisitFields = {
  service: string;
  date: string;
  time: string;
  timezone: string;
  duration: string;
  location: string;
  price: string;
  deposit: string;
};

export function VisitForm({ value, onChange }: { value: VisitFields; onChange: (next: VisitFields) => void }) {
  const set = (key: keyof VisitFields) => (text: string) => onChange({ ...value, [key]: text });
  const price = money(value.price);
  const deposit = money(value.deposit);
  const share = price > 0 ? Math.round((deposit / price) * 100) : 0;

  return (
    <>
      <FormSection title="Service">
        <TextField label="Service" value={value.service} onChangeText={set('service')} />
      </FormSection>

      <FormSection title="When">
        <FieldRow>
          <FieldCol><TextField label="Date" value={value.date} onChangeText={set('date')} /></FieldCol>
          <FieldCol><TextField label="Time" value={value.time} onChangeText={set('time')} /></FieldCol>
        </FieldRow>
        <FieldRow>
          <FieldCol><TextField label="Time zone" value={value.timezone} onChangeText={set('timezone')} autoCapitalize="none" placeholder="America/New_York" /></FieldCol>
          <FieldCol><TextField label="Duration" value={value.duration} onChangeText={set('duration')} /></FieldCol>
        </FieldRow>
      </FormSection>

      <FormSection title="Where">
        <TextField label="Location" value={value.location} onChangeText={set('location')} />
      </FormSection>

      <FormSection title="Pricing">
        <FieldRow>
          <FieldCol><TextField label="Price" value={value.price} onChangeText={set('price')} /></FieldCol>
          <FieldCol><TextField label="Deposit" value={value.deposit} onChangeText={set('deposit')} /></FieldCol>
        </FieldRow>
        <View style={styles.summary}>
          <View style={{ flex: 1 }}>
            <Text style={styles.summaryLabel}>Client pays now</Text>
            <Text style={styles.summaryValue}>{usd(deposit)}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.summaryLabel}>Balance at the visit</Text>
            <Text style={styles.summarySmall}>{usd(Math.max(price - deposit, 0))}{price > 0 ? ` · ${share}% upfront` : ''}</Text>
          </View>
        </View>
      </FormSection>
    </>
  );
}

const styles = StyleSheet.create({
  summary: { flexDirection: 'row', alignItems: 'flex-end', backgroundColor: theme.goldSoft, borderRadius: radius.md, padding: 16 },
  summaryLabel: { color: theme.accent, fontSize: 12.5, fontWeight: '600' },
  summaryValue: { fontFamily: fonts.serif, color: theme.text, fontSize: 28, fontWeight: '700', marginTop: 2 },
  summarySmall: { color: theme.text, fontSize: 15, fontWeight: '700', marginTop: 4 },
});
