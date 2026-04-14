# Design Document: Data Table Sorting

## Overview

This document describes the technical design for Phase 2 of the data table component — click-to-sort functionality. Building on the Phase 1 foundation (column schema, row identity, hybrid state ownership), this phase adds:

- `SortDirection` and `SortState` types in `src/types/table.ts`
- A `SortCycle` pure function for direction transitions
- A `SortEngine` utility with nine type-aware comparators
- A `SortIndicator` React component for visual direction feedback
- Extensions to `TableHeader`, `useTableState`, and `DataTable`

All Phase 1 behavior is fully preserved. Sort state follows the same hybrid controlled/uncontrolled ownership pattern established for density and column visibility.

---

## Architecture

### File Changes

```
src/
├── types/
│   └── table.ts                  # EXTEND: add SortDirection, SortState
├── utils/
│   ├── sortEngine.ts             # NEW: SortEngine, TypeComparators, SortCycle
│   └── (existing utils unchanged)
├── components/DataTable/
│   ├── SortIndicator.tsx         # NEW: visual sort direction indicator
│   ├── TableHeader.tsx           # EXTEND: sortState prop, onSortChange, SortIndicator
│   └── DataTable.tsx             # EXTEND: sort props, SortEngine application
└── hooks/
    └── useTableState.ts          # EXTEND: sortState hybrid logic
```

### Data Flow

```
DataTable (props: sortState?, onSortChange?)
  │
  ├─ useTableState(props)
  │     └─ sortState (internal or controlled)
  │
  ├─ sortedRows = sortState.direction !== 'none'
  │     ? applySort(resolvedRows, sortState, normalizedColumns)
  │     : resolvedRows
  │
  ├─ <TableHeader
  │     columns={visibleNormalizedCols}
  │     sortState={sortState}
  │     onSortChange={setSortState}
  │   />
  │     └─ <th onClick={handleHeaderClick}>
  │           {col.label}
  │           {col.sortable && <SortIndicator direction={colDirection} />}
  │        </th>
  │
  └─ <TableBody rows={sortedRows} ... />
```

---

## Components and Interfaces

### SortIndicator

New component. Renders a Tailwind-styled directional arrow inside a sortable column header.

```ts
interface SortIndicatorProps {
  direction: SortDirection  // 'asc' | 'desc' | 'none'
}
```

- `'asc'` → upward-pointing chevron (border-based CSS triangle, no Unicode, no icon lib)
- `'desc'` → downward-pointing chevron
- `'none'` → neutral double-chevron or muted up/down pair indicating sortability
- Implemented as inline `<span>` elements with Tailwind border utilities

### TableHeader (extended)

```ts
interface TableHeaderProps {
  columns: NormalizedColumnDef[]
  sortState: SortState                          // NEW
  onSortChange: (state: SortState) => void      // NEW
}
```

- Sortable `<th>` elements gain `cursor-pointer` class and an `onClick` handler
- Click handler calls `SortCycle` on the current direction for that column, then calls `onSortChange`
- Non-sortable columns render no `SortIndicator` and no click handler

### DataTable (extended)

```ts
interface DataTableProps {
  columnDefs: ColumnDef[]
  rowData: RowData[]
  defaultDensity?: Density
  density?: Density
  onDensityChange?: (density: Density) => void
  visibleColumns?: string[]
  onVisibilityChange?: (key: string, visible: boolean) => void
  // Phase 2 additions:
  sortState?: SortState
  onSortChange?: (state: SortState) => void
}
```

### useTableState (extended return shape)

```ts
function useTableState(props: DataTableProps): {
  density: Density
  setDensity: (d: Density) => void
  visibleColumnKeys: string[]
  setVisibleColumnKeys: (keys: string[]) => void
  normalizedColumns: NormalizedColumnDef[]
  resolvedRows: ResolvedRow[]
  // Phase 2 additions:
  sortState: SortState
  setSortState: (state: SortState) => void
}
```

---

## Data Models

### New Types (`src/types/table.ts`)

