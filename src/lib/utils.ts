import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString();
};

export function parseDeadline(
  value: string,
  baseTime: Date = new Date()
): Date | null {
  const base = baseTime.getTime();
  switch (value) {
    case "12h":
      return new Date(base + 12 * 60 * 60 * 1000);
    case "24h":
      return new Date(base + 24 * 60 * 60 * 1000);
    case "48h":
      return new Date(base + 48 * 60 * 60 * 1000);
    case "3days":
      return new Date(base + 3 * 24 * 60 * 60 * 1000);
    case "7days":
      return new Date(base + 7 * 24 * 60 * 60 * 1000);
    default:
      return null;
  }
}
export function calculateProgress(
  deadlineValue: string,
  createdAt: Date
): number {
  const deadline = parseDeadline(deadlineValue, new Date(createdAt));
  if (!deadline) return -1;

  const now = new Date().getTime();
  const created = new Date(createdAt).getTime();
  const end = deadline.getTime();

  const totalDuration = end - created;
  const elapsed = now - created;

  const percentage = Math.min(
    Math.max((elapsed / totalDuration) * 100, 0),
    100
  );
  return percentage;
}
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
export const daysOfWeek = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]

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
]
