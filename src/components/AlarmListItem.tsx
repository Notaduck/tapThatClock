import React from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import type { Alarm } from '../types/alarm';
import { formatRepeatDays } from '../utils/datetime';

interface AlarmListItemProps {
  alarm: Alarm;
  onToggle: (id: string, enabled: boolean) => void;
  onEdit: (alarm: Alarm) => void;
  onDelete: (id: string) => void;
}

const AlarmListItem: React.FC<AlarmListItemProps> = ({ alarm, onToggle, onEdit, onDelete }) => (
  <View style={styles.container}>
    <Pressable onPress={() => onEdit(alarm)} style={styles.infoArea}>
      <View>
        <Text style={[styles.time, !alarm.enabled && styles.disabledText]}>{alarm.time}</Text>
        <Text style={[styles.label, !alarm.enabled && styles.disabledText]}>{alarm.label}</Text>
        <Text style={styles.repeat}>{formatRepeatDays(alarm.repeatDays)}</Text>
      </View>
    </Pressable>
    <View style={styles.actions}>
      <Switch
        value={alarm.enabled}
        onValueChange={(value) => onToggle(alarm.id, value)}
        trackColor={{ true: '#FF7A59', false: '#1E293B' }}
        thumbColor={alarm.enabled ? '#FFE4D6' : '#CBD5F5'}
      />
      <Pressable onPress={() => onDelete(alarm.id)} style={styles.deleteButton}>
        <Text style={styles.deleteText}>Delete</Text>
      </Pressable>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  infoArea: {
    flex: 1,
    marginRight: 12,
  },
  time: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  label: {
    fontSize: 16,
    color: '#CBD5F5',
    marginTop: 4,
  },
  repeat: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 6,
  },
  disabledText: {
    color: '#64748B',
  },
  actions: {
    alignItems: 'flex-end',
  },
  deleteButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#0F172A',
    borderRadius: 999,
    marginTop: 12,
  },
  deleteText: {
    color: '#F97316',
    fontWeight: '600',
  },
});

export default AlarmListItem;
