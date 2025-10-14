export type RepeatDay = 'Sun' | 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat';

export type AlarmSound = 'default' | 'bright' | 'soft';

export interface AlarmDraft {
  time: string; // HH:mm format
  label: string;
  repeatDays: RepeatDay[];
  sound: AlarmSound;
}

export interface Alarm extends AlarmDraft {
  id: string;
  enabled: boolean;
  notificationIds: string[];
}
