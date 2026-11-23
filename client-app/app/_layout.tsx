import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { View } from 'react-native';
import 'react-native-reanimated';

import { theme } from '@/constants/theme';
import { AuthProvider } from '@/context/AuthContext';
import { ClientProvider } from '@/context/ClientContext';

export { ErrorBoundary } from 'expo-router';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (error) console.warn(error);
  }, [error]);

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [loaded, error]);

  return (
    <AuthProvider>
      <ClientProvider>
        <RootLayoutNav />
      </ClientProvider>
    </AuthProvider>
  );
}

function RootLayoutNav() {
  return (
    <View style={{ flex: 1, width: '100%', backgroundColor: theme.bg }}>
      <View style={{ flex: 1, width: '100%', maxWidth: 480, marginLeft: 'auto', marginRight: 'auto' }}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(app)" />
        </Stack>
      </View>
    </View>
  );
}
