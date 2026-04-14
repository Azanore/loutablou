// Purpose: Exports visible table rows to CSV or Excel (.xlsx) file download.
// Related files: src/types/table.ts, src/utils/formatCellValue.ts
// Must not include: React imports, component logic, or clipboard logic.

import type { NormalizedColumnDef, ResolvedRow } from '../types/table'
import { formatCellValue } from './formatCellValue'

function buildRows(rows: ResolvedRow[], columns: NormalizedColumnDef[]): string[][] {
  const header = columns.map(c => c.label)
  const body = rows.map(row => columns.map(col => formatCellValue(row[col.key], col.type)))
  return [header, ...body]
}

// Triggers a file download in the browser.
function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

// Exports rows as a UTF-8 CSV file.
export function exportCsv(
  rows: ResolvedRow[],
  columns: NormalizedColumnDef[],
  filename = 'export.csv'
): void {
  const data = buildRows(rows, columns)
  const csv = data
    .map(row => row.map(cell => {
      const s = String(cell)
      return s.includes(',') || s.includes('"') || s.includes('\n')
        ? `"${s.replace(/"/g, '""')}"`
        : s
    }).join(','))
    .join('\n')
  triggerDownload(new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' }), filename)
}

// Exports rows as an Excel .xlsx file using the xlsx library.
export async function exportXlsx(
  rows: ResolvedRow[],
  columns: NormalizedColumnDef[],
  filename = 'export.xlsx'
): Promise<void> {
  const XLSX = await import('xlsx')
  const data = buildRows(rows, columns)
  const ws = XLSX.utils.aoa_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')
  XLSX.writeFile(wb, filename)
}
