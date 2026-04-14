// Purpose: Maps Density levels to their corresponding DensityTokens (row height, padding, font size).
// Related files: src/types/table.ts, src/components/DataTable/TableRow.tsx
// Must not include: component logic, side effects, or external dependencies.

import type { Density, DensityTokens } from '../types/table'

const COMPACT_TOKENS: DensityTokens = { rowHeight: 32, paddingClass: 'py-1', fontSizeClass: 'text-xs' }
const DEFAULT_TOKENS: DensityTokens = { rowHeight: 44, paddingClass: 'py-2.5', fontSizeClass: 'text-sm' }
const COMFORTABLE_TOKENS: DensityTokens = { rowHeight: 56, paddingClass: 'py-4', fontSizeClass: 'text-sm' }

const DENSITY_TOKEN_MAP: Record<Density, DensityTokens> = {
  compact: COMPACT_TOKENS,
  default: DEFAULT_TOKENS,
  comfortable: COMFORTABLE_TOKENS,
}

// Returns the DensityTokens for the given density level.
export function getDensityTokens(density: Density): DensityTokens {
  return DENSITY_TOKEN_MAP[density]
}
