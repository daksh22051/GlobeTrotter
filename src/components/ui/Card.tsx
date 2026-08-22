import React from 'react';
import { cn } from '../../utils/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'subtle' | 'elevated' | 'glass' | 'interactive';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  radius?: 'lg' | 'xl' | '2xl' | '3xl';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant = 'default',
      padding = 'lg',
      radius = '2xl',
      children,
      ...props
    },
    ref
  ) => {
    const radiusClasses = {
      lg: 'rounded-[18px]',
      xl: 'rounded-[22px]',
      '2xl': 'rounded-[24px]',
      '3xl': 'rounded-[28px]',
    };

    const paddingClasses = {
      none: 'p-0',
      sm: 'p-3.5',
      md: 'p-5',
      lg: 'p-6 sm:p-7',
      xl: 'p-8 sm:p-10',
    };

    const variantClasses = {
      default:
        'bg-white border border-[#EAE6DD] shadow-[0_4px_20px_rgba(23,32,29,0.04)]',
      subtle:
        'bg-[#FFF8ED] border border-[#EAE6DD]/80 shadow-[0_2px_12px_rgba(23,32,29,0.03)]',
      elevated:
        'bg-white border border-[#EAE6DD]/70 shadow-[0_12px_36px_rgba(23,32,29,0.08)]',
      glass:
        'bg-white/85 backdrop-blur-md border border-white/60 shadow-[0_8px_32px_rgba(23,32,29,0.06)]',
      interactive:
        'bg-white border border-[#EAE6DD] shadow-[0_4px_20px_rgba(23,32,29,0.04)] hover:border-[#FF6B4A]/30 hover:shadow-[0_16px_36px_rgba(23,32,29,0.08)] hover:-translate-y-1 transition-all duration-300 cursor-pointer',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'transition-all duration-200 text-[#17201D]',
          radiusClasses[radius],
          paddingClasses[padding],
          variantClasses[variant],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
