// Purpose: Top-level DataTable component — composes all sub-components and orchestrates state.
// Phases: sort, multi-row filter (OR across rows, AND within), global search, pagination, selection, export.
// Related files: src/hooks/useTableState.ts, src/components/DataTable/TableShell.tsx,
//                src/components/DataTable/TableHeader.tsx, src/components/DataTable/TableBody.tsx,
//                src/components/DataTable/DensityToggle.tsx,
//                src/components/DataTable/ColumnVisibilityPanel.tsx,
//                src/components/DataTable/Pagination.tsx,
//                src/utils/sortEngine.ts, src/utils/filterEngine.ts, src/utils/exportData.ts
// Must not include: aggregation.

import React, { useMemo, useState } from 'react'
import { useTableState } from '../../hooks/useTableState'
import type { DataTableProps } from '../../hooks/useTableState'
import { applySort } from '../../utils/sortEngine'
import { applyFilters } from '../../utils/filterEngine'
import { exportCsv, exportXlsx } from '../../utils/exportData'
import { TableToolbar } from './TableToolbar'
import { Pagination } from './Pagination'
import { TableShell } from './TableShell'
import { TableHeader } from './TableHeader'
import { TableBody } from './TableBody'
import { copySelectionToClipboard } from '../../utils/copyToClipboard'

const CSS_VARS = {
  '--row-height-compact': '32px',
  '--row-height-default': '44px',
  '--row-height-comfortable': '56px',
} as React.CSSProperties

const ROW_NUM_WIDTH = 40
const CHECKBOX_COL_WIDTH = 36

