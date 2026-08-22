import React from 'react';
import { cn } from '../../utils/cn';

export interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  className?: string;
  isLink?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showTagline = false,
  className,
}) => {
  const iconSizeClasses = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
    xl: 'w-14 h-14',
  };

  const textClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  return (
    <div className={cn('inline-flex items-center gap-3 select-none', className)}>
      {/* Visual Mark: Globe + Journey Route + Location Pin Concept */}
      <div className={cn('relative shrink-0 flex items-center justify-center', iconSizeClasses[size])}>
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-sm"
        >
          {/* Subtle Outer Glow / Background disc */}
          <circle cx="24" cy="24" r="22" fill="#FFE4DD" fillOpacity="0.4" />
          
          {/* Globe Latitude & Longitude Geometrics */}
          <circle cx="24" cy="24" r="18" stroke="#17201D" strokeWidth="2.2" strokeOpacity="0.85" />
          <ellipse cx="24" cy="24" rx="9" ry="18" stroke="#17201D" strokeWidth="1.8" strokeOpacity="0.35" />
          <line x1="6" y1="24" x2="42" y2="24" stroke="#17201D" strokeWidth="1.8" strokeOpacity="0.35" />
          
          {/* Dynamic Travel Journey Flight Arc (Sunset Coral to Coastal Teal) */}
          <path
            d="M 12 33 C 14 15, 30 11, 38 20"
            stroke="#FF6B4A"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeDasharray="1 0"
          />

          {/* Dotted extension trajectory */}
          <path
            d="M 38 20 C 41 24, 38 34, 28 36"
            stroke="#20B8A6"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeDasharray="2.5 3.5"
          />

          {/* Origin departure point */}
          <circle cx="12" cy="33" r="3.2" fill="#20B8A6" stroke="#FFFFFF" strokeWidth="1.5" />

          {/* Destination Location Pin Node (Vibrant Sunset Coral) */}
          <circle cx="38" cy="20" r="4.2" fill="#FF6B4A" stroke="#FFFFFF" strokeWidth="1.8" />
          <circle cx="38" cy="20" r="1.6" fill="#FFFFFF" />
        </svg>
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col text-left">
        <div className={cn('font-black tracking-tight text-[#17201D] flex items-center leading-none', textClasses[size])}>
          <span>Globe</span>
          <span className="text-[#FF6B4A]">Trotter</span>
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#20B8A6] ml-1 mb-1 self-end" />
        </div>
        {showTagline && (
          <span className="text-[11px] font-semibold text-[#68736F] tracking-wide mt-1">
            Plan smarter. Travel better.
          </span>
        )}
      </div>
    </div>
  );
};
