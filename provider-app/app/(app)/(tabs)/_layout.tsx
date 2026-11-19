import { Tabs } from 'expo-router';
import { StyleSheet, Text, type ColorValue } from 'react-native';

import { theme } from '@/constants/theme';

function Icon({ glyph, color }: { glyph: string; color: ColorValue }) {
  return <Text style={[styles.icon, { color }]}>{glyph}</Text>;
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
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: ({ color }) => <Icon glyph="H" color={color} /> }} />
      <Tabs.Screen name="visits" options={{ title: 'Visits', tabBarIcon: ({ color }) => <Icon glyph="V" color={color} /> }} />
      <Tabs.Screen name="earnings" options={{ title: 'Earnings', tabBarIcon: ({ color }) => <Icon glyph="$" color={color} /> }} />
      <Tabs.Screen name="alerts" options={{ title: 'Alerts', tabBarIcon: ({ color }) => <Icon glyph="!" color={color} /> }} />
      <Tabs.Screen name="business" options={{ title: 'Business', tabBarIcon: ({ color }) => <Icon glyph="B" color={color} /> }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({ icon: { fontSize: 14, fontWeight: '700' } });
