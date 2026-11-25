import type { BottomTabBarProps } from 'expo-router/tabs';
import { Pressable, StyleSheet, View } from 'react-native';

import { Icon, type IconName } from '@/components/Icon';
import { Text } from '@/components/Text';
import { radius, theme } from '@/constants/theme';

/** Floating ink tab bar. `icons` maps each route name to its icon. */
export function TabBar({ state, descriptors, navigateToTab, insets, icons }: BottomTabBarProps & { icons: Record<string, IconName> }) {
  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      <View style={styles.bar}>
        {state.routes.map((route, index) => {
          const options = descriptors[route.key]?.options ?? {};
          const focused = state.index === index;
          const label = typeof options.title === 'string' ? options.title : route.name;
          const badge = options.tabBarBadge;
          return (
            <Pressable
              key={route.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={label}
              onPress={() => {
                if (!focused) navigateToTab(route.key);
              }}
              style={styles.item}>
              <View style={[styles.iconWrap, focused && styles.iconOn]}>
                <Icon name={icons[route.name] ?? 'home'} size={20} color={focused ? theme.ink : theme.onInkMuted} strokeWidth={focused ? 2.1 : 1.7} />
                {badge != null && badge !== '' ? (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{String(badge)}</Text>
                  </View>
                ) : null}
              </View>
              <Text style={[styles.label, focused && styles.labelOn]} numberOfLines={1}>{label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { backgroundColor: theme.bg, paddingHorizontal: 14, paddingTop: 8 },
  bar: { flexDirection: 'row', backgroundColor: theme.ink, borderRadius: radius.xl, paddingVertical: 8, paddingHorizontal: 6 },
  item: { flex: 1, alignItems: 'center', gap: 4, paddingVertical: 2 },
  iconWrap: { width: 46, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  iconOn: { backgroundColor: theme.gold },
  label: { color: theme.onInkMuted, fontSize: 10.5, fontWeight: '500' },
  labelOn: { color: theme.onInk, fontWeight: '600' },
  badge: { position: 'absolute', top: -3, right: 2, minWidth: 17, height: 17, borderRadius: 9, paddingHorizontal: 4, backgroundColor: theme.goldLight, borderWidth: 2, borderColor: theme.ink, alignItems: 'center', justifyContent: 'center' },
  badgeText: { color: theme.ink, fontSize: 9.5, fontWeight: '700' },
});
