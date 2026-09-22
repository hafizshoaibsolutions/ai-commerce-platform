import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind classes, letting later classes win over earlier conflicting
 * ones. Used by every UI primitive so callers can override styles safely.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Up to two initials for an avatar fallback, e.g. "Ada Lovelace" -> "AL".
 */
export function getInitials(name: string | null | undefined): string {
  if (!name) return "?";

  return (
    name
      .trim()
      .split(/\s+/)
      .map((part) => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?"
  );
}
