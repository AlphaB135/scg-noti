// frontend/src/lib/utils.ts

// นำเข้า clsx เป็น default export พร้อม type ClassValue
import clsx, { type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  // clsx รับ argument แยก ไม่ใช่ array
  return twMerge(clsx(...inputs))
}

export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export function formatDateTime(date: string | Date) {
  return new Date(date).toLocaleString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
  })
}

export function truncateText(text: string, maxLength: number) {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + "..."
}

/**
 * Get initials from a full name
 * @example
 * getInitials("John Doe") // returns "JD"
 */
export function getInitials(name: string): string {
  if (!name) return ""
  return name
    .split(" ")
    .map(part => part[0])
    .join("")
    .toUpperCase()
}
