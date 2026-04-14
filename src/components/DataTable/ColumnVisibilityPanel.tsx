// Purpose: Dropdown panel with one checkbox per column for show/hide control.
// Related: src/types/table.ts, src/components/DataTable/DataTable.tsx
// Must not include: row-number column toggle, internal visibility state, Phase 2+ logic.

import React from 'react'
import { Columns3 } from 'lucide-react'
import type { NormalizedColumnDef } from '../../types/table'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'

interface ColumnVisibilityPanelProps {
  columns: NormalizedColumnDef[]
  visibleColumns: string[]
  onVisibilityChange: (key: string, visible: boolean) => void
}

/** Popover with labeled checkboxes per column in a 2-column grid. */
export function ColumnVisibilityPanel({
  columns,
  visibleColumns,
  onVisibilityChange,
}: ColumnVisibilityPanelProps): React.ReactElement {
  const hiddenCount = columns.length - visibleColumns.length

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button type="button" variant="default" size="default" aria-label="Toggle column visibility">
          <Columns3 className="h-3.5 w-3.5" />
          <span>Columns</span>
          {hiddenCount > 0 && (
            <span className="ml-0.5 text-xs font-semibold text-accent-foreground bg-white/20 rounded px-1">
              {hiddenCount} hidden
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72">
        <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 p-1">
          {columns.map((col) => {
            const isVisible = visibleColumns.includes(col.key)
            return (
              <label
                key={col.key}
                className="flex items-center gap-2 px-2 py-1.5 rounded-[var(--radius-sm)] cursor-pointer select-none text-sm text-text-secondary hover:bg-surface-raised hover:text-text-primary transition-colors"
              >
                <Checkbox
                  checked={isVisible}
                  onCheckedChange={(checked) => onVisibilityChange(col.key, checked === true)}
                />
                <span className="truncate">{col.label}</span>
              </label>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}