```ts
export type SortDirection = 'asc' | 'desc' | 'none'

export interface SortState {
  columnKey: string    // empty string when direction is 'none'
  direction: SortDirection
}
```

**Invariant:** `direction === 'none'` implies `columnKey === ''`.

### Default Sort State

```ts
const DEFAULT_SORT_STATE: SortState = { columnKey: '', direction: 'none' }
```

---

## Utility Contracts

### `SortCycle(current: SortDirection): SortDirection`

Pure function. Advances direction through the fixed cycle:

```
'none' → 'asc' → 'desc' → 'none'
```

No side effects. No external dependencies. Exported from `src/utils/sortEngine.ts`.

### TypeComparators

Each comparator has the signature `(a: unknown, b: unknown) => number`. Returns negative if `a < b`, zero if equal, positive if `a > b`. Null/undefined values always sort last (positive return when `a` is null, negative when `b` is null).

| Export name | ColumnType(s) | Comparison logic |
|---|---|---|
| `compareNumber` | `number`, `integer`, `float` | `Number(a) - Number(b)` |
| `compareText` | `text`, `unknown` | `String(a).localeCompare(String(b))` |
| `compareDate` | `date`, `timestamp` | `new Date(a).getTime() - new Date(b).getTime()` |
| `compareBoolean` | `boolean` | `false` before `true` → `Number(a) - Number(b)` |
| `compareEnum` | `enum` | index of `a` in `enumValues` minus index of `b` |

All five are individually importable named exports from `src/utils/sortEngine.ts`.

The `unknown` type uses `compareText` — no separate comparator needed.

### `applySort(rows: ResolvedRow[], sortState: SortState, columns: NormalizedColumnDef[]): ResolvedRow[]`

The SortEngine entry point. Exported from `src/utils/sortEngine.ts`.

```ts
function applySort(
  rows: ResolvedRow[],
  sortState: SortState,
  columns: NormalizedColumnDef[]
): ResolvedRow[]
```

Behavior:
1. If `sortState.direction === 'none'`, return `rows` unchanged (same reference).
2. Locate the `NormalizedColumnDef` matching `sortState.columnKey`.
3. Select the TypeComparator for the column's `type`. For `enum`, pass `col.enumValues` to `compareEnum`.
4. Wrap the comparator with null-last logic: if either value is `null`/`undefined`, sort it after the non-null value regardless of direction.
5. Call `[...rows].sort(wrappedComparator)` — never mutates the input array.
6. If `sortState.direction === 'desc'`, reverse the comparator sign (multiply by `-1`).
7. Return the new sorted array.

**Null-last wrapper:**

```ts
function nullLast(compareFn: (a: unknown, b: unknown) => number) {
  return (a: unknown, b: unknown): number => {
    const aNull = a === null || a === undefined
    const bNull = b === null || b === undefined
    if (aNull && bNull) return 0
    if (aNull) return 1
    if (bNull) return -1
    return compareFn(a, b)
  }
}
```

The null-last wrapper is applied before direction inversion, so nulls remain last in both `'asc'` and `'desc'`.

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: SortCycle is a deterministic three-step cycle

*For any* `SortDirection` value, applying `SortCycle` three times must return the original direction. Additionally, `SortCycle('none')` must equal `'asc'`, `SortCycle('asc')` must equal `'desc'`, and `SortCycle('desc')` must equal `'none'`.

**Validates: Requirements 2.1, 2.2, 2.3, 2.5**

---

### Property 2: Non-sortable column clicks do not change sort state

*For any* `SortState` and any column where `sortable` is `false`, invoking the header click handler for that column must leave the sort state unchanged.

**Validates: Requirements 2.4**

---

### Property 3: Numeric comparator produces total ordering

*For any* two non-null numeric values `a` and `b`, `compareNumber(a, b)` must return a negative number when `a < b`, zero when `a === b`, and a positive number when `a > b`.

**Validates: Requirements 3.1**

---

### Property 4: Text comparator produces locale-consistent ordering

*For any* two non-null string values `a` and `b`, `compareText(a, b)` must return the same sign as `String(a).localeCompare(String(b))`.

