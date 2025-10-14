import { formatRepeatDays, getNextTriggerDate } from '../src/utils/datetime';
import type { RepeatDay } from '../src/types/alarm';

describe('datetime utils', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it('formats repeat days for special cases and custom sets', () => {
    expect(formatRepeatDays([])).toBe('One-time alarm');

    const everyDay: RepeatDay[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    expect(formatRepeatDays(everyDay)).toBe('Every day');

    expect(formatRepeatDays(['Mon', 'Wed', 'Fri'])).toBe('Mon, Wed, Fri');
  });

  it('returns the next trigger date occurring today when time is in the future', () => {
    const base = new Date('2024-05-05T06:15:00Z');
    jest.useFakeTimers().setSystemTime(base);

    const trigger = getNextTriggerDate('07:45');
    expect(trigger.toISOString()).toBe('2024-05-05T07:45:00.000Z');
  });

  it('returns the next trigger date on the following day when time already passed', () => {
    const base = new Date('2024-05-05T20:15:00Z');
    jest.useFakeTimers().setSystemTime(base);

    const trigger = getNextTriggerDate('07:45');
    expect(trigger.toISOString()).toBe('2024-05-06T07:45:00.000Z');
  });
});
