import dayjs from 'dayjs';
import type { RepeatDay } from '../types/alarm';

const dayMap: Record<RepeatDay, number> = {
  Sun: 1,
  Mon: 2,
  Tue: 3,
  Wed: 4,
  Thu: 5,
  Fri: 6,
  Sat: 7,
};

export const repeatDayToWeekday = (day: RepeatDay): number => dayMap[day];

export const formatRepeatDays = (days: RepeatDay[]): string => {
  if (days.length === 0) {
    return 'One-time alarm';
  }
  if (days.length === 7) {
    return 'Every day';
  }
  return days.join(', ');
};

export const getNextTriggerDate = (time: string): Date => {
  const [hour, minute] = time.split(':').map(Number);
  let target = dayjs().hour(hour).minute(minute).second(0).millisecond(0);
  if (target.isBefore(dayjs())) {
    target = target.add(1, 'day');
  }
  return target.toDate();
};
