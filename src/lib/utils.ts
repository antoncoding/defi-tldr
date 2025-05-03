import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Helper to generate slugs for headings
export const generateSlug = (text: string): string => {
  if (!text) return 'heading-' + Math.random().toString(36).substring(7);
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')            // Replace spaces with hyphens
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove markdown links but keep text
    .replace(/[^¿-῿Ⰰ-퟿\w\s-]/g, '') // Remove non-word chars except specified unicode ranges
    .replace(/[\s_-]+/g, '-')        // Replace whitespace/underscores with single hyphen
    .replace(/^-+|-+$/g, '');       // Trim leading/trailing hyphens
};