**Validates: Requirements 3.2, 3.6**

---

### Property 5: Date comparator produces chronological ordering

*For any* two non-null date-parseable values `a` and `b`, `compareDate(a, b)` must return a negative number when `a` is earlier than `b`, zero when equal, and positive when `a` is later.

**Validates: Requirements 3.3**

---

### Property 6: Boolean comparator places false before true in ascending order

*For any* pair of boolean values, `compareBoolean(false, true)` must return a negative number and `compareBoolean(true, false)` must return a positive number.

**Validates: Requirements 3.4**

---

### Property 7: Enum comparator orders by enumValues index

*For any* `enumValues` array and any two values `a` and `b` present in that array, `compareEnum(a, b, enumValues)` must return a negative number when `indexOf(a) < indexOf(b)`, zero when equal, and positive when `indexOf(a) > indexOf(b)`.

**Validates: Requirements 3.5**

---

### Property 8: Null-last invariant holds for all types and both directions

*For any* array of rows containing a mix of null/undefined and non-null values in the sort column, after calling `applySort` with either `'asc'` or `'desc'` direction, all rows with null/undefined values must appear after all rows with non-null values.

**Validates: Requirements 3.7**

---

### Property 9: Sort produces correct ordering in both directions

*For any* non-empty array of rows with non-null values in the sort column, after calling `applySort` with `'asc'`, each consecutive pair of rows must satisfy `comparator(row[i], row[i+1]) <= 0`. After calling `applySort` with `'desc'`, each consecutive pair must satisfy `comparator(row[i], row[i+1]) >= 0`.

**Validates: Requirements 4.1, 4.2**

---

### Property 10: Sort with direction 'none' returns original order

*For any* array of rows, calling `applySort` with `direction: 'none'` must return the rows in the same order as the input array.

**Validates: Requirements 4.3, 7.3**

---

### Property 11: Sort is stable

*For any* array of rows where multiple rows have equal values in the sort column, after calling `applySort`, those equal rows must appear in the same relative order as in the input array.

**Validates: Requirements 4.4**

---

### Property 12: SortEngine does not mutate the input array

*For any* array of rows, after calling `applySort`, the original array reference must be unchanged and its elements must remain in their original positions.

**Validates: Requirements 4.5**

---

### Property 13: SortIndicator renders the correct element for every direction

*For any* `SortDirection` value, the `SortIndicator` component must render a distinct visual element: an upward indicator for `'asc'`, a downward indicator for `'desc'`, and a neutral indicator for `'none'`. The column label must appear in the same `<th>` as the indicator.

**Validates: Requirements 5.1, 5.2, 5.3, 5.5**

---

### Property 14: Sortable and non-sortable columns render correctly

*For any* column where `sortable` is `false`, the rendered `<th>` must contain no `SortIndicator` element and must not have a pointer cursor class. *For any* column where `sortable` is `true`, the rendered `<th>` must have the `cursor-pointer` class applied.

**Validates: Requirements 5.4, 5.7**

---

### Property 15: Controlled sort mode delegates to external state

*For any* `SortState` and `onSortChange` handler provided as props, clicking a sortable column header must call `onSortChange` with the next `SortState` and must not update any internal sort state.

**Validates: Requirements 6.2**

---

### Property 16: Sort state changes do not affect Phase 1 state dimensions

*For any* density value and visible column set, changing the sort state must leave `density` and `visibleColumnKeys` unchanged.

**Validates: Requirements 7.4**

---

### Property 17: SortState none invariant

*For any* `SortState` produced by `SortCycle` or by the default initialization, when `direction` is `'none'`, `columnKey` must be an empty string.

**Validates: Requirements 1.3**

---

## Error Handling

### Unknown Column Key in SortState

If `sortState.columnKey` does not match any column in `normalizedColumns`, `applySort` returns the input rows unchanged (same behavior as `direction: 'none'`). No error is thrown.

### Invalid Enum Value

If a cell value is not present in `enumValues`, `compareEnum` treats its index as `-1`, placing it before all known enum values. This degrades gracefully without throwing.

