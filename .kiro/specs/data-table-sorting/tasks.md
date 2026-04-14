# Implementation Plan: Data Table Sorting (Phase 2)

## Overview

Incremental build-out of click-to-sort functionality on top of the Phase 1 DataTable. Each task produces runnable, type-safe code that builds on the previous step. Tasks are ordered so the project compiles after every step.

## Tasks

- [x] 1. Add `SortDirection` and `SortState` types to `src/types/table.ts`
  - Append `SortDirection = 'asc' | 'desc' | 'none'` union type
  - Append `SortState` interface with `columnKey: string` and `direction: SortDirection`
  - Export both from `src/types/table.ts` alongside existing Phase 1 types
  - Do not rename or remove any existing exports
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 2. Implement `src/utils/sortEngine.ts`
  - [x] 2.1 Implement `SortCycle` pure function
    - Export `SortCycle(current: SortDirection): SortDirection` advancing `'none' → 'asc' → 'desc' → 'none'`
    - _Requirements: 2.5_

  - [ ]* 2.2 Write property test for `SortCycle` — Property 1
    - **Property 1: SortCycle is a deterministic three-step cycle**
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.5**
    - File: `src/utils/sortEngine.test.ts`
    - Use `fc.constantFrom('none', 'asc', 'desc')`; assert three applications return original; assert each individual transition; run 100 iterations

  - [ ]* 2.3 Write property test for `SortState` none invariant — Property 17
    - **Property 17: SortState none invariant**
    - **Validates: Requirements 1.3**
    - File: `src/utils/sortEngine.test.ts`
    - Assert `SortCycle('desc')` returns `'none'`; assert default state `{ columnKey: '', direction: 'none' }` satisfies invariant

  - [x] 2.4 Implement five TypeComparators and `nullLast` helper
    - Export `compareNumber(a, b)` — `Number(a) - Number(b)`
    - Export `compareText(a, b)` — `String(a).localeCompare(String(b))`
    - Export `compareDate(a, b)` — `new Date(String(a)).getTime() - new Date(String(b)).getTime()`
    - Export `compareBoolean(a, b)` — `Number(a as boolean) - Number(b as boolean)`
    - Export `compareEnum(a, b, enumValues)` — index-based comparison; unknown values treated as index `-1`
    - Implement unexported `nullLast(compareFn)` wrapper: null/undefined always sorts last regardless of direction
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8_

  - [ ]* 2.5 Write property test for numeric comparator — Property 3
    - **Property 3: Numeric comparator produces total ordering**
    - **Validates: Requirements 3.1**
    - File: `src/utils/sortEngine.test.ts`
    - Use `fc.tuple(fc.float({ noNaN: true }), fc.float({ noNaN: true }))`; assert sign matches `a - b`; run 100 iterations

  - [ ]* 2.6 Write property test for text comparator — Property 4
    - **Property 4: Text comparator produces locale-consistent ordering**
    - **Validates: Requirements 3.2, 3.6**
    - File: `src/utils/sortEngine.test.ts`
    - Use `fc.tuple(fc.string(), fc.string())`; assert sign matches `localeCompare`; run 100 iterations

  - [ ]* 2.7 Write property test for date comparator — Property 5
    - **Property 5: Date comparator produces chronological ordering**
    - **Validates: Requirements 3.3**
    - File: `src/utils/sortEngine.test.ts`
    - Use `fc.tuple(fc.date(), fc.date())`; assert sign matches timestamp difference; run 100 iterations

  - [ ]* 2.8 Write property test for boolean comparator — Property 6
    - **Property 6: Boolean comparator places false before true in ascending order**
    - **Validates: Requirements 3.4**
    - File: `src/utils/sortEngine.test.ts`
    - Assert `compareBoolean(false, true) < 0` and `compareBoolean(true, false) > 0`; run 100 iterations

  - [ ]* 2.9 Write property test for enum comparator — Property 7
    - **Property 7: Enum comparator orders by enumValues index**
    - **Validates: Requirements 3.5**
    - File: `src/utils/sortEngine.test.ts`
    - Use `fc.array(fc.string(), { minLength: 2, maxLength: 10 })` for enumValues; pick two distinct indices; assert sign matches index difference; run 100 iterations

  - [x] 2.10 Implement `applySort` function
    - Export `applySort(rows, sortState, columns): ResolvedRow[]`
    - Return same reference when `direction === 'none'` (optimization)
    - Locate column by `sortState.columnKey`; return rows unchanged if column not found
    - Select TypeComparator by `col.type`; pass `col.enumValues` for `'enum'`; use `compareText` for `'unknown'`
    - Wrap comparator with `nullLast`; invert sign for `'desc'`
    - Sort via `[...rows].sort(wrappedComparator)` — never mutate input
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [ ]* 2.11 Write property test for null-last invariant — Property 8
    - **Property 8: Null-last invariant holds for all types and both directions**
    - **Validates: Requirements 3.7**
    - File: `src/utils/sortEngine.test.ts`
    - Use `fc.array(fc.option(fc.float({ noNaN: true })), { minLength: 1 })`; after `applySort` with `'asc'` and `'desc'`, assert all null/undefined rows appear after non-null rows; run 100 iterations

  - [ ]* 2.12 Write property test for sort ordering — Property 9
    - **Property 9: Sort produces correct ordering in both directions**
    - **Validates: Requirements 4.1, 4.2**
    - File: `src/utils/sortEngine.test.ts`
    - Use `fc.array(fc.record({ _tableRowId: fc.integer(), val: fc.float({ noNaN: true }) }), { minLength: 1 })`; assert consecutive pairs satisfy `<= 0` for `'asc'` and `>= 0` for `'desc'`; run 100 iterations

  - [ ]* 2.13 Write property test for sort identity with 'none' — Property 10
    - **Property 10: Sort with direction 'none' returns original order**
    - **Validates: Requirements 4.3, 7.3**
    - File: `src/utils/sortEngine.test.ts`
    - Use `fc.array(fc.record({ _tableRowId: fc.integer() }))`; assert returned reference is identical to input; run 100 iterations

  - [ ]* 2.14 Write property test for stable sort — Property 11
    - **Property 11: Sort is stable**
    - **Validates: Requirements 4.4**
    - File: `src/utils/sortEngine.test.ts`
    - Build rows with duplicate sort-column values; assert relative order of equal rows is preserved after `applySort`; run 100 iterations

  - [ ]* 2.15 Write property test for no mutation — Property 12
    - **Property 12: SortEngine does not mutate the input array**
    - **Validates: Requirements 4.5**
    - File: `src/utils/sortEngine.test.ts`
    - Snapshot input array before and after `applySort`; assert original array is unchanged; run 100 iterations