/** Top-level DataTable — wires state, controls, and rendering sub-components together. */
export function DataTable(props: DataTableProps): React.ReactElement {
  const {
    density, setDensity,
    visibleColumnKeys, setVisibleColumnKeys,
    columnOrder, setColumnOrder,
    columnWidths, setColumnWidth,
    pinnedColumns, togglePinnedColumn,
    normalizedColumns, resolvedRows,
    sortState, setSortState,
    multiFilterState, setMultiFilterState,
    globalSearch, setGlobalSearch,
    pagination, setPagination,
    selectedRowIds, toggleRowSelection, toggleAllSelection, clearSelection,
  } = useTableState(props)

  const orderedColumns = useMemo(
    () => columnOrder
      .map(key => normalizedColumns.find(c => c.key === key))
      .filter((c): c is typeof normalizedColumns[number] => c !== undefined),
    [columnOrder, normalizedColumns]
  )

  const visibleNormalizedCols = useMemo(() => {
    const visible = orderedColumns.filter(col => visibleColumnKeys.includes(col.key))
    const pinned = visible.filter(c => pinnedColumns.includes(c.key))
    const unpinned = visible.filter(c => !pinnedColumns.includes(c.key))
    return [...pinned, ...unpinned]
  }, [orderedColumns, visibleColumnKeys, pinnedColumns])

  const pinnedOffsets = useMemo(() => {
    const offsets: Record<string, number> = {}
    let left = ROW_NUM_WIDTH + CHECKBOX_COL_WIDTH
    for (const col of visibleNormalizedCols) {
      if (!pinnedColumns.includes(col.key)) break
      offsets[col.key] = left
      left += columnWidths[col.key] ?? col.width
    }
    return offsets
  }, [visibleNormalizedCols, pinnedColumns, columnWidths])

  // Pipeline: sort → multi-row filter → global search → paginate
  // All three filter stages operate on normalizedColumns (all columns), not visibleNormalizedCols.
  // This is intentional: hiding a column does not remove it from sort/filter/search scope.
  // Visibility only controls what is rendered — the data pipeline is always column-complete.
  const sortedRows = sortState.direction !== 'none'
    ? applySort(resolvedRows, sortState, normalizedColumns)
    : resolvedRows

  const filteredRows = applyFilters(sortedRows, multiFilterState)

  const searchedRows = useMemo(() => {
    const q = globalSearch.trim().toLowerCase()
    if (!q) return filteredRows
    // Search all filterable columns regardless of visibility — hiding a column
    // should not silently narrow the search scope.
    const filterableCols = normalizedColumns.filter(c => c.filterable)
    return filteredRows.filter(row =>
      filterableCols.some(col => {
        const val = row[col.key]
        return val !== null && val !== undefined && String(val).toLowerCase().includes(q)
      })
    )
  }, [filteredRows, globalSearch, normalizedColumns])

  const totalFilteredRows = searchedRows.length
  const { page, pageSize } = pagination
  const totalPages = Math.max(1, Math.ceil(totalFilteredRows / pageSize))
  const safePage = Math.min(page, totalPages - 1)
  const pagedRows = searchedRows.slice(safePage * pageSize, (safePage + 1) * pageSize)

  const hasActiveFilters = multiFilterState.some(row => Object.keys(row).length > 0)
  const anyFilterActive = hasActiveFilters || globalSearch !== ''
  const activeFilterCount = multiFilterState.reduce((n, row) => n + Object.keys(row).length, 0)
    + (globalSearch !== '' ? 1 : 0)
  const [copyLabel, setCopyLabel] = useState<'Copy' | 'Copied!'>('Copy')
  const [exportLoading, setExportLoading] = useState(false)

  // Fix 1: copy searches all filtered rows for selected IDs, not just current page.
  // This ensures selections made on other pages are included in the copy.
  async function handleCopy() {
    await copySelectionToClipboard(searchedRows, visibleNormalizedCols, selectedRowIds)
    setCopyLabel('Copied!')
    setTimeout(() => setCopyLabel('Copy'), 2000)
  }

  function handleVisibilityChange(key: string, visible: boolean) {
    const next = visible
      ? [...visibleColumnKeys, key]
      : visibleColumnKeys.filter(k => k !== key)
    setVisibleColumnKeys(next)
  }

  function handleClearAllFilters() {
    setMultiFilterState([{}])
    setGlobalSearch('')
    clearSelection()
  }

  async function handleExportCsv() {
    exportCsv(searchedRows, visibleNormalizedCols)
  }

  async function handleExportXlsx() {
    setExportLoading(true)
    try {
      await exportXlsx(searchedRows, visibleNormalizedCols)
    } finally {
      setExportLoading(false)
    }
  }

  return (
    <div className="p-4 font-sans bg-canvas min-h-screen">
      <TableToolbar
        density={density}
        onDensityChange={setDensity}
        columns={normalizedColumns}
        visibleColumns={visibleColumnKeys}
        onVisibilityChange={handleVisibilityChange}
        anyFilterActive={anyFilterActive}
        activeFilterCount={activeFilterCount}
        onClearFilters={handleClearAllFilters}
        globalSearch={globalSearch}
        onGlobalSearchChange={setGlobalSearch}
        onExportCsv={handleExportCsv}
        onExportXlsx={handleExportXlsx}
        exportLoading={exportLoading}
        selectedRowIds={selectedRowIds}
        copyLabel={copyLabel}
        onCopy={handleCopy}
        onClearSelection={clearSelection}
        totalFilteredRows={totalFilteredRows}
        totalRows={resolvedRows.length}
      />

      {/* Table */}
      <TableShell
        cssVars={CSS_VARS}
        colgroup={
          <colgroup>
            <col style={{ width: `${ROW_NUM_WIDTH}px` }} />
            <col style={{ width: `${CHECKBOX_COL_WIDTH}px` }} />
            {visibleNormalizedCols.map(col => (
              <col key={col.key} style={{ width: `${columnWidths[col.key] ?? col.width}px` }} />
            ))}
          </colgroup>
        }
        thead={
          <TableHeader
            columns={visibleNormalizedCols}
            sortState={sortState}
            onSortChange={setSortState}
            multiFilterState={multiFilterState}
            onMultiFilterChange={setMultiFilterState}
            columnOrder={columnOrder}
            onColumnReorder={setColumnOrder}
            columnWidths={columnWidths}
            onColumnResize={setColumnWidth}
            pinnedColumns={pinnedColumns}
            onTogglePin={togglePinnedColumn}
            pinnedOffsets={pinnedOffsets}
            selectedRowIds={selectedRowIds}
            visibleRows={pagedRows}
            onToggleAll={() => toggleAllSelection(pagedRows)}
          />
        }
        tbody={
          <TableBody
            rows={pagedRows}
            columns={visibleNormalizedCols}
            rowOffset={safePage * pageSize}
            density={density}
            emptyVariant={anyFilterActive ? 'filtered' : 'empty'}
            onClearFilters={handleClearAllFilters}
            pinnedColumns={pinnedColumns}
            pinnedOffsets={pinnedOffsets}
            selectedRowIds={selectedRowIds}
            onToggleRow={(id, shiftKey) => toggleRowSelection(id, shiftKey, pagedRows)}
          />
        }
      />

      {/* Pagination */}
      <Pagination
        pagination={{ page: safePage, pageSize }}
        totalRows={totalFilteredRows}
        onPageChange={p => setPagination({ page: p, pageSize })}
        onPageSizeChange={s => setPagination({ page: 0, pageSize: s })}
      />
    </div>
  )
}
