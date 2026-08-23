import React from 'react';
import { Layers, Route } from 'lucide-react';
import { ItineraryDay } from '../../types/itinerary';
import { getDayColor } from '../../config/mapConfig';
import { RouteDisplayMode } from '../../types/map';

interface DayFilterProps {
  days: ItineraryDay[];
  selectedDayNumber: number | 'all';
  onSelectDay: (dayNumber: number | 'all') => void;
  totalActivitiesCount: number;
  routeDisplayMode?: RouteDisplayMode;
  onSelectRouteDisplayMode?: (mode: RouteDisplayMode) => void;
}

export const DayFilter: React.FC<DayFilterProps> = ({
  days,
  selectedDayNumber,
  onSelectDay,
  totalActivitiesCount,
  routeDisplayMode = 'active_day',
  onSelectRouteDisplayMode,
}) => {
  return (
    <div className="w-full bg-[#FFFDF8] border-b border-[#EAE6DD] py-2 px-4 sm:px-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        {/* Days Scrollable Tab List */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          {/* All Days Option */}
          <button
            type="button"
            onClick={() => onSelectDay('all')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 ${
              selectedDayNumber === 'all'
                ? 'bg-[#17201D] text-white shadow-xs scale-[1.02]'
                : 'bg-white border border-[#EAE6DD] text-[#5E6B67] hover:border-[#17201D] hover:text-[#17201D]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>All Days</span>
            <span
              className={`ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                selectedDayNumber === 'all'
                  ? 'bg-white/20 text-white'
                  : 'bg-[#F4F1EA] text-[#5E6B67]'
              }`}
            >
              {totalActivitiesCount}
            </span>
          </button>

          {/* Individual Days */}
          {days.map((day) => {
            const isSelected = selectedDayNumber === day.dayNumber;
            const dayColor = getDayColor(day.dayNumber);
            const stopCount = day.activities.length;

            return (
              <button
                key={day.id || day.dayNumber}
                type="button"
                onClick={() => onSelectDay(day.dayNumber)}
                className={`group flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  isSelected
                    ? 'text-white shadow-xs scale-[1.02]'
                    : 'bg-white border border-[#EAE6DD] text-[#5E6B67] hover:border-[#17201D] hover:text-[#17201D]'
                }`}
                style={{
                  backgroundColor: isSelected ? dayColor.primary : undefined,
                  borderColor: isSelected ? dayColor.border : undefined,
                }}
              >
                {/* Day Color Indicator Dot */}
                <span
                  className="w-2 h-2 rounded-full shrink-0 transition-transform group-hover:scale-125"
                  style={{
                    backgroundColor: isSelected ? '#FFFFFF' : dayColor.primary,
                  }}
                />

                <span>Day {day.dayNumber}</span>

                {/* Stop Count */}
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                    isSelected
                      ? 'bg-black/20 text-white'
                      : 'bg-[#F4F1EA] text-[#68736F]'
                  }`}
                >
                  {stopCount}
                </span>
              </button>
            );
          })}
        </div>

        {/* Route Display Control */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1 sm:pt-0">
          {/* Route Mode Toggle Pill */}
          <button
            type="button"
            onClick={() => {
              if (onSelectRouteDisplayMode) {
                const nextMode =
                  routeDisplayMode === 'active_day'
                    ? 'all_days'
                    : routeDisplayMode === 'all_days'
                    ? 'none'
                    : 'active_day';
                onSelectRouteDisplayMode(nextMode);
              }
            }}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all cursor-pointer shrink-0 ${
              routeDisplayMode === 'active_day'
                ? 'bg-[#E6F4EA] border-[#34A853]/40 text-[#137333]'
                : routeDisplayMode === 'all_days'
                ? 'bg-[#FFF2EE] border-[#FF6B4A]/40 text-[#FF6B4A]'
                : 'bg-white border-[#EAE6DD] text-[#838F8B]'
            }`}
            title="Toggle Route Display (Active Day / All Routes / Hidden)"
          >
            <Route className="w-3 h-3" />
            <span>
              {routeDisplayMode === 'active_day'
                ? 'Active Day Route'
                : routeDisplayMode === 'all_days'
                ? 'All Routes'
                : 'Routes Hidden'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
