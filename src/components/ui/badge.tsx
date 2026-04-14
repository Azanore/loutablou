// Purpose: Small inline badge for counts and status labels.
// Related: src/lib/utils.ts

import * as React from 'react'
import { cn } from '@/lib/utils'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'accent' | 'muted'
}

/** Inline badge — use for row counts, selection counts, status chips. */
export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      data-slot="badge"
      className={cn(
        'inline-flex items-center rounded-[var(--radius-sm)] px-2 py-0.5 text-xs font-medium',
        variant === 'default' && 'bg-surface-raised text-text-secondary border border-border',
        variant === 'accent'  && 'bg-accent-subtle text-accent border border-accent-border',
        variant === 'muted'   && 'bg-surface text-text-muted',
        className
      )}
      {...props}
    />
  )
}
