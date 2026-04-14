# Implementation Plan: Data Table Component (Phase 1)

## Overview

Incremental build-out of the Vite + React + TypeScript + Tailwind CSS v4 data table. Each task produces runnable, type-safe code that builds on the previous step. Tasks are ordered so the project compiles after every step.

## Tasks

- [x] 1. Project scaffolding and Tailwind CSS v4 setup
  - Scaffold a new Vite + React + TypeScript project (`npm create vite@latest`)
  - Install runtime deps: `react`, `react-dom`
  - Install dev deps: `typescript`, `vite`, `@vitejs/plugin-react`, `tailwindcss`, `@tailwindcss/vite`, `tsx`
  - Install test deps: `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `fast-check`, `jsdom`
  - Update `vite.config.ts` to include both `react()` and `tailwindcss()` plugins (Tailwind v4 Vite plugin — no `tailwind.config.js` needed)
  - Replace `src/index.css` content with `@import "tailwindcss";`
  - Enable strict mode in `tsconfig.json`
  - Add `vitest` config block to `vite.config.ts` (environment: `jsdom`, setupFiles pointing to a test-setup file)
  - Create `src/test-setup.ts` importing `@testing-library/jest-dom`
  - Verify `npm run build` exits with zero errors
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.6_

- [x] 2. Core TypeScript types
  - Create `src/types/table.ts` with all shared types: `ColumnType`, `ColumnAlign`, `Density`, `RowIdentity`, `ColumnDef`, `NormalizedColumnDef`, `RowData`, `ResolvedRow`, `DensityTokens`
  - // SortState and FilterState are defined in Phase 2 and 3 respectively — not created here.
  - Ensure the file has zero TypeScript errors
  - _Requirements: 1.1, 1.2, 2.1, 3.1_

- [x] 3. Implement mock data generator script
  - Create `src/scripts/generateMockData.ts`
  - Use a fixed-seed linear congruential PRNG (zero external npm imports)
  - Generate exactly 500 rows with fields: `id` (integer, unique, 1-based), `name` (text, max 80 chars), `status` (enum: `active | inactive | pending | archived`), `score` (float, 0–100, 2 decimal places), `created_at` (ISO timestamp string), `is_verified` (boolean), `country` (text, max 60 chars), `revenue` (float, 0–1,000,000, 2 decimal places)
  - Write output to `src/data/mock-data.json` using Node.js `fs.writeFileSync`
  - Add a `generate` script to `package.json`: `"generate": "npx tsx src/scripts/generateMockData.ts"`
  - Run `npm run generate` immediately to produce `src/data/mock-data.json`
  - Verify the file contains 500 rows and is valid JSON
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

  - [ ]* 3.1 Write property test for generator determinism
    - **Property 15: MockDataGenerator output is deterministic**
    - **Validates: Requirements 9.3**
    - File: `src/scripts/generateMockData.test.ts`
    - Run the generator function twice and compare JSON output byte-for-byte

  - [ ]* 3.2 Write property test for generator row schema conformance
    - **Property 16: MockDataGenerator rows conform to schema**
    - **Validates: Requirements 9.2**
    - File: `src/scripts/generateMockData.test.ts`
    - Validate all 500 rows have required fields with correct types and value ranges

  - [ ]* 3.3 Write unit tests for generator output
    - Test produces exactly 500 rows
    - Test output is valid JSON
    - Test writes to `src/data/mock-data.json`
    - _Requirements: 9.1, 9.4, 9.6_

- [x] 4. Wire App.tsx entry point
  - Update `src/App.tsx` to import `mock-data.json` and define `columnDefs` matching the 8 mock data columns
  - Render `<DataTable columnDefs={columnDefs} rowData={mockData} defaultDensity="default" />` — DataTable can be a placeholder `<div>` at this point
  - Import `./index.css` in `src/main.tsx` (Tailwind entry)
  - Verify `npm run dev` starts and the browser shows something — the project is now visibly running
  - _Requirements: 10.6_

- [x] 5. Implement `normalizeColumn` utility
  - Create `src/utils/normalizeColumn.ts`
  - Implement align defaulting: numeric types → `'right'`, categorical/temporal → `'center'`, text/unknown → `'left'`
  - Implement `aggregatable: false` override for `type === 'unknown'`
  - Explicit `align` must pass through unchanged
  - _Requirements: 1.3, 1.4, 1.5, 1.6, 1.7_

  - [ ]* 5.1 Write property tests for `normalizeColumn`
    - **Property 1: NormalizeColumn sets align by type**
    - **Validates: Requirements 1.3, 1.4, 1.5**
    - **Property 2: Explicit align is never overridden**
    - **Validates: Requirements 1.7**
    - File: `src/utils/normalizeColumn.test.ts`
    - Use `fc.record` with `fc.constantFrom` over all `ColumnType` values; run 100 iterations each

- [x] 6. Implement `resolveRowIdentity` utility
  - Create `src/utils/resolveRowIdentity.ts`
  - Return shallow copies (`{ ...row, _tableRowId: i }`) — never mutate input
  - When `row.id` exists, preserve it; `_tableRowId` is still injected as the positional index
  - When `row.id` is absent, `_tableRowId` serves as the identity
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [ ]* 6.1 Write property tests for `resolveRowIdentity`
    - **Property 3: Row identity uses id when present**
    - **Validates: Requirements 2.1**
    - **Property 4: Row identity injects _tableRowId when id is absent**
    - **Validates: Requirements 2.2**
    - **Property 5: resolveRowIdentity does not mutate input rows**
    - **Validates: Requirements 2.4**
    - File: `src/utils/resolveRowIdentity.test.ts`
    - Use `fc.array(fc.record(...))` arbitraries; run 100 iterations each

- [x] 7. Implement `densityTokens` utility
  - Create `src/utils/densityTokens.ts`
  - Implement `getDensityTokens(density: Density): DensityTokens` as a pure lookup
  - Token map: compact → `{rowHeight: 32, paddingClass: 'py-1', fontSizeClass: 'text-xs'}`, default → `{rowHeight: 44, paddingClass: 'py-2.5', fontSizeClass: 'text-sm'}`, comfortable → `{rowHeight: 56, paddingClass: 'py-4', fontSizeClass: 'text-sm'}`
  - _Requirements: 3.2, 3.3, 3.4_

  - [ ]* 7.1 Write property test for `getDensityTokens`
    - **Property 6: getDensityTokens returns correct tokens for every density**
    - **Validates: Requirements 3.2, 3.3, 3.4**
    - File: `src/utils/densityTokens.test.ts`
    - Use `fc.constantFrom('compact', 'default', 'comfortable')`; run 100 iterations

- [x] 8. Implement `formatCellValue` utility
  - Create `src/utils/formatCellValue.ts`
  - `null | undefined` → `'—'` (em dash), checked first before any type branch
  - `'boolean'` → `true` → `'Yes'`, `false` → `'No'`
  - `'date' | 'timestamp'` → `new Date(value).toLocaleDateString()`; fall back to `String(value)` if parsing fails
  - All other types → `String(value)`
  - _Requirements: 6.2, 6.5, 6.6_

  - [ ]* 8.1 Write property tests for `formatCellValue`
    - **Property 9: formatCellValue renders null/undefined as em dash**
    - **Validates: Requirements 6.2**
    - **Property 10: formatCellValue renders boolean values as Yes/No**
    - **Validates: Requirements 6.5**
    - **Property 11: formatCellValue renders date/timestamp as locale date string**
    - **Validates: Requirements 6.6**
    - File: `src/utils/formatCellValue.test.ts`
    - Use `fc.constantFrom(null, undefined)`, `fc.boolean()`, `fc.date()` arbitraries; run 100 iterations each

- [x] 9. Checkpoint — utilities complete
  - Ensure all utility tests pass, ask the user if questions arise.

- [x] 10. Implement `useTableState` hook
  - Create `src/hooks/useTableState.ts`
  - Accept `DataTableProps`; return `{ density, setDensity, visibleColumnKeys, setVisibleColumnKeys, normalizedColumns, resolvedRows }`
  - Density hybrid logic: controlled when both `props.density` + `props.onDensityChange` provided; initial-value-only when only `props.density` provided; otherwise use `props.defaultDensity ?? 'default'`
  - Visibility hybrid logic: controlled when both `props.visibleColumns` + `props.onVisibilityChange` provided; initial-value-only when only `props.visibleColumns` provided; otherwise derive from `columnDefs[].visible`
  - Run `normalizeColumn` and `resolveRowIdentity` once on mount via `useMemo`
  - _Requirements: 3.6, 3.7, 4.1, 4.4, 4.5, 8.1, 8.2, 8.3_

  - [ ]* 10.1 Write property test for initial visibility derivation
    - **Property 14: Initial visibility matches ColumnDef visible fields**
    - **Validates: Requirements 4.1**
    - File: `src/hooks/useTableState.test.ts`
    - Use `fc.array(fc.record({ visible: fc.boolean(), key: fc.string(), ... }))`; run 100 iterations

- [x] 11. Implement `EmptyState` component
  - Create `src/components/DataTable/EmptyState.tsx`
  - Render a `<tr><td colSpan={colSpan}>` with variant-specific message
  - `'empty'` variant: "No data available"
  - `'error'` variant: "An error occurred"
  - No state reset calls in either variant
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

  - [ ]* 11.1 Write property test for `EmptyState` colSpan
    - **Property 12: EmptyState colSpan equals visible columns plus one**
    - **Validates: Requirements 7.5**
    - File: `src/components/DataTable/EmptyState.test.tsx`
    - Use `fc.integer({ min: 0, max: 50 })` for column count; run 100 iterations

  - [ ]* 11.2 Write unit tests for `EmptyState` variant messages
    - Test `'empty'` renders "No data available"
    - Test `'error'` renders error message
    - _Requirements: 7.2, 7.3_

- [x] 12. Implement `TableRow` component
  - Create `src/components/DataTable/TableRow.tsx`
  - Render `<tr>` with one `<td>` for the row-number (1-based `rowIndex + 1`) followed by one `<td>` per visible column
  - Apply `formatCellValue` for each cell; apply column `align` as Tailwind text-align class
  - Apply density padding and font-size classes from `getDensityTokens`
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

- [x] 13. Implement `TableHeader` component
  - Create `src/components/DataTable/TableHeader.tsx`
  - Render `<thead><tr>` with a row-number `<th>` as the first cell, then one `<th>` per column using `column.label`
  - Do not add the row-number column to `columnDefs`
  - _Requirements: 5.3, 5.4, 5.5_

  - [ ]* 13.1 Write property test for `TableHeader` column count and labels
    - **Property 7: TableHeader renders correct column count and labels**
    - **Validates: Requirements 5.3, 5.4, 5.5**
    - File: `src/components/DataTable/TableHeader.test.tsx`
    - Use `fc.array(fc.record({ key: fc.string(), label: fc.string(), ... }))`; run 100 iterations

- [x] 14. Implement `TableBody` component
  - Create `src/components/DataTable/TableBody.tsx`
  - When `rows` is non-empty: render `<tbody>` with one `<TableRow>` per row, keyed by `row._tableRowId`
  - When `rows` is empty: render `<tbody><EmptyState colSpan={columns.length + 1} variant={emptyVariant} /></tbody>`
  - _Requirements: 5.6, 5.7_

  - [ ]* 14.1 Write property test for `TableBody` row count
    - **Property 8: TableBody renders one row per dataset entry**
    - **Validates: Requirements 5.6**
    - File: `src/components/DataTable/TableBody.test.tsx`
    - Use `fc.array(fc.record({ _tableRowId: fc.integer() }), { minLength: 1 })`; run 100 iterations

  - [ ]* 14.2 Write unit test for `TableBody` empty state rendering
    - Test that `EmptyState` is rendered when `rows` is empty
    - _Requirements: 5.7_

- [x] 15. Implement `TableShell` component
  - Create `src/components/DataTable/TableShell.tsx`
  - Render a scrollable outer `<div>` (overflow-x-auto) wrapping a `<table className="table-fixed w-full">`
  - Accept `cssVars` prop and apply as inline `style` on the root element
  - _Requirements: 5.1, 5.2, 3.5_

- [x] 16. Implement `DensityToggle` component
  - Create `src/components/DataTable/DensityToggle.tsx`
  - Render a control that cycles through `'compact' → 'default' → 'comfortable' → 'compact'` on click
  - Display the current density label
  - Call `onDensityChange` with the next density value
  - _Requirements: 3.8_

- [x] 17. Implement `ColumnVisibilityPanel` component
  - Create `src/components/DataTable/ColumnVisibilityPanel.tsx`
  - Render one toggle (checkbox or switch) per column in `columns` prop
  - Do not render a toggle for the row-number column (it is excluded from the `columns` prop)
  - Call `onVisibilityChange(key, visible)` when a toggle changes
  - _Requirements: 4.2, 4.3, 4.6_

  - [ ]* 17.1 Write property test for `ColumnVisibilityPanel` toggle count
    - **Property 13: ColumnVisibilityPanel renders one toggle per user column**
    - **Validates: Requirements 4.2, 4.6**
    - File: `src/components/DataTable/ColumnVisibilityPanel.test.tsx`
    - Use `fc.array(fc.record({ key: fc.string(), label: fc.string(), ... }))`; run 100 iterations

- [x] 18. Implement `DataTable` top-level component
  - Create `src/components/DataTable/DataTable.tsx`
  - Compose `useTableState`, `DensityToggle`, `ColumnVisibilityPanel`, `TableShell`, `TableHeader`, `TableBody`
  - Compute `visibleNormalizedCols` by filtering `normalizedColumns` to those in `visibleColumnKeys`
  - Pass CSS custom properties (`--row-height-compact`, `--row-height-default`, `--row-height-comfortable`) to `TableShell` via `cssVars`
  - Wire `onDensityChange` and `onVisibilityChange` through to `useTableState` setters
  - _Requirements: 1.1, 3.5, 4.3, 4.4, 4.5, 8.1, 8.2, 8.3_

  - [ ]* 18.1 Write unit test for default density initialization
    - Test that `DataTable` defaults to `'default'` density when no `defaultDensity` prop is provided
    - _Requirements: 3.7_

  - [ ]* 18.2 Write unit test for initial-value-only controlled prop
    - Test that providing a value prop without `onChange` uses the value as initial state
    - _Requirements: 8.3_

- [x] 19. Create `src/components/DataTable/index.ts` barrel export
  - Re-export `DataTable` as default and named export
  - Re-export `DataTableProps` type
  - _Requirements: 10.2_

- [x] 20. Checkpoint — all components complete
  - Ensure all component tests pass and `npm run build` exits cleanly, ask the user if questions arise.

- [x] 21. Final checkpoint — full integration
  - Ensure all tests pass (`npx vitest --run`), `npm run build` exits cleanly, and the dev server renders the table with 500 rows, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Property tests use fast-check with `numRuns: 100` minimum
- Each property test includes a comment: `// Feature: data-table-component, Property N: <property_text>`
- Tailwind v4 uses `@tailwindcss/vite` plugin — no `tailwind.config.js` or PostCSS config needed
- All Tailwind utility classes must be static strings (no dynamic class construction) for correct purging
- The mock data generator uses zero external npm imports (built-in PRNG + Node.js `fs`)
