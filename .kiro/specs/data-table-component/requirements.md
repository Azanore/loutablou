# Requirements Document

## Introduction

A high-end, reusable data table component targeting dashboard power users. Phase 1 establishes the structural foundation: project scaffolding, column schema, row identity, density system, column visibility, core rendering components, and a deterministic mock data generator. The component is built on Vite + React + TypeScript with Tailwind CSS for styling.

## Glossary

- **DataTable**: The top-level React component that composes all sub-components and manages state.
- **ColumnDef**: The schema object describing a single column's identity, type, display, and behavior.
- **ColumnType**: The union type `'text' | 'number' | 'integer' | 'float' | 'date' | 'timestamp' | 'boolean' | 'enum' | 'unknown'`.
- **ColumnAlign**: The union type `'left' | 'right' | 'center'`.
- **RowData**: A plain object representing a single data row; expected to carry a unique `id` field.
- **RowIdentity**: The resolved unique identifier for a row — either the row's own `id` field or the injected `_tableRowId` integer index.
- **Density**: The visual compactness level of the table rows: `'compact'`, `'default'`, or `'comfortable'`.
- **DensityTokens**: The set of Tailwind class strings and CSS variable values associated with a Density level.
- **TableShell**: The outermost scrollable container that wraps the `<table>` element.
- **TableHeader**: The `<thead>` element rendering column headers, including the injected row-number column.
- **TableBody**: The `<tbody>` element rendering all visible data rows.
- **TableRow**: A single `<tr>` element rendering one row's cell values.
- **EmptyState**: The component rendered inside the table body when no rows are present, with `'empty'` and `'error'` variants.
- **DensityToggle**: The control component allowing the user to switch between density levels.
- **ColumnVisibilityPanel**: The control component allowing the user to show or hide individual columns.
- **NormalizeColumn**: The utility that fills in default values for optional ColumnDef fields.
- **ResolveRowIdentity**: The utility that ensures every row has a stable unique identifier.
- **MockDataGenerator**: The script that produces deterministic mock data without external npm imports.

---

## Requirements

### Requirement 1: Column Schema Definition

**User Story:** As a developer, I want a strongly-typed column schema contract, so that I can describe every column's identity, type, and display behavior in one place.

#### Acceptance Criteria

1. THE DataTable SHALL accept a `columnDefs` prop typed as `ColumnDef[]`.
2. THE ColumnDef SHALL include the fields: `key` (string), `label` (string), `type` (ColumnType), `nullable` (boolean), `visible` (boolean), `width` (number, pixels), `sortable` (boolean), `filterable` (boolean), `aggregatable` (boolean), `align` (ColumnAlign, optional), and `enumValues` (string array, optional, required when type is `'enum'`).

> Note: `pinned` is a Phase 5 field — excluded from Phase 1 schema.
3. WHEN a ColumnDef has `type` of `'number'`, `'integer'`, or `'float'`, THE NormalizeColumn SHALL set the default `align` to `'right'`.
4. WHEN a ColumnDef has `type` of `'date'`, `'timestamp'`, `'boolean'`, or `'enum'`, THE NormalizeColumn SHALL set the default `align` to `'center'`.
5. WHEN a ColumnDef has `type` of `'text'` or `'unknown'`, THE NormalizeColumn SHALL set the default `align` to `'left'`.
6. WHEN a ColumnDef has `type` of `'unknown'`, THE DataTable SHALL apply lexicographic sort, text-contains filter, left alignment, and disabled aggregation for that column.
7. WHEN a ColumnDef `align` field is explicitly provided, THE NormalizeColumn SHALL use the provided value and SHALL NOT override it with the type-based default.

---

### Requirement 2: Row Identity Resolution

**User Story:** As a developer, I want every row to have a stable unique identifier, so that selection, expansion, and keying work correctly even when source data lacks an `id` field.

#### Acceptance Criteria

1. WHEN a row object contains an `id` field, THE ResolveRowIdentity SHALL use that field's value as the row's identity.
2. WHEN a row object does not contain an `id` field, THE ResolveRowIdentity SHALL silently inject a `_tableRowId` field set to the row's integer index in the dataset.
3. THE DataTable SHALL apply ResolveRowIdentity to all rows at load time before any rendering or state initialization.
4. THE `_tableRowId` injection SHALL NOT mutate the original row objects passed in via `rowData`; THE ResolveRowIdentity SHALL return new row objects.

---

### Requirement 3: Density System

**User Story:** As a power user, I want to switch between compact, default, and comfortable row densities, so that I can optimize the table for my screen size and workflow.

#### Acceptance Criteria

1. THE DataTable SHALL support three density levels: `'compact'`, `'default'`, and `'comfortable'`.
2. WHEN density is `'compact'`, THE DataTable SHALL apply row height of 32px, vertical padding class `py-1`, and font size class `text-xs`.
3. WHEN density is `'default'`, THE DataTable SHALL apply row height of 44px, vertical padding class `py-2.5`, and font size class `text-sm`.
4. WHEN density is `'comfortable'`, THE DataTable SHALL apply row height of 56px, vertical padding class `py-4`, and font size class `text-sm`.
5. THE DataTable SHALL expose CSS custom properties `--row-height-compact` (32px), `--row-height-default` (44px), and `--row-height-comfortable` (56px) on the table's root element.
6. THE DataTable SHALL accept a `defaultDensity` prop to set the initial density level.
7. WHEN no `defaultDensity` prop is provided, THE DataTable SHALL default to `'default'` density.
8. THE DensityToggle SHALL allow the user to cycle through all three density levels.

---

### Requirement 4: Column Visibility Management

**User Story:** As a power user, I want to show and hide individual columns, so that I can focus on the data most relevant to my current task.

#### Acceptance Criteria

