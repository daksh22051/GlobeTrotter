import React from 'react';
import { Search, SlidersHorizontal, ArrowUpDown, X, Heart, Pin } from 'lucide-react';
import { TripFilterState, countActiveFilters, DEFAULT_TRIP_FILTERS } from '../../utils/tripFilters';
import { TripSortOption, SORT_OPTIONS } from '../../utils/tripSorting';

interface TripFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filters: TripFilterState;
  onOpenFilterModal: () => void;
  onResetFilters: () => void;
  sortOption: TripSortOption;
  onSortChange: (sort: TripSortOption) => void;
  onToggleFavoriteFilter: () => void;
  onTogglePinnedFilter: () => void;
  totalFilteredCount: number;
}

export const TripFilterBar: React.FC<TripFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  filters,
  onOpenFilterModal,
  onResetFilters,
  sortOption,
  onSortChange,
  onToggleFavoriteFilter,
  onTogglePinnedFilter,
  totalFilteredCount,
}) => {
  const activeFiltersCount = countActiveFilters(filters);

  return (
    <div className="space-y-3">
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        {/* Search Field */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C9B95]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search your trips by name, destination, country, notes..."
            className="w-full pl-10 pr-10 py-2.5 bg-white border border-[#EAE6DD] rounded-2xl text-sm text-[#17201D] placeholder:text-[#8C9B95] focus:outline-none focus:ring-2 focus:ring-[#FF6B4A]/30 focus:border-[#FF6B4A] transition-all shadow-2xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#8C9B95] hover:text-[#17201D] rounded-full hover:bg-[#F4F1EA] transition-colors cursor-pointer"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Action Controls Group */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {/* Quick Filter: Favorites */}
          <button
            type="button"
            onClick={onToggleFavoriteFilter}
            className={`inline-flex items-center gap-1.5 px-3 py-2.5 rounded-2xl text-xs font-bold transition-all border whitespace-nowrap cursor-pointer ${
              filters.favoriteOnly
                ? 'bg-[#FFF2EE] border-[#FFD9CE] text-[#FF6B4A] shadow-2xs'
                : 'bg-white border-[#EAE6DD] text-[#556960] hover:text-[#17201D] hover:bg-[#F9F7F1]'
            }`}
            title="Show only favorites"
          >
            <Heart
              className={`w-3.5 h-3.5 ${
                filters.favoriteOnly ? 'fill-[#FF6B4A] text-[#FF6B4A]' : 'text-[#8C9B95]'
              }`}
            />
            <span>Favorites</span>
          </button>

          {/* Quick Filter: Pinned */}
          <button
            type="button"
            onClick={onTogglePinnedFilter}
            className={`inline-flex items-center gap-1.5 px-3 py-2.5 rounded-2xl text-xs font-bold transition-all border whitespace-nowrap cursor-pointer ${
              filters.pinnedOnly
                ? 'bg-[#E8F8F5] border-[#B2E6DC] text-[#1F8A70] shadow-2xs'
                : 'bg-white border-[#EAE6DD] text-[#556960] hover:text-[#17201D] hover:bg-[#F9F7F1]'
            }`}
            title="Show only pinned journeys"
          >
            <Pin
              className={`w-3.5 h-3.5 ${
                filters.pinnedOnly ? 'fill-[#1F8A70] text-[#1F8A70]' : 'text-[#8C9B95]'
              }`}
            />
            <span>Pinned</span>
          </button>

          {/* Expanded Filter Modal Trigger */}
          <button
            type="button"
            onClick={onOpenFilterModal}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all border whitespace-nowrap cursor-pointer ${
              activeFiltersCount > 0
                ? 'bg-[#FFF8ED] border-[#FCE2B6] text-[#E08A00] shadow-2xs'
                : 'bg-white border-[#EAE6DD] text-[#556960] hover:text-[#17201D] hover:bg-[#F9F7F1]'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#E08A00] text-white">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* Sort Dropdown */}
          <div className="relative inline-flex items-center">
            <div className="relative">
              <select
                value={sortOption}
                onChange={(e) => onSortChange(e.target.value as TripSortOption)}
                className="appearance-none bg-white border border-[#EAE6DD] hover:border-[#17201D]/40 text-[#17201D] text-xs font-bold pl-8 pr-8 py-2.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#FF6B4A]/30 transition-all cursor-pointer shadow-2xs"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ArrowUpDown className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8C9B95] pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Active Filter Chips Bar (if any filter or search query is applied) */}
      {(activeFiltersCount > 0 || searchQuery) && (
        <div className="flex items-center flex-wrap gap-2 pt-1 text-xs">
          <span className="text-[#8C9B95] font-semibold">Active filters:</span>

          {searchQuery && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FAF8F5] border border-[#EAE6DD] text-[#17201D] font-medium">
              <span>Query: &quot;{searchQuery}&quot;</span>
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="p-0.5 hover:text-[#FF6B4A] cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.destination !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FAF8F5] border border-[#EAE6DD] text-[#17201D] font-medium">
              <span>Dest: {filters.destination}</span>
              <button
                type="button"
                onClick={() => onResetFilters()}
                className="p-0.5 hover:text-[#FF6B4A] cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.tripType !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FAF8F5] border border-[#EAE6DD] text-[#17201D] font-medium">
              <span>Type: {filters.tripType}</span>
              <button
                type="button"
                onClick={() => onResetFilters()}
                className="p-0.5 hover:text-[#FF6B4A] cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.budgetRange !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FAF8F5] border border-[#EAE6DD] text-[#17201D] font-medium">
              <span>
                Budget:{' '}
                {filters.budgetRange === 'under50k'
                  ? 'Under ₹50k'
                  : filters.budgetRange === '50k_150k'
                  ? '₹50k – ₹1.5L'
                  : 'Above ₹1.5L'}
              </span>
              <button
                type="button"
                onClick={() => onResetFilters()}
                className="p-0.5 hover:text-[#FF6B4A] cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          <button
            type="button"
            onClick={onResetFilters}
            className="text-xs font-bold text-[#FF6B4A] hover:underline cursor-pointer ml-1"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
};
