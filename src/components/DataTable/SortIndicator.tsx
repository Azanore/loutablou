// Purpose: Renders a sort direction indicator using Lucide icons.
// Related: src/types/table.ts, src/components/DataTable/TableHeader.tsx
// Must not include: click handlers, sort logic, state management.

import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react'
import type { SortDirection } from '../../types/table'

interface SortIndicatorProps {
  direction: SortDirection
}

/** Lucide-based sort indicator — asc, desc, or neutral. */
export function SortIndicator({ direction }: SortIndicatorProps) {
  return (
    <span className="inline-flex items-center ml-1 text-text-header-muted" data-direction={direction}>
      {direction === 'asc'  && <ArrowUp   className="h-3 w-3 text-text-header" />}
      {direction === 'desc' && <ArrowDown  className="h-3 w-3 text-text-header" />}
      {direction === 'none' && <ArrowUpDown className="h-3 w-3 text-text-header-muted opacity-50" />}
    </span>
  )
}
