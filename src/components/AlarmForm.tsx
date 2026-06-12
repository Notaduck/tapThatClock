import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import dayjs from 'dayjs';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { Alarm, AlarmDraft, AlarmSound, RepeatDay } from '../types/alarm';

const dayOrder: RepeatDay[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface AlarmFormProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (draft: AlarmDraft) => void;
  initialValue?: Alarm | null;
}

const sounds: { label: string; value: AlarmSound; description: string }[] = [
  { label: 'Default', value: 'default', description: 'Balanced tone suitable for most sleepers.' },
  { label: 'Bright', value: 'bright', description: 'Energetic chime to boost your morning energy.' },
  { label: 'Soft', value: 'soft', description: 'Gentle tone ideal for light sleepers.' },
];

const AlarmForm: React.FC<AlarmFormProps> = ({ visible, onCancel, onSubmit, initialValue }) => {
  const [time, setTime] = useState(new Date());
  const [label, setLabel] = useState('');
  const [repeatDays, setRepeatDays] = useState<Set<RepeatDay>>(new Set());
  const [sound, setSound] = useState<AlarmSound>('default');

  useEffect(() => {
    if (initialValue) {
      const [hours, minutes] = initialValue.time.split(':').map(Number);
      const nextOccurrence = dayjs().hour(hours).minute(minutes).second(0).millisecond(0);
      setTime(nextOccurrence.toDate());
      setLabel(initialValue.label);
      setRepeatDays(new Set(initialValue.repeatDays));
      setSound(initialValue.sound);
    } else {
      const now = dayjs().second(0).millisecond(0).add(1, 'minute');
      setTime(now.toDate());
      setLabel('Morning alarm');
      setRepeatDays(new Set());
      setSound('default');
    }
  }, [initialValue, visible]);

  const sortedDays = useMemo(
    () => dayOrder.filter((day) => repeatDays.has(day)),
    [repeatDays],
  );

  const toggleDay = (day: RepeatDay) => {
    setRepeatDays((prev) => {
      const next = new Set(prev);
      if (next.has(day)) {
        next.delete(day);
      } else {
        next.add(day);
      }
      return next;
    });
  };

  const handleSubmit = () => {
    const formattedTime = dayjs(time).format('HH:mm');
    const trimmedLabel = label.trim() || 'Alarm';
    onSubmit({
      time: formattedTime,
      label: trimmedLabel,
      repeatDays: sortedDays,
      sound,
    });
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onCancel}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>{initialValue ? 'Edit alarm' : 'Create alarm'}</Text>
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Alarm time</Text>
          <DateTimePicker
            value={time}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, selectedDate) => {
              if (selectedDate) {
                setTime(selectedDate);
              }
            }}
            style={styles.timePicker}
          />
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Label</Text>
          <TextInput
            style={styles.input}
            placeholder="Morning alarm"
            value={label}
            onChangeText={setLabel}
            returnKeyType="done"
          />
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Repeat on</Text>
          <View style={styles.dayGrid}>
            {dayOrder.map((day) => {
              const selected = repeatDays.has(day);
              return (
                <Pressable
                  key={day}
                  onPress={() => toggleDay(day)}
                  style={[styles.dayChip, selected && styles.dayChipSelected]}
                >
                  <Text style={[styles.dayChipText, selected && styles.dayChipTextSelected]}>{day}</Text>
                </Pressable>
              );
            })}
          </View>
          <Text style={styles.helperText}>
            Leave empty to create a one-time alarm. Selected days repeat weekly.
          </Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Sound</Text>
          <View style={styles.pickerWrapper}>
            <Picker selectedValue={sound} onValueChange={(value) => setSound(value as AlarmSound)}>
              {sounds.map((option) => (
                <Picker.Item label={option.label} value={option.value} key={option.value} />
              ))}
            </Picker>
          </View>
          <Text style={styles.helperText}>
            {sounds.find((item) => item.value === sound)?.description}
          </Text>
        </View>
        <View style={styles.footer}>
          <Pressable onPress={onCancel} style={[styles.button, styles.secondaryButton]}>
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>Cancel</Text>
          </Pressable>
          <Pressable onPress={handleSubmit} style={[styles.button, styles.primaryButton]}>
            <Text style={styles.buttonText}>{initialValue ? 'Save changes' : 'Create alarm'}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingBottom: 48,
    backgroundColor: '#0F172A',
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionLabel: {
    fontSize: 16,
    color: '#CBD5F5',
    marginBottom: 12,
    fontWeight: '500',
  },
  timePicker: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
  },
  input: {
    backgroundColor: '#1E293B',
    color: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  dayGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  dayChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: '#1E293B',
    marginHorizontal: 6,
    marginVertical: 6,
  },
  dayChipSelected: {
    backgroundColor: '#FF7A59',
  },
  dayChipText: {
    color: '#CBD5F5',
    fontWeight: '600',
  },
  dayChipTextSelected: {
    color: '#0F172A',
  },
  pickerWrapper: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
  },
  helperText: {
    marginTop: 8,
    color: '#94A3B8',
    fontSize: 14,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: -6,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 6,
  },
  primaryButton: {
    backgroundColor: '#FF7A59',
  },
  secondaryButton: {
    backgroundColor: '#1E293B',
  },
  buttonText: {
    color: '#0F172A',
    fontWeight: '700',
    fontSize: 16,
  },
  secondaryButtonText: {
    color: '#CBD5F5',
  },
});

export default AlarmForm;
