import React from 'react';
import { cn } from '../../utils/cn';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  ariaLabel: string;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, variant = 'ghost', size = 'md', ariaLabel, children, ...props }, ref) => {
    const sizeClasses = {
      sm: 'w-8 h-8 p-1.5 text-xs',
      md: 'w-10 h-10 p-2 text-sm',
      lg: 'w-12 h-12 p-2.5 text-base',
    };

    const variantClasses = {
      primary:
        'bg-[#FF6B4A] hover:bg-[#E55837] text-white shadow-[0_4px_12px_rgba(255,107,74,0.25)] border border-transparent',
      secondary:
        'bg-[#20B8A6] hover:bg-[#179E8E] text-white shadow-[0_4px_12px_rgba(32,184,166,0.25)] border border-transparent',
      outline:
        'bg-white/80 hover:bg-white text-[#17201D] border border-[#EAE6DD] shadow-sm hover:border-[#17201D]/20',
      ghost:
        'bg-transparent hover:bg-[#17201D]/5 text-[#17201D] border border-transparent',
    };

    return (
      <button
        ref={ref}
        aria-label={ariaLabel}
        className={cn(
          'inline-flex items-center justify-center rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B4A]/50 disabled:opacity-50 disabled:pointer-events-none cursor-pointer',
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

IconButton.displayName = 'IconButton';
