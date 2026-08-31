import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * cn — Concatenate Tailwind class names with conflict-resolution.
 * Standard shadcn/ui helper used by every component in /components/ui.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}