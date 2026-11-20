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
        headerTitleStyle: { color: theme.text, fontWeight: '600' },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: theme.bg },
      }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="visit/new" options={{ title: 'New visit' }} />
      <Stack.Screen name="visit/[id]" options={{ title: 'Visit' }} />
      <Stack.Screen name="visit-edit/[id]" options={{ title: 'Edit visit' }} />
      <Stack.Screen name="qr/[id]" options={{ title: 'Attendance QR' }} />
      <Stack.Screen name="no-show/[id]" options={{ title: 'Client no-show' }} />
      <Stack.Screen name="business-edit" options={{ title: 'Business profile' }} />
      <Stack.Screen name="policy" options={{ title: 'Policies' }} />
      <Stack.Screen name="payout" options={{ title: 'Payout method' }} />
      <Stack.Screen name="disputes" options={{ title: 'Disputes' }} />
      <Stack.Screen name="dispute/new" options={{ title: 'Raise a dispute' }} />
      <Stack.Screen name="dispute/[id]" options={{ title: 'Dispute' }} />
    </Stack>
  );
}
