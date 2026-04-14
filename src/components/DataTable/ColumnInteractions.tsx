// Purpose: Column resize handle and drag-reorder logic for the table header label row.
// Extracted from TableHeader to keep each file single-concern.
// Related: src/components/DataTable/TableHeader.tsx
// Must not include: filter logic, sort logic, or row rendering.

import React from 'react'

const MIN_COL_WIDTH = 80

interface ResizeHandleProps {
  colKey: string
  onResize: (key: string, width: number) => void
}

/** Drag handle on the right edge of a <th> for column resizing. */
export function ResizeHandle({ colKey, onResize }: ResizeHandleProps) {
  function handleMouseDown(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    const startX = e.clientX
    const th = (e.target as HTMLElement).closest('th') as HTMLTableCellElement
    const startWidth = th.getBoundingClientRect().width
    function onMouseMove(ev: MouseEvent) {
      onResize(colKey, Math.max(MIN_COL_WIDTH, Math.round(startWidth + ev.clientX - startX)))
    }
    function onMouseUp() {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }
  return (
    <span
      onMouseDown={handleMouseDown}
      className="absolute right-0 top-0 h-full w-1.5 cursor-col-resize opacity-0 hover:opacity-100 hover:bg-accent/40 transition-opacity"
      aria-hidden="true"
    />
  )
}

/** Returns drag event props for a draggable column header cell. Pinned columns are not draggable. */
export function useColumnDrag(
  columnOrder: string[] | undefined,
  onColumnReorder: (order: string[]) => void
) {
  const dragKey = React.useRef<string | null>(null)

  function handleDragStart(key: string) {
    dragKey.current = key
  }

  function handleDrop(targetKey: string) {
    if (!dragKey.current || dragKey.current === targetKey || !columnOrder) return
    const order = [...columnOrder]
    const from = order.indexOf(dragKey.current)
    const to = order.indexOf(targetKey)
    if (from === -1 || to === -1) return
    order.splice(from, 1)
    order.splice(to, 0, dragKey.current)
    onColumnReorder(order)
    dragKey.current = null
  }

  function getDragProps(key: string, isPinned: boolean) {
    if (!columnOrder) return {}
    return {
      draggable: !isPinned as true,
      onDragStart: () => !isPinned && handleDragStart(key),
      onDragOver: (e: React.DragEvent) => e.preventDefault(),
      onDrop: () => !isPinned && handleDrop(key),
    }
  }

  return { getDragProps }
}
