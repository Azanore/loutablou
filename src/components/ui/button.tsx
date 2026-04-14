// Purpose: shadcn-style Button primitive with variant + size support.
// Related: src/lib/utils.ts, @radix-ui/react-slot

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-[background-color,opacity,scale] select-none cursor-pointer disabled:pointer-events-none disabled:opacity-40 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50',
  {
    variants: {
      variant: {
        default:  'bg-surface-raised text-text-primary border border-border hover:bg-surface-hover hover:border-border-strong',
        accent:   'bg-accent text-canvas hover:bg-accent-hover',
        ghost:    'text-text-secondary hover:bg-surface-raised hover:text-text-primary',
        outline:  'border border-accent-border text-accent hover:bg-accent-subtle',
      },
      size: {
        sm:      'h-8 px-3 text-xs rounded-[var(--radius-sm)]',
        default: 'h-9 px-4 rounded-[var(--radius-md)]',
        lg:      'h-11 px-5 rounded-[var(--radius-lg)]',
        icon:    'h-9 w-9 rounded-[var(--radius-md)]',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  }
)

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

/** Base button — forwardRef required for Radix asChild/Slot ref passing. */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        ref={ref}
        data-slot="button"
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'
