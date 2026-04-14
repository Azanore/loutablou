// Purpose: Pagination controls — page navigation, page size selector, and row range display.
// Related: src/types/table.ts, src/components/DataTable/DataTable.tsx
// Must not include: data slicing logic, filter state, or sort state.

import React from 'react'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import type { PaginationState } from '../../types/table'
import { Button } from '../ui/button'
import { Select } from '../ui/select'

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100]

interface PaginationProps {
  pagination: PaginationState
  totalRows: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
}

/** Renders page navigation, page size selector, and current row range. */
export function Pagination({ pagination, totalRows, onPageChange, onPageSizeChange }: PaginationProps) {
  const { page, pageSize } = pagination
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize))
  const from = totalRows === 0 ? 0 : page * pageSize + 1
  const to = Math.min((page + 1) * pageSize, totalRows)

  function handlePageSize(e: React.ChangeEvent<HTMLSelectElement>) {
    onPageSizeChange(Number(e.target.value))
  }

  return (
    <div className="flex items-center justify-between px-1 pt-3">
      {/* Row range */}
      <span className="text-xs text-text-muted tabular-nums">
        {totalRows === 0 ? 'No rows' : `${from}–${to} of ${totalRows}`}
      </span>

      {/* Page size + navigation */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-text-muted">Rows per page</span>
          <Select value={pageSize} onChange={handlePageSize} className="w-16">
            {PAGE_SIZE_OPTIONS.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </Select>
        </div>

        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onPageChange(0)}
            disabled={page === 0}
            aria-label="First page"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onPageChange(page - 1)}
            disabled={page === 0}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <span className="text-xs text-text-muted tabular-nums px-2">
            {page + 1} / {totalPages}
          </span>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages - 1}
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onPageChange(totalPages - 1)}
            disabled={page >= totalPages - 1}
            aria-label="Last page"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
