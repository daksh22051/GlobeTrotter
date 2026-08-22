import React from 'react';
import { cn } from '../../utils/cn';

export interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical';
  label?: string;
}

export const Divider: React.FC<DividerProps> = ({
  orientation = 'horizontal',
  label,
  className,
  ...props
}) => {
  if (orientation === 'vertical') {
    return (
      <div
        className={cn('w-px bg-[#EAE6DD] self-stretch mx-2', className)}
        role="separator"
        aria-orientation="vertical"
        {...props}
      />
    );
  }

  if (label) {
    return (
      <div
        className={cn('relative flex items-center justify-center w-full my-4', className)}
        role="separator"
        {...props}
      >
        <div className="w-full border-t border-[#EAE6DD]" />
        <span className="absolute px-3 bg-[#FFFDF8] text-xs uppercase tracking-wider text-[#68736F] font-semibold">
          {label}
        </span>
      </div>
    );
  }

  return (
    <hr
      className={cn('w-full border-0 border-t border-[#EAE6DD] my-4', className)}
      role="separator"
      {...props}
    />
  );
};
