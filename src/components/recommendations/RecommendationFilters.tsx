import React from 'react';
import { Search, X, Sparkles, MapPin, Building2, Utensils, Compass, ArrowUpDown } from 'lucide-react';
import { RecommendationCategory } from '../../types/recommendation';

export type FilterCategory = 'all' | RecommendationCategory;
export type SortOption = 'match' | 'cost_asc' | 'cost_desc' | 'rating';

interface RecommendationFiltersProps {
  selectedCategory: FilterCategory;
  onSelectCategory: (cat: FilterCategory) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  counts: {
    all: number;
    place: number;
    hotel: number;
    food: number;
    experience: number;
  };
}

export const RecommendationFilters: React.FC<RecommendationFiltersProps> = ({
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  counts,
}) => {
  const categoryTabs: { id: FilterCategory; label: string; icon: React.ReactNode; count: number }[] = [
    { id: 'all', label: 'All Curations', icon: <Sparkles className="w-3.5 h-3.5" />, count: counts.all },
    { id: 'place', label: 'Places to Visit', icon: <MapPin className="w-3.5 h-3.5" />, count: counts.place },
    { id: 'hotel', label: 'Stays & Hotels', icon: <Building2 className="w-3.5 h-3.5" />, count: counts.hotel },
    { id: 'food', label: 'Food & Dining', icon: <Utensils className="w-3.5 h-3.5" />, count: counts.food },
    { id: 'experience', label: 'Experiences', icon: <Compass className="w-3.5 h-3.5" />, count: counts.experience },
  ];

  return (
    <div className="w-full space-y-4 mb-8 select-none">
      {/* Top Row: Search & Sort Dropdown */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#838F8B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search recommendations by name, cuisine, tag..."
            className="w-full pl-10 pr-9 py-2.5 rounded-full bg-white border border-[#EAE6DD] text-xs sm:text-sm text-[#17201D] placeholder-[#9CA7A4] focus:outline-none focus:border-[#FF6B4A] focus:ring-2 focus:ring-[#FF6B4A]/10 shadow-2xs transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#838F8B] hover:text-[#17201D] transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Sort Selector */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <label htmlFor="rec-sort-select" className="text-xs font-bold text-[#838F8B] flex items-center gap-1">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#FF6B4A]" />
            <span>Sort by:</span>
          </label>
          <select
            id="rec-sort-select"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="px-3 py-2 rounded-xl bg-white border border-[#EAE6DD] text-xs font-bold text-[#17201D] focus:outline-none focus:border-[#FF6B4A] shadow-2xs cursor-pointer"
          >
            <option value="match">Highest Match Score</option>
            <option value="rating">Highest Rated ⭐</option>
            <option value="cost_asc">Lowest Estimated Cost</option>
            <option value="cost_desc">Highest Estimated Cost</option>
          </select>
        </div>
      </div>

      {/* Category Tabs (Horizontally scrollable on mobile) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {categoryTabs.map((tab) => {
          const isActive = selectedCategory === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectCategory(tab.id)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer shadow-2xs ${
                isActive
                  ? 'bg-[#17201D] text-white shadow-xs'
                  : 'bg-white hover:bg-[#F4F1EA] text-[#4E5955] border border-[#EAE6DD]'
              }`}
            >
              <span className={isActive ? 'text-[#FF8E72]' : 'text-[#838F8B]'}>{tab.icon}</span>
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                  isActive ? 'bg-white/20 text-white' : 'bg-[#F0ECE1] text-[#68736F]'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
