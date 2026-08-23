import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, LayoutGrid, List, Trash2 } from 'lucide-react';

interface MyTripsHeaderProps {
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  totalTripsCount: number;
  onClearAll: () => void;
}

export const MyTripsHeader: React.FC<MyTripsHeaderProps> = ({
  viewMode,
  onViewModeChange,
  totalTripsCount,
  onClearAll,
}) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#EAE6DD]">
      {/* Title & Description */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17201D] tracking-tight">
          My Trips
        </h1>
        <p className="text-sm text-[#556960] mt-1 max-w-2xl">
          Every journey you&apos;re planning, exploring, and remembering — all in one place.
        </p>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3 shrink-0">
        {/* View Switcher: Grid vs List */}
        <div className="inline-flex items-center p-1 bg-white border border-[#EAE6DD] rounded-2xl shadow-2xs">
          <button
            type="button"
            onClick={() => onViewModeChange('grid')}
            className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-[#17201D] text-white shadow-xs'
                : 'text-[#68736F] hover:text-[#17201D] hover:bg-[#F9F7F1]'
            }`}
            title="Grid View"
            aria-label="Grid View"
          >
            <LayoutGrid className="w-4 h-4" />
            <span className="hidden sm:inline">Grid</span>
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange('list')}
            className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'list'
                ? 'bg-[#17201D] text-white shadow-xs'
                : 'text-[#68736F] hover:text-[#17201D] hover:bg-[#F9F7F1]'
            }`}
            title="List View"
            aria-label="List View"
          >
            <List className="w-4 h-4" />
            <span className="hidden sm:inline">List</span>
          </button>
        </div>

        {/* Primary CTA */}
        <button
          type="button"
          onClick={() => navigate('/plan-trip')}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#FF6B4A] to-[#FF8E72] hover:from-[#E85535] hover:to-[#FF7859] text-white text-sm font-bold shadow-md shadow-[#FF6B4A]/25 hover:shadow-lg hover:shadow-[#FF6B4A]/30 transition-all transform active:scale-98 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Plan New Trip</span>
        </button>
        {totalTripsCount > 0 && (
          <button
            type="button"
            onClick={onClearAll}
            className="inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-2xl bg-white hover:bg-[#FFF0F0] border border-[#EAE6DD] hover:border-[#FDB8B8] text-[#C72E33] text-xs font-bold transition-colors cursor-pointer"
            title="Remove all saved trips"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Remove All</span>
          </button>
        )}
      </div>
    </div>
  );
};
