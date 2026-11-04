import { forwardRef, type ButtonHTMLAttributes, type AnchorHTMLAttributes, type ReactNode } from 'react'

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'accent'
export type ButtonSize = 'sm' | 'md' | 'lg'

interface BaseButtonProps {
  variant?: ButtonVariant
  size?: ButtonSize
  icon?: ReactNode
  iconRight?: ReactNode
  fullWidth?: boolean
  className?: string
  children?: ReactNode
}

export type ButtonProps = BaseButtonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: undefined
  }

export type LinkButtonProps = BaseButtonProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string
  }

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-primary-900 text-white hover:bg-primary-700 focus-visible:ring-primary-700 active:bg-primary-950 shadow-soft',
  secondary:
    'bg-subtle text-ink hover:bg-line-strong/30 focus-visible:ring-primary-700',
  outline:
    'border border-line-strong bg-card text-ink hover:border-primary-700 hover:text-brand focus-visible:ring-primary-700',
  ghost:
    'text-ink-2 hover:bg-subtle hover:text-ink focus-visible:ring-primary-700',
  accent:
    'bg-accent-500 text-primary-950 font-bold hover:bg-accent-500/90 focus-visible:ring-accent-500 shadow-soft',
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5 rounded-full',
  md: 'h-11 px-5 text-sm gap-2 rounded-full',
  lg: 'h-13 px-7 text-base gap-2.5 rounded-full',
}

export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps | LinkButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      icon,
      iconRight,
      fullWidth = false,
      className = '',
      children,
      ...restProps
    },
    ref
  ) => {
    const base =
      'inline-flex items-center justify-center font-semibold transition-all outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none select-none cursor-pointer'
    const combined = `${base} ${variantStyles[variant]} ${sizeStyles[size]} ${fullWidth ? 'w-full' : ''} ${className}`.trim()

    if ('href' in restProps && restProps.href !== undefined) {
      return (
        <a
          ref={ref as React.Ref<HTMLAnchorElement>}
          className={combined}
          {...(restProps as AnchorHTMLAttributes<HTMLAnchorElement>)}
        >
          {icon}
          {children}
          {iconRight}
        </a>
      )
    }

    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type={(restProps as ButtonHTMLAttributes<HTMLButtonElement>).type || 'button'}
        className={combined}
        {...(restProps as ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        {icon}
        {children}
        {iconRight}
      </button>
    )
  }
)

Button.displayName = 'Button'
