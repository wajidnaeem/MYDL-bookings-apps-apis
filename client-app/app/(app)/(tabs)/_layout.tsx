import { Tabs } from 'expo-router';

import type { IconName } from '@/components/Icon';
import { TabBar } from '@/components/TabBar';
import { useClient } from '@/context/ClientContext';

const icons: Record<string, IconName> = { index: 'home', appointments: 'calendar', payments: 'card', notifications: 'bell', profile: 'user' };

export default function TabLayout() {
  const { appointments } = useClient();
  const invitations = appointments.filter((item) => item.status === 'pending').length;

  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <TabBar {...props} icons={icons} />}>
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="appointments" options={{ title: 'Visits', tabBarBadge: invitations || undefined }} />
      <Tabs.Screen name="payments" options={{ title: 'Payments' }} />
      <Tabs.Screen name="notifications" options={{ title: 'Alerts' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}
