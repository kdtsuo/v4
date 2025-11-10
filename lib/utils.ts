import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getTimeSince(createdAt: string | undefined): {
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
} {
  if (!createdAt) return { months: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };

  const created = new Date(createdAt);
  const now = new Date();

  let yearsDiff = now.getFullYear() - created.getFullYear();
  let monthsDiff = now.getMonth() - created.getMonth();
  let daysDiff = now.getDate() - created.getDate();

  if (daysDiff < 0) {
    monthsDiff -= 1;
    const previousMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    daysDiff += previousMonth.getDate();
  }

  if (monthsDiff < 0) {
    yearsDiff -= 1;
    monthsDiff += 12;
  }

  const totalMonths = yearsDiff * 12 + monthsDiff;

  // Calculate hours, minutes, seconds
  let hours = now.getHours() - created.getHours();
  let minutes = now.getMinutes() - created.getMinutes();
  let seconds = now.getSeconds() - created.getSeconds();

  if (seconds < 0) {
    minutes -= 1;
    seconds += 60;
  }
  if (minutes < 0) {
    hours -= 1;
    minutes += 60;
  }
  if (hours < 0) {
    daysDiff -= 1;
    hours += 24;
  }

  return {
    months: Math.max(0, totalMonths),
    days: Math.max(0, daysDiff),
    hours: Math.max(0, hours),
    minutes: Math.max(0, minutes),
    seconds: Math.max(0, seconds),
  };
}
