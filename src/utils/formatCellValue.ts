// Purpose: Type-aware cell value formatter for the data table.
// Related files: src/types/table.ts, src/components/DataTable/TableRow.tsx
// Must not include: React imports, side effects, or external dependencies.

import type { ColumnType } from '../types/table'

const EM_DASH = '—'

// Formats a date/timestamp value to a localized date string. Falls back to String(value) on parse failure.
function formatDate(value: unknown): string {
  try {
    const date = new Date(value as string | number | Date)
    if (isNaN(date.getTime())) return String(value)
    return date.toLocaleDateString()
  } catch {
    return String(value)
  }
}

// Dispatch table: ColumnType → formatter function. Exhaustive — compile error if a type is missing.
const FORMATTERS: Record<ColumnType, (value: unknown) => string> = {
  text:      value => String(value),
  unknown:   value => String(value),
  number:    value => String(value),
  integer:   value => String(value),
  float:     value => String(value),
  boolean:   value => value ? 'Yes' : 'No',
  date:      formatDate,
  timestamp: formatDate,
  enum:      value => String(value),
}

// Formats a raw cell value into a display string based on the column type.
// Null, undefined, and empty string always render as em dash regardless of type.
export function formatCellValue(value: unknown, type: ColumnType): string {
  if (value === null || value === undefined || value === '') return EM_DASH
  return FORMATTERS[type](value)
}
