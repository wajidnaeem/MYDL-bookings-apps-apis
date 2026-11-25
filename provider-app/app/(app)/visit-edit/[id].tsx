import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { VisitForm, type VisitFields } from '@/components/VisitForm';
import { Button, EmptyState, Notice, Screen } from '@/components/ui';
import { useProvider } from '@/context/ProviderContext';
import { goBack } from '@/lib/nav';
import { useFillOnce } from '@/lib/format';

export default function EditVisitScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { appointments, updateVisit } = useProvider();
  const visit = appointments.find((item) => item.id === id);
  const [fields, setFields] = useState<VisitFields>({
    service: visit?.service || '',
    date: visit?.date || '',
    time: visit?.time || '',
    timezone: visit?.timezone || 'UTC',
    duration: visit?.duration || '',
    location: visit?.location || '',
    price: visit?.price || '',
    deposit: visit?.deposit || '',
  });
  useFillOnce(Boolean(visit), () => visit && setFields({
    service: visit.service, date: visit.date, time: visit.time, timezone: visit.timezone || 'UTC',
    duration: visit.duration, location: visit.location, price: visit.price, deposit: visit.deposit,
  }));
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (!visit) {
    return (
      <Screen>
        <EmptyState icon="calendar" title="This visit is no longer available." />
      </Screen>
    );
  }

  async function save() {
    setBusy(true);
    setError('');
    try {
      await updateVisit(visit!.id, fields);
      goBack(`/visit/${visit!.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save the visit.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen subtitle="The client is notified when the visit changes.">
      {visit.depositPaid ? <Notice tone="info" text={`The client has already paid a ${visit.deposit} deposit. Changing the deposit here does not charge or refund them.`} /> : null}
      <VisitForm value={fields} onChange={setFields} />
      {error ? <Notice text={error} /> : null}
      <Button label={busy ? 'Saving…' : 'Save changes'} loading={busy} disabled={busy} onPress={save} />
    </Screen>
  );
}
