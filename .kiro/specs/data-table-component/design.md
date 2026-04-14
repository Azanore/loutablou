# Design Document: Data Table Component

## Overview

This document describes the technical design for Phase 1 of the data table component — a high-end, reusable table built for dashboard power users. The implementation targets a fresh Vite + React + TypeScript project styled with Tailwind CSS v4.

Phase 1 delivers the structural foundation: project scaffolding, column schema normalization, row identity resolution, a three-level density system, column visibility management, core rendering components (shell, header, body, row, empty state), UI controls (density toggle, column visibility panel), a deterministic mock data generator, and an app entry point wiring everything together.

The component is designed for hybrid state ownership — it manages its own state by default but yields control to a parent when value + onChange props are provided for any state dimension.

---

## Architecture

### High-Level Structure

```
src/
├── components/
│   └── DataTable/
│       ├── DataTable.tsx          # Top-level component, state orchestration
│       ├── TableShell.tsx         # Scrollable outer container + <table>
│       ├── TableHeader.tsx        # <thead> with injected row-number column
│       ├── TableBody.tsx          # <tbody>, delegates to TableRow or EmptyState
│       ├── TableRow.tsx           # Single <tr> with formatted cells
│       ├── EmptyState.tsx         # Empty/error feedback component
│       ├── DensityToggle.tsx      # Density cycle control
│       ├── ColumnVisibilityPanel.tsx  # Per-column show/hide toggles
│       └── index.ts               # Public re-export
├── types/
│   └── table.ts                   # All shared TypeScript types
├── utils/
│   ├── normalizeColumn.ts         # ColumnDef default-filling logic
│   ├── resolveRowIdentity.ts      # Row id / _tableRowId injection
│   ├── densityTokens.ts           # Density → Tailwind class mapping
│   └── formatCellValue.ts         # Type-aware cell value formatter
├── hooks/
│   └── useTableState.ts           # Hybrid state ownership hook
├── data/
│   └── mock-data.json             # Generated mock data (500 rows)
├── scripts/
│   └── generateMockData.ts        # Deterministic mock data generator
├── App.tsx                        # Entry point wiring DataTable + mock data
└── main.tsx                       # Vite entry, ReactDOM.createRoot
```

### Data Flow

```
App.tsx
  └─ <DataTable columnDefs={...} rowData={...} defaultDensity="default">
        │
        ├─ useTableState(columnDefs, rowData, props)
        │     ├─ normalizeColumn(def)          per column at init
        │     ├─ resolveRowIdentity(rows)       all rows at init
        │     ├─ density state (internal or controlled)
        │     └─ visibleColumns state (internal or controlled)
        ├─ <DensityToggle density onDensityChange />
        ├─ <ColumnVisibilityPanel columns visibleColumns onVisibilityChange />
        └─ <TableShell>
              ├─ <TableHeader columns={visibleNormalizedCols} />
              └─ <TableBody
                    rows={resolvedRows}
                    columns={visibleNormalizedCols}
                    density={density}
                    emptyVariant="empty" | "error"
                  >
                    └─ <TableRow /> × N   or   <EmptyState />
```

### Tailwind CSS v4 Setup

Tailwind CSS v4 introduces a significant change from v3: configuration moves from `tailwind.config.js` into CSS using `@import "tailwindcss"` and `@theme` directives. There is no longer a separate config file for most use cases.

**Installation:**
```bash
npm install tailwindcss @tailwindcss/vite
```

**vite.config.ts** — use the dedicated Vite plugin (replaces PostCSS integration):
```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

**src/index.css** — single import, no config file needed:
```css
@import "tailwindcss";
```

> Note: The requirements list `postcss` and `autoprefixer` as dependencies. In Tailwind v4 with the Vite plugin, PostCSS/Autoprefixer are handled internally by the plugin. If the project must use the PostCSS path instead (e.g., for compatibility), the setup is:
> ```
> npm install tailwindcss @tailwindcss/postcss postcss autoprefixer
> ```
> with a `postcss.config.js` using `@tailwindcss/postcss`. Either path produces the same output; the Vite plugin path is simpler for a Vite project.

---

## Components and Interfaces

### DataTable

The top-level component. Composes all sub-components and owns (or proxies) all state.

```ts
interface DataTableProps {
  columnDefs: ColumnDef[]
  rowData: RowData[]
  defaultDensity?: Density
  // Controlled density
  density?: Density
  onDensityChange?: (density: Density) => void
  // Controlled column visibility
  visibleColumns?: string[]
  onVisibilityChange?: (key: string, visible: boolean) => void
}
// Phase 2+ event handlers (onSortChange, onFilterChange,
// onSelectionChange, onRowExpand) are added in their
// respective phases — not stubbed here.
```

### TableShell

Renders the scrollable container and `<table>` element.

```ts
interface TableShellProps {
  children: React.ReactNode
  cssVars: React.CSSProperties  // --row-height-* custom properties
}
```

### TableHeader

Renders `<thead>` with the injected row-number `<th>` followed by one `<th>` per visible column.

```ts
interface TableHeaderProps {
  columns: NormalizedColumnDef[]
}
```

### TableBody

Renders `<tbody>`. Delegates to `TableRow` per row or `EmptyState` when rows is empty.

```ts
interface TableBodyProps {
  rows: ResolvedRow[]
  columns: NormalizedColumnDef[]
  density: Density
  emptyVariant?: 'empty' | 'error'
}
```

### TableRow

Renders a single `<tr>` with formatted cell values.

```ts
interface TableRowProps {
  row: ResolvedRow
  columns: NormalizedColumnDef[]
  rowIndex: number   // 0-based; displayed as rowIndex + 1
  density: Density
}
```

### EmptyState

```ts
interface EmptyStateProps {
  variant: 'empty' | 'error'
  colSpan: number   // visibleColumns.length + 1
}
```

### DensityToggle

```ts
interface DensityToggleProps {
  density: Density
  onDensityChange: (density: Density) => void
}
```

### ColumnVisibilityPanel

```ts
interface ColumnVisibilityPanelProps {
  columns: NormalizedColumnDef[]          // excludes row-number column
  visibleColumns: string[]                // array of visible column keys
  onVisibilityChange: (key: string, visible: boolean) => void
}
```

---

## Data Models

### Core Types (`src/types/table.ts`)

```ts
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
  // pinned: Phase 5 field — not included in Phase 1
  sortable: boolean
  filterable: boolean
  aggregatable: boolean
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

// SortState and FilterState are defined in Phase 2 and 3 respectively — not created here.
```

### Density Token Map

| Density | rowHeight | paddingClass | fontSizeClass |
|---------|-----------|--------------|---------------|
| compact | 32 | py-1 | text-xs |
| default | 44 | py-2.5 | text-sm |
| comfortable | 56 | py-4 | text-sm |

### CSS Custom Properties

Applied to the table's root element via inline `style`:

```ts
{
  '--row-height-compact': '32px',
  '--row-height-default': '44px',
  '--row-height-comfortable': '56px',
}
```

---

## Utility Contracts

### `normalizeColumn(def: ColumnDef): NormalizedColumnDef`

- If `def.align` is explicitly provided, return it unchanged.
- Otherwise derive default align from `def.type`:
  - `'number' | 'integer' | 'float'` → `'right'`
  - `'date' | 'timestamp' | 'boolean' | 'enum'` → `'center'`
  - `'text' | 'unknown'` → `'left'`
- For `type === 'unknown'`: also ensure `aggregatable` is `false` (override if true).

### `resolveRowIdentity(rows: RowData[]): ResolvedRow[]`

- Returns a new array; never mutates input objects.
- For each row at index `i`:
  - If `row.id` exists: `_tableRowId = i` (index still injected for consistent shape; identity key remains `id`).
  - If `row.id` is absent: inject `_tableRowId = i` as the identity.
- The returned objects are shallow copies (`{ ...row, _tableRowId: i }`).

### `getDensityTokens(density: Density): DensityTokens`

- Pure lookup; returns the token object for the given density level.

### `formatCellValue(value: unknown, type: ColumnType): string`

- `null | undefined` → `'—'` (em dash)
- `'boolean'` → `true` → `'Yes'`, `false` → `'No'`
- `'date' | 'timestamp'` → `new Date(value).toLocaleDateString()`
- All other types → `String(value)`

---

## Hook Contracts

### `useTableState(props: DataTableProps)`

Implements hybrid state ownership for density and column visibility.

```ts
function useTableState(props: DataTableProps): {
  density: Density
  setDensity: (d: Density) => void
  visibleColumnKeys: string[]
  setVisibleColumnKeys: (keys: string[]) => void
  normalizedColumns: NormalizedColumnDef[]
  resolvedRows: ResolvedRow[]
}
```

**Density state logic:**
- If `props.density` and `props.onDensityChange` are both provided → controlled mode: use `props.density`, call `props.onDensityChange` on change.
- If only `props.density` is provided (no handler) → use as initial value, manage internally.
- Otherwise → initialize from `props.defaultDensity ?? 'default'`, manage internally.

**Column visibility state logic:**
- If `props.visibleColumns` and `props.onVisibilityChange` are both provided → controlled mode.
- If only `props.visibleColumns` is provided → use as initial value, manage internally.
- Otherwise → derive from `columnDefs[].visible`.

> Adapter note: `setVisibleColumnKeys` takes a full `string[]` internally. When wiring `ColumnVisibilityPanel.onVisibilityChange(key, visible)` through `DataTable`, the adapter is: `(key, visible) => setVisibleColumnKeys(visible ? [...keys, key] : keys.filter(k => k !== key))`.

**Initialization (runs once on mount):**
1. `normalizedColumns = props.columnDefs.map(normalizeColumn)`
2. `resolvedRows = resolveRowIdentity(props.rowData)`

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: NormalizeColumn sets align by type

*For any* ColumnDef without an explicit `align` field, `normalizeColumn` must set `align` to `'right'` for numeric types (`number`, `integer`, `float`), `'center'` for categorical/temporal types (`date`, `timestamp`, `boolean`, `enum`), and `'left'` for text/unknown types (`text`, `unknown`).

**Validates: Requirements 1.3, 1.4, 1.5**

---

### Property 2: Explicit align is never overridden

*For any* ColumnDef with an explicitly provided `align` value, `normalizeColumn` must return that exact `align` value regardless of the column's `type`.

**Validates: Requirements 1.7**

---

### Property 3: Row identity uses id when present

*For any* array of row objects where each row has an `id` field, `resolveRowIdentity` must return rows whose `id` values are unchanged from the input.

**Validates: Requirements 2.1**

---

### Property 4: Row identity injects _tableRowId when id is absent

*For any* array of row objects without an `id` field, `resolveRowIdentity` must return rows where each row's `_tableRowId` equals its 0-based index in the input array.

**Validates: Requirements 2.2**

---

### Property 5: resolveRowIdentity does not mutate input rows

*For any* array of row objects, after calling `resolveRowIdentity`, the original input row objects must not have a `_tableRowId` property added to them.

**Validates: Requirements 2.4**

---

### Property 6: getDensityTokens returns correct tokens for every density

*For any* density level (`compact`, `default`, `comfortable`), `getDensityTokens` must return the exact token set specified: compact → `{rowHeight: 32, paddingClass: 'py-1', fontSizeClass: 'text-xs'}`, default → `{rowHeight: 44, paddingClass: 'py-2.5', fontSizeClass: 'text-sm'}`, comfortable → `{rowHeight: 56, paddingClass: 'py-4', fontSizeClass: 'text-sm'}`.

**Validates: Requirements 3.2, 3.3, 3.4**

---

### Property 7: TableHeader renders correct column count and labels

*For any* array of visible normalized columns, the rendered `<thead>` must contain exactly `columns.length + 1` header cells (the +1 being the injected row-number column), and each column's `label` must appear in the corresponding `<th>`.

**Validates: Requirements 5.3, 5.4, 5.5**

---

### Property 8: TableBody renders one row per dataset entry

*For any* non-empty dataset, the rendered `<tbody>` must contain exactly as many `<tr>` elements as there are rows in the dataset.

**Validates: Requirements 5.6**

---

### Property 9: formatCellValue renders null/undefined as em dash

*For any* column type, when the cell value is `null` or `undefined`, `formatCellValue` must return the string `'—'`.

**Validates: Requirements 6.2**

---

### Property 10: formatCellValue renders boolean values as Yes/No

*For any* column with type `'boolean'`, `formatCellValue` must return `'Yes'` when the value is `true` and `'No'` when the value is `false`.

**Validates: Requirements 6.5**

---

### Property 11: formatCellValue renders date/timestamp as locale date string

*For any* column with type `'date'` or `'timestamp'` and a valid date value, `formatCellValue` must return a string equal to `new Date(value).toLocaleDateString()`.

**Validates: Requirements 6.6**

---

### Property 12: EmptyState colSpan equals visible columns plus one

*For any* number of visible columns `n`, the `EmptyState` component must render a `<td>` with `colSpan` equal to `n + 1`.

**Validates: Requirements 7.5**

---

### Property 13: ColumnVisibilityPanel renders one toggle per user column

*For any* `columnDefs` array, the `ColumnVisibilityPanel` must render exactly `columnDefs.length` toggle controls — one per column — and must not render a toggle for the injected row-number column.

**Validates: Requirements 4.2, 4.6**

---

### Property 14: Initial visibility matches ColumnDef visible fields

*For any* `columnDefs` array, the initial `visibleColumnKeys` state derived by `useTableState` must contain exactly the keys of columns where `visible === true`.

**Validates: Requirements 4.1**

---

### Property 15: MockDataGenerator output is deterministic

*For any* two consecutive runs of `generateMockData`, the output JSON must be byte-for-byte identical, confirming the fixed-seed PRNG produces the same sequence every time.

**Validates: Requirements 9.3**

---

### Property 16: MockDataGenerator rows conform to schema

*For any* row in the generated mock data, the row must contain all required fields (`id`, `name`, `status`, `score`, `created_at`, `is_verified`, `country`, `revenue`) with values matching their specified types and constraints.

**Validates: Requirements 9.2**

---

## Error Handling

### Column Schema Errors

- Unknown `type` values are treated as `'unknown'` — the system degrades gracefully rather than throwing.
- Missing required fields on `ColumnDef` (e.g., no `key`) are a developer error caught by TypeScript at compile time; no runtime guard needed in Phase 1.

### Row Data Errors

- Rows missing an `id` field are handled silently via `_tableRowId` injection — no console warnings.
- `resolveRowIdentity` never throws; it always returns a valid array.

### Cell Value Errors

- `formatCellValue` treats any value that fails `new Date(value)` parsing as a string fallback via `String(value)` — no thrown errors.
- `null` and `undefined` are always caught first and return `'—'` before any type-specific branch runs.

### Empty / Error State

- The `EmptyState` `'error'` variant is purely presentational — it displays a message and does not call any reset or recovery functions. Error recovery is the parent's responsibility.

### Mock Data Generator

- The generator script runs in Node.js and writes to `src/data/mock-data.json`. If the file cannot be written (permissions, missing directory), the Node.js process will throw a native `ENOENT`/`EACCES` error — no custom error handling is added in Phase 1.

---

## Testing Strategy

### Dual Testing Approach

Phase 1 uses both unit tests and property-based tests. They are complementary:

- **Unit tests** cover specific examples, integration points, and edge cases (empty dataset, error variant rendering, default density initialization).
- **Property-based tests** verify universal properties across randomly generated inputs, catching edge cases that hand-written examples miss.

### Property-Based Testing Library

Use **[fast-check](https://github.com/dubzzz/fast-check)** for TypeScript/JavaScript property-based testing.

```bash
npm install --save-dev fast-check vitest @testing-library/react @testing-library/jest-dom
```

Each property test must run a minimum of **100 iterations** (fast-check default is 100; set explicitly via `{ numRuns: 100 }`).

### Property Test Tags

Each property-based test must include a comment referencing the design property it validates:

```
// Feature: data-table-component, Property N: <property_text>
```

### Property Test Mapping

Each correctness property from this document maps to exactly one property-based test:

| Property | Test file | fast-check arbitraries |
|----------|-----------|------------------------|
| P1: NormalizeColumn align by type | `normalizeColumn.test.ts` | `fc.record({ type: fc.constantFrom(...types), ...})` |
| P2: Explicit align preserved | `normalizeColumn.test.ts` | `fc.record({ align: fc.constantFrom('left','right','center'), ...})` |
| P3: Row identity uses id | `resolveRowIdentity.test.ts` | `fc.array(fc.record({ id: fc.oneof(fc.string(), fc.integer()) }))` |
| P4: _tableRowId injection | `resolveRowIdentity.test.ts` | `fc.array(fc.record({ name: fc.string() }))` |
| P5: No mutation | `resolveRowIdentity.test.ts` | `fc.array(fc.record({ name: fc.string() }))` |
| P6: getDensityTokens | `densityTokens.test.ts` | `fc.constantFrom('compact','default','comfortable')` |
| P7: Header column count + labels | `TableHeader.test.tsx` | `fc.array(fc.record({ key: fc.string(), label: fc.string(), ... }))` |
| P8: TableBody row count | `TableBody.test.tsx` | `fc.array(fc.record({ _tableRowId: fc.integer() }), { minLength: 1 })` |
| P9: null/undefined → em dash | `formatCellValue.test.ts` | `fc.constantFrom(null, undefined)` × all types |
| P10: boolean → Yes/No | `formatCellValue.test.ts` | `fc.boolean()` |
| P11: date → locale string | `formatCellValue.test.ts` | `fc.date()` |
| P12: EmptyState colSpan | `EmptyState.test.tsx` | `fc.integer({ min: 0, max: 50 })` |
| P13: VisibilityPanel toggle count | `ColumnVisibilityPanel.test.tsx` | `fc.array(fc.record({ key: fc.string(), label: fc.string(), ... }))` |
| P14: Initial visibility from ColumnDef | `useTableState.test.ts` | `fc.array(fc.record({ visible: fc.boolean(), ... }))` |
| P15: Generator determinism | `generateMockData.test.ts` | Run twice, compare output |
| P16: Generator row schema | `generateMockData.test.ts` | Validate each of 500 rows |

### Unit Tests

Unit tests (using Vitest + Testing Library) cover:

- `EmptyState` renders correct message for `'empty'` and `'error'` variants (Requirements 7.2, 7.3)
- `DataTable` defaults to `'default'` density when no `defaultDensity` prop is provided (Requirement 3.7)
- `DataTable` uses provided value as initial state when no `onChange` handler is given (Requirement 8.3)
- `TableBody` renders `EmptyState` when `rows` is empty (Requirement 5.7 — edge case)
- `MockDataGenerator` produces exactly 500 rows (Requirement 9.1)
- `MockDataGenerator` output is valid JSON (Requirement 9.6)
- `MockDataGenerator` writes to `src/data/mock-data.json` (Requirement 9.4)
