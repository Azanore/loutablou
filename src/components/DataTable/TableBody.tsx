// Purpose: Renders <tbody> with one TableRow per row, or EmptyState when rows is empty.
// Related files: src/components/DataTable/TableRow.tsx, src/components/DataTable/EmptyState.tsx,
//                src/types/table.ts
// Must not include: sorting, filtering, or any Phase 2+ logic beyond selection.

import type { NormalizedColumnDef, ResolvedRow, Density, SelectionState } from '../../types/table'
import { TableRow } from './TableRow'
import { EmptyState } from './EmptyState'

interface TableBodyProps {
  rows: ResolvedRow[]
  columns: NormalizedColumnDef[]
  density: Density
  emptyVariant?: 'empty' | 'filtered' | 'error'
  onClearFilters?: () => void
  pinnedColumns?: string[]
  pinnedOffsets?: Record<string, number>
  selectedRowIds?: SelectionState
  onToggleRow?: (id: number, shiftKey: boolean) => void
}

/** Renders the table body — delegates to TableRow per row or EmptyState when rows is empty. */
export function TableBody({ rows, columns, density, emptyVariant = 'empty', onClearFilters, pinnedColumns = [], pinnedOffsets = {}, selectedRowIds = new Set(), onToggleRow = () => {} }: TableBodyProps) {
  if (rows.length === 0) {
    return (
      <tbody>
        <EmptyState colSpan={columns.length + 2} variant={emptyVariant} onClearFilters={onClearFilters} />
      </tbody>
    )
  }

  return (
    <tbody>
      {rows.map((row, index) => (
        <TableRow
          key={row._tableRowId}
          row={row}
          columns={columns}
          rowIndex={index}
          density={density}
          pinnedColumns={pinnedColumns}
          pinnedOffsets={pinnedOffsets}
          isSelected={selectedRowIds.has(row._tableRowId)}
          onToggle={(shiftKey) => onToggleRow(row._tableRowId, shiftKey)}
        />
      ))}
    </tbody>
  )
}
