import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { Text } from '@/components/Text';
import { fonts, radius, theme } from '@/constants/theme';

// Visits store dates as "Thu, 27 Nov 2026" and times as "3:00 PM"; the API parses exactly these formats.
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export function formatVisitDate(d: Date) {
  return `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function parseVisitDate(value: string): Date | null {
  const m = /(\d{1,2})\s+([A-Za-z]{3})[a-z]*\s+(\d{4})/.exec(value || '');
  if (!m) return null;
  const month = MONTHS.findIndex((name) => name.toLowerCase() === m[2].toLowerCase());
  if (month < 0) return null;
  return new Date(Number(m[3]), month, Number(m[1]));
}

const sameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

function startOfToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

// 15-minute steps from 6:00 AM to 11:45 PM.
const TIMES = Array.from({ length: (24 - 6) * 4 }, (_, i) => {
  const minutes = 6 * 60 + i * 15;
  const h24 = Math.floor(minutes / 60);
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(minutes % 60).padStart(2, '0')} ${h24 < 12 ? 'AM' : 'PM'}`;
});

function PickerField({ label, value, placeholder, icon, onPress }: { label: string; value: string; placeholder: string; icon: 'calendar' | 'clock'; onPress: () => void }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Pressable accessibilityRole="button" accessibilityLabel={`${label}: ${value || placeholder}`} onPress={onPress} style={({ pressed }) => [styles.input, pressed && styles.inputPressed]}>
        <Text style={[styles.inputText, !value && { color: theme.faint }]} numberOfLines={1}>{value || placeholder}</Text>
        <Icon name={icon} size={18} color={theme.accent} />
      </Pressable>
    </View>
  );
}

function Sheet({ visible, title, onClose, children }: { visible: boolean; title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close">
        <Pressable style={styles.sheet} onPress={() => {}}>
          <View style={styles.sheetHead}>
            <Text style={styles.sheetTitle}>{title}</Text>
            <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={onClose} hitSlop={10}>
              <Icon name="cancel" size={20} color={theme.muted} />
            </Pressable>
          </View>
          {children}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export function DateField({ label = 'Date', value, onChange }: { label?: string; value: string; onChange: (next: string) => void }) {
  const [open, setOpen] = useState(false);
  const selected = parseVisitDate(value);
  const today = startOfToday();
  const [month, setMonth] = useState(() => {
    const base = selected ?? today;
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });

  const cells = useMemo(() => {
    const first = month.getDay();
    const count = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    return [...Array(first).fill(null), ...Array.from({ length: count }, (_, i) => new Date(month.getFullYear(), month.getMonth(), i + 1))];
  }, [month]);

  const canGoBack = month > new Date(today.getFullYear(), today.getMonth(), 1);
  const shift = (by: number) => setMonth((m) => new Date(m.getFullYear(), m.getMonth() + by, 1));

  return (
    <>
      <PickerField label={label} value={value} placeholder="Choose a date" icon="calendar" onPress={() => setOpen(true)} />
      <Sheet visible={open} title="Choose a date" onClose={() => setOpen(false)}>
        <View style={styles.monthRow}>
          <Pressable accessibilityRole="button" accessibilityLabel="Previous month" disabled={!canGoBack} onPress={() => shift(-1)} style={[styles.navBtn, !canGoBack && { opacity: 0.3 }]}>
            <View style={{ transform: [{ rotate: '180deg' }] }}><Icon name="chevron" size={18} color={theme.text} /></View>
          </Pressable>
          <Text style={styles.monthTitle}>{MONTH_NAMES[month.getMonth()]} {month.getFullYear()}</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="Next month" onPress={() => shift(1)} style={styles.navBtn}>
            <Icon name="chevron" size={18} color={theme.text} />
          </Pressable>
        </View>
        <View style={styles.grid}>
          {DAYS.map((d) => <Text key={d} style={styles.weekday}>{d.slice(0, 2)}</Text>)}
          {cells.map((day, i) => {
            if (!day) return <View key={`blank-${i}`} style={styles.cell} />;
            const past = day < today;
            const isSelected = selected ? sameDay(day, selected) : false;
            const isToday = sameDay(day, today);
            return (
              <Pressable
                key={day.toISOString()}
                accessibilityRole="button"
                accessibilityLabel={formatVisitDate(day)}
                disabled={past}
                onPress={() => { onChange(formatVisitDate(day)); setOpen(false); }}
                style={styles.cell}>
                <View style={[styles.dayDot, isToday && styles.today, isSelected && styles.daySelected]}>
                  <Text style={[styles.dayText, past && { color: theme.border }, isSelected && styles.dayTextSelected]}>{day.getDate()}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </Sheet>
    </>
  );
}

export function TimeField({ label = 'Time', value, onChange }: { label?: string; value: string; onChange: (next: string) => void }) {
  const [open, setOpen] = useState(false);
  const current = TIMES.indexOf(value);
  return (
    <>
      <PickerField label={label} value={value} placeholder="Choose a time" icon="clock" onPress={() => setOpen(true)} />
      <Sheet visible={open} title="Choose a time" onClose={() => setOpen(false)}>
        <ScrollView style={{ maxHeight: 360 }} contentOffset={{ x: 0, y: Math.max(0, current - 2) * 46 }}>
          <View style={styles.times}>
            {TIMES.map((t) => {
              const on = t === value;
              return (
                <Pressable key={t} accessibilityRole="button" onPress={() => { onChange(t); setOpen(false); }} style={[styles.timeChip, on && styles.daySelected]}>
                  <Text style={[styles.timeText, on && styles.dayTextSelected]}>{t}</Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      </Sheet>
    </>
  );
}

const styles = StyleSheet.create({
  field: { gap: 7 },
  fieldLabel: { color: theme.muted, fontSize: 13, fontWeight: '500' },
  input: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, borderRadius: radius.md, paddingHorizontal: 16, paddingVertical: 15 },
  inputPressed: { borderColor: theme.gold },
  inputText: { flex: 1, fontSize: 16, color: theme.text },
  backdrop: { flex: 1, backgroundColor: 'rgba(13,16,20,0.45)', alignItems: 'center', justifyContent: 'center', padding: 16 },
  sheet: { width: '100%', maxWidth: 380, backgroundColor: theme.card, borderRadius: radius.lg, padding: 18 },
  sheetHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  sheetTitle: { fontFamily: fonts.serif, fontSize: 22, fontWeight: '700', color: theme.text },
  monthRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  monthTitle: { fontSize: 16, fontWeight: '700', color: theme.text },
  navBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.borderSoft },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  weekday: { width: `${100 / 7}%`, textAlign: 'center', color: theme.faint, fontSize: 12, fontWeight: '600', paddingVertical: 6 },
  cell: { width: `${100 / 7}%`, aspectRatio: 1, alignItems: 'center', justifyContent: 'center' },
  dayDot: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  today: { borderWidth: 1, borderColor: theme.gold },
  daySelected: { backgroundColor: theme.ink, borderColor: theme.ink },
  dayText: { fontSize: 15, color: theme.text, fontWeight: '500' },
  dayTextSelected: { color: theme.onInk, fontWeight: '700' },
  times: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  timeChip: { width: '31%', height: 38, borderRadius: radius.md, borderWidth: 1, borderColor: theme.border, alignItems: 'center', justifyContent: 'center' },
  timeText: { fontSize: 14, color: theme.text, fontWeight: '500' },
});
