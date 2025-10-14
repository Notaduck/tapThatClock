import React, { useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as Notifications from 'expo-notifications';
import { nanoid } from 'nanoid/non-secure';
import AlarmForm from './src/components/AlarmForm';
import AlarmListItem from './src/components/AlarmListItem';
import { useNotificationSetup } from './src/hooks/useNotificationSetup';
import type { Alarm, AlarmDraft } from './src/types/alarm';
import { getNextTriggerDate, repeatDayToWeekday } from './src/utils/datetime';

const App: React.FC = () => {
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [isFormVisible, setFormVisible] = useState(false);
  const [editingAlarm, setEditingAlarm] = useState<Alarm | null>(null);
  const { status, error, requestPermission } = useNotificationSetup();

  const ensureNotificationsEnabled = async () => {
    if (status === 'granted') {
      return true;
    }
    const granted = await requestPermission();
    return granted;
  };

  const scheduleNotificationsForAlarm = async (alarm: Alarm): Promise<string[]> => {
    const [hour, minute] = alarm.time.split(':').map(Number);
    const baseContent = {
      title: alarm.label || 'Alarm',
      body: 'Time to wake up!',
      sound: 'default' as const,
    };
    const notificationIds: string[] = [];

    if (alarm.repeatDays.length === 0) {
      const triggerDate = getNextTriggerDate(alarm.time);
      const id = await Notifications.scheduleNotificationAsync({
        content: baseContent,
        trigger: triggerDate,
      });
      notificationIds.push(id);
    } else {
      for (const day of alarm.repeatDays) {
        const id = await Notifications.scheduleNotificationAsync({
          content: baseContent,
          trigger: {
            hour,
            minute,
            weekday: repeatDayToWeekday(day),
            repeats: true,
          },
        });
        notificationIds.push(id);
      }
    }

    return notificationIds;
  };

  const handleSubmitAlarm = async (draft: AlarmDraft) => {
    try {
      if (!(await ensureNotificationsEnabled())) {
        return;
      }

      if (editingAlarm) {
        await Promise.all(
          editingAlarm.notificationIds.map((id) => Notifications.cancelScheduledNotificationAsync(id)),
        );
      }

      const baseAlarm: Alarm = editingAlarm
        ? { ...editingAlarm, ...draft }
        : {
            id: nanoid(),
            enabled: true,
            notificationIds: [],
            ...draft,
          };

      let notificationIds: string[] = [];
      if (baseAlarm.enabled) {
        notificationIds = await scheduleNotificationsForAlarm(baseAlarm);
      }

      const nextAlarm = { ...baseAlarm, notificationIds };

      setAlarms((prev) => {
        const existingIndex = prev.findIndex((item) => item.id === nextAlarm.id);
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = nextAlarm;
          return updated;
        }
        return [...prev, nextAlarm];
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      Alert.alert('Failed to save alarm', message);
    } finally {
      setFormVisible(false);
      setEditingAlarm(null);
    }
  };

  const handleToggle = async (id: string, enabled: boolean) => {
    try {
      const alarm = alarms.find((item) => item.id === id);
      if (!alarm) {
        return;
      }

      if (enabled && !(await ensureNotificationsEnabled())) {
        return;
      }

      if (!enabled) {
        await Promise.all(
          alarm.notificationIds.map((notifId) => Notifications.cancelScheduledNotificationAsync(notifId)),
        );
      }

      let notificationIds: string[] = [];
      if (enabled) {
        notificationIds = await scheduleNotificationsForAlarm({ ...alarm, enabled });
      }

      setAlarms((prev) =>
        prev.map((item) => (item.id === id ? { ...item, enabled, notificationIds } : item)),
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      Alert.alert('Unable to update alarm', message);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete alarm', 'Are you sure you want to delete this alarm?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const alarm = alarms.find((item) => item.id === id);
          if (!alarm) {
            return;
          }
          await Promise.all(
            alarm.notificationIds.map((notificationId) => Notifications.cancelScheduledNotificationAsync(notificationId)),
          );
          setAlarms((prev) => prev.filter((item) => item.id !== id));
        },
      },
    ]);
  };

  const openCreateForm = () => {
    setEditingAlarm(null);
    setFormVisible(true);
  };

  const handleEditAlarm = (alarm: Alarm) => {
    setEditingAlarm(alarm);
    setFormVisible(true);
  };

  const headerDescription = useMemo(() => {
    if (alarms.length === 0) {
      return 'Add your first alarm to start fresh tomorrow.';
    }
    const activeCount = alarms.filter((alarm) => alarm.enabled).length;
    if (activeCount === 0) {
      return 'All alarms are snoozed. Tap + to schedule a new wake up.';
    }
    return `${activeCount} alarm${activeCount > 1 ? 's' : ''} ready to ring.`;
  }, [alarms]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Tap That Clock</Text>
            <Text style={styles.subheading}>{headerDescription}</Text>
            {error && <Text style={styles.errorText}>Notifications error: {error}</Text>}
          </View>
          <Pressable style={styles.addButton} onPress={openCreateForm}>
            <Text style={styles.addButtonText}>+</Text>
          </Pressable>
        </View>
        <FlatList
          data={alarms}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <AlarmListItem alarm={item} onToggle={handleToggle} onEdit={handleEditAlarm} onDelete={handleDelete} />
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No alarms yet</Text>
              <Text style={styles.emptyDescription}>
                Create an alarm to build a consistent wake-up routine.
              </Text>
            </View>
          }
          contentContainerStyle={alarms.length === 0 ? styles.emptyListContainer : undefined}
        />
      </View>
      <AlarmForm
        visible={isFormVisible}
        onCancel={() => {
          setFormVisible(false);
          setEditingAlarm(null);
        }}
        onSubmit={handleSubmitAlarm}
        initialValue={editingAlarm}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  subheading: {
    fontSize: 16,
    color: '#CBD5F5',
    marginTop: 8,
  },
  errorText: {
    color: '#F97316',
    marginTop: 6,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FF7A59',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: -4,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 120,
  },
  emptyTitle: {
    fontSize: 22,
    color: '#FFFFFF',
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
    paddingHorizontal: 16,
    marginTop: 4,
  },
  emptyListContainer: {
    flexGrow: 1,
  },
});

export default App;