1. THE DataTable SHALL derive initial column visibility from the `visible` field of each ColumnDef.
2. THE ColumnVisibilityPanel SHALL render a toggle control for each column defined in `columnDefs`.
3. WHEN the user toggles a column in the ColumnVisibilityPanel, THE DataTable SHALL update the visibility state for that column.
4. THE DataTable SHALL accept an optional `visibleColumns` prop (string array of column keys) to allow parent-controlled visibility.
5. WHEN `visibleColumns` prop is provided alongside an `onVisibilityChange` handler, THE DataTable SHALL operate in controlled mode for column visibility and SHALL NOT maintain internal visibility state.
6. THE row-number column SHALL always be visible and SHALL NOT appear as a toggle option in the ColumnVisibilityPanel.

---

### Requirement 5: Table Shell and Layout

**User Story:** As a developer, I want a well-structured table shell, so that the table renders correctly with horizontal scrolling and sticky headers.

#### Acceptance Criteria

1. THE TableShell SHALL render a scrollable container wrapping a `<table>` element with `table-fixed` layout.
2. THE TableShell SHALL support horizontal overflow scrolling.
3. THE TableHeader SHALL render a `<thead>` element with one `<th>` per visible column.
4. THE TableHeader SHALL inject a row-number column as the first `<th>` without adding it to `columnDefs`.
5. THE TableHeader SHALL render column labels from the `label` field of each visible ColumnDef.
6. THE TableBody SHALL render one TableRow per row in the dataset.
7. WHEN the dataset is empty, THE TableBody SHALL render the EmptyState component instead of TableRow components.

---

### Requirement 6: Table Row Rendering

**User Story:** As a user, I want each row to display its cell values correctly formatted by type, so that data is readable and consistent.

#### Acceptance Criteria

1. THE TableRow SHALL render one `<td>` per visible column, aligned according to the column's resolved `align` value.
2. WHEN a cell value is `null` or `undefined`, THE TableRow SHALL render an em dash (`—`) in that cell.
3. THE TableRow SHALL render the row's position number (1-based) in the injected row-number column.
4. THE TableRow SHALL apply the current density's height and padding classes to each `<tr>`.
5. WHEN a row's `type` is `'boolean'`, THE TableRow SHALL render `true` as `'Yes'` and `false` as `'No'`.
6. WHEN a row's `type` is `'date'` or `'timestamp'`, THE TableRow SHALL render the value as a locale date string.

---

### Requirement 7: Empty State

**User Story:** As a user, I want clear feedback when the table has no data or encounters an error, so that I understand the table's current state.

#### Acceptance Criteria

1. THE EmptyState SHALL support two variants: `'empty'` and `'error'`.
2. WHEN the `'empty'` variant is rendered, THE EmptyState SHALL display a message indicating no data is available.
3. WHEN the `'error'` variant is rendered, THE EmptyState SHALL display an error message.
4. THE EmptyState `'error'` variant SHALL NOT trigger or call any state reset functions.
5. THE EmptyState SHALL span the full width of the table using `colSpan` equal to the total number of visible columns plus one (for the row-number column).

---

### Requirement 8: Hybrid State Ownership

**User Story:** As a developer, I want the table to manage its own state by default while allowing parent components to take control of any state dimension, so that I can use the table both as a self-contained widget and as a controlled component.

#### Acceptance Criteria

1. THE DataTable SHALL manage density, column visibility, and other state dimensions internally by default.
2. WHEN a parent provides both a value prop and a corresponding `onChange` handler for a state dimension, THE DataTable SHALL operate in controlled mode for that dimension and SHALL NOT maintain internal state for it.
3. WHEN a parent provides a value prop without a corresponding `onChange` handler, THE DataTable SHALL use the provided value as the initial state and manage subsequent changes internally.
4. THE DataTable SHALL follow the `on`-prefix naming convention for all future event handler props.

---

### Requirement 9: Mock Data Generation

**User Story:** As a developer, I want a deterministic mock data generator, so that I can develop and test the table with realistic, reproducible data.

#### Acceptance Criteria

1. THE MockDataGenerator SHALL produce exactly 500 rows of valid data with no edge cases.
2. THE MockDataGenerator SHALL generate rows with the following columns: `id` (integer, unique, non-null), `name` (text, max 80 chars, non-null), `status` (enum: `active | inactive | pending | archived`), `score` (float, 0–100), `created_at` (timestamp), `is_verified` (boolean), `country` (text, max 60 chars), `revenue` (float, 0–1,000,000).
3. THE MockDataGenerator SHALL use a fixed seed to produce deterministic output on every run.
4. THE MockDataGenerator SHALL write output to `src/data/mock-data.json`.
5. THE MockDataGenerator SHALL use zero external npm imports.
6. THE MockDataGenerator output SHALL be valid JSON parseable without errors.

---

### Requirement 10: Project Scaffolding and Build Configuration

**User Story:** As a developer, I want a correctly configured Vite + React + TypeScript + Tailwind project, so that the application builds and runs without modification.

#### Acceptance Criteria

1. THE project SHALL use Vite as the build tool with the `@vitejs/plugin-react` plugin.
2. THE project SHALL use TypeScript with strict mode enabled and zero type errors.
3. THE project SHALL use Tailwind CSS v4 configured via the `@tailwindcss/vite` plugin — no PostCSS config or `tailwind.config.js` required.
4. THE project SHALL include only the following dependencies: `react`, `react-dom`, `typescript`, `vite`, `@vitejs/plugin-react`, `tailwindcss`, `@tailwindcss/vite`.
5. ALL Tailwind utility classes used in components SHALL be static strings to ensure correct purging by the Tailwind content scanner.
6. THE project SHALL produce a working application when the user runs `npm install && npm run dev`.
