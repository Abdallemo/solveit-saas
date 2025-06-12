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