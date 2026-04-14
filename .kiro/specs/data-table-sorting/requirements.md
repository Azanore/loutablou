# Requirements Document

## Introduction

Phase 2 of the data table component project adds click-to-sort functionality to the existing DataTable component. Building on the Phase 1 foundation (column schema, row identity, hybrid state ownership), this phase introduces: a `SortState` type, type-aware comparators for all nine `ColumnType` values, single-column sort with asc/desc/none cycling, sort indicators in column headers, and hybrid state ownership consistent with the Phase 1 pattern.

The feature integrates with the existing `NormalizedColumnDef.sortable` field (already defined in Phase 1) and the `useTableState` hook, extending both without modifying unrelated Phase 1 behavior.

## Glossary

- **SortState**: A type describing the current sort configuration — the column key being sorted and the sort direction. Defined in this phase.
- **SortDirection**: The union type `'asc' | 'desc' | 'none'`. `'none'` means no sort is applied.
- **SortCycle**: The deterministic transition function that advances sort direction: `'none' → 'asc' → 'desc' → 'none'`.
- **Comparator**: A pure function `(a: unknown, b: unknown) => number` used to order two cell values. Returns negative if a < b, zero if equal, positive if a > b.
- **TypeComparator**: A Comparator specialized for a specific `ColumnType`.
- **SortEngine**: The utility that applies a `SortState` to a `ResolvedRow[]` array and returns a new sorted array.
- **SortIndicator**: The visual element rendered inside a sortable column header `<th>` that communicates the current sort direction for that column.
- **useSortState**: The hook (or hook extension) that manages `SortState` with hybrid controlled/uncontrolled ownership.
- **DataTable**: The existing top-level React component, extended in this phase to accept sort props and pass sorted rows to `TableBody`.
- **TableHeader**: The existing `<thead>` component, extended in this phase to render `SortIndicator` elements and handle header click events.
- **NormalizedColumnDef**: The existing normalized column schema type. Its `sortable: boolean` field (defined in Phase 1) gates sort behavior in this phase.
- **ResolvedRow**: The existing row type after identity resolution.

---

## Requirements

### Requirement 1: SortState Type Definition

**User Story:** As a developer, I want a well-typed `SortState` contract, so that sort configuration can be passed between components and hooks without ambiguity.

#### Acceptance Criteria

1. THE DataTable SHALL define `SortDirection` as the union type `'asc' | 'desc' | 'none'`.
2. THE DataTable SHALL define `SortState` as an object with fields `columnKey` (string) and `direction` (SortDirection).
3. WHEN `direction` is `'none'`, THE SortState `columnKey` SHALL be an empty string.
4. THE `SortState` and `SortDirection` types SHALL be exported from `src/types/table.ts`.

---

### Requirement 2: Sort Direction Cycling

**User Story:** As a user, I want clicking a sortable column header to cycle through ascending, descending, and unsorted states, so that I can control sort direction with minimal clicks.

#### Acceptance Criteria

1. WHEN a user clicks a column header where `sortable` is `true` and the column is not currently sorted, THE DataTable SHALL set the sort direction for that column to `'asc'`.
2. WHEN a user clicks a column header where `sortable` is `true` and the column is currently sorted `'asc'`, THE DataTable SHALL set the sort direction for that column to `'desc'`.
3. WHEN a user clicks a column header where `sortable` is `true` and the column is currently sorted `'desc'`, THE DataTable SHALL clear the sort state, setting direction to `'none'` and `columnKey` to an empty string.
4. WHEN a user clicks a column header where `sortable` is `false`, THE DataTable SHALL NOT change the sort state.
5. THE SortCycle SHALL be a pure function that accepts the current `SortDirection` and returns the next `SortDirection` in the cycle `'none' → 'asc' → 'desc' → 'none'`.

---

### Requirement 3: Type-Aware Comparators

**User Story:** As a user, I want sorted columns to order values correctly for their data type, so that numbers sort numerically, dates sort chronologically, and text sorts alphabetically.

#### Acceptance Criteria

1. WHEN sorting a column of type `'number'`, `'integer'`, or `'float'`, THE SortEngine SHALL order rows by numeric value.
2. WHEN sorting a column of type `'text'` or `'unknown'`, THE SortEngine SHALL order rows lexicographically using locale-aware string comparison.
3. WHEN sorting a column of type `'date'` or `'timestamp'`, THE SortEngine SHALL order rows by the numeric timestamp value of the parsed date.
4. WHEN sorting a column of type `'boolean'`, THE SortEngine SHALL order rows with `false` before `true` in ascending direction.
5. WHEN sorting a column of type `'enum'`, THE SortEngine SHALL order rows by the index of the cell value within the column's `enumValues` array.
6. WHEN sorting a column of type `'unknown'`, THE SortEngine SHALL apply lexicographic sort identical to the `'text'` comparator.
7. IF a cell value is `null` or `undefined`, THEN THE SortEngine SHALL place that row after all rows with non-null values, regardless of sort direction.
8. THE SortEngine SHALL expose one TypeComparator function per `ColumnType` as individually importable named exports.

