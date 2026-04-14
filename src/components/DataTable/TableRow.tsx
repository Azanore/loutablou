// Purpose: Renders a single <tr> with row-number, checkbox, and one <td> per visible column.
// Related: src/types/table.ts, src/utils/formatCellValue.ts, src/utils/densityTokens.ts
// Must not include: sorting, filtering, or state management.

import React from 'react'
import type { NormalizedColumnDef, ResolvedRow, Density, ColumnAlign } from '../../types/table'
import { formatCellValue } from '../../utils/formatCellValue'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'

interface TableRowProps {
  row: ResolvedRow
  columns: NormalizedColumnDef[]
  rowIndex: number
  density: Density
  pinnedColumns?: string[]
  pinnedOffsets?: Record<string, number>
  isSelected?: boolean
  onToggle?: (shiftKey: boolean) => void
}

// RULE: Static lookup — Tailwind v4 requires static strings for purging.
const ALIGN_CLASS: Record<ColumnAlign, string> = {
  left:   'text-left',
  right:  'text-right',
  center: 'text-center',
}

const DENSITY_TD_CLASS: Record<Density, string> = {
  compact:     'py-1 text-xs',
  default:     'py-2.5 text-sm',
  comfortable: 'py-4 text-sm',
}


/** Renders one table row with formatted cell values, density-aware styling, and selection state. */
export function TableRow({
  row, columns, rowIndex, density,
  pinnedColumns = [], pinnedOffsets = {},
  isSelected = false, onToggle = () => {},
}: TableRowProps) {
  const densityClass = DENSITY_TD_CLASS[density]

  // Alternating row backgrounds — uses CSS vars so both themes work
  const stripedBg = rowIndex % 2 === 1 ? 'bg-row-stripe' : ''
  const selectedBg = isSelected ? 'bg-row-selected' : stripedBg
  const hoverClass = isSelected ? 'hover:bg-accent-subtle/50' : 'hover:bg-row-hover'
  const accentBorder = isSelected ? 'border-l-[3px] border-l-accent' : 'border-l-[3px] border-l-transparent'

  // Pinned cell bg must be opaque — transparent bg bleeds scrolling content through.
  // Selected rows use a dedicated opaque token instead of the semi-transparent row-selected.
  const pinnedBg = isSelected ? 'bg-row-selected-pinned' : (rowIndex % 2 === 1 ? 'bg-row-stripe-pinned' : 'bg-surface-pinned')

  function handleRowClick(e: React.MouseEvent) {
    const target = e.target as HTMLElement
    if (target.closest('input, button, a, select')) return
    onToggle(e.shiftKey)
  }

  return (
    <tr
      className={cn(
        selectedBg, hoverClass, accentBorder,
        'border-b border-border-subtle transition-colors cursor-pointer'
      )}
      onClick={handleRowClick}
    >
      {/* Row number — sticky left */}
      <td className={cn(densityClass, 'px-2 text-right tabular-nums text-text-muted border-r border-border-subtle sticky left-0 z-10', pinnedBg)}>
        {rowIndex + 1}
      </td>
      {/* Checkbox — sticky left after row number */}
      <td className={cn(densityClass, 'px-2 text-center border-r border-border-subtle sticky left-10 z-10', pinnedBg)}>
        <Checkbox
          checked={isSelected}
          onCheckedChange={(_checked) => onToggle(false)}
          onClick={(e) => { e.stopPropagation() }}
          aria-label={`Select row ${rowIndex + 1}`}
        />
      </td>
      {columns.map((col, i) => {
        const isPinned = pinnedColumns.includes(col.key)
        const stickyStyle = isPinned ? { left: pinnedOffsets[col.key] } : undefined
        const stickyClass = isPinned ? cn('sticky z-10', pinnedBg, 'shadow-[2px_0_8px_rgba(0,0,0,0.25)]') : ''
        const divider = i < columns.length - 1 ? 'border-r border-border-subtle' : ''
        return (
          <td
            key={col.key}
            style={stickyStyle}
            className={cn(densityClass, 'px-2 break-words', ALIGN_CLASS[col.align], divider, stickyClass)}
          >
            {formatCellValue(row[col.key], col.type)}
          </td>
        )
      })}
    </tr>
  )
}
