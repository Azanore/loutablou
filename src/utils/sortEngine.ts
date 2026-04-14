// Purpose: Pure sort utilities — SortCycle direction transition, TypeComparators, and applySort engine.
// Related files: src/types/table.ts, src/components/DataTable/TableHeader.tsx, src/components/DataTable/DataTable.tsx
// Must not include: React imports, component logic, side effects, or external dependencies.

import type { SortDirection, SortState, NormalizedColumnDef, ResolvedRow } from '../types/table'

const SORT_CYCLE: Record<SortDirection, SortDirection> = {
  none: 'asc',
  asc: 'desc',
  desc: 'none',
}

// Advances SortDirection through the fixed cycle: none → asc → desc → none.
export function SortCycle(current: SortDirection): SortDirection {
  return SORT_CYCLE[current]
}

// Wraps a comparator so null/undefined values always sort last, regardless of direction.
function nullLast(compareFn: (a: unknown, b: unknown) => number) {
  return (a: unknown, b: unknown): number => {
    const aNull = a === null || a === undefined
    const bNull = b === null || b === undefined
    if (aNull && bNull) return 0
    if (aNull) return 1
    if (bNull) return -1
    return compareFn(a, b)
  }
}

// Compares two numeric values. Suitable for number, integer, and float column types.
export const compareNumber = nullLast((a: unknown, b: unknown): number =>
  Number(a) - Number(b)
)

// Compares two values as strings using locale-aware ordering. Suitable for text and unknown types.
export const compareText = nullLast((a: unknown, b: unknown): number =>
  String(a).localeCompare(String(b))
)

// Compares two date-parseable values chronologically. Suitable for date and timestamp types.
export const compareDate = nullLast((a: unknown, b: unknown): number =>
  new Date(String(a)).getTime() - new Date(String(b)).getTime()
)

// Compares two boolean values: false sorts before true. Suitable for boolean column type.
export const compareBoolean = nullLast((a: unknown, b: unknown): number =>
  Number(a as boolean) - Number(b as boolean)
)

// Compares two enum values by their index in enumValues. Unknown values are treated as index -1.
export function compareEnum(a: unknown, b: unknown, enumValues: string[]): number {
  const aNull = a === null || a === undefined
  const bNull = b === null || b === undefined
  if (aNull && bNull) return 0
  if (aNull) return 1
  if (bNull) return -1
  const aIdx = enumValues.indexOf(String(a))
  const bIdx = enumValues.indexOf(String(b))
  return aIdx - bIdx
}

// Selects the appropriate comparator for a column type.
function selectComparator(col: NormalizedColumnDef): (a: unknown, b: unknown) => number {
  switch (col.type) {
    case 'number': case 'integer': case 'float': return compareNumber
    case 'date': case 'timestamp': return compareDate
    case 'boolean': return compareBoolean
    case 'enum': return (a, b) => compareEnum(a, b, col.enumValues ?? [])
    default: return compareText
  }
}

// Applies sort to rows based on sortState and column definitions. Never mutates input.
// The direction multiplier is applied inside nullLast so null sentinel values are never flipped.
export function applySort(
  rows: ResolvedRow[],
  sortState: SortState,
  columns: NormalizedColumnDef[]
): ResolvedRow[] {
  if (sortState.direction === 'none') return rows
  const col = columns.find(c => c.key === sortState.columnKey)
  if (!col) return rows
  const comparator = selectComparator(col)
  const dir = sortState.direction === 'desc' ? -1 : 1
  return [...rows].sort((a, b) => {
    const av = a[col.key]
    const bv = b[col.key]
    const aNull = av === null || av === undefined
    const bNull = bv === null || bv === undefined
    // Nulls always last regardless of direction — never multiply sentinel values.
    if (aNull && bNull) return 0
    if (aNull) return 1
    if (bNull) return -1
    return comparator(av, bv) * dir
  })
}
