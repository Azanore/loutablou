// Purpose: Base input element for filter fields.
// Related: src/lib/utils.ts

import * as React from 'react'
import { cn } from '@/lib/utils'

/** Styled input — used in filter row cells. */
export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      data-slot="input"
      className={cn(
        'w-full bg-surface border border-border-subtle rounded-[var(--radius-sm)]',
        'px-2 py-1 text-xs text-text-primary placeholder:text-text-muted',
        'transition-colors focus:outline-none focus:border-accent/60 focus:bg-surface-raised',
        className
      )}
      {...props}
    />
  )
}
