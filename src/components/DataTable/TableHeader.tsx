// Purpose: Renders <thead> with sticky header row, sort controls, filter inputs, and select-all checkbox.
// Supports multiple filter rows — rows are OR'd together, conditions within a row are AND'd.
// Related: src/types/table.ts, src/utils/sortEngine.ts, src/components/DataTable/SortIndicator.tsx,
//          src/utils/filterEngine.ts
// Must not include: density logic, row rendering, or state management beyond emitting changes.

import React from 'react'
import { Pin, PinOff, Plus, Trash2 } from 'lucide-react'
import type { NormalizedColumnDef, ColumnAlign, SortState, MultiFilterState, SelectionState, ResolvedRow } from '../../types/table'
import { SortCycle } from '../../utils/sortEngine'
import { SortIndicator } from './SortIndicator'
import { filterTypeFor } from '../../utils/columnTypeUtils'
import { renderFilterInput } from './FilterInputs'
import { ResizeHandle, useColumnDrag } from './ColumnInteractions'
import { Checkbox } from '@/components/ui/checkbox'
// Checkbox is used in the label row for select-all — not in EnumFilter
import { cn } from '@/lib/utils'

const DEFAULT_SORT_STATE: SortState = { columnKey: '', direction: 'none' }
const DEFAULT_MULTI_FILTER: MultiFilterState = [{}]

interface TableHeaderProps {
  columns: NormalizedColumnDef[]
  sortState?: SortState
  onSortChange?: (state: SortState) => void
  multiFilterState?: MultiFilterState
  onMultiFilterChange?: (state: MultiFilterState) => void
  columnOrder?: string[]
  onColumnReorder?: (order: string[]) => void
  columnWidths?: Record<string, number>
  onColumnResize?: (key: string, width: number) => void
  pinnedColumns?: string[]
  onTogglePin?: (key: string) => void
  pinnedOffsets?: Record<string, number>
  selectedRowIds?: SelectionState
  visibleRows?: ResolvedRow[]
  onToggleAll?: () => void
}

// Label text alignment within the flex-1 label span.
const LABEL_ALIGN_CLASS: Record<ColumnAlign, string> = {
  left:   'text-left',
  right:  'text-right',
  center: 'text-center',
}

function nextSortState(col: NormalizedColumnDef, sortState: SortState): SortState {
  const currentDirection = sortState.columnKey === col.key ? sortState.direction : 'none'
  const nextDirection = SortCycle(currentDirection)
  return nextDirection === 'none'
    ? { columnKey: '', direction: 'none' }
    : { columnKey: col.key, direction: nextDirection }
}

