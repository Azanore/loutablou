// Purpose: shadcn-style Checkbox built on Radix UI primitive.
// Related: src/lib/utils.ts, @radix-ui/react-checkbox

import * as React from 'react'
import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

/** Accessible checkbox with accent color indicator. */
export function Checkbox({ className, ...props }: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        'peer h-4 w-4 shrink-0 rounded-[3px] border border-border bg-surface transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50',
        'disabled:cursor-not-allowed disabled:opacity-40',
        'data-[state=checked]:bg-accent data-[state=checked]:border-accent',
        'data-[state=indeterminate]:bg-surface data-[state=indeterminate]:border-accent',
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator className="flex items-center justify-center text-canvas">
        <Check className="h-3 w-3 stroke-[3]" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}
