// Purpose: Manages column layout state — visibility, order, widths, pinning, and density.
// Related files: src/types/table.ts, src/hooks/useTableState.ts
// Must not include: filter, sort, pagination, or selection state.

import { useState } from 'react'
import type { ColumnDef, Density, MultiFilterState } from '../types/table'

interface ColumnStateProps {
  columnDefs: ColumnDef[]
  density?: Density
  defaultDensity?: Density
  onDensityChange?: (d: Density) => void
  visibleColumns?: string[]
  onVisibilityChange?: (key: string, visible: boolean) => void
}

const DEFAULT_DENSITY: Density = 'default'

export function useColumnState(
  props: ColumnStateProps,
  // Passed in so hiding a column can clear its filters atomically
  setMultiFilterState: (updater: (prev: MultiFilterState) => MultiFilterState) => void
) {
  const isControlledDensity = props.density !== undefined && props.onDensityChange !== undefined
  const isControlledVisibility = props.visibleColumns !== undefined && props.onVisibilityChange !== undefined

  const [_density, _setDensity] = useState<Density>(
    () => props.density ?? props.defaultDensity ?? DEFAULT_DENSITY
  )
  const [_visibleKeys, _setVisibleKeys] = useState<string[]>(
    () => isControlledVisibility ? props.visibleColumns! : props.columnDefs.filter(c => c.visible).map(c => c.key)
  )
  const [_columnOrder, _setColumnOrder] = useState<string[]>(
    () => props.columnDefs.map(c => c.key)
  )
  const [_columnWidths, _setColumnWidths] = useState<Record<string, number>>(
    () => Object.fromEntries(props.columnDefs.map(c => [c.key, c.width]))
  )
  const [_pinnedColumns, _setPinnedColumns] = useState<string[]>([])

  const density = isControlledDensity ? props.density! : _density

  function setDensity(d: Density) {
    if (isControlledDensity) { props.onDensityChange!(d) } else { _setDensity(d) }
  }

  const visibleColumnKeys = isControlledVisibility ? props.visibleColumns! : _visibleKeys

  function setVisibleColumnKeys(keys: string[]) {
    if (isControlledVisibility) {
      const current = new Set(props.visibleColumns!)
      const next = new Set(keys)
      for (const key of [...current, ...next]) {
        const wasVisible = current.has(key)
        const isVisible = next.has(key)
        if (wasVisible !== isVisible) props.onVisibilityChange!(key, isVisible)
      }
    } else {
      _setVisibleKeys(keys)
    }
    // Clear filters for any column being hidden — prevents silent filtering.
    const hiddenKeys = _visibleKeys.filter(k => !keys.includes(k))
    if (hiddenKeys.length > 0) {
      setMultiFilterState(prev => {
        const anyAffected = prev.some(row => hiddenKeys.some(k => k in row))
        if (!anyAffected) return prev
        return prev.map(row => {
          const updated = { ...row }
          hiddenKeys.forEach(k => delete updated[k])
          return updated
        })
      })
    }
  }

  function setColumnOrder(order: string[]) { _setColumnOrder(order) }
  function setColumnWidth(key: string, width: number) {
    _setColumnWidths(prev => ({ ...prev, [key]: width }))
  }
  function togglePinnedColumn(key: string) {
    _setPinnedColumns(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    )
  }

  return {
    density, setDensity,
    visibleColumnKeys, setVisibleColumnKeys,
    columnOrder: _columnOrder, setColumnOrder,
    columnWidths: _columnWidths, setColumnWidth,
    pinnedColumns: _pinnedColumns, togglePinnedColumn,
  }
}
