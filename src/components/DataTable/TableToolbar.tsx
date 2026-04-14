// Purpose: Toolbar strip above the table — density, columns, search, export, selection bar, row count.
// Groups: [View: density, columns] | [Data: search, filter indicator] | [Actions: export] → [Selection + count]
// Related: src/components/DataTable/DataTable.tsx, src/hooks/useTableState.ts
// Must not include: pipeline logic, filter execution, or pagination.

import { Search, Download, FileSpreadsheet, X } from 'lucide-react'
import type { NormalizedColumnDef, SelectionState, Density } from '../../types/table'
import { DensityToggle } from './DensityToggle'
import { ColumnVisibilityPanel } from './ColumnVisibilityPanel'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

interface TableToolbarProps {
  density: Density
  onDensityChange: (d: Density) => void
  columns: NormalizedColumnDef[]
  visibleColumns: string[]
  onVisibilityChange: (key: string, visible: boolean) => void
  anyFilterActive: boolean
  activeFilterCount: number
  onClearFilters: () => void
  globalSearch: string
  onGlobalSearchChange: (q: string) => void
  onExportCsv: () => void
  onExportXlsx: () => void
  exportLoading: boolean
  selectedRowIds: SelectionState
  copyLabel: 'Copy' | 'Copied!'
  onCopy: () => void
  onClearSelection: () => void
  totalFilteredRows: number
  totalRows: number
}

// Thin vertical divider between toolbar groups.
function Divider() {
  return <div className="w-px h-5 bg-border flex-none" aria-hidden="true" />
}

/** Toolbar above the table — all controls except the table itself and pagination. */
export function TableToolbar({
  density, onDensityChange,
  columns, visibleColumns, onVisibilityChange,
  anyFilterActive, activeFilterCount, onClearFilters,
  globalSearch, onGlobalSearchChange,
  onExportCsv, onExportXlsx, exportLoading,
  selectedRowIds, copyLabel, onCopy, onClearSelection,
  totalFilteredRows, totalRows,
}: TableToolbarProps) {
  const selectionCount = selectedRowIds.size

  return (
    <div className="flex items-center gap-2 mb-3 flex-wrap">

      {/* Group 1 — View controls */}
      <DensityToggle density={density} onDensityChange={onDensityChange} />
      <ColumnVisibilityPanel
        columns={columns}
        visibleColumns={visibleColumns}
        onVisibilityChange={onVisibilityChange}
      />

      <Divider />

      {/* Group 2 — Filter / Search */}
      {/* Search input */}
      <div className="relative flex items-center">
        <Search className="absolute left-2.5 h-3.5 w-3.5 text-text-muted pointer-events-none" />
        <Input
          type="text"
          placeholder="Search all columns…"
          value={globalSearch}
          onChange={e => onGlobalSearchChange(e.target.value)}
          className="pl-8 w-52 text-xs h-9"
        />
        {globalSearch !== '' && (
          <button
            type="button"
            onClick={() => onGlobalSearchChange('')}
            className="absolute right-2 text-text-muted hover:text-text-secondary transition-colors cursor-pointer"
            aria-label="Clear search"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* Filter indicator + clear — always present, styled by active state */}
      {anyFilterActive && (
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[var(--radius-md)] border border-accent-border bg-accent-subtle">
          <span className="h-1.5 w-1.5 rounded-full bg-accent flex-none" aria-hidden="true" />
          <span className="text-xs text-accent font-medium tabular-nums">
            {activeFilterCount} {activeFilterCount === 1 ? 'filter' : 'filters'} active
          </span>
          <button
            type="button"
            onClick={onClearFilters}
            className="ml-1 text-accent/60 hover:text-accent transition-colors cursor-pointer"
            aria-label="Clear all filters"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}

      <Divider />

      {/* Group 3 — Actions */}
      <Popover>
        <PopoverTrigger asChild>
          <Button type="button" variant="default" size="default" disabled={exportLoading} aria-label="Export">
            <Download className="h-3.5 w-3.5" />
            <span>Export</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="min-w-[160px] p-1">
          <button
            type="button"
            onClick={onExportCsv}
            className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-text-secondary hover:bg-surface-raised hover:text-text-primary rounded-[var(--radius-sm)] transition-colors cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </button>
          <button
            type="button"
            onClick={onExportXlsx}
            className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-text-secondary hover:bg-surface-raised hover:text-text-primary rounded-[var(--radius-sm)] transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
            Export Excel
          </button>
        </PopoverContent>
      </Popover>

      {/* Selection bar — contextual, appears when rows are selected */}
      {selectionCount > 0 && (
        <div className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-[var(--radius-md)]',
          'border border-accent-border bg-accent-subtle'
        )}>
          <Badge variant="accent">{selectionCount} selected</Badge>
          <button
            type="button"
            onClick={onCopy}
            className="text-xs text-accent hover:text-accent-hover transition-colors font-medium cursor-pointer"
          >
            {copyLabel}
          </button>
          <span className="text-border-strong text-xs">|</span>
          <button
            type="button"
            onClick={onClearSelection}
            className="text-xs text-text-muted hover:text-text-secondary transition-colors cursor-pointer"
          >
            Deselect all
          </button>
        </div>
      )}

      {/* Row count — always right-aligned */}
      <span className="ml-auto text-xs text-text-muted tabular-nums">
        {totalFilteredRows < totalRows
          ? `${totalFilteredRows} of ${totalRows} rows`
          : `${totalRows} rows`}
      </span>
    </div>
  )
}
