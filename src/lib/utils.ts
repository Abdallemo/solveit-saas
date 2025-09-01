import { AvailabilitySlot } from "@/features/mentore/server/action";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString();
};

export function isError(err: unknown): err is Error {
  return typeof err === "object" && err !== null && "message" in err;
}
export function truncateText(text: string, maxLength: number): string {
  return text.length > maxLength
    ? text.slice(0, maxLength).trim() + "..."
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
  // "text-blue-800",
  // "text-yellow-800",
  // "text-pink-800",
  // "text-purple-800",
  // "text-purple-800",
  // "text-cyan-800",
  // "text-amber-800",
  // "text-indigo-800",
  // "text-teal-700",
  // "text-violet-700",
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
export function calculateSlotDuration  (slot: AvailabilitySlot) {
  const [startHour, startMin] = slot.start.split(":").map(Number);
  const [endHour, endMin] = slot.end.split(":").map(Number);
  return endHour + endMin / 60 - (startHour + startMin / 60);
};
export function ToPascalCase(val: string) {
  return val.charAt(0).toUpperCase() + val.slice(1);
}
export function getValidEndTimes(startTime: string) {
  const startIndex = timeOptions.indexOf(startTime);
  return timeOptions.filter((_, index) => index > startIndex);
}