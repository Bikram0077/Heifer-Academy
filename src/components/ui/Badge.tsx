import type { HTMLAttributes, ReactNode } from 'react'

export type BadgeVariant = 'default' | 'brand' | 'accent' | 'outline' | 'subtle'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  icon?: ReactNode
  children: ReactNode
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-subtle text-ink-2',
  brand: 'bg-primary-100 text-brand font-semibold',
  accent: 'bg-accent-100 text-ochre font-semibold',
  outline: 'border border-line text-ink-2',
  subtle: 'bg-white/10 text-white/90',
}

export function Badge({ variant = 'default', icon, className = '', children, ...props }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {icon}
      {children}
    </span>
  )
}