- [x] 3. Checkpoint — sortEngine complete
  - Ensure all `sortEngine.test.ts` tests pass, ask the user if questions arise.

- [x] 4. Implement `SortIndicator` component
  - Create `src/components/DataTable/SortIndicator.tsx`
  - Accept `direction: SortDirection` prop
  - `'asc'` → upward-pointing CSS triangle using Tailwind border utilities (no Unicode, no icon libs)
  - `'desc'` → downward-pointing CSS triangle
  - `'none'` → neutral muted up/down pair indicating sortability
  - All Tailwind classes must be static strings
  - _Requirements: 5.1, 5.2, 5.3, 5.6_

  - [ ]* 4.1 Write property test for `SortIndicator` rendering — Property 13
    - **Property 13: SortIndicator renders the correct element for every direction**
    - **Validates: Requirements 5.1, 5.2, 5.3, 5.5**
    - File: `src/components/DataTable/SortIndicator.test.tsx`
    - Use `fc.constantFrom('asc', 'desc', 'none')`; assert each direction renders a distinct element with the expected `data-direction` or aria attribute; run 100 iterations

- [x] 5. Extend `TableHeader` with sort props, click handlers, and `SortIndicator` rendering
  - Add `sortState: SortState` and `onSortChange: (state: SortState) => void` to `TableHeaderProps`
  - Sortable `<th>` elements: add `cursor-pointer` class and `onClick` handler
  - Click handler: call `SortCycle` on current direction for that column; emit new `SortState` via `onSortChange`; when cycling to `'none'` set `columnKey` to `''`
  - Render `<SortIndicator direction={colDirection} />` inside sortable `<th>` alongside the label
  - Non-sortable columns: no `SortIndicator`, no click handler, no `cursor-pointer`
  - Do not alter the existing `columns` prop contract
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 5.1, 5.2, 5.3, 5.4, 5.5, 5.7, 7.2, 7.5_

  - [ ]* 5.1 Write property test for non-sortable column click — Property 2
    - **Property 2: Non-sortable column clicks do not change sort state**
    - **Validates: Requirements 2.4**
    - File: `src/components/DataTable/TableHeader.test.tsx`
    - Use `fc.record({ sortable: fc.constant(false), key: fc.string(), label: fc.string() })`; simulate click; assert `onSortChange` is never called; run 100 iterations

  - [ ]* 5.2 Write property test for sortable/non-sortable header rendering — Property 14
    - **Property 14: Sortable and non-sortable columns render correctly**
    - **Validates: Requirements 5.4, 5.7**
    - File: `src/components/DataTable/TableHeader.test.tsx`
    - Use `fc.record({ sortable: fc.boolean(), key: fc.string(), label: fc.string() })`; assert `cursor-pointer` present iff `sortable` is true; assert `SortIndicator` absent when `sortable` is false; run 100 iterations

