import React, { useState, useEffect } from 'react';
import { X, SlidersHorizontal, Check, RefreshCw } from 'lucide-react';
import {
  TripFilterState,
  StatusFilter,
  BudgetFilter,
  DateFilter,
  DEFAULT_TRIP_FILTERS,
} from '../../utils/tripFilters';
import { TripType } from '../../types/trip';

interface TripFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: TripFilterState;
  onApplyFilters: (newFilters: TripFilterState) => void;
  availableDestinations: string[];
}

const TRIP_TYPES: { value: string; label: string }[] = [
  { value: 'all', label: 'All Types' },
  { value: 'adventure', label: 'Adventure' },
  { value: 'leisure', label: 'Relaxation & Leisure' },
  { value: 'food_culture', label: 'Food & Culture' },
  { value: 'romantic', label: 'Romantic & Couple' },
  { value: 'family', label: 'Family' },
  { value: 'backpacking', label: 'Backpacking & Solo' },
  { value: 'photography', label: 'Photography' },
  { value: 'wellness', label: 'Wellness & Retreat' },
  { value: 'business', label: 'Business & Bleisure' },
];

const BUDGET_PRESETS: { value: BudgetFilter; label: string }[] = [
  { value: 'all', label: 'Any Budget' },
  { value: 'under50k', label: 'Under ₹50,000' },
  { value: '50k_150k', label: '₹50,000 – ₹1,50,000' },
  { value: 'above150k', label: 'Above ₹1,50,000' },
];

const DATE_PRESETS: { value: DateFilter; label: string }[] = [
  { value: 'all', label: 'All Travel Dates' },
  { value: 'this_month', label: 'Departing This Month' },
  { value: 'next_3_months', label: 'Next 3 Months' },
  { value: 'this_year', label: 'Later This Year' },
  { value: 'future', label: 'All Future Dates' },
  { value: 'past', label: 'Past & Completed' },
];

export const TripFilterModal: React.FC<TripFilterModalProps> = ({
  isOpen,
  onClose,
  filters,
  onApplyFilters,
  availableDestinations,
}) => {
  const [localFilters, setLocalFilters] = useState<TripFilterState>(filters);

  useEffect(() => {
    if (isOpen) {
      setLocalFilters(filters);
    }
  }, [isOpen, filters]);

  if (!isOpen) return null;

  const handleApply = () => {
    onApplyFilters(localFilters);
    onClose();
  };

  const handleReset = () => {
    setLocalFilters(DEFAULT_TRIP_FILTERS);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#17201D]/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-[#EAE6DD] flex flex-col max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="filter-modal-title"
      >
        {/* Header */}
        <div className="p-5 border-b border-[#F4F1EA] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#FFF8ED] text-[#E08A00] flex items-center justify-center">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <h2 id="filter-modal-title" className="text-lg font-bold text-[#17201D]">
                Filter & Refine Journeys
              </h2>
              <p className="text-xs text-[#68736F]">Find exact trips in your command center</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-[#8C9B95] hover:text-[#17201D] hover:bg-[#F4F1EA] rounded-full transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Filter Form */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* 1. Trip Status */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#68736F] mb-2.5">
              Trip Status
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['all', 'upcoming', 'ongoing', 'completed', 'draft'] as StatusFilter[]).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setLocalFilters({ ...localFilters, status })}
                  className={`py-2 px-3 rounded-xl text-xs font-bold capitalize transition-all border text-center cursor-pointer ${
                    localFilters.status === status
                      ? 'bg-[#17201D] text-white border-[#17201D] shadow-2xs'
                      : 'bg-[#FAF8F5] border-[#EAE6DD] text-[#556960] hover:border-[#17201D]/40'
                  }`}
                >
                  {status === 'all' ? 'All Status' : status}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Destination */}
          {availableDestinations.length > 0 && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#68736F] mb-2.5">
                Destination
              </label>
              <select
                value={localFilters.destination}
                onChange={(e) => setLocalFilters({ ...localFilters, destination: e.target.value })}
                className="w-full bg-[#FAF8F5] border border-[#EAE6DD] rounded-xl py-2.5 px-3 text-sm font-semibold text-[#17201D] focus:outline-none focus:ring-2 focus:ring-[#FF6B4A]/30 focus:bg-white transition-all cursor-pointer"
              >
                <option value="all">All Destinations</option>
                {availableDestinations.map((dest) => (
                  <option key={dest} value={dest}>
                    {dest}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 3. Trip Type / Style */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#68736F] mb-2.5">
              Trip Type & Style
            </label>
            <div className="grid grid-cols-2 gap-2">
              {TRIP_TYPES.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setLocalFilters({ ...localFilters, tripType: type.value })}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border text-left flex items-center justify-between cursor-pointer ${
                    localFilters.tripType === type.value
                      ? 'bg-[#FFF2EE] border-[#FF6B4A] text-[#FF6B4A]'
                      : 'bg-[#FAF8F5] border-[#EAE6DD] text-[#556960] hover:border-[#17201D]/40'
                  }`}
                >
                  <span className="truncate">{type.label}</span>
                  {localFilters.tripType === type.value && <Check className="w-3.5 h-3.5 shrink-0 ml-1" />}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Budget Range */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#68736F] mb-2.5">
              Budget Target
            </label>
            <div className="grid grid-cols-2 gap-2">
              {BUDGET_PRESETS.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => setLocalFilters({ ...localFilters, budgetRange: preset.value })}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border text-left flex items-center justify-between cursor-pointer ${
                    localFilters.budgetRange === preset.value
                      ? 'bg-[#E8F8F5] border-[#20B8A6] text-[#1F8A70]'
                      : 'bg-[#FAF8F5] border-[#EAE6DD] text-[#556960] hover:border-[#17201D]/40'
                  }`}
                >
                  <span className="truncate">{preset.label}</span>
                  {localFilters.budgetRange === preset.value && (
                    <Check className="w-3.5 h-3.5 shrink-0 ml-1" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* 5. Date Window */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#68736F] mb-2.5">
              Date Range
            </label>
            <div className="grid grid-cols-2 gap-2">
              {DATE_PRESETS.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => setLocalFilters({ ...localFilters, dateRange: preset.value })}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border text-left flex items-center justify-between cursor-pointer ${
                    localFilters.dateRange === preset.value
                      ? 'bg-[#17201D] text-white border-[#17201D]'
                      : 'bg-[#FAF8F5] border-[#EAE6DD] text-[#556960] hover:border-[#17201D]/40'
                  }`}
                >
                  <span className="truncate">{preset.label}</span>
                  {localFilters.dateRange === preset.value && (
                    <Check className="w-3.5 h-3.5 shrink-0 ml-1" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[#FAF8F5] border-t border-[#EAE6DD] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-[#68736F] hover:text-[#17201D] transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Clear Filters</span>
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-[#EAE6DD] text-xs font-bold text-[#17201D] hover:bg-white transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="px-5 py-2.5 rounded-xl bg-[#FF6B4A] hover:bg-[#E85535] text-white text-xs font-bold shadow-md shadow-[#FF6B4A]/20 transition-all cursor-pointer"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
