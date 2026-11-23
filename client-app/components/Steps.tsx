import { StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { theme } from '@/constants/theme';

const labels = ['Review terms', 'Pay deposit', 'Check in'];

/** Progress through the booking: 0 = terms, 1 = payment, 2 = check-in. */
export function Steps({ current }: { current: number }) {
  return (
    <View style={styles.row} accessibilityLabel={`Step ${current + 1} of ${labels.length}: ${labels[current]}`}>
      {labels.map((label, i) => {
        const done = i < current;
        const on = i === current;
        return (
          <View key={label} style={styles.item}>
            <View style={styles.top}>
              <View style={[styles.dot, (done || on) && styles.dotOn]}>
                {done ? <Icon name="check" size={12} color={theme.onInk} strokeWidth={3} /> : <Text style={[styles.num, on && { color: theme.onInk }]}>{i + 1}</Text>}
              </View>
              {i < labels.length - 1 ? <View style={[styles.line, done && styles.lineOn]} /> : null}
            </View>
            <Text style={[styles.label, (done || on) && styles.labelOn]} numberOfLines={1}>{label}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row' },
  item: { flex: 1, gap: 8 },
  top: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, borderColor: theme.border, backgroundColor: theme.card, alignItems: 'center', justifyContent: 'center' },
  dotOn: { backgroundColor: theme.ink, borderColor: theme.ink },
  num: { color: theme.faint, fontSize: 12, fontWeight: '800' },
  line: { flex: 1, height: 2, backgroundColor: theme.border, marginHorizontal: 6 },
  lineOn: { backgroundColor: theme.ink },
  label: { color: theme.faint, fontSize: 12.5, fontWeight: '600' },
  labelOn: { color: theme.text },
});
