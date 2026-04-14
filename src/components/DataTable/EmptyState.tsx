// Purpose: Renders an empty or error state row spanning the full table width.
// Variants: empty (no data), filtered (filters returned nothing), error (data error).
// Related: src/components/DataTable/TableBody.tsx, src/types/table.ts
// Must not include: state management or side effects beyond the onClearFilters callback.

import React from 'react'
import { Inbox, AlertCircle, SearchX } from 'lucide-react'

interface EmptyStateProps {
  variant: 'empty' | 'filtered' | 'error'
  colSpan: number
  onClearFilters?: () => void
}

const CONFIG = {
  empty:    { icon: Inbox,       label: 'No data available',           cls: 'text-text-muted'  },
  filtered: { icon: SearchX,     label: 'No rows match your filters',  cls: 'text-text-muted'  },
  error:    { icon: AlertCircle, label: 'An error occurred',           cls: 'text-red-400/80'  },
} as const

/** Single full-width row with icon + message for empty, filtered, and error states. */
export function EmptyState({ variant, colSpan, onClearFilters }: EmptyStateProps): React.ReactElement {
  const { icon: Icon, label, cls } = CONFIG[variant]
  return (
    <tr>
      <td colSpan={colSpan} className="py-16 text-center">
        <div className={`inline-flex flex-col items-center gap-2 ${cls}`}>
          <Icon className="h-8 w-8 opacity-40" />
          <span className="text-sm">{label}</span>
          {variant === 'filtered' && onClearFilters && (
            <button
              type="button"
              onClick={onClearFilters}
              className="mt-1 text-xs text-accent hover:text-accent-hover transition-colors font-medium"
            >
              Clear filters
            </button>
          )}
        </div>
      </td>
    </tr>
  )
}
