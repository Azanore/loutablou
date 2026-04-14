// Purpose: Native select wrapper styled to match the dark theme.
// Used for boolean filter dropdowns. Radix Select is overkill for a 3-option filter.
// Related: src/lib/utils.ts

import * as React from 'react'
import { cn } from '@/lib/utils'

/** Styled native select — used for boolean filter (All / Yes / No). */
export function Select({ className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      data-slot="select"
      className={cn(
        'w-full bg-surface border border-border-subtle rounded-[var(--radius-sm)]',
        'px-2 py-1 text-xs text-text-primary',
        'transition-colors focus:outline-none focus:border-accent/60',
        'appearance-none cursor-pointer',
        className
      )}
      {...props}
    />
  )
}
