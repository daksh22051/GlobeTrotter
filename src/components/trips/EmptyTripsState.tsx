import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, Search, Plus, Sparkles, RefreshCw, Calendar } from 'lucide-react';
import { StatusFilter } from '../../utils/tripFilters';

interface EmptyTripsStateProps {
  type: 'zero_trips' | 'no_search_results' | 'no_status_results';
  searchQuery?: string;
  status?: StatusFilter;
  onClearFilters?: () => void;
}

export const EmptyTripsState: React.FC<EmptyTripsStateProps> = ({
  type,
  searchQuery,
  status,
  onClearFilters,
}) => {
  const navigate = useNavigate();

  if (type === 'zero_trips') {
    return (
      <div className="text-center py-16 px-6 bg-white rounded-3xl border border-[#EAE6DD] shadow-2xs max-w-2xl mx-auto my-8">
        <div className="w-16 h-16 rounded-3xl bg-[#FFF2EE] text-[#FF6B4A] flex items-center justify-center mx-auto mb-4 border border-[#FFD9CE] shadow-xs">
          <Compass className="w-8 h-8 animate-pulse" />
        </div>

        <h3 className="text-xl sm:text-2xl font-extrabold text-[#17201D] tracking-tight">
          Your next adventure starts here
        </h3>
        <p className="text-sm text-[#556960] mt-2 max-w-md mx-auto leading-relaxed">
          Create your first trip, build smart day-by-day itineraries, track your budget, and visualize your entire timeline in one command center.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/plan-trip')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-[#FF6B4A] to-[#FF8E72] hover:from-[#E85535] hover:to-[#FF7859] text-white text-sm font-bold shadow-lg shadow-[#FF6B4A]/25 hover:shadow-xl transition-all transform active:scale-98 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Plan Your First Trip</span>
          </button>
        </div>
      </div>
    );
  }

  if (type === 'no_search_results') {
    return (
      <div className="text-center py-14 px-6 bg-white rounded-3xl border border-[#EAE6DD] shadow-2xs max-w-xl mx-auto my-6">
        <div className="w-14 h-14 rounded-2xl bg-[#FFF8ED] text-[#E08A00] flex items-center justify-center mx-auto mb-3.5 border border-[#FCE2B6]">
          <Search className="w-6 h-6" />
        </div>

        <h3 className="text-lg sm:text-xl font-bold text-[#17201D]">
          No journeys found
        </h3>
        <p className="text-sm text-[#68736F] mt-1.5 max-w-sm mx-auto">
          We couldn&apos;t find any trips matching {searchQuery ? `"${searchQuery}"` : 'your active filters'}.
        </p>

        {onClearFilters && (
          <div className="mt-5">
            <button
              type="button"
              onClick={onClearFilters}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#EAE6DD] hover:border-[#17201D]/40 bg-[#FAF8F5] text-xs font-bold text-[#17201D] transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Search & Filters</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  // No status results (e.g. no completed trips yet)
  return (
    <div className="text-center py-14 px-6 bg-white rounded-3xl border border-[#EAE6DD] shadow-2xs max-w-xl mx-auto my-6">
      <div className="w-14 h-14 rounded-2xl bg-[#F4F1EA] text-[#556960] flex items-center justify-center mx-auto mb-3.5">
        <Calendar className="w-6 h-6" />
      </div>

      <h3 className="text-lg sm:text-xl font-bold text-[#17201D]">
        No {status} trips found
      </h3>
      <p className="text-sm text-[#68736F] mt-1.5 max-w-sm mx-auto">
        You don&apos;t have any {status} journeys in this collection right now.
      </p>

      {onClearFilters && (
        <div className="mt-5 flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={onClearFilters}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FAF8F5] border border-[#EAE6DD] text-xs font-bold text-[#17201D] hover:bg-[#F4F1EA] transition-colors cursor-pointer"
          >
            <span>View All Journeys</span>
          </button>
        </div>
      )}
    </div>
  );
};
