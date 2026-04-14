// Purpose: Cycles through density levels: compact → default → comfortable → compact.
// Related: src/types/table.ts, src/components/DataTable/DataTable.tsx
// Must not include: internal density state, Phase 2+ logic.

import React from 'react'
import { AlignJustify, AlignCenter, LayoutList } from 'lucide-react'
import type { Density } from '../../types/table'
import { Button } from '@/components/ui/button'

interface DensityToggleProps {
  density: Density
  onDensityChange: (density: Density) => void
}

const DENSITY_CYCLE: Record<Density, Density> = {
  compact:     'default',
  default:     'comfortable',
  comfortable: 'compact',
}

const DENSITY_ICON: Record<Density, React.ElementType> = {
  compact:     AlignJustify,
  default:     AlignCenter,
  comfortable: LayoutList,
}

const DENSITY_LABEL: Record<Density, string> = {
  compact:     'Compact',
  default:     'Default',
  comfortable: 'Comfortable',
}

/** Cycles density on click, shows current level with icon + label. */
export function DensityToggle({ density, onDensityChange }: DensityToggleProps): React.ReactElement {
  const Icon = DENSITY_ICON[density]
  return (
    <Button
      type="button"
      variant="default"
      size="default"
      onClick={() => onDensityChange(DENSITY_CYCLE[density])}
      aria-label={`Density: ${DENSITY_LABEL[density]}`}
    >
      <Icon className="h-3.5 w-3.5" />
      <span>{DENSITY_LABEL[density]}</span>
    </Button>
  )
}
