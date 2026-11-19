import { CameraView, useCameraPermissions } from 'expo-camera';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Platform, StyleSheet, Text } from 'react-native';

import { Button, Screen, TextField } from '@/components/ui';
import { theme } from '@/constants/theme';
import { useClient } from '@/context/ClientContext';
import { apiBase } from '@/lib/api';

export default function ScanScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { appointments, confirmAttendance } = useClient();
  const appointment = appointments.find((item) => item.id === id);
  const [permission, requestPermission] = useCameraPermissions();
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (!appointment) {
    return <Screen subtitle="Open a visit first, then scan the provider's code." />;
  }

  async function submit(value: string) {
    if (busy || !appointment) return;
    setBusy(true);
    setError('');
    try {
      const ok = await confirmAttendance(appointment.id, value.trim());
      router.replace(`/scan-result?id=${appointment.id}&ok=${ok ? '1' : '0'}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not check the code.');
      setBusy(false);
    }
  }

  const cameraReady = permission?.granted && Platform.OS !== 'web';

  return (
    <Screen subtitle={`${appointment.provider} shows a time-limited code when you arrive. The phone camera reads it and the server checks it.`}>
      {cameraReady ? (
        <CameraView
          style={styles.camera}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          onBarcodeScanned={busy ? undefined : ({ data }) => submit(data)}
        />
      ) : (
        <Button label={permission?.granted ? 'Camera is used on the phone' : 'Allow camera'} onPress={requestPermission} />
      )}
      <Text style={styles.hint}>Provider preview: {apiBase()}/demo/qr/{appointment.id}</Text>
      <TextField label="Or type the code" value={code} onChangeText={setCode} autoCapitalize="characters" />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button label={busy ? 'Checking…' : 'Check code'} disabled={busy || !code.trim()} onPress={() => submit(code)} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  camera: { height: 280, borderRadius: 20, overflow: 'hidden' },
  hint: { color: theme.muted, fontSize: 13, lineHeight: 18 },
  error: { color: theme.danger, fontSize: 14 },
});
