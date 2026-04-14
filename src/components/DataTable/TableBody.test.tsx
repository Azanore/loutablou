// Purpose: Property and unit tests for the TableBody component.
// Related files: src/components/DataTable/TableBody.tsx, src/types/table.ts
// Must not include: Phase 2+ logic, mocks that bypass real rendering.

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import * as fc from 'fast-check'
import { TableBody } from './TableBody'
import type { ResolvedRow, NormalizedColumnDef } from '../../types/table'

const BASE_COLUMN: NormalizedColumnDef = {
  key: 'name',
  label: 'Name',
  type: 'text',
  nullable: true,
  visible: true,
  width: 100,
  sortable: false,
  filterable: false,
  aggregatable: false,
  align: 'left',
}

const columnArb = fc.record({
  key: fc.string({ minLength: 1, maxLength: 10 }),
  label: fc.string({ minLength: 1, maxLength: 20 }),
  type: fc.constantFrom('text' as const, 'number' as const),
  nullable: fc.boolean(),
  visible: fc.constant(true),
  width: fc.integer({ min: 50, max: 300 }),
  sortable: fc.constant(false),
  filterable: fc.constant(false),
  aggregatable: fc.constant(false),
  align: fc.constantFrom('left' as const, 'right' as const, 'center' as const),
})

// Feature: data-table-component, Property 8: TableBody renders one row per dataset entry
describe('TableBody', () => {
  it('P8: renders exactly one <tr> per row in a non-empty dataset', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({ _tableRowId: fc.integer() }),
          { minLength: 1, maxLength: 50 }
        ),
        fc.array(columnArb, { minLength: 1, maxLength: 5 }),
        (rows, columns) => {
          const resolvedRows = rows as ResolvedRow[]
          const { container } = render(
            <table>
              <TableBody rows={resolvedRows} columns={columns} density="default" />
            </table>
          )
          const trs = container.querySelectorAll('tbody tr')
          expect(trs.length).toBe(rows.length)
        }
      ),
      { numRuns: 100 }
    )
  })

  // Unit test: EmptyState is rendered when rows is empty (Requirement 5.7)
  it('renders EmptyState when rows is empty', () => {
    render(
      <table>
        <TableBody rows={[]} columns={[BASE_COLUMN]} density="default" />
      </table>
    )
    expect(screen.getByText('No data available')).toBeTruthy()
  })

  it('renders EmptyState with error variant when rows is empty and emptyVariant is error', () => {
    render(
      <table>
        <TableBody rows={[]} columns={[BASE_COLUMN]} density="default" emptyVariant="error" />
      </table>
    )
    expect(screen.getByText('An error occurred')).toBeTruthy()
  })

  it('EmptyState colSpan equals columns.length + 1 when rows is empty', () => {
    const columns = [BASE_COLUMN, { ...BASE_COLUMN, key: 'score', label: 'Score' }]
    render(
      <table>
        <TableBody rows={[]} columns={columns} density="default" />
      </table>
    )
    const td = screen.getByText('No data available').closest('td')
    expect(td?.getAttribute('colspan')).toBe(String(columns.length + 1))
  })
})
