import React from 'react';
import { cn } from '../../utils/cn';

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'coral' | 'teal' | 'current' | 'white';
  className?: string;
  label?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'coral',
  className,
  label,
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-7 h-7 border-[2.5px]',
    lg: 'w-10 h-10 border-3',
  };

  const colorClasses = {
    coral: 'border-[#FFE4DD] border-t-[#FF6B4A]',
    teal: 'border-[#DDF7F2] border-t-[#20B8A6]',
    current: 'border-current/20 border-t-current',
    white: 'border-white/30 border-t-white',
  };

  return (
    <div className={cn('inline-flex flex-col items-center justify-center gap-2', className)} role="status">
      <div
        className={cn(
          'rounded-full animate-spin',
          sizeClasses[size],
          colorClasses[color]
        )}
      />
      {label && <span className="text-xs font-medium text-[#68736F]">{label}</span>}
      <span className="sr-only">{label || 'Loading...'}</span>
    </div>
  );
};
