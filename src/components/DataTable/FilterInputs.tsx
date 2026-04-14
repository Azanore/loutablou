// Purpose: Per-column filter input components for the table header filter row.
// Each component is a pure controlled input — no internal state, no side effects.
// Related: src/types/table.ts, src/utils/filterEngine.ts, src/components/DataTable/TableHeader.tsx
// Must not include: sort logic, row rendering, or state management.

import type { ColumnFilter, FilterRow, NormalizedColumnDef } from '../../types/table'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'

type OnChange = (key: string, filter: ColumnFilter | null) => void

export function ClearButton({ onClear }: { onClear: () => void }) {
  return (
    <button
      type="button"
      onClick={onClear}
      className="flex-none text-text-muted hover:text-text-secondary transition-colors text-xs leading-none px-0.5"
      aria-label="Clear filter"
    >
      ×
    </button>
  )
}

export function TextFilter({ colKey, filter, onChange }: { colKey: string; filter: FilterRow[string] | undefined; onChange: OnChange }) {
  const value = filter?.type === 'text' ? filter.value : ''
  return (
    <div className="flex items-center gap-0.5">
      <Input
        type="text"
        placeholder="Search…"
        value={value}
        onChange={e => onChange(colKey, e.target.value === '' ? null : { type: 'text', value: e.target.value })}
      />
      {value !== '' && <ClearButton onClear={() => onChange(colKey, null)} />}
    </div>
  )
}

export function NumberFilter({ colKey, filter, onChange }: { colKey: string; filter: FilterRow[string] | undefined; onChange: OnChange }) {
  const min = filter?.type === 'number' ? filter.min : ''
  const max = filter?.type === 'number' ? filter.max : ''
  const active = min !== '' || max !== ''
  function emit(nm: string, nx: string) {
    if (nm === '' && nx === '') { onChange(colKey, null); return }
    onChange(colKey, { type: 'number', min: nm, max: nx })
  }
  return (
    <div className="flex items-center gap-0.5">
      <Input type="number" placeholder="Min" value={min} className="min-w-0 flex-1" onChange={e => emit(e.target.value, max)} />
      <Input type="number" placeholder="Max" value={max} className="min-w-0 flex-1" onChange={e => emit(min, e.target.value)} />
      {active && <ClearButton onClear={() => onChange(colKey, null)} />}
    </div>
  )
}

export function DateFilter({ colKey, filter, onChange }: { colKey: string; filter: FilterRow[string] | undefined; onChange: OnChange }) {
  const min = filter?.type === 'date' ? filter.min : ''
  const max = filter?.type === 'date' ? filter.max : ''
  const active = min !== '' || max !== ''
  function emit(nm: string, nx: string) {
    if (nm === '' && nx === '') { onChange(colKey, null); return }
    onChange(colKey, { type: 'date', min: nm, max: nx })
  }
  return (
    <div className="flex items-center gap-0.5">
      <Input type="date" value={min} className="min-w-0 flex-1" onChange={e => emit(e.target.value, max)} />
      <Input type="date" value={max} className="min-w-0 flex-1" onChange={e => emit(min, e.target.value)} />
      {active && <ClearButton onClear={() => onChange(colKey, null)} />}
    </div>
  )
}

export function BooleanFilter({ colKey, filter, onChange }: { colKey: string; filter: FilterRow[string] | undefined; onChange: OnChange }) {
  const value = filter?.type === 'boolean' ? filter.value : ''
  return (
    <Select
      value={value}
      onChange={e => {
        const v = e.target.value as 'true' | 'false' | ''
        onChange(colKey, v === '' ? null : { type: 'boolean', value: v })
      }}
    >
      <option value="">—</option>
      <option value="true">Yes</option>
      <option value="false">No</option>
    </Select>
  )
}

export function EnumFilter({ colKey, col, filter, onChange }: { colKey: string; col: NormalizedColumnDef; filter: FilterRow[string] | undefined; onChange: OnChange }) {
  const selected = filter?.type === 'enum' && filter.values.length === 1 ? filter.values[0] : ''
  return (
    <Select
      value={selected}
      onChange={e => {
        const v = e.target.value
        onChange(colKey, v === '' ? null : { type: 'enum', values: [v] })
      }}
    >
      <option value="">—</option>
      {(col.enumValues ?? []).map(opt => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </Select>
  )
}

// Dispatch table: filter type → render function.
// Adding a new ColumnFilter type only requires adding one entry here.
type FilterRenderer = (colKey: string, col: NormalizedColumnDef, filter: FilterRow[string] | undefined, onChange: OnChange) => React.ReactElement | null

import React from 'react'
import type { ColumnFilter as CF } from '../../types/table'

const FILTER_RENDERERS: Record<CF['type'], FilterRenderer> = {
  text:    (colKey, _col, filter, onChange) => <TextFilter    colKey={colKey} filter={filter} onChange={onChange} />,
  number:  (colKey, _col, filter, onChange) => <NumberFilter  colKey={colKey} filter={filter} onChange={onChange} />,
  date:    (colKey, _col, filter, onChange) => <DateFilter    colKey={colKey} filter={filter} onChange={onChange} />,
  boolean: (colKey, _col, filter, onChange) => <BooleanFilter colKey={colKey} filter={filter} onChange={onChange} />,
  enum:    (colKey,  col, filter, onChange) => <EnumFilter    colKey={colKey} col={col}       filter={filter} onChange={onChange} />,
}

/** Renders the appropriate filter input for a column based on its filter type. */
export function renderFilterInput(
  filterType: CF['type'],
  colKey: string,
  col: NormalizedColumnDef,
  filter: FilterRow[string] | undefined,
  onChange: OnChange
): React.ReactElement | null {
  return FILTER_RENDERERS[filterType]?.(colKey, col, filter, onChange) ?? null
}
