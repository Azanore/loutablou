// Purpose: All shared TypeScript types for the data table component.
// Related files: src/utils/normalizeColumn.ts, src/utils/resolveRowIdentity.ts,
//                src/utils/densityTokens.ts, src/utils/sortEngine.ts, src/utils/filterEngine.ts,
//                src/components/DataTable/
// Must not include: aggregation types.

export type ColumnType =
  | 'text' | 'number' | 'integer' | 'float'
  | 'date' | 'timestamp' | 'boolean' | 'enum' | 'unknown'

export type ColumnAlign = 'left' | 'right' | 'center'

export type Density = 'compact' | 'default' | 'comfortable'

export type RowIdentity = string | number

export interface ColumnDef {
  key: string
  label: string
  type: ColumnType
  nullable: boolean
  visible: boolean
  width: number           // pixels
  sortable: boolean
  filterable: boolean
  align?: ColumnAlign     // optional; NormalizeColumn fills default
  enumValues?: string[]   // required when type === 'enum'
}

// After normalization, align is always present
export interface NormalizedColumnDef extends ColumnDef {
  align: ColumnAlign
}

export interface RowData {
  id?: string | number
  [key: string]: unknown
}

// After identity resolution, _tableRowId is always present
export interface ResolvedRow extends RowData {
  _tableRowId: number
}

export interface DensityTokens {
  rowHeight: number        // px value
  paddingClass: string     // e.g. 'py-1'
  fontSizeClass: string    // e.g. 'text-xs'
}

// Phase 2: Sort types
export type SortDirection = 'asc' | 'desc' | 'none'

// Invariant: when direction is 'none', columnKey must be ''
export interface SortState {
  columnKey: string
  direction: SortDirection
}

// Phase 3: Filter types

// One entry per filtered column. Absent key = no filter on that column.
// A FilterRow is one header filter row — conditions within a row are AND'd.
export type FilterRow = Record<string, ColumnFilter>

// Multiple rows are OR'd together: a row passes if it matches ANY FilterRow.
export type MultiFilterState = FilterRow[]

export type ColumnFilter =
  | { type: 'text';    value: string }
  | { type: 'number';  min: string; max: string }
  | { type: 'date';    min: string; max: string }
  | { type: 'boolean'; value: 'true' | 'false' | 'all' }
  | { type: 'enum';    values: string[] }

// Phase 4: Selection types
// selectedRowIds is a Set of _tableRowId values for O(1) lookup.
export type SelectionState = Set<number>

// Pagination state
export interface PaginationState {
  page: number       // 0-based
  pageSize: number
}
