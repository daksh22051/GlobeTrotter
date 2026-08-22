import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, LayoutGrid, List, Sparkles, Compass } from 'lucide-react';

interface MyTripsHeaderProps {
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  totalTripsCount: number;
}

export const MyTripsHeader: React.FC<MyTripsHeaderProps> = ({
  viewMode,
  onViewModeChange,
  totalTripsCount,
}) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#EAE6DD]">
      {/* Title & Description */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#FFF2EE] text-[#FF6B4A] border border-[#FFD9CE]">
            <Compass className="w-3 h-3" />
            Personal Travel Command Center
          </span>
          <span className="text-xs font-semibold text-[#8C9B95]">
            {totalTripsCount} {totalTripsCount === 1 ? 'journey' : 'journeys'} recorded
          </span>
        </div>
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
      </div>
    </div>
  );
};
