import { AvailabilitySlot } from "@/features/mentore/server/types";
import { Units } from "@/features/tasks/server/task-types";
import { clsx, type ClassValue } from "clsx";
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
  isSameDay,
  parse,
  parseISO,
} from "date-fns";
import {
  FileArchive,
  FileAudio,
  FileCode,
  FileImage,
  FileJson,
  FileSpreadsheet,
  FileText,
  FileVideo,
} from "lucide-react";
import { twMerge } from "tailwind-merge";
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export function toYMD(date: Date): string {
  return format(date, "yyyy-MM-dd");
}
export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString(undefined, {
    timeZone: "UTC",
  });
};
export const wait = (ms: number = 3000): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
export const formatDates = (dateString: Date) => {
  return dateString.toLocaleDateString(undefined, {
    timeZone: "UTC",
  });
};
export const formatDatesNUTC = (dateString: Date) => {
  return dateString.toLocaleDateString(undefined);
};
export const formatDateAndTime = (date: Date) => {
  return date.toLocaleDateString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  });
};
export const formatDateAndTimeNUTC = (date: Date) => {
  return date.toLocaleDateString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};
export function parseDeadlineV2(value: string, baseTime: Date): Date | null {
  const lowerValue = value.toLowerCase();
  const match = lowerValue.match(/^(\d+)([hdwmy])$/);
  if (!match) {
    return null;
  }

  const [, numStr, unit] = match;
  const num = parseInt(numStr, 10);

  switch (unit as Units) {
    case "h":
      return addHours(baseTime, num);
    case "d":
      return addDays(baseTime, num);
    case "w":
      return addWeeks(baseTime, num);
    case "m":
      return addMonths(baseTime, num);
    case "y":
      return addYears(baseTime, num);
    default:
      return null;
  }
}
export function isError(err: unknown): err is Error {
  return typeof err === "object" && err !== null && "message" in err;
}
export function truncateText(text: string, maxLength: number): string {
  return text.length > maxLength
    ? text.slice(0, maxLength).trim() + "..." + text.slice(-4)
    : text;
}
const badgeColors = [
  "bg-green-100 text-green-800",
  "bg-blue-100 text-blue-800",
  "bg-yellow-100 text-yellow-800",
  "bg-pink-100 text-pink-800",
  // "bg-purple-100 text-purple-800",
];
const objColors = [
  "text-neutral-900 font-semibold",
  "text-blue-800 font-semibold",
  "text-yellow-800 font-semibold",
  "text-pink-800 font-semibold",
  "text-purple-800 font-semibold",
  "text-purple-800 font-semibold",
  "text-cyan-800 font-semibold",
  "text-amber-800 font-semibold",
  "text-indigo-800 font-semibold",
  "text-teal-700 font-semibold",
  "text-violet-700 font-semibold",
];

export function getColorClass(name: string, bg = true, txt?: boolean) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  if (bg) {
    const index = Math.abs(hash) % badgeColors.length;
    return badgeColors[index];
  }
  if (txt) {
    const index = Math.abs(hash) % objColors.length;
    return objColors[index];
  }
}
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
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
  "21:00",
  "22:00",
];
export const defaultAvatars = [
  "/avatars/avatar-1.svg",
  "/avatars/avatar-10.svg",
  "/avatars/avatar-11.svg",
  "/avatars/avatar-12.svg",
  "/avatars/avatar-13.svg",
  "/avatars/avatar-14.svg",
  "/avatars/avatar-15.svg",
  "/avatars/avatar-16.svg",
  "/avatars/avatar-2.svg",
  "/avatars/avatar-3.svg",
  "/avatars/avatar-4.svg",
  "/avatars/avatar-5.svg",
  "/avatars/avatar-6.svg",
  "/avatars/avatar-7.svg",
  "/avatars/avatar-8.svg",
  "/avatars/avatar-9.svg",
];
export function calculateSlotDuration(slot: AvailabilitySlot) {
  const [startHour, startMin] = slot.start.split(":").map(Number);
  const [endHour, endMin] = slot.end.split(":").map(Number);
  return endHour + endMin / 60 - (startHour + startMin / 60);
}
export function ToPascalCase(val: string) {
  return val.charAt(0).toUpperCase() + val.slice(1);
}
export function getValidEndTimes(startTime: string) {
  const startIndex = timeOptions.indexOf(startTime);
  return timeOptions.filter((_, index) => index > startIndex);
}

