import { router } from 'expo-router';
import { useState } from 'react';

import { formatVisitDate } from '@/components/DateTimeFields';
import { VisitForm, type VisitFields } from '@/components/VisitForm';
import { Button, FormSection, Notice, Screen, TextField } from '@/components/ui';
import { useProvider } from '@/context/ProviderContext';
import { useFillOnce } from '@/lib/format';

export default function NewVisitScreen() {
  const { business, createVisit } = useProvider();
  const [clientEmail, setClientEmail] = useState('amina@example.com');
  const [fields, setFields] = useState<VisitFields>({
    service: 'Consultation',
    date: formatVisitDate(new Date(Date.now() + 24 * 60 * 60 * 1000)),
    time: '3:00 PM',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    duration: '45 min',
    location: business.location,
    price: '$80.00',
    deposit: '$25.00',
  });
  useFillOnce(Boolean(business.location), () => setFields((f) => (f.location ? f : { ...f, location: business.location })));
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    setError('');
    try {
      const id = await createVisit({ clientEmail, ...fields });
      router.replace(`/visit/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create the visit.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen subtitle="The client must already have a MYDL account. They will get an invitation.">
      <FormSection title="Client">
        <TextField label="Client email" value={clientEmail} onChangeText={setClientEmail} autoCapitalize="none" keyboardType="email-address" />
      </FormSection>
      <VisitForm value={fields} onChange={setFields} />
      {error ? <Notice text={error} /> : null}
      <Button label={busy ? 'Sending…' : 'Send invitation'} icon={busy ? undefined : 'mail'} loading={busy} disabled={busy} onPress={submit} />
    </Screen>
  );
}
