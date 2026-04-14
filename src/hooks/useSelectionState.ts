// Purpose: Manages row selection state — toggle, shift-click range, select-all, clear.
// Related files: src/types/table.ts, src/hooks/useTableState.ts
// Must not include: column layout state, filter state, or pagination state.

import { useState, useRef } from 'react'
import type { SelectionState, ResolvedRow } from '../types/table'

export function useSelectionState() {
  const [_selectedRowIds, _setSelectedRowIds] = useState<SelectionState>(() => new Set())
  const _lastSelectedIndex = useRef<number | null>(null)

  const selectedRowIds = _selectedRowIds

  // Toggles a single row; with shiftKey held, selects the range from last click to current.
  function toggleRowSelection(id: number, shiftKey: boolean, visibleRows: ResolvedRow[]) {
    const clickedIndex = visibleRows.findIndex(r => r._tableRowId === id)
    if (shiftKey && _lastSelectedIndex.current !== null) {
      const from = Math.min(_lastSelectedIndex.current, clickedIndex)
      const to = Math.max(_lastSelectedIndex.current, clickedIndex)
      _setSelectedRowIds(prev => {
        const next = new Set(prev)
        for (let i = from; i <= to; i++) next.add(visibleRows[i]._tableRowId)
        return next
      })
    } else {
      _setSelectedRowIds(prev => {
        const next = new Set(prev)
        if (next.has(id)) { next.delete(id) } else { next.add(id) }
        return next
      })
      _lastSelectedIndex.current = clickedIndex
    }
  }

  // Adds all visible rows to selection if not all selected; removes them if all are already selected.
  // Preserves selections from other pages.
  function toggleAllSelection(visibleRows: ResolvedRow[]) {
    const allSelected = visibleRows.every(r => _selectedRowIds.has(r._tableRowId))
    if (allSelected) {
      _setSelectedRowIds(prev => {
        const next = new Set(prev)
        visibleRows.forEach(r => next.delete(r._tableRowId))
        return next
      })
    } else {
      _setSelectedRowIds(prev => {
        const next = new Set(prev)
        visibleRows.forEach(r => next.add(r._tableRowId))
        return next
      })
    }
    _lastSelectedIndex.current = null
  }

  function clearSelection() {
    _setSelectedRowIds(new Set())
    _lastSelectedIndex.current = null
  }

  // Clears selection and resets last index — called when filter/search changes.
  function resetSelection() {
    _setSelectedRowIds(new Set())
    _lastSelectedIndex.current = null
  }

  return { selectedRowIds, toggleRowSelection, toggleAllSelection, clearSelection, resetSelection }
}