export type ImageType = "jpg" | "jpeg" | "png" | "gif" | "svg";
export type VideoType = "mp4" | "mov";
export type AudioType = "mp3" | "wav";
export type ArchiveType = "zip" | "rar";
export type DocType = "doc" | "docx" | "xls" | "xlsx" | "csv" | "pptx";
export type CodeType =
  | "js"
  | "jsx"
  | "ts"
  | "tsx"
  | "html"
  | "css"
  | "json"
  | "txt"
  | "ejs"
  | "go"
  | "c"
  | "cpp";
export type supportedExtentions =
  | ImageType
  | AudioType
  | VideoType
  | ArchiveType
  | DocType
  | CodeType
  | "pdf";

export function fileExtention(fileName: string) {
  return fileName?.split(".").at(-1) as supportedExtentions;
}
export const getIconForFileExtension = (extension: supportedExtentions) => {
  switch (extension) {
    case "pdf":
    case "doc":
    case "docx":
      return FileText;
    case "js":
    case "jsx":
    case "ts":
    case "tsx":
    case "html":
    case "css":
      return FileCode;
    case "json":
      return FileJson;
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
    case "svg":
      return FileImage;
    case "zip":
    case "rar":
      return FileArchive;
    case "mp4":
    case "mov":
      return FileVideo;
    case "mp3":
    case "wav":
      return FileAudio;
    case "xls":
    case "xlsx":
    case "csv":
      return FileSpreadsheet;
    default:
      return FileText;
  }
};
export function removeFileExtension(fileName: string) {
  if (!fileName) {
    return "";
  }
  const trimmedName = fileName.trim();
  const lastDotIndex = trimmedName.lastIndexOf(".");

  if (lastDotIndex <= 0) {
    return trimmedName;
  }
  return trimmedName.substring(0, lastDotIndex);
}
const imageExtensions: ImageType[] = ["jpg", "jpeg", "png", "gif", "svg"];
const videoExtensions: VideoType[] = ["mp4", "mov"];
const audioExtensions: AudioType[] = ["mp3", "wav"];
const docExtensions: DocType[] = ["csv", "doc", "docx", "xls", "xlsx", "pptx"];
const codeExtensions: CodeType[] = [
  "css",
  "html",
  "js",
  "json",
  "jsx",
  "ts",
  "tsx",
  "txt",
  "c",
  "cpp",
  "ejs",
  "go",
];

export function isImage(ext: supportedExtentions): ext is ImageType {
  return imageExtensions.includes(ext as ImageType);
}

export function isVideo(ext: supportedExtentions): ext is VideoType {
  return videoExtensions.includes(ext as VideoType);
}

export function isAudio(ext: supportedExtentions): ext is AudioType {
  return audioExtensions.includes(ext as AudioType);
}
export function isDoc(ext: supportedExtentions): ext is DocType {
  return docExtensions.includes(ext as DocType);
}

export function isCode(ext: supportedExtentions): ext is CodeType {
  return codeExtensions.includes(ext as CodeType);
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

type SessionActiveType = {
  now: Date;
  sessionDate: string;
  session: AvailabilitySlot;
};

export function isSessionActive({
  session,
  sessionDate,
  now,
}: SessionActiveType) {
  const sessionDay = parseISO(sessionDate);
  const startTime = parse(session.start, "HH:mm", sessionDay);
  const endTime = parse(session.end, "HH:mm", sessionDay);

  return (
    isSameDay(now, sessionDay) &&
    (isAfter(now, startTime) || now.getTime() === startTime.getTime()) &&
    isBefore(now, endTime)
  );
}

export function isBeforeSession({
  session,
  sessionDate,
  now,
}: SessionActiveType) {
  const sessionDay = parseISO(sessionDate);
  const startTime = parse(session.start, "HH:mm", sessionDay);

  return isBefore(now, startTime);
}

export function isAfterSession({
  session,
  sessionDate,
  now,
}: SessionActiveType) {
  const sessionDay = parseISO(sessionDate);
  const endTime = parse(session.end, "HH:mm", sessionDay);

  return isAfter(now, endTime);
}
