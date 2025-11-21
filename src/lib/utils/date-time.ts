import { AvailabilitySlot } from "@/features/mentore/server/types";
import { Units } from "@/features/tasks/server/task-types";
import {
  addDays,
  addHours,
  addMonths,
  addWeeks,
  addYears,
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  differenceInMonths,
  differenceInWeeks,
  differenceInYears,
  format,
  isAfter,
  isBefore,
} from "date-fns";

export const daysInWeek = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

export const timeOptions = [
  "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00",
  "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00",
];

export function toYMD(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export const formatDateAndTimeNUTC = (date: Date) => {
  return date.toLocaleDateString(undefined, {
    hour: "numeric",
    minute: "2-digit",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

export const getCurrentServerTime = () => new Date();

function normalizeDate(input: string | Date): Date {
  return typeof input === "string" ? new Date(input) : input;
}

export function calculateSlotDuration(slot: AvailabilitySlot) {
  const [startHour, startMin] = slot.start.split(":").map(Number);
  const [endHour, endMin] = slot.end.split(":").map(Number);
  return endHour + endMin / 60 - (startHour + startMin / 60);
}

export function getValidEndTimes(startTime: string) {
  const startIndex = timeOptions.indexOf(startTime);
  return timeOptions.filter((_, index) => index > startIndex);
}

export function parseDeadlineV2(value: string, baseTime: Date): Date | null {
  const lowerValue = value.toLowerCase();
  const match = lowerValue.match(/^(\d+)([hdwmy])$/);
  if (!match) {
    return null;
  }

  const [, numStr, unit] = match;
  const num = parseInt(numStr, 10);

  switch (unit as Units) {
    case "h": return addHours(baseTime, num);
    case "d": return addDays(baseTime, num);
    case "w": return addWeeks(baseTime, num);
    case "m": return addMonths(baseTime, num);
    case "y": return addYears(baseTime, num);
    default: return null;
  }
}

export function formatTimeRemaining(end: Date, now: Date, unit: Units) {
  switch (unit) {
    case "h": {
      const hours = differenceInHours(end, now);
      const minutes = differenceInMinutes(end, now) % 60;
      return `${hours}h ${minutes}m`;
    }
    case "d": {
      const days = differenceInDays(end, now);
      const hours = differenceInHours(end, now) % 24;
      return `${days}d ${hours}h`;
    }
    case "w": {
      const weeks = differenceInWeeks(end, now);
      const days = differenceInDays(end, now) % 7;
      return `${weeks}w ${days}d`;
    }
    case "m": {
      const months = differenceInMonths(end, now);
      const days = differenceInDays(end, now) % 30; // approximate
      return `${months}m ${days}d`;
    }
    case "y": {
      const years = differenceInYears(end, now);
      const months = differenceInMonths(end, now) % 12;
      return `${years}y ${months}m`;
    }
  }
}

export const sessionTimeUtils = {
  isSessionActive: (
    session: { sessionStart: string | Date; sessionEnd: string | Date },
    now: Date
  ): boolean => {
    const start = normalizeDate(session.sessionStart);
    const end = normalizeDate(session.sessionEnd);

    return (
      (now.getTime() === start.getTime() || isAfter(now, start)) &&
      isBefore(now, end)
    );
  },

  isBeforeSession: (
    session: { sessionStart: string | Date },
    now: Date
  ): boolean => {
    const start = normalizeDate(session.sessionStart);
    return isBefore(now, start);
  },

  isAfterSession: (
    session: { sessionEnd: string | Date },
    now: Date
  ): boolean => {
    const end = normalizeDate(session.sessionEnd);
    return isAfter(now, end);
  },
};