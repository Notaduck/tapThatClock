import { useCallback, useEffect, useState } from 'react';
import { Alert, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldShowAlert: true,
    shouldSetBadge: false,
  }),
});

export const useNotificationSetup = () => {
  const [status, setStatus] = useState<'pending' | 'granted' | 'denied'>('pending');
  const [error, setError] = useState<string | null>(null);

  const requestPermission = useCallback(async () => {
    try {
      const settings = await Notifications.getPermissionsAsync();
      if (settings.status !== 'granted') {
        const finalStatus = (await Notifications.requestPermissionsAsync()).status;
        setStatus(finalStatus === 'granted' ? 'granted' : 'denied');
        if (finalStatus !== 'granted') {
          Alert.alert(
            'Notifications disabled',
            'Enable notifications in your device settings to allow alarms to sound.',
          );
          return false;
        }
      } else {
        setStatus('granted');
      }

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('alarms', {
          name: 'Alarms',
          importance: Notifications.AndroidImportance.MAX,
          sound: 'default',
          enableVibrate: true,
          lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
        });
      }
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      setStatus('denied');
      return false;
    }
  }, []);

  useEffect(() => {
    requestPermission();
  }, [requestPermission]);

  return { status, error, requestPermission };
};

export type NotificationSetupStatus = ReturnType<typeof useNotificationSetup>;