- [x] 6. Extend `useTableState` hook with `sortState` hybrid logic
  - Add `sortState?: SortState` and `onSortChange?: (state: SortState) => void` to `DataTableProps` in `src/hooks/useTableState.ts`
  - Add internal `_sortState` useState initialized from `props.sortState ?? DEFAULT_SORT_STATE`
  - Implement `SORT_CONTROLLED` predicate (both `props.sortState` + `props.onSortChange` defined)
  - Expose `sortState` (controlled or internal) and `setSortState` in the return shape
  - Do not remove or rename any existing return values (`density`, `setDensity`, `visibleColumnKeys`, `setVisibleColumnKeys`, `normalizedColumns`, `resolvedRows`)
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 7.6_

  - [ ]* 6.1 Write property test for sort state isolation — Property 16
    - **Property 16: Sort state changes do not affect Phase 1 state dimensions**
    - **Validates: Requirements 7.4**
    - File: `src/hooks/useTableState.test.ts`
    - Use `fc.constantFrom('compact', 'default', 'comfortable')` × sort states; assert `density` and `visibleColumnKeys` unchanged after `setSortState` call; run 100 iterations

- [x] 7. Extend `DataTable` to wire sort props and apply `SortEngine` to rows
  - Add `sortState` and `onSortChange` to the destructured `useTableState` return
  - Compute `sortedRows`: when `sortState.direction !== 'none'` call `applySort(resolvedRows, sortState, normalizedColumns)`, otherwise pass `resolvedRows` unchanged
  - Pass `sortedRows` to `<TableBody>` in place of `resolvedRows`
  - Pass `sortState` and `setSortState` to `<TableHeader>` as new props
  - Do not alter density, column visibility, or any other Phase 1 wiring
  - _Requirements: 4.6, 6.1, 6.2, 6.3, 6.4, 7.1, 7.2, 7.3, 7.4_

  - [ ]* 7.1 Write property test for controlled sort mode — Property 15
    - **Property 15: Controlled sort mode delegates to external state**
    - **Validates: Requirements 6.2**
    - File: `src/components/DataTable/DataTable.test.tsx`
    - Use `fc.record({ columnKey: fc.string(), direction: fc.constantFrom('asc', 'desc', 'none') })`; provide `sortState` + `onSortChange` spy; simulate header click; assert spy called with next state and internal state unchanged; run 100 iterations

  - [ ]* 7.2 Write unit tests for `DataTable` sort initialization and rendering
    - Test: initializes sort state to `{ columnKey: '', direction: 'none' }` when no sort props provided (Requirement 6.3)
    - Test: uses provided `sortState` as initial value when only `sortState` given without `onSortChange` (Requirement 6.4)
    - Test: renders rows in sorted order when `sortState` is set (Requirements 4.6, 7.1)
    - Test: passes `sortState` and handler to `TableHeader` (Requirement 7.2)
    - Test: `useTableState` return shape includes `sortState` and `setSortState` (Requirement 7.6)
    - Test: named exports for all five TypeComparators exist (Requirement 3.8)

- [x] 8. Final checkpoint — all tests pass, build clean
  - Ensure all tests pass (`npx vitest --run`), `npm run build` exits cleanly, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Property tests use fast-check with `numRuns: 100` minimum
- Each property test includes a comment: `// Feature: data-table-sorting, Property N: <property_text>`
- All Tailwind classes must be static strings — no dynamic class construction that breaks purging
- `SortIndicator` uses border-based CSS triangles — no Unicode arrow characters, no external icon libraries
- `applySort` returns the same array reference when `direction` is `'none'` (optimization — avoids unnecessary re-renders)
- Phase 1 behavior must be fully preserved — no existing return values from `useTableState` renamed or removed
