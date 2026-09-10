import { TZDate } from '@date-fns/tz';
import { format } from 'date-fns';

export const VANCOUVER_TZ = 'America/Vancouver';

function toHour24(hour12: number, period: 'AM' | 'PM') {
  return period === 'AM'
    ? hour12 === 12
      ? 0
      : hour12
    : hour12 === 12
      ? 12
      : hour12 + 12;
}

function toHour12(hour24: number) {
  const period = hour24 >= 12 ? 'PM' : 'AM';
  let hour = hour24 % 12;
  if (hour === 0) hour = 12;
  return { hour, period: period as 'AM' | 'PM' };
}

export function buildScheduledAtUtc(
  date: Date,
  hour12: number,
  minute: number,
  period: 'AM' | 'PM'
) {
  const hour24 = toHour24(hour12, period);
  const scheduledAt = new TZDate(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    hour24,
    minute,
    0,
    VANCOUVER_TZ
  );

  return scheduledAt.toISOString();
}

export function getCurrentVancouverScheduleValues() {
  const now = TZDate.tz(VANCOUVER_TZ);
  const { hour, period } = toHour12(now.getHours());

  return {
    date: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
    hour: String(hour),
    minute: String(now.getMinutes()).padStart(2, '0'),
    period,
  };
}

export function parseScheduledAt(iso: string | null | undefined) {
  if (!iso) return null;

  const scheduledAt = TZDate.tz(VANCOUVER_TZ, iso);
  const { hour, period } = toHour12(scheduledAt.getHours());

  return {
    date: new Date(
      scheduledAt.getFullYear(),
      scheduledAt.getMonth(),
      scheduledAt.getDate()
    ),
    hour: String(hour),
    minute: String(scheduledAt.getMinutes()).padStart(2, '0'),
    period,
  };
}

export function formatVancouverDate(date: Date, formatStr: string) {
  const vancouverDate = new TZDate(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    0,
    0,
    0,
    VANCOUVER_TZ
  );

  return format(vancouverDate, formatStr);
}

export function formatScheduledAtDisplay(iso: string) {
  const scheduledAt = TZDate.tz(VANCOUVER_TZ, iso);
  const { hour, period } = toHour12(scheduledAt.getHours());
  const minute = String(scheduledAt.getMinutes()).padStart(2, '0');

  return `${format(scheduledAt, 'PPP')} at ${hour}:${minute} ${period} (Vancouver)`;
}

export function isBeforeVancouverToday(date: Date) {
  const today = TZDate.tz(VANCOUVER_TZ);
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const selectedStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  return selectedStart < todayStart;
}

export function isScheduledLinkVisible(scheduledAt: string) {
  return TZDate.tz(VANCOUVER_TZ, scheduledAt) <= TZDate.tz(VANCOUVER_TZ);
}
