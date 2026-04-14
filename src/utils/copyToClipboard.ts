// Purpose: Builds a TSV string from selected visible rows + visible columns and writes it to the clipboard.
// TSV (tab-separated values) pastes correctly into Excel, Google Sheets, and Numbers.
// Related files: src/types/table.ts, src/utils/formatCellValue.ts, src/components/DataTable/DataTable.tsx
// Must not include: React imports, component logic, or side effects beyond clipboard write.

import type { NormalizedColumnDef, ResolvedRow, SelectionState } from '../types/table'
import { formatCellValue } from './formatCellValue'

// Escapes a cell value for TSV: wraps in quotes if it contains tabs, newlines, or quotes.
function escapeTsv(value: string): string {
  if (value.includes('\t') || value.includes('\n') || value.includes('"')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

// Builds a TSV string from the selected rows and visible columns, then writes it to the clipboard.
// Returns a promise that resolves when the write completes.
export async function copySelectionToClipboard(
  rows: ResolvedRow[],
  columns: NormalizedColumnDef[],
  selectedRowIds: SelectionState
): Promise<void> {
  const selectedRows = rows.filter(r => selectedRowIds.has(r._tableRowId))
  if (selectedRows.length === 0) return

  const header = columns.map(c => escapeTsv(c.label)).join('\t')
  const body = selectedRows.map(row =>
    columns.map(col => escapeTsv(formatCellValue(row[col.key], col.type))).join('\t')
  ).join('\n')

  await navigator.clipboard.writeText(`${header}\n${body}`)
}
