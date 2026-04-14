// Purpose: ColumnType utility mappings — alignment defaults and filter type resolution.
// Single source of truth for all ColumnType → derived value lookups.
// Related files: src/types/table.ts, src/utils/normalizeColumn.ts, src/components/DataTable/FilterInputs.tsx
// Must not include: React imports, component logic, or side effects.

import type { ColumnType, ColumnAlign, ColumnFilter } from '../types/table'

// Lookup table: ColumnType → default alignment. Exhaustive — compile error if a type is missing.
export const DEFAULT_ALIGN: Record<ColumnType, ColumnAlign> = {
  text:      'left',
  unknown:   'left',
  number:    'right',
  integer:   'right',
  float:     'right',
  date:      'center',
  timestamp: 'center',
  boolean:   'center',
  enum:      'center',
}

// Lookup table: ColumnType → ColumnFilter type. Exhaustive — compile error if a type is missing.
export const FILTER_TYPE: Record<ColumnType, ColumnFilter['type']> = {
  text:      'text',
  unknown:   'text',
  number:    'number',
  integer:   'number',
  float:     'number',
  date:      'date',
  timestamp: 'date',
  boolean:   'boolean',
  enum:      'enum',
}

// Maps a ColumnType to the filter input type to render for it.
export function filterTypeFor(colType: ColumnType): ColumnFilter['type'] {
  return FILTER_TYPE[colType]
}
