import type { HTMLAttributes, ReactNode } from 'react'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
  children: ReactNode
}

const paddingStyles = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8 sm:p-10',
}

export function Card({
  hoverable = false,
  padding = 'md',
  className = '',
  children,
  ...props
}: CardProps) {
  const hoverClass = hoverable
    ? 'transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card hover:border-line-strong'
    : ''
  return (
    <div
      className={`rounded-2xl border border-line bg-card text-ink shadow-soft ${hoverClass} ${paddingStyles[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

