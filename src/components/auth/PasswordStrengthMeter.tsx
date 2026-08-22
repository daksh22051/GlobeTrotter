import React from 'react';
import { Check, X } from 'lucide-react';
import { PasswordStrength } from '../../types/auth';

interface PasswordStrengthMeterProps {
  strength: PasswordStrength;
  showRequirements?: boolean;
}

export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({
  strength,
  showRequirements = true,
}) => {
  const { score, label, hasMinLength, hasUppercase, hasNumber } = strength;

  // Colors based on score
  const getBarColor = (index: number) => {
    if (index >= score) return 'bg-[#EAE6DD]';
    if (score <= 1) return 'bg-[#FF6B4A]'; // Weak
    if (score === 2) return 'bg-[#FBBF24]'; // Fair
    if (score === 3) return 'bg-[#38BDF8]'; // Good
    return 'bg-[#20B8A6]'; // Strong
  };

  const getLabelColor = () => {
    if (score <= 1) return 'text-[#FF6B4A]';
    if (score === 2) return 'text-[#D97706]';
    if (score === 3) return 'text-[#0284C7]';
    return 'text-[#0D9488]';
  };

  return (
    <div className="w-full space-y-2 pt-1">
      {/* Strength Bars and Text */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1 flex items-center gap-1.5 h-1.5">
          {[0, 1, 2, 3].map((index) => (
            <div
              key={index}
              className={`h-full flex-1 rounded-full transition-all duration-300 ${getBarColor(index)}`}
            />
          ))}
        </div>
        <span className={`text-[11px] font-bold tracking-wide uppercase ${getLabelColor()}`}>
          {label}
        </span>
      </div>

      {/* Live Requirement Checklist */}
      {showRequirements && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 pt-1 text-[11px] font-medium text-[#68736F]">
          <div className="flex items-center gap-1.5 transition-colors">
            {hasMinLength ? (
              <Check className="w-3.5 h-3.5 text-[#20B8A6] shrink-0" />
            ) : (
              <span className="w-1.5 h-1.5 rounded-full bg-[#D1CCC0] mx-1 shrink-0" />
            )}
            <span className={hasMinLength ? 'text-[#17201D] font-semibold' : ''}>8+ characters</span>
          </div>

          <div className="flex items-center gap-1.5 transition-colors">
            {hasUppercase ? (
              <Check className="w-3.5 h-3.5 text-[#20B8A6] shrink-0" />
            ) : (
              <span className="w-1.5 h-1.5 rounded-full bg-[#D1CCC0] mx-1 shrink-0" />
            )}
            <span className={hasUppercase ? 'text-[#17201D] font-semibold' : ''}>Uppercase letter</span>
          </div>

          <div className="flex items-center gap-1.5 transition-colors">
            {hasNumber ? (
              <Check className="w-3.5 h-3.5 text-[#20B8A6] shrink-0" />
            ) : (
              <span className="w-1.5 h-1.5 rounded-full bg-[#D1CCC0] mx-1 shrink-0" />
            )}
            <span className={hasNumber ? 'text-[#17201D] font-semibold' : ''}>One number</span>
          </div>
        </div>
      )}
    </div>
  );
};
