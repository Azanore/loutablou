// Purpose: Manages pipeline state — sort, multi-row filter, global search, and pagination.
// Related files: src/types/table.ts, src/hooks/useTableState.ts
// Must not include: column layout state or selection state.

import { useState } from 'react'
import type { SortState, FilterRow, MultiFilterState, PaginationState } from '../types/table'

interface PipelineStateProps {
  sortState?: SortState
  onSortChange?: (state: SortState) => void
  defaultPageSize?: number
}

const DEFAULT_SORT_STATE: SortState = { columnKey: '', direction: 'none' }
const DEFAULT_FILTER_ROW: FilterRow = {}
const DEFAULT_PAGE_SIZE = 25

export function usePipelineState(props: PipelineStateProps) {
  const isControlledSort = props.sortState !== undefined && props.onSortChange !== undefined

  const [_sortState, _setSortState] = useState<SortState>(
    () => props.sortState ?? DEFAULT_SORT_STATE
  )
  const [_multiFilterState, _setMultiFilterState] = useState<MultiFilterState>([DEFAULT_FILTER_ROW])
  const [_globalSearch, _setGlobalSearch] = useState('')
  const [_pagination, _setPagination] = useState<PaginationState>({
    page: 0,
    pageSize: props.defaultPageSize ?? DEFAULT_PAGE_SIZE,
  })

  const sortState = isControlledSort ? props.sortState! : _sortState

  function setSortState(state: SortState) {
    if (isControlledSort) { props.onSortChange!(state) } else { _setSortState(state) }
    _setPagination(p => ({ ...p, page: 0 }))
  }

  const multiFilterState = _multiFilterState

  // Exposed as both a direct setter and an updater function so useColumnState can call it atomically.
  function setMultiFilterState(state: MultiFilterState) {
    _setMultiFilterState(state)
    _setPagination(p => ({ ...p, page: 0 }))
  }

  function setMultiFilterStateUpdater(updater: (prev: MultiFilterState) => MultiFilterState) {
    _setMultiFilterState(updater)
  }

  const globalSearch = _globalSearch

  function setGlobalSearch(q: string) {
    _setGlobalSearch(q)
    _setPagination(p => ({ ...p, page: 0 }))
  }

  const pagination = _pagination

  function setPagination(p: PaginationState) { _setPagination(p) }

  return {
    sortState, setSortState,
    multiFilterState, setMultiFilterState, setMultiFilterStateUpdater,
    globalSearch, setGlobalSearch,
    pagination, setPagination,
  }
}
