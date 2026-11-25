import { CameraView, useCameraPermissions } from 'expo-camera';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { Button, EmptyState, Notice, Screen, TextField } from '@/components/ui';
import { fontFor, radius, theme } from '@/constants/theme';
import { useClient } from '@/context/ClientContext';
import { Text } from '@/components/Text';

export default function ScanScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { appointments, confirmAttendance } = useClient();
  const appointment = appointments.find((item) => item.id === id);
  const [permission, requestPermission] = useCameraPermissions();
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (!appointment) {
    return (
      <Screen>
        <EmptyState icon="qr" title="Open a visit first, then scan the provider's code." />
      </Screen>
    );
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
      <View style={styles.stage}>
        {cameraReady ? (
          <CameraView
            style={StyleSheet.absoluteFill}
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
            onBarcodeScanned={busy ? undefined : ({ data }) => submit(data)}
          />
        ) : null}
        <View style={styles.frame} pointerEvents="none">
          <View style={[styles.corner, styles.tl]} />
          <View style={[styles.corner, styles.tr]} />
          <View style={[styles.corner, styles.bl]} />
          <View style={[styles.corner, styles.br]} />
        </View>
        {!cameraReady ? (
          <View style={styles.idle}>
            <Icon name="qr" size={44} color={theme.goldLight} strokeWidth={1.4} />
            <Text style={styles.idleText}>
              {Platform.OS === 'web' ? 'Scanning works in the phone app. Type the code below instead.' : 'Allow the camera to scan the code.'}
            </Text>
            {Platform.OS !== 'web' ? (
              <View style={{ alignSelf: 'stretch', marginTop: 12 }}>
                <Button label="Allow camera" variant="gold" icon="lock" onPress={requestPermission} />
              </View>
            ) : null}
          </View>
        ) : null}
        <Text style={styles.stageLabel}>{appointment.provider} · {appointment.time}</Text>
      </View>

      <TextField label="Or type the code" value={code} onChangeText={setCode} autoCapitalize="characters" placeholder="MYDL-XXXXXXXX" style={styles.codeInput} />
      {error ? <Notice text={error} /> : null}
      <Button label={busy ? 'Checking…' : 'Check code'} icon={busy ? undefined : 'check'} loading={busy} disabled={busy || !code.trim()} onPress={() => submit(code)} />
    </Screen>
  );
}

const C = 30;
const styles = StyleSheet.create({
  stage: { height: 320, borderRadius: radius.xl, overflow: 'hidden', backgroundColor: theme.ink, alignItems: 'center', justifyContent: 'center' },
  frame: { position: 'absolute', width: 210, height: 210 },
  corner: { position: 'absolute', width: C, height: C, borderColor: theme.gold },
  tl: { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 14 },
  tr: { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 14 },
  bl: { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 14 },
  br: { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 14 },
  idle: { alignItems: 'center', gap: 10, width: 190 },
  idleText: { color: theme.onInkMuted, fontSize: 13.5, lineHeight: 19, textAlign: 'center' },
  stageLabel: { position: 'absolute', bottom: 16, color: theme.onInk, fontSize: 13, fontWeight: '600', backgroundColor: 'rgba(13,16,20,0.6)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, overflow: 'hidden' },
  codeInput: { fontFamily: fontFor(undefined, 600), fontSize: 18, letterSpacing: 2, textAlign: 'center' },
});
