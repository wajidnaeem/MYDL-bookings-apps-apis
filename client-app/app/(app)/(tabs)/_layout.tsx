import { SymbolView } from 'expo-symbols';
import { Tabs } from 'expo-router';

import { theme } from '@/constants/theme';

function tint(color: string | undefined) {
  return typeof color === 'string' ? color : theme.accent;
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.accent,
        tabBarInactiveTintColor: '#8AA09C',
        tabBarStyle: { backgroundColor: theme.card, borderTopColor: theme.border },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <SymbolView name={{ ios: 'house.fill', android: 'home', web: 'home' }} tintColor={tint(color as string)} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="appointments"
        options={{
          title: 'Visits',
          tabBarIcon: ({ color }) => (
            <SymbolView name={{ ios: 'calendar', android: 'calendar_today', web: 'calendar_today' }} tintColor={tint(color as string)} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="payments"
        options={{
          title: 'Payments',
          tabBarIcon: ({ color }) => (
            <SymbolView name={{ ios: 'creditcard.fill', android: 'payments', web: 'payments' }} tintColor={tint(color as string)} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Alerts',
          tabBarIcon: ({ color }) => (
            <SymbolView name={{ ios: 'bell.fill', android: 'notifications', web: 'notifications' }} tintColor={tint(color as string)} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => (
            <SymbolView name={{ ios: 'person.fill', android: 'person', web: 'person' }} tintColor={tint(color as string)} size={24} />
          ),
        }}
      />
    </Tabs>
  );
}
