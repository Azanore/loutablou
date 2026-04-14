// Purpose: Pure filter logic — applies a MultiFilterState (OR across rows, AND within each row).
// Related files: src/types/table.ts, src/components/DataTable/FilterInputs.tsx
// Must not include: React imports, component logic, side effects, or type-mapping utilities.

import type { ColumnFilter, FilterRow, MultiFilterState, ResolvedRow } from '../types/table'

// Returns true if the cell value passes the given column filter.
function matchesFilter(value: unknown, filter: ColumnFilter): boolean {
  switch (filter.type) {
    case 'text': {
      if (filter.value === '') return true
      return String(value ?? '').toLowerCase().includes(filter.value.toLowerCase())
    }
    case 'number': {
      const num = Number(value)
      if (isNaN(num)) return true
      if (filter.min !== '' && num < Number(filter.min)) return false
      if (filter.max !== '' && num > Number(filter.max)) return false
      return true
    }
    case 'date': {
      const ts = new Date(String(value ?? '')).getTime()
      if (isNaN(ts)) return true
      if (filter.min !== '' && ts < new Date(filter.min).getTime()) return false
      if (filter.max !== '' && ts > new Date(filter.max).getTime()) return false
      return true
    }
    case 'boolean': {
      if (filter.value === 'all') return true
      return String(value) === filter.value
    }
    case 'enum': {
      if (filter.values.length === 0) return true
      return filter.values.includes(String(value ?? ''))
    }
  }
}

// Returns true if a FilterRow has at least one active (non-empty) condition.
function isRowActive(row: FilterRow): boolean {
  return Object.keys(row).length > 0
}

// Returns true if a data row passes all conditions in a single FilterRow (AND logic within a row).
function matchesRow(row: ResolvedRow, filterRow: FilterRow): boolean {
  return Object.entries(filterRow).every(([key, filter]) => matchesFilter(row[key], filter))
}

// Applies MultiFilterState to rows.
// A data row passes if it matches ALL conditions in ANY active FilterRow (OR across rows, AND within).
// Returns same reference when no active filter rows exist.
export function applyFilters(rows: ResolvedRow[], filterState: MultiFilterState): ResolvedRow[] {
  const activeRows = filterState.filter(isRowActive)
  if (activeRows.length === 0) return rows
  return rows.filter(row => activeRows.some(fr => matchesRow(row, fr)))
}
