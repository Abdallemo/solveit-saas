import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString();
};

export function parseDeadline(value: string): Date | null {
  const now = new Date();
  console.log('deadline Values: '+value)
  switch (value) {
    case "24h":
      return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    case "48h":
      return new Date(now.getTime() + 48 * 60 * 60 * 1000);
    case "3days":
      return new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    case "7days":
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    default:
      return null;
  }
}
export function truncateText(text: string, maxLength: number): string {
  return text.length > maxLength ? text.slice(0, maxLength).trim() + "..." : text;
}
const badgeColors = [
  "bg-green-100 text-green-800",
  "bg-blue-100 text-blue-800",
  "bg-yellow-100 text-yellow-800",
  "bg-pink-100 text-pink-800",
  "bg-purple-100 text-purple-800",
];

export function getColorClass(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % badgeColors.length;
  return badgeColors[index];
}
