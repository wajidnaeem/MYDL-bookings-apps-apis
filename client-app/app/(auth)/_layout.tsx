import { Redirect, Stack } from 'expo-router';

import { theme } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';

export default function AuthLayout() {
  const { ready, signedIn } = useAuth();
  if (ready && signedIn) return <Redirect href="/(app)/(tabs)" />;

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: theme.bg },
        headerTintColor: theme.accent,
        headerTitleStyle: { color: theme.text, fontWeight: '600' },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: theme.bg },
      }}>
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="register" options={{ title: 'Create account' }} />
      <Stack.Screen name="verify" options={{ title: 'Verify account' }} />
      <Stack.Screen name="forgot-password" options={{ title: 'Forgot password' }} />
      <Stack.Screen name="reset-password" options={{ title: 'Reset password' }} />
    </Stack>
  );
}
