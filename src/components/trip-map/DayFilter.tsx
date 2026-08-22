import React from 'react';
import { Layers } from 'lucide-react';
import { ItineraryDay } from '../../types/itinerary';
import { getDayColor } from '../../config/mapConfig';

interface DayFilterProps {
  days: ItineraryDay[];
  selectedDayNumber: number | 'all';
  onSelectDay: (dayNumber: number | 'all') => void;
  totalActivitiesCount: number;
}

export const DayFilter: React.FC<DayFilterProps> = ({
  days,
  selectedDayNumber,
  onSelectDay,
  totalActivitiesCount,
}) => {
  return (
    <div className="w-full bg-[#FFFDF8] border-b border-[#EAE6DD] py-2 px-4 sm:px-6">
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
        {/* All Days Option */}
        <button
          type="button"
          onClick={() => onSelectDay('all')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 ${
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
                className="w-2.5 h-2.5 rounded-full shrink-0 transition-transform group-hover:scale-125"
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
                {stopCount} {stopCount === 1 ? 'stop' : 'stops'}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
