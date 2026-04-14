// Purpose: Resolves row identity by injecting _tableRowId for every row.
// Related files: src/types/table.ts, src/hooks/useTableState.ts
// Must not include: side effects, external dependencies, or mutation of input objects.

import type { RowData, ResolvedRow } from '../types/table'

/** Returns a new array of shallow-copied rows, each with _tableRowId set to its 0-based index. */
export function resolveRowIdentity(rows: RowData[]): ResolvedRow[] {
  return rows.map((row, i) => ({ ...row, _tableRowId: i }))
}
