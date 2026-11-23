import { Redirect, Stack } from 'expo-router';

import { theme } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';

export default function AppLayout() {
  const { ready, signedIn } = useAuth();
  if (ready && !signedIn) return <Redirect href="/(auth)/login" />;

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: theme.bg },
        headerTintColor: theme.accent,
        headerTitleStyle: { color: theme.text, fontWeight: '700', fontSize: 17 },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: theme.bg },
      }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="appointment/[id]" options={{ title: 'Appointment' }} />
      <Stack.Screen name="policy/[id]" options={{ title: 'Policies' }} />
      <Stack.Screen name="checkout/[id]" options={{ title: 'Pay deposit' }} />
      <Stack.Screen name="payment-result" options={{ title: 'Payment', headerBackVisible: false }} />
      <Stack.Screen name="cancel/[id]" options={{ title: 'Cancel appointment' }} />
      <Stack.Screen name="receipt/[id]" options={{ title: 'Receipt' }} />
      <Stack.Screen name="scan" options={{ title: 'Scan QR' }} />
      <Stack.Screen name="scan-result" options={{ title: 'Attendance', headerBackVisible: false }} />
      <Stack.Screen name="report-no-show/[id]" options={{ title: 'Provider no-show' }} />
      <Stack.Screen name="disputes" options={{ title: 'Disputes' }} />
      <Stack.Screen name="dispute/new" options={{ title: 'Raise a dispute' }} />
      <Stack.Screen name="dispute/[id]" options={{ title: 'Dispute' }} />
      <Stack.Screen name="profile-edit" options={{ title: 'Edit profile' }} />
    </Stack>
  );
}
