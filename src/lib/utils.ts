import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Decode HTML entities (e.g., &amp; → &) */
export function decodeHTML(value: any): any {
  if (typeof value !== "string") return value;
  // Decode common HTML entities: &, <, >
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

/** Sanitize image URLs – replace spaces with %20 */
export function sanitizeImageUrl(url: string): string {
  return url.replace(/\s+/g, "%20");
}
