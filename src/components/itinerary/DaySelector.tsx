import React from 'react';
import { Calendar, Sparkles, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { ItineraryDay, DayHealthResult } from '../../types/itinerary';

interface DaySelectorProps {
  days: ItineraryDay[];
  selectedDayNumber: number;
  onSelectDay: (dayNumber: number) => void;
  dayHealths: Record<number, DayHealthResult>;
  onDropOnDay?: (dayNumber: number, activityId: string) => void;
}

export const DaySelector: React.FC<DaySelectorProps> = ({
  days,
  selectedDayNumber,
  onSelectDay,
  dayHealths,
  onDropOnDay,
}) => {
  const [dragOverDay, setDragOverDay] = React.useState<number | null>(null);

  const handleDragOver = (e: React.DragEvent, dayNum: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverDay !== dayNum) {
      setDragOverDay(dayNum);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverDay(null);
  };

  const handleDrop = (e: React.DragEvent, dayNum: number) => {
    e.preventDefault();
    setDragOverDay(null);
    const activityId = e.dataTransfer.getData('text/plain') || e.dataTransfer.getData('application/json');
    if (activityId && onDropOnDay) {
      onDropOnDay(dayNum, activityId);
    }
  };

  return (
    <div className="w-full bg-[#FFFDF8] border-b border-[#EAE6DD] py-2.5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-1">
          {days.map((day) => {
            const isSelected = day.dayNumber === selectedDayNumber;
            const health = dayHealths[day.dayNumber];
            const isDragTarget = dragOverDay === day.dayNumber;

            // Determine status color
            let healthColor = 'text-[#20B8A6] bg-[#EAF8F5] border-[#20B8A6]/30';
            if (health?.status === 'Busy') {
              healthColor = 'text-[#FFB020] bg-[#FFF8E7] border-[#FFB020]/30';
            } else if (health?.status === 'Overloaded') {
              healthColor = 'text-[#E55837] bg-[#FFF0EC] border-[#FF6B4A]/30';
            }

            return (
              <button
                key={day.id}
                type="button"
                onClick={() => onSelectDay(day.dayNumber)}
                onDragOver={(e) => handleDragOver(e, day.dayNumber)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, day.dayNumber)}
                className={`group relative flex flex-col items-start min-w-[130px] sm:min-w-[150px] p-3 rounded-2xl border transition-all text-left cursor-pointer shrink-0 ${
                  isSelected
                    ? 'bg-white border-[#FF6B4A] shadow-md ring-2 ring-[#FF6B4A]/15 scale-[1.02]'
                    : isDragTarget
                    ? 'bg-[#FFF2EE] border-[#FF6B4A] border-dashed ring-2 ring-[#FF6B4A]/30 scale-[1.04]'
                    : 'bg-white/80 hover:bg-white border-[#EAE6DD] hover:border-[#D8D3C5] shadow-2xs'
                }`}
              >
                {/* Top Row: DAY X + Health Badge */}
                <div className="w-full flex items-center justify-between gap-1 mb-1">
                  <span
                    className={`text-[11px] font-black tracking-wider uppercase ${
                      isSelected ? 'text-[#FF6B4A]' : 'text-[#838F8B] group-hover:text-[#5E6B67]'
                    }`}
                  >
                    DAY {day.dayNumber}
                  </span>

                  {health && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md border ${healthColor}`}
                      title={`Planning Health: ${health.score}% (${health.status})`}
                    >
                      {health.score}%
                    </span>
                  )}
                </div>

                {/* Day Theme Title */}
                <div className="w-full">
                  <p
                    className={`text-xs sm:text-sm font-bold truncate max-w-full ${
                      isSelected ? 'text-[#17201D]' : 'text-[#5E6B67]'
                    }`}
                  >
                    {day.title || `Day ${day.dayNumber}`}
                  </p>
                </div>

                {/* Bottom Row: Activity Count & Date */}
                <div className="w-full flex items-center justify-between text-[10px] text-[#838F8B] mt-1.5 pt-1.5 border-t border-[#F4F1EA]">
                  <span>{day.activities?.length || 0} stops</span>
                  <span className="truncate max-w-[80px]">
                    {day.dateDisplay ? day.dateDisplay.split(',')[1] || day.dateDisplay : ''}
                  </span>
                </div>

                {/* Active Underline Pill */}
                {isSelected && (
                  <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-[#FF6B4A]" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
