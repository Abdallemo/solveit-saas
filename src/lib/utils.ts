import { AvailabilitySlot } from "@/features/mentore/server/types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString();
};
export const formatDateAndTime = (date: Date) => {
  return date.toLocaleDateString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  });
};

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
  "bg-purple-100 text-purple-800",
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

import {
  FileText,
  FileCode,
  FileImage,
  FileArchive,
  FileVideo,
  FileAudio,
  FileSpreadsheet,
  FileJson,
  FileType,
} from "lucide-react";
export type supportedExtentions =
  | "pdf"
  | "doc"
  | "docx"
  | "js"
  | "jsx"
  | "ts"
  | "tsx"
  | "html"
  | "css"
  | "json"
  | "jpg"
  | "jpeg"
  | "png"
  | "gif"
  | "svg"
  | "zip"
  | "rar"
  | "mp4"
  | "mov"
  | "mp3"
  | "wav"
  | "xls"
  | "xlsx"
  | "csv";

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
