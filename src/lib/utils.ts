// Purpose: cn() helper — merges Tailwind classes safely via clsx + tailwind-merge.
// Used by all shadcn-style components. No other logic here.

import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
