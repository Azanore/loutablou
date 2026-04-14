// Purpose: Property-based tests for useTableState hook.
// Related files: src/hooks/useTableState.ts, src/types/table.ts
// Must not include: component rendering tests, Phase 2+ state tests.

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { renderHook } from '@testing-library/react'
import { useTableState } from './useTableState'
import type { DataTableProps } from './useTableState'
import type { ColumnDef, ColumnType } from '../types/table'

const COLUMN_TYPES: ColumnType[] = [
  'text', 'number', 'integer', 'float',
  'date', 'timestamp', 'boolean', 'enum', 'unknown',
]

const arbColumnDef = fc.record<ColumnDef>({
  key: fc.string({ minLength: 1, maxLength: 20 }),
  label: fc.string({ minLength: 1, maxLength: 40 }),
  type: fc.constantFrom(...COLUMN_TYPES),
  nullable: fc.boolean(),
  visible: fc.boolean(),
  width: fc.integer({ min: 40, max: 400 }),
  sortable: fc.boolean(),
  filterable: fc.boolean(),
  aggregatable: fc.boolean(),
})

// Feature: data-table-component, Property 14: Initial visibility matches ColumnDef visible fields
describe('useTableState', () => {
  it('P14: initial visibleColumnKeys matches columnDefs where visible === true', () => {
    // Validates: Requirements 4.1
    fc.assert(
      fc.property(
        fc.array(arbColumnDef, { minLength: 0, maxLength: 20 }),
        (columnDefs) => {
          const props: DataTableProps = { columnDefs, rowData: [] }
          const { result } = renderHook(() => useTableState(props))
          const expectedKeys = columnDefs.filter(c => c.visible).map(c => c.key)
          expect(result.current.visibleColumnKeys).toEqual(expectedKeys)
        }
      ),
      { numRuns: 100 }
    )
  })
})
