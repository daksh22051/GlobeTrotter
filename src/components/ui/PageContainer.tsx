import React from 'react';
import { cn } from '../../utils/cn';

export interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  hasPattern?: boolean;
}

export const PageContainer: React.FC<PageContainerProps> = ({
  size = 'xl',
  hasPattern = false,
  className,
  children,
  ...props
}) => {
  const sizeClasses = {
    sm: 'max-w-3xl',
    md: 'max-w-5xl',
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
    full: 'max-w-full',
  };

  return (
    <div
      className={cn(
        'w-full mx-auto px-4 sm:px-6 lg:px-8',
        sizeClasses[size],
        hasPattern && 'bg-warm-pattern',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
