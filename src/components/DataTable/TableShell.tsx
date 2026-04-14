// Purpose: Renders the two-table scroll architecture — fixed header table + scrollable body table.
// Horizontal scroll is synced between both containers via refs.
// Related files: src/components/DataTable/DataTable.tsx, src/types/table.ts
// Must not include: sorting, filtering, density logic, or any state management.

import React, { useRef, useCallback } from 'react'

interface TableShellProps {
  colgroup: React.ReactNode        // identical <colgroup> rendered in both tables
  thead: React.ReactNode           // <thead> rendered in the header table only
  tbody: React.ReactNode           // <tbody> rendered in the body table only
  cssVars: React.CSSProperties     // --row-height-* custom properties
}

/** Fixed header + scrollable body. Horizontal scroll is synced between both containers. */
export function TableShell({ colgroup, thead, tbody, cssVars }: TableShellProps) {
  const headerRef = useRef<HTMLDivElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)

  // Sync horizontal scroll from body → header
  const onBodyScroll = useCallback(() => {
    if (headerRef.current && bodyRef.current) {
      headerRef.current.scrollLeft = bodyRef.current.scrollLeft
    }
  }, [])

  // Sync horizontal scroll from header → body (e.g. trackpad on header)
  const onHeaderScroll = useCallback(() => {
    if (headerRef.current && bodyRef.current) {
      bodyRef.current.scrollLeft = headerRef.current.scrollLeft
    }
  }, [])

  return (
    <div className="border border-border rounded-[var(--radius-lg)] flex flex-col bg-surface" style={cssVars}>
      {/* Header table — horizontally scrollable, never vertically scrollable, scrollbar hidden */}
      <div ref={headerRef} onScroll={onHeaderScroll} className="overflow-x-auto overflow-y-hidden" style={{ scrollbarWidth: 'none' }}>
        <table className="table-fixed w-full text-sm text-text-primary">
          {colgroup}
          {thead}
        </table>
      </div>
      {/* Body table — both axes scrollable, scrollbar track starts here */}
      <div ref={bodyRef} onScroll={onBodyScroll} className="overflow-auto max-h-[65vh]">
        <table className="table-fixed w-full text-sm text-text-primary">
          {colgroup}
          {tbody}
        </table>
      </div>
    </div>
  )
}
