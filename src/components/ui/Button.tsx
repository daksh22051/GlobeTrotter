import React from 'react';
import { cn } from '../../utils/cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      icon,
      iconPosition = 'right',
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      sm: 'px-3.5 py-1.5 text-xs font-medium gap-1.5 rounded-full min-h-[36px]',
      md: 'px-5 py-2.5 text-sm font-semibold gap-2 rounded-full min-h-[44px]',
      lg: 'px-7 py-3.5 text-base font-bold gap-2.5 rounded-full min-h-[52px]',
    };

    const variantClasses = {
      primary:
        'bg-[#FF6B4A] hover:bg-[#E55837] text-white shadow-[0_4px_16px_rgba(255,107,74,0.25)] hover:shadow-[0_8px_24px_rgba(255,107,74,0.38)] hover:-translate-y-0.5 active:translate-y-0 active:shadow-[0_2px_8px_rgba(255,107,74,0.2)] border border-transparent',
      secondary:
        'bg-[#20B8A6] hover:bg-[#179E8E] text-white shadow-[0_4px_16px_rgba(32,184,166,0.22)] hover:shadow-[0_8px_24px_rgba(32,184,166,0.32)] hover:-translate-y-0.5 active:translate-y-0 border border-transparent',
      outline:
        'bg-white/80 hover:bg-white text-[#17201D] border border-[#EAE6DD] hover:border-[#17201D]/20 shadow-[0_2px_8px_rgba(23,32,29,0.04)] hover:shadow-[0_4px_16px_rgba(23,32,29,0.08)] hover:-translate-y-0.5 active:translate-y-0',
      ghost:
        'bg-transparent hover:bg-[#17201D]/5 text-[#17201D] border border-transparent',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'group inline-flex items-center justify-center transition-all duration-200 ease-out cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B4A]/50 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed whitespace-nowrap',
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : (
          <>
            {icon && iconPosition === 'left' && (
              <span className="shrink-0 transition-transform duration-200 group-hover:-translate-x-0.5">
                {icon}
              </span>
            )}
            <span>{children}</span>
            {icon && iconPosition === 'right' && (
              <span className="shrink-0 transition-transform duration-200 group-hover:translate-x-1">
                {icon}
              </span>
            )}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