### Unparseable Date Values

If `new Date(value)` produces `NaN`, `compareDate` returns `0` (treats as equal). The null-last wrapper handles `null`/`undefined` before this branch is reached.

### Non-Sortable Column Clicked

The `TableHeader` click handler checks `col.sortable` before calling `onSortChange`. If `sortable` is `false`, the handler returns early — no state update occurs.

---

## Testing Strategy

### Dual Testing Approach

Phase 2 uses both unit tests and property-based tests:

- **Unit tests** cover specific examples, integration wiring, and initialization behavior (default sort state, controlled mode initialization, DataTable renders sorted rows).
- **Property-based tests** verify universal properties across randomly generated inputs, covering all comparators, the sort engine, and the cycle function.

### Property-Based Testing Library

Use **[fast-check](https://github.com/dubzzz/fast-check)** (already a dev dependency from Phase 1).

Each property test must run a minimum of **100 iterations** (set via `{ numRuns: 100 }`).

### Property Test Tags

Each property-based test must include a comment referencing the design property:

```
// Feature: data-table-sorting, Property N: <property_text>
```

### Property Test Mapping

| Property | Test file | fast-check arbitraries |
|---|---|---|
| P1: SortCycle determinism | `sortEngine.test.ts` | `fc.constantFrom('none','asc','desc')` |
| P2: Non-sortable no state change | `TableHeader.test.tsx` | `fc.record({ sortable: fc.constant(false), ... })` |
| P3: Numeric comparator ordering | `sortEngine.test.ts` | `fc.tuple(fc.float(), fc.float())` |
| P4: Text comparator ordering | `sortEngine.test.ts` | `fc.tuple(fc.string(), fc.string())` |
| P5: Date comparator ordering | `sortEngine.test.ts` | `fc.tuple(fc.date(), fc.date())` |
| P6: Boolean comparator ordering | `sortEngine.test.ts` | `fc.tuple(fc.boolean(), fc.boolean())` |
| P7: Enum comparator ordering | `sortEngine.test.ts` | `fc.array(fc.string(), {minLength:2})` for enumValues |
| P8: Null-last invariant | `sortEngine.test.ts` | `fc.array(fc.option(fc.float()))` mixed null/non-null |
| P9: Sort ordering asc+desc | `sortEngine.test.ts` | `fc.array(fc.record({...}), {minLength:1})` |
| P10: Sort identity for 'none' | `sortEngine.test.ts` | `fc.array(fc.record({...}))` |
| P11: Stable sort | `sortEngine.test.ts` | `fc.array(fc.record({...}))` with duplicate values |
| P12: No mutation | `sortEngine.test.ts` | `fc.array(fc.record({...}))` |
| P13: SortIndicator renders per direction | `SortIndicator.test.tsx` | `fc.constantFrom('asc','desc','none')` |
| P14: Sortable/non-sortable header rendering | `TableHeader.test.tsx` | `fc.record({ sortable: fc.boolean(), ... })` |
| P15: Controlled sort mode | `DataTable.test.tsx` | `fc.record({ columnKey: fc.string(), direction: fc.constantFrom(...) })` |
| P16: Sort state isolation | `useTableState.test.ts` | `fc.constantFrom('compact','default','comfortable')` × sort states |
| P17: SortState none invariant | `sortEngine.test.ts` | Verify `SortCycle('desc')` and default state |

### Unit Tests

Unit tests (Vitest + Testing Library) cover:

- `DataTable` initializes sort state to `{ columnKey: '', direction: 'none' }` when no sort props are provided (Requirement 6.3)
- `DataTable` uses provided `sortState` as initial value when only `sortState` is given without `onSortChange` (Requirement 6.4)
- `DataTable` renders rows in sorted order when `sortState` is set (Requirement 4.6 / 7.1)
- `DataTable` passes `sortState` and handler to `TableHeader` (Requirement 7.2)
- `useTableState` returns `sortState` and `setSortState` in its return shape (Requirement 7.6)
- `SortEngine` named exports exist for all five TypeComparators (Requirement 3.8)
