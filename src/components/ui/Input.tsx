import React from 'react';
import { cn } from '../../utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      helperText,
      error,
      icon,
      iconPosition = 'left',
      disabled,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5 text-left">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-bold text-[#17201D] tracking-wide uppercase"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && iconPosition === 'left' && (
            <span className="absolute left-4 text-[#68736F] pointer-events-none flex items-center">
              {icon}
            </span>
          )}
          <input
            id={inputId}
            ref={ref}
            disabled={disabled}
            className={cn(
              'w-full bg-white border text-[#17201D] placeholder:text-[#9BA3A0] rounded-xl px-4 py-3 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#FF6B4A]/30 focus:border-[#FF6B4A] disabled:opacity-50 disabled:bg-[#FFF8ED]',
              error ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : 'border-[#EAE6DD]',
              icon && iconPosition === 'left' ? 'pl-11' : '',
              icon && iconPosition === 'right' ? 'pr-11' : '',
              className
            )}
            {...props}
          />
          {icon && iconPosition === 'right' && (
            <span className="absolute right-4 text-[#68736F] pointer-events-none flex items-center">
              {icon}
            </span>
          )}
        </div>
        {error ? (
          <p className="text-xs font-medium text-red-500 mt-0.5">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-[#68736F] mt-0.5">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
