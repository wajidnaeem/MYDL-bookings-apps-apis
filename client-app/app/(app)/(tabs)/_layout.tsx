import { Tabs } from 'expo-router';
import { Platform, StyleSheet, View } from 'react-native';

import { Icon, type IconName } from '@/components/Icon';
import { theme } from '@/constants/theme';
import { useClient } from '@/context/ClientContext';

function TabIcon({ name, color, focused }: { name: IconName; color: string; focused: boolean }) {
  return (
    <View style={[styles.iconWrap, focused && styles.iconOn]}>
      <Icon name={name} size={21} color={color} strokeWidth={focused ? 2.1 : 1.8} />
    </View>
  );
}

export default function TabLayout() {
  const { appointments } = useClient();
  const invitations = appointments.filter((item) => item.status === 'pending').length;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.ink,
        tabBarInactiveTintColor: theme.faint,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700', marginTop: 2 },
        tabBarStyle: {
          backgroundColor: theme.card,
          borderTopColor: theme.border,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 88 : 72,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? 28 : 10,
        },
        tabBarBadgeStyle: { backgroundColor: theme.gold, color: theme.ink, fontSize: 10, fontWeight: '800' },
      }}>
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: ({ color, focused }) => <TabIcon name="home" color={String(color)} focused={focused} /> }} />
      <Tabs.Screen
        name="appointments"
        options={{ title: 'Visits', tabBarBadge: invitations || undefined, tabBarIcon: ({ color, focused }) => <TabIcon name="calendar" color={String(color)} focused={focused} /> }}
      />
      <Tabs.Screen name="payments" options={{ title: 'Payments', tabBarIcon: ({ color, focused }) => <TabIcon name="card" color={String(color)} focused={focused} /> }} />
      <Tabs.Screen name="notifications" options={{ title: 'Alerts', tabBarIcon: ({ color, focused }) => <TabIcon name="bell" color={String(color)} focused={focused} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: ({ color, focused }) => <TabIcon name="user" color={String(color)} focused={focused} /> }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconWrap: { width: 44, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  iconOn: { backgroundColor: theme.goldSoft },
});
