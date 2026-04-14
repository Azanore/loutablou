---
inclusion: always
---

# Project Steering File
# Data Table Component — React + TS + Tailwind

## Code Standards
- Write minimal functional code — no verbosity, no defensive padding, no negotiation.
- Keep functions under 20 lines; extract helpers when logic branches multiply.
- No magic numbers — extract all constants to named variables at the top of the file.
- No dead code, unused imports, or orphaned files — clean up after every task.
- Apply YAGNI — build only what the current phase explicitly requires.
- No silent failures — surface errors explicitly, never swallow them quietly.

## Component Structure
- One component per file; file name matches the component name exactly.
- Barrel exports for public API only — no re-exporting internals.
- No circular dependencies between components, hooks, or utilities.
- Compose over inherit — build behavior through composition, not class hierarchies.
- Each component, hook, and utility has exactly one reason to change.
- Do not modify shared components to fix a problem in one consumer — target only the affected file.

## Naming Conventions
- Components and types: PascalCase. Variables, functions, hooks: camelCase. Constants: SCREAMING_SNAKE_CASE.
- No `I` prefix on interfaces — use descriptive names (ColumnDef, TableState, not IColumnDef, ITableState).
- Private/internal members prefixed with underscore (_internalState).
- Props: camelCase nouns (columnDefs, rowData). Events: on-prefix (onSortChange, onDensityChange).
- Names describe purpose, not implementation — no generic terms like `data`, `info`, `handler`.

## State & Logic
- Hybrid state: table owns state internally by default; yield control when value + onChange are both provided.
- Run normalization and identity resolution once on mount via useMemo — never on every render.
- Pure utility functions have no side effects and no external dependencies.
- Isolate all side effects to hooks or event handlers — never in render paths.
- Immutable data by default — return new objects, never mutate props or state directly.

## Styling (Tailwind)
- All Tailwind classes must be static strings — no dynamic class construction that breaks purging.
- Define density tokens as CSS custom properties on the root element via inline style.
- Use Tailwind v4 with `@tailwindcss/vite` plugin — no `tailwind.config.js`, no PostCSS config.
- Entry CSS file contains only `@import "tailwindcss"` — no other global styles.
- Deviations from Tailwind utility patterns require a `// RULE:` comment with rationale.

## Error & Edge Case Handling
- Null and undefined cell values always render as em dash (—) — never "null", never empty string.
- Unknown column types degrade gracefully: lexicographic sort, text-contains filter, left align, no aggregation.
- resolveRowIdentity never throws — always returns a valid array regardless of input shape.
- formatCellValue catches all type-specific failures and falls back to String(value).

## Comments & Documentation
- Every file starts with a comment: purpose, related files, and what it must not include.
- Every function and component gets one summary comment — inline comments for non-obvious logic only.
- When deviating from an established pattern, add a `// RULE:` comment with the deviation and its reason.
- No summary or documentation markdown files — share analysis and decisions in chat only.

## Performance
- Memoize expensive derivations (normalizeColumn, resolveRowIdentity) with useMemo.
- Avoid heavy computations in render paths — move them to hooks or utilities.
- Key all list renders by stable row identity (_tableRowId), never by array index.

## UI/UX Principles
- Allocate fixed space for scrollbars and error messages — never shift layout on their appearance.
- Use real Tailwind-styled elements for interactive controls — no Unicode symbols as icons.
- All interactive elements must meet minimum touch target sizes across all three density levels.
- Empty and error states are first-class — design them before the happy path.

## Development Behavior
- Read related files before making any change — understand existing patterns first.
- Make only the minimal changes needed to solve the stated problem — no unsolicited improvements.
- List exactly which files will be added, updated, or deleted before touching anything.
- Never implement a Phase 2+ feature, even as a stub or placeholder.
- When deviating from the spec, surface the conflict explicitly before proceeding.
