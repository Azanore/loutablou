// Purpose: Tests for EmptyState component — colSpan property and variant messages.
// Related files: src/components/DataTable/EmptyState.tsx
// Must not include: snapshot tests, Phase 2+ concerns.

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import * as fc from 'fast-check'
import { EmptyState } from './EmptyState'

// Wrap in a table so the DOM is valid for <tr>/<td> rendering
function renderInTable(ui: React.ReactElement) {
  return render(<table><tbody>{ui}</tbody></table>)
}

// Feature: data-table-component, Property 12: EmptyState colSpan equals visible columns plus one
describe('EmptyState — P12: colSpan equals visible columns plus one', () => {
  it('renders <td> with colSpan equal to the provided value', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 50 }), (n) => {
        const colSpan = n + 1 // visibleColumns.length + 1
        const { container, unmount } = renderInTable(
          <EmptyState variant="empty" colSpan={colSpan} />
        )
        const td = container.querySelector('td')
        expect(td).not.toBeNull()
        expect(td!.colSpan).toBe(colSpan)
        unmount()
      }),
      { numRuns: 100 }
    )
  })
})

describe('EmptyState — variant messages', () => {
  it('renders "No data available" for the empty variant', () => {
    renderInTable(<EmptyState variant="empty" colSpan={3} />)
    expect(screen.getByText('No data available')).toBeTruthy()
  })

  it('renders "An error occurred" for the error variant', () => {
    renderInTable(<EmptyState variant="error" colSpan={3} />)
    expect(screen.getByText('An error occurred')).toBeTruthy()
  })
})
