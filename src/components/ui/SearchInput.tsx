import React from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onClear?: () => void;
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, value, onChange, onClear, placeholder = 'Search destinations, cities, activities...', ...props }, ref) => {
    return (
      <div className="relative flex items-center w-full">
        <span className="absolute left-4 text-[#68736F] pointer-events-none">
          <Search className="w-4 h-4" />
        </span>
        <input
          ref={ref}
          type="text"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={cn(
            'w-full bg-white border border-[#EAE6DD] text-[#17201D] placeholder:text-[#9BA3A0] rounded-full pl-11 pr-10 py-2.5 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#FF6B4A]/30 focus:border-[#FF6B4A] shadow-[0_2px_12px_rgba(23,32,29,0.03)] hover:border-[#17201D]/20',
            className
          )}
          {...props}
        />
        {value && onClear && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-3.5 p-1 rounded-full text-[#9BA3A0] hover:text-[#17201D] hover:bg-[#17201D]/5 transition-colors"
            aria-label="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    );
  }
);

SearchInput.displayName = 'SearchInput';
