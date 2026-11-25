import { Tabs } from 'expo-router';

import type { IconName } from '@/components/Icon';
import { TabBar } from '@/components/TabBar';
import { useProvider } from '@/context/ProviderContext';

const icons: Record<string, IconName> = { index: 'home', visits: 'calendar', earnings: 'wallet', alerts: 'bell', business: 'briefcase' };

export default function TabLayout() {
  const { appointments } = useProvider();
  const pending = appointments.filter((item) => item.status === 'pending').length;

  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <TabBar {...props} icons={icons} />}>
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="visits" options={{ title: 'Visits', tabBarBadge: pending || undefined }} />
      <Tabs.Screen name="earnings" options={{ title: 'Earnings' }} />
      <Tabs.Screen name="alerts" options={{ title: 'Alerts' }} />
      <Tabs.Screen name="business" options={{ title: 'Business' }} />
    </Tabs>
  );
}
