import React from 'react';
import { Minus, Plus, Users, User, Baby } from 'lucide-react';

interface TravellerSelectorProps {
  adultsCount: number;
  childrenCount: number;
  onAdultsChange: (count: number) => void;
  onChildrenChange: (count: number) => void;
  minAdults?: number;
  maxTotal?: number;
}

export const TravellerSelector: React.FC<TravellerSelectorProps> = ({
  adultsCount,
  childrenCount,
  onAdultsChange,
  onChildrenChange,
  minAdults = 1,
  maxTotal = 20,
}) => {
  const totalCount = adultsCount + childrenCount;

  const handleDecrementAdults = () => {
    if (adultsCount > minAdults) {
      onAdultsChange(adultsCount - 1);
    }
  };

  const handleIncrementAdults = () => {
    if (totalCount < maxTotal) {
      onAdultsChange(adultsCount + 1);
    }
  };

  const handleDecrementChildren = () => {
    if (childrenCount > 0) {
      onChildrenChange(childrenCount - 1);
    }
  };

  const handleIncrementChildren = () => {
    if (totalCount < maxTotal) {
      onChildrenChange(childrenCount + 1);
    }
  };

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold uppercase tracking-wider text-[#4A5551]">
          Number of Travellers <span className="text-[#FF6B4A]">*</span>
        </label>
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#FFF2EE] text-[#FF6B4A] text-xs font-extrabold border border-[#FFE0D6]">
          <Users className="w-3.5 h-3.5" />
          <span>{totalCount} {totalCount === 1 ? 'Traveller' : 'Travellers'} Total</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Adults Row */}
        <div className="flex items-center justify-between p-3.5 bg-white rounded-2xl border border-[#EAE6DD] shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#F4F1EA] text-[#4A5551] flex items-center justify-center">
              <User className="w-4.5 h-4.5" />
            </div>
            <div>
              <p className="text-xs font-extrabold text-[#17201D]">Adults</p>
              <p className="text-[11px] text-[#68736F]">Age 13 and above</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={adultsCount <= minAdults}
              onClick={handleDecrementAdults}
              aria-label="Decrease adults count"
              className="w-8 h-8 rounded-full border border-[#EAE6DD] bg-white hover:bg-[#F9F7F1] disabled:opacity-35 disabled:cursor-not-allowed flex items-center justify-center text-[#17201D] font-bold transition-colors cursor-pointer"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>

            <span className="w-7 text-center text-sm font-extrabold text-[#17201D]" aria-live="polite">
              {adultsCount}
            </span>

            <button
              type="button"
              disabled={totalCount >= maxTotal}
              onClick={handleIncrementAdults}
              aria-label="Increase adults count"
              className="w-8 h-8 rounded-full border border-[#FF6B4A]/30 bg-[#FFF2EE] hover:bg-[#FFE5DC] disabled:opacity-35 disabled:cursor-not-allowed flex items-center justify-center text-[#FF6B4A] font-bold transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Children Row */}
        <div className="flex items-center justify-between p-3.5 bg-white rounded-2xl border border-[#EAE6DD] shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#F4F1EA] text-[#4A5551] flex items-center justify-center">
              <Baby className="w-4.5 h-4.5" />
            </div>
            <div>
              <p className="text-xs font-extrabold text-[#17201D]">Children</p>
              <p className="text-[11px] text-[#68736F]">Ages 0 to 12</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={childrenCount <= 0}
              onClick={handleDecrementChildren}
              aria-label="Decrease children count"
              className="w-8 h-8 rounded-full border border-[#EAE6DD] bg-white hover:bg-[#F9F7F1] disabled:opacity-35 disabled:cursor-not-allowed flex items-center justify-center text-[#17201D] font-bold transition-colors cursor-pointer"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>

            <span className="w-7 text-center text-sm font-extrabold text-[#17201D]" aria-live="polite">
              {childrenCount}
            </span>

            <button
              type="button"
              disabled={totalCount >= maxTotal}
              onClick={handleIncrementChildren}
              aria-label="Increase children count"
              className="w-8 h-8 rounded-full border border-[#FF6B4A]/30 bg-[#FFF2EE] hover:bg-[#FFE5DC] disabled:opacity-35 disabled:cursor-not-allowed flex items-center justify-center text-[#FF6B4A] font-bold transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
