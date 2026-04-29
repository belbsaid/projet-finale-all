import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Safely extracts an array from API responses regardless of nesting shape */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function toArray<T = any>(res: any): T[] {
  const data = res?.data || res;
  if (!data) return [];
  if (Array.isArray(data)) return data as T[];

  // For responses like { success: true, brands: [...] }, find the first array value
  if (typeof data === "object") {
    for (const key of Object.keys(data)) {
      if (Array.isArray(data[key])) return data[key] as T[];
    }
  }
  return [];
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = "DZD") {
  return new Intl.NumberFormat("fr-DZ", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function truncate(str: string, length: number) {
  return str.length > length ? `${str.slice(0, length)}...` : str;
}