---

### Requirement 4: Sort Application and Row Ordering

**User Story:** As a user, I want the table rows to reflect the current sort state, so that I can read data in the order I selected.

#### Acceptance Criteria

1. WHEN `SortState.direction` is `'asc'`, THE SortEngine SHALL return rows ordered from lowest to highest value according to the column's TypeComparator.
2. WHEN `SortState.direction` is `'desc'`, THE SortEngine SHALL return rows ordered from highest to lowest value according to the column's TypeComparator.
3. WHEN `SortState.direction` is `'none'`, THE SortEngine SHALL return rows in their original input order.
4. THE SortEngine SHALL perform a stable sort — WHEN two rows compare as equal, THE SortEngine SHALL preserve their relative order from the input array.
5. THE SortEngine SHALL return a new array and SHALL NOT mutate the input `ResolvedRow[]` array.
6. THE DataTable SHALL apply the SortEngine to `resolvedRows` before passing rows to `TableBody`.

---

### Requirement 5: Sort Indicators in Column Headers

**User Story:** As a user, I want to see a visual indicator on the sorted column header showing the current sort direction, so that I always know which column is sorted and in which direction.

#### Acceptance Criteria

1. WHEN a column is sorted `'asc'`, THE TableHeader SHALL render a SortIndicator in that column's `<th>` showing an upward-pointing arrow.
2. WHEN a column is sorted `'desc'`, THE TableHeader SHALL render a SortIndicator in that column's `<th>` showing a downward-pointing arrow.
3. WHEN a column has `sortable` set to `true` and is not currently sorted, THE TableHeader SHALL render a neutral SortIndicator (no direction) in that column's `<th>` to signal that the column is sortable.
4. WHEN a column has `sortable` set to `false`, THE TableHeader SHALL NOT render any SortIndicator in that column's `<th>`.
5. THE TableHeader SHALL render the column label and SortIndicator together within the same `<th>` element.
6. THE SortIndicator SHALL be implemented using Tailwind-styled HTML elements — not Unicode arrow characters or external icon libraries.
7. WHEN a column header with `sortable` set to `true` is rendered, THE TableHeader SHALL apply a pointer cursor style to that `<th>` to signal interactivity.

---

### Requirement 6: Hybrid State Ownership for Sort

**User Story:** As a developer, I want sort state to follow the same hybrid ownership pattern as density and column visibility, so that I can use the table as a self-contained widget or as a controlled component.

#### Acceptance Criteria

1. THE DataTable SHALL accept an optional `sortState` prop of type `SortState` and an optional `onSortChange` prop of type `(state: SortState) => void`.
2. WHEN both `sortState` and `onSortChange` are provided, THE DataTable SHALL operate in controlled mode: use `sortState` as the current sort configuration and call `onSortChange` when the user clicks a sortable header.
3. WHEN neither `sortState` nor `onSortChange` is provided, THE DataTable SHALL manage sort state internally, initializing to `{ columnKey: '', direction: 'none' }`.
4. WHEN only `sortState` is provided without `onSortChange`, THE DataTable SHALL use the provided value as the initial sort state and manage subsequent changes internally.
5. THE DataTable SHALL follow the `on`-prefix naming convention established in Phase 1 for the `onSortChange` handler prop.
6. THE `useTableState` hook SHALL be extended to manage `SortState` using the same hybrid ownership logic applied to density and column visibility in Phase 1.

---

### Requirement 7: Integration with Existing DataTable

**User Story:** As a developer, I want the sorting feature to integrate cleanly with the existing DataTable component, so that Phase 1 behavior is fully preserved and no existing props or state dimensions are affected.

#### Acceptance Criteria

1. THE DataTable SHALL pass sorted rows (output of SortEngine) to `TableBody` in place of the unsorted `resolvedRows`.
2. THE DataTable SHALL pass the current `SortState` and a sort-change handler to `TableHeader` so it can render indicators and handle clicks.
3. WHEN `sortState.direction` is `'none'`, THE DataTable SHALL pass rows to `TableBody` in their original resolved order, with no sort computation applied.
4. THE DataTable SHALL NOT modify the behavior of density, column visibility, or any other Phase 1 state dimension when sort state changes.
5. THE `TableHeader` component SHALL accept `sortState` and `onSortChange` as new props without altering its existing `columns` prop contract.
6. THE `useTableState` hook SHALL return `sortState` and `setSortState` alongside the existing return values, without removing or renaming any existing return values.
