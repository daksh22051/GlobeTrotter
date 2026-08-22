import React from 'react';
import {
  Search,
  X,
  SlidersHorizontal,
  Landmark,
  Utensils,
  Hotel,
  Compass,
  AlertTriangle,
  Clock,
  Sparkles,
  Train,
} from 'lucide-react';

export type TimelineFilterCategory =
  | 'all'
  | 'place'
  | 'food'
  | 'hotel'
  | 'experience'
  | 'travel'
  | 'free_time'
  | 'conflicts';

interface TimelineFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedFilter: TimelineFilterCategory;
  onFilterChange: (filter: TimelineFilterCategory) => void;
  conflictCount: number;
  totalFilteredCount?: number;
  onClearFilters: () => void;
}

export const TimelineFilters: React.FC<TimelineFiltersProps> = ({
  searchQuery,
  onSearchChange,
  selectedFilter,
  onFilterChange,
  conflictCount,
  totalFilteredCount,
  onClearFilters,
}) => {
  const filterChips: {
    id: TimelineFilterCategory;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    countBadge?: number;
  }[] = [
    { id: 'all', label: 'All Activities', icon: SlidersHorizontal },
    { id: 'place', label: 'Places & Sights', icon: Landmark },
    { id: 'food', label: 'Food & Dining', icon: Utensils },
    { id: 'hotel', label: 'Hotels & Stays', icon: Hotel },
    { id: 'experience', label: 'Experiences', icon: Compass },
    { id: 'travel', label: 'Transit & Travel', icon: Train },
    { id: 'free_time', label: 'Free Time', icon: Sparkles },
    {
      id: 'conflicts',
      label: 'Conflicts',
      icon: AlertTriangle,
      countBadge: conflictCount,
    },
  ];

  const hasActiveFilters = searchQuery.trim().length > 0 || selectedFilter !== 'all';

  return (
    <div className="bg-[#FFFDF8] border-b border-[#EAE6DD] py-3 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#838F8B]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search your itinerary (places, food, notes)..."
            className="w-full pl-10 pr-9 py-2 rounded-xl bg-[#F4F1EA]/80 border border-[#EAE6DD] focus:border-[#FF6B4A] focus:bg-white text-xs sm:text-sm text-[#17201D] placeholder-[#838F8B] focus:outline-none transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-[#838F8B] hover:text-[#17201D] hover:bg-[#EAE6DD] transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Chips Scroll Container */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {filterChips.map((chip) => {
            const Icon = chip.icon;
            const isSelected = selectedFilter === chip.id;
            const isConflictChip = chip.id === 'conflicts';

            return (
              <button
                key={chip.id}
                type="button"
                onClick={() => onFilterChange(chip.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 border ${
                  isSelected
                    ? isConflictChip
                      ? 'bg-[#FFEAE5] text-[#D9534F] border-[#FF6B4A]'
                      : 'bg-[#17201D] text-white border-[#17201D] shadow-2xs'
                    : isConflictChip && conflictCount > 0
                    ? 'bg-[#FFF3D6] text-[#B7791F] border-[#FFE58F] hover:bg-[#FFEAE5]'
                    : 'bg-white text-[#556960] border-[#EAE6DD] hover:border-[#17201D] hover:text-[#17201D]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{chip.label}</span>
                {chip.countBadge !== undefined && chip.countBadge > 0 && (
                  <span
                    className={`inline-flex items-center justify-center min-w-4 h-4 px-1 rounded-full text-[10px] font-black ${
                      isSelected
                        ? 'bg-[#D9534F] text-white'
                        : 'bg-[#FF6B4A] text-white'
                    }`}
                  >
                    {chip.countBadge}
                  </span>
                )}
              </button>
            );
          })}

          {hasActiveFilters && (
            <button
              type="button"
              onClick={onClearFilters}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-semibold text-[#838F8B] hover:text-[#D9534F] hover:bg-[#FFEAE5] transition-colors cursor-pointer shrink-0"
              title="Clear all filters"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
