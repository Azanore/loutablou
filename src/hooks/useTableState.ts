// Purpose: Composes useColumnState, usePipelineState, and useSelectionState into the full table state.
// This hook is the single public API for DataTable — consumers destructure from here only.
// Related files: src/types/table.ts, src/hooks/useColumnState.ts,
//                src/hooks/usePipelineState.ts, src/hooks/useSelectionState.ts
// Must not include: aggregation state or direct useState calls.

import { useMemo } from 'react'
import type { ColumnDef, Density, NormalizedColumnDef, ResolvedRow, RowData, SortState, MultiFilterState, SelectionState, PaginationState } from '../types/table'
import { normalizeColumn } from '../utils/normalizeColumn'
import { resolveRowIdentity } from '../utils/resolveRowIdentity'
import { useColumnState } from './useColumnState'
import { usePipelineState } from './usePipelineState'
import { useSelectionState } from './useSelectionState'

export interface DataTableProps {
  columnDefs: ColumnDef[]
  rowData: RowData[]
  defaultDensity?: Density
  density?: Density
  onDensityChange?: (density: Density) => void
  visibleColumns?: string[]
  onVisibilityChange?: (key: string, visible: boolean) => void
  sortState?: SortState
  onSortChange?: (state: SortState) => void
  defaultPageSize?: number
}

/** Composes all table state concerns into a single public API for DataTable. */
export function useTableState(props: DataTableProps): {
  density: Density
  setDensity: (d: Density) => void
  visibleColumnKeys: string[]
  setVisibleColumnKeys: (keys: string[]) => void
  columnOrder: string[]
  setColumnOrder: (order: string[]) => void
  columnWidths: Record<string, number>
  setColumnWidth: (key: string, width: number) => void
  pinnedColumns: string[]
  togglePinnedColumn: (key: string) => void
  normalizedColumns: NormalizedColumnDef[]
  resolvedRows: ResolvedRow[]
  sortState: SortState
  setSortState: (state: SortState) => void
  multiFilterState: MultiFilterState
  setMultiFilterState: (state: MultiFilterState) => void
  globalSearch: string
  setGlobalSearch: (q: string) => void
  pagination: PaginationState
  setPagination: (p: PaginationState) => void
  selectedRowIds: SelectionState
  toggleRowSelection: (id: number, shiftKey: boolean, visibleRows: ResolvedRow[]) => void
  toggleAllSelection: (visibleRows: ResolvedRow[]) => void
  clearSelection: () => void
} {
  const normalizedColumns = useMemo(
    () => props.columnDefs.map(normalizeColumn),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  const resolvedRows = useMemo(
    () => resolveRowIdentity(props.rowData),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  const pipeline = usePipelineState(props)
  const selection = useSelectionState()

  // Wire filter/search changes to clear selection — passed into pipeline so it can call it.
  const originalSetMultiFilter = pipeline.setMultiFilterState
  const originalSetGlobalSearch = pipeline.setGlobalSearch

  function setMultiFilterState(state: MultiFilterState) {
    originalSetMultiFilter(state)
    selection.resetSelection()
  }

  function setGlobalSearch(q: string) {
    originalSetGlobalSearch(q)
    selection.resetSelection()
  }

  const columns = useColumnState(props, pipeline.setMultiFilterStateUpdater)

  return {
    ...columns,
    normalizedColumns,
    resolvedRows,
    sortState: pipeline.sortState,
    setSortState: pipeline.setSortState,
    multiFilterState: pipeline.multiFilterState,
    setMultiFilterState,
    globalSearch: pipeline.globalSearch,
    setGlobalSearch,
    pagination: pipeline.pagination,
    setPagination: pipeline.setPagination,
    selectedRowIds: selection.selectedRowIds,
    toggleRowSelection: selection.toggleRowSelection,
    toggleAllSelection: selection.toggleAllSelection,
    clearSelection: selection.clearSelection,
  }
}
