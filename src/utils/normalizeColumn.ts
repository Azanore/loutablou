// Purpose: Fills in default values for optional ColumnDef fields, producing a NormalizedColumnDef.
// Related files: src/types/table.ts, src/utils/columnTypeUtils.ts, src/hooks/useTableState.ts
// Must not include: React imports, side effects, or aggregation logic.

import type { ColumnDef, ColumnAlign, NormalizedColumnDef } from '../types/table'
import { DEFAULT_ALIGN } from './columnTypeUtils'

// Returns a NormalizedColumnDef with align always set. Never mutates the input.
export function normalizeColumn(def: ColumnDef): NormalizedColumnDef {
  const align: ColumnAlign = def.align ?? DEFAULT_ALIGN[def.type]
  return { ...def, align }
}
