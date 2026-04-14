// Purpose: Public barrel export for the DataTable component.
// Related files: src/components/DataTable/DataTable.tsx, src/hooks/useTableState.ts
// Must not include: re-exports of internal sub-components (TableBody, TableRow, etc.)

export { DataTable } from './DataTable'
export type { DataTableProps } from '../../hooks/useTableState'
export { DataTable as default } from './DataTable'
