import { Redirect } from 'expo-router';

import { useAuth } from '@/context/AuthContext';

export default function Index() {
  const { signedIn } = useAuth();
  if (signedIn) {
    return <Redirect href="/(app)/(tabs)" />;
  }
  return <Redirect href="/(auth)/login" />;
}
