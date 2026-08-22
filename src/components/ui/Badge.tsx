import React from 'react';
import { cn } from '../../utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'coral' | 'teal' | 'sun' | 'neutral' | 'outline' | 'solid-coral' | 'solid-teal';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'coral',
  size = 'md',
  icon,
  children,
  ...props
}) => {
  const sizeClasses = {
    sm: 'px-2.5 py-0.5 text-xs font-semibold gap-1 rounded-full',
    md: 'px-3.5 py-1 text-xs font-bold gap-1.5 rounded-full',
    lg: 'px-4 py-1.5 text-sm font-bold gap-2 rounded-full',
  };

  const variantClasses = {
    coral: 'bg-[#FFE4DD] text-[#E55837] border border-[#FF6B4A]/20',
    teal: 'bg-[#DDF7F2] text-[#179E8E] border border-[#20B8A6]/20',
    sun: 'bg-[#FFF4D6] text-[#B88714] border border-[#FFC857]/30',
    neutral: 'bg-[#FFF8ED] text-[#68736F] border border-[#EAE6DD]',
    outline: 'bg-white/80 text-[#17201D] border border-[#EAE6DD]',
    'solid-coral': 'bg-[#FF6B4A] text-white shadow-sm',
    'solid-teal': 'bg-[#20B8A6] text-white shadow-sm',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center font-medium tracking-wide whitespace-nowrap select-none',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