/** Renders <thead> with one or more filter rows + label row. Filter rows are OR'd together. */
export function TableHeader({
  columns,
  sortState = DEFAULT_SORT_STATE,
  onSortChange = () => {},
  multiFilterState = DEFAULT_MULTI_FILTER,
  onMultiFilterChange = () => {},
  columnOrder,
  onColumnReorder = () => {},
  columnWidths,
  onColumnResize = () => {},
  pinnedColumns = [],
  onTogglePin = () => {},
  pinnedOffsets = {},
  selectedRowIds = new Set(),
  visibleRows = [],
  onToggleAll = () => {},
}: TableHeaderProps): React.ReactElement {
  const { getDragProps } = useColumnDrag(columnOrder, onColumnReorder)

  const allSelected = visibleRows.length > 0 && visibleRows.every(r => selectedRowIds.has(r._tableRowId))
  const someSelected = !allSelected && visibleRows.some(r => selectedRowIds.has(r._tableRowId))

  // Radix Checkbox supports 'indeterminate' as a checked value natively
  const selectAllState: boolean | 'indeterminate' = someSelected ? 'indeterminate' : allSelected

  // Shared sticky cell classes
  const stickyBase = 'sticky z-10'
  // Both rows share the same bg — they form one unified header zone
  const filterRowBg = 'bg-surface-raised'
  const headerRowBg = 'bg-surface-header'

  // Helpers for multi-filter row mutations
  function handleFilterChange(rowIndex: number, key: string, filter: import('../../types/table').ColumnFilter | null) {
    const next = multiFilterState.map((row, i) => {
      if (i !== rowIndex) return row
      const updated = { ...row }
      if (filter === null) { delete updated[key] } else { updated[key] = filter }
      return updated
    })
    onMultiFilterChange(next)
  }

  function addFilterRow() {
    onMultiFilterChange([...multiFilterState, {}])
  }

  function removeFilterRow(rowIndex: number) {
    // Always keep at least one row
    const next = multiFilterState.filter((_, i) => i !== rowIndex)
    onMultiFilterChange(next.length > 0 ? next : [{}])
  }

  return (
    <thead>
      {multiFilterState.map((filterRow, rowIndex) => {
        const isLast = rowIndex === multiFilterState.length - 1
        const isOnly = multiFilterState.length === 1
        return (
          <tr key={rowIndex} className="border-b border-border">
            {/* Row number cell — shows OR label for extra rows, or empty for first */}
            <td className={cn('px-2 py-1 w-10 border-r border-border', stickyBase, 'left-0', filterRowBg)}>
              {rowIndex > 0 && (
                <span className="flex items-center justify-center text-[9px] font-bold text-accent uppercase tracking-widest">OR</span>
              )}
            </td>
            {/* Checkbox cell — add row button on last row, remove on others */}
            <td className={cn('px-1 py-1 w-9 border-r border-border text-center', stickyBase, 'left-10', filterRowBg)}>
              {isLast ? (
                <button
                  type="button"
                  onClick={addFilterRow}
                  className="p-1 rounded text-text-muted hover:text-accent hover:bg-accent/10 transition-colors cursor-pointer"
                  aria-label="Add OR filter row"
                  title="Add OR row"
                >
                  <Plus className="h-3 w-3" />
                </button>
              ) : !isOnly ? (
                <button
                  type="button"
                  onClick={() => removeFilterRow(rowIndex)}
                  className="p-1 rounded text-text-muted hover:text-red-400 hover:bg-red-400/10 transition-colors cursor-pointer"
                  aria-label="Remove filter row"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              ) : null}
            </td>
            {columns.map((col, i) => {
              const isPinned = pinnedColumns.includes(col.key)
              const stickyStyle = isPinned ? { left: pinnedOffsets[col.key] } : undefined
              const divider = i < columns.length - 1 ? 'border-r border-border' : ''
              return (
                <td
                  key={col.key}
                  style={stickyStyle}
                  className={cn('px-2 py-1 min-w-0 overflow-hidden', divider, isPinned && cn(stickyBase, filterRowBg, 'shadow-[2px_0_8px_rgba(0,0,0,0.3)]'))}
                >
                  {col.filterable && renderFilterInput(
                    filterTypeFor(col.type),
                    col.key,
                    col,
                    filterRow[col.key],
                    (k, f) => handleFilterChange(rowIndex, k, f)
                  )}
                </td>
              )
            })}
          </tr>
        )
      })}

      {/* Label row — border-strong is the zone boundary separating header from data */}
      <tr className="border-b-2 border-border-strong">
        <th className={cn('font-medium text-[11px] text-text-header-muted uppercase tracking-widest px-2 py-2.5 text-right w-10 border-r border-border', stickyBase, 'left-0', headerRowBg)}>
          #
        </th>
        <th className={cn('px-2 py-2.5 w-9 border-r border-border text-center', stickyBase, 'left-10', headerRowBg)}>
          <Checkbox
            checked={selectAllState}
            onCheckedChange={onToggleAll}
            aria-label="Select all rows on this page"
          />
        </th>
        {columns.map((col, i) => {
          const colDirection = sortState.columnKey === col.key ? sortState.direction : 'none'
          const isPinned = pinnedColumns.includes(col.key)
          const pinLeft = pinnedOffsets[col.key]
          const stickyStyle = isPinned ? { left: pinLeft } : undefined
          const divider = i < columns.length - 1 ? 'border-r border-border' : ''
          const dragProps = getDragProps(col.key, isPinned)

          const thClass = cn(
            'group relative font-medium text-[11px] text-text-header-muted uppercase tracking-widest px-2 py-2.5 select-none',
            headerRowBg,
            divider,
            isPinned && cn(stickyBase, 'shadow-[2px_0_8px_rgba(0,0,0,0.3)]'),
            col.sortable ? 'cursor-pointer hover:text-text-header' : 'cursor-grab'
          )

          return (
            <th
              key={col.key}
              {...dragProps}
              style={stickyStyle}
              className={thClass}
              onClick={col.sortable ? () => onSortChange(nextSortState(col, sortState)) : undefined}
            >
              {/* Flex row: label+sort on one side, pin button allocated on the right */}
              <div className="flex items-center gap-1">
                <span className={cn('flex items-center gap-0.5 flex-1 min-w-0 truncate', LABEL_ALIGN_CLASS[col.align])}>
                  {col.label}
                  {col.sortable && <SortIndicator direction={colDirection} />}
                </span>
                {/* Pin slot — always reserves space so layout never shifts on hover */}
                <button
                  type="button"
                  onClick={e => { e.stopPropagation(); onTogglePin(col.key) }}
                  className={cn(
                    'flex-none opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded text-text-header-muted hover:text-text-header hover:bg-white/10 active:bg-white/20 cursor-pointer',
                    isPinned && 'opacity-100 text-text-header'
                  )}
                  title={isPinned ? 'Unpin column' : 'Pin column'}
                  aria-label={isPinned ? 'Unpin column' : 'Pin column'}
                >
                  {isPinned
                    ? <PinOff className="h-3 w-3" />
                    : <Pin    className="h-3 w-3" />
                  }
                </button>
              </div>
              {columnWidths && <ResizeHandle colKey={col.key} onResize={onColumnResize} />}
            </th>
          )
        })}
      </tr>
    </thead>
  )
}
