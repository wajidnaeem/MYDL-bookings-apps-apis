import { Stack } from 'expo-router';
import { View } from 'react-native';

import { theme } from '@/constants/theme';
import { AuthProvider } from '@/context/AuthContext';
import { ProviderProvider } from '@/context/ProviderContext';

export { ErrorBoundary } from 'expo-router';

export default function RootLayout() {
  return (
    <AuthProvider>
      <ProviderProvider>
        <View style={{ flex: 1, width: '100%', backgroundColor: theme.bg }}>
          <View style={{ flex: 1, width: '100%', maxWidth: 480, marginLeft: 'auto', marginRight: 'auto' }}>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(app)" />
            </Stack>
          </View>
        </View>
      </ProviderProvider>
    </AuthProvider>
  );
}
