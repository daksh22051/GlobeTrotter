import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Wallet,
  Plus,
  Compass,
  Utensils,
  Hotel,
  Landmark,
  AlertTriangle,
  GripVertical,
} from 'lucide-react';
import { ItineraryDay, ItineraryActivity, DayHealthResult } from '../../types/itinerary';
import { formatTimeDisplay, calculateEndTime } from '../../utils/itineraryConflictDetector';

interface CalendarViewProps {
  days: ItineraryDay[];
  dayHealths: Record<number, DayHealthResult>;
  currency: string;
  onSelectDay: (dayNumber: number) => void;
  onEditActivity: (activity: ItineraryActivity) => void;
  onAddActivity: (dayNumber: number) => void;
  onMoveActivity: (activityId: string, targetDayNumber: number) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  days,
  dayHealths,
  currency,
  onSelectDay,
  onEditActivity,
  onAddActivity,
  onMoveActivity,
}) => {
  const [dragOverDay, setDragOverDay] = useState<number | null>(null);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'food':
        return <Utensils className="w-3 h-3 text-[#FF6B4A]" />;
      case 'hotel':
        return <Hotel className="w-3 h-3 text-[#20B8A6]" />;
      case 'experience':
        return <Compass className="w-3 h-3 text-[#F59E0B]" />;
      default:
        return <Landmark className="w-3 h-3 text-[#3B82F6]" />;
    }
  };

  return (
    <div className="w-full overflow-x-auto pb-6">
      <div className="flex items-start gap-4 min-w-[700px]">
        {days.map((day) => {
          const health = dayHealths[day.dayNumber];
          const isTarget = dragOverDay === day.dayNumber;

          return (
            <div
              key={day.id}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                setDragOverDay(day.dayNumber);
              }}
              onDragLeave={() => setDragOverDay(null)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOverDay(null);
                const activityId =
                  e.dataTransfer.getData('text/plain') ||
                  e.dataTransfer.getData('application/json');
                if (activityId) {
                  onMoveActivity(activityId, day.dayNumber);
                }
              }}
              className={`flex-1 min-w-[240px] max-w-[320px] bg-white rounded-3xl p-4 border transition-all flex flex-col ${
                isTarget
                  ? 'border-[#FF6B4A] bg-[#FFF2EE]/40 ring-2 ring-[#FF6B4A]/20 scale-[1.01]'
                  : 'border-[#EAE6DD] shadow-2xs'
              }`}
            >
              {/* Column Header */}
              <div className="pb-3 border-b border-[#F4F1EA] mb-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase text-[#FF6B4A] tracking-wider">
                    DAY {day.dayNumber}
                  </span>
                  {health && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        health.status === 'Excellent'
                          ? 'bg-[#EAF8F5] text-[#179E8E]'
                          : health.status === 'Balanced'
                          ? 'bg-[#EAF8F5] text-[#20B8A6]'
                          : health.status === 'Busy'
                          ? 'bg-[#FFF8E7] text-[#B45309]'
                          : 'bg-[#FFF0EC] text-[#E55837]'
                      }`}
                    >
                      {health.score}%
                    </span>
                  )}
                </div>

                <h3
                  onClick={() => onSelectDay(day.dayNumber)}
                  className="text-sm font-extrabold text-[#17201D] truncate cursor-pointer hover:text-[#FF6B4A] transition-colors mt-0.5"
                >
                  {day.title || `Day ${day.dayNumber}`}
                </h3>
                <p className="text-[10px] text-[#838F8B]">{day.dateDisplay}</p>
              </div>

              {/* Activities Stream */}
              <div className="flex-1 space-y-2.5 min-h-[220px]">
                {day.activities.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center p-6 border border-dashed border-[#EAE6DD] rounded-2xl text-center">
                    <p className="text-xs text-[#838F8B]">No activities</p>
                    <button
                      type="button"
                      onClick={() => onAddActivity(day.dayNumber)}
                      className="mt-2 text-[11px] font-bold text-[#FF6B4A] hover:underline"
                    >
                      + Add Activity
                    </button>
                  </div>
                ) : (
                  day.activities.map((act) => (
                    <div
                      key={act.id}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('text/plain', act.id);
                        e.dataTransfer.setData(
                          'application/json',
                          JSON.stringify({ activityId: act.id, sourceDay: day.dayNumber })
                        );
                        e.dataTransfer.effectAllowed = 'move';
                      }}
                      onClick={() => onEditActivity(act)}
                      className="group p-3 rounded-2xl bg-[#FFFDF8] hover:bg-white border border-[#EAE6DD] hover:border-[#FF6B4A]/40 shadow-2xs cursor-pointer transition-all"
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[10px] font-black text-[#FF6B4A] flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          {act.startTime ? formatTimeDisplay(act.startTime) : 'Flexible'}
                        </span>
                        {getCategoryIcon(act.category)}
                      </div>

                      <h4 className="text-xs font-bold text-[#17201D] line-clamp-1 group-hover:text-[#FF6B4A] transition-colors">
                        {act.title}
                      </h4>

                      <div className="flex items-center justify-between text-[10px] text-[#838F8B] mt-1.5 pt-1.5 border-t border-[#F4F1EA]">
                        <span className="truncate max-w-[100px]">{act.location}</span>
                        <span className="font-semibold text-[#17201D]">
                          {act.estimatedCost > 0
                            ? `${currency}${act.estimatedCost.toLocaleString()}`
                            : 'Free'}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Add Activity Button at bottom */}
              <button
                type="button"
                onClick={() => onAddActivity(day.dayNumber)}
                className="w-full mt-3 py-2 rounded-xl bg-[#F9F7F1] hover:bg-[#F4F1EA] text-[#5E6B67] hover:text-[#17201D] text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Stop</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
