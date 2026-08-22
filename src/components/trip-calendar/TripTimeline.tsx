import React, { useState } from 'react';
import {
  ChevronsUpDown,
  Plus,
  Clock,
  Compass,
  AlertTriangle,
  Sparkles,
  Inbox,
  Filter,
} from 'lucide-react';
import {
  Itinerary,
  ItineraryDay,
  ItineraryActivity,
  DayHealthResult,
} from '../../types/itinerary';
import { TimelineDay } from './TimelineDay';
import { TimelineActivityCard } from './TimelineActivityCard';
import { TimelineFilterCategory } from './TimelineFilters';

interface TripTimelineProps {
  itinerary: Itinerary;
  dayHealths: Record<number, DayHealthResult>;
  currency: string;
  tripBudget: number;
  selectedDayNumber: number;
  onSelectDay: (dayNumber: number) => void;
  onEditActivity: (activity: ItineraryActivity) => void;
  onMoveActivity: (activity: ItineraryActivity) => void;
  onDeleteActivity: (activity: ItineraryActivity) => void;
  onViewOnMap: (activity: ItineraryActivity) => void;
  onAddActivity: (dayNumber: number, suggestedStartTime?: string) => void;
  onFindFood: (dayNumber: number, mealType: 'breakfast' | 'lunch' | 'dinner') => void;
  onOptimizeDay?: (dayNumber: number) => void;
  onReorderOrMove: (activityId: string, targetDayNumber: number) => void;
  filterCategory: TimelineFilterCategory;
  searchQuery: string;
}

export const TripTimeline: React.FC<TripTimelineProps> = ({
  itinerary,
  dayHealths,
  currency,
  tripBudget,
  selectedDayNumber,
  onSelectDay,
  onEditActivity,
  onMoveActivity,
  onDeleteActivity,
  onViewOnMap,
  onAddActivity,
  onFindFood,
  onOptimizeDay,
  onReorderOrMove,
  filterCategory,
  searchQuery,
}) => {
  const days = itinerary.days || [];
  
  // Track expanded state for days
  const [expandedDays, setExpandedDays] = useState<Record<number, boolean>>(() => {
    const map: Record<number, boolean> = {};
    days.forEach((d) => {
      map[d.dayNumber] = true; // all expanded by default
    });
    return map;
  });

  // Drag state
  const [draggedActivityInfo, setDraggedActivityInfo] = useState<{
    activityId: string;
    sourceDayNumber: number;
  } | null>(null);

  const toggleDayExpand = (dayNumber: number) => {
    setExpandedDays((prev) => ({
      ...prev,
      [dayNumber]: !prev[dayNumber],
    }));
    onSelectDay(dayNumber);
  };

  const expandAll = () => {
    const map: Record<number, boolean> = {};
    days.forEach((d) => {
      map[d.dayNumber] = true;
    });
    setExpandedDays(map);
  };

  const collapseAll = () => {
    const map: Record<number, boolean> = {};
    days.forEach((d) => {
      map[d.dayNumber] = false;
    });
    setExpandedDays(map);
  };

  // Drag Handlers
  const handleDragStart = (
    e: React.DragEvent,
    activityId: string,
    dayNumber: number
  ) => {
    e.dataTransfer.setData('text/plain', activityId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedActivityInfo({ activityId, sourceDayNumber: dayNumber });
  };

  const handleDropOnDay = (e: React.DragEvent, targetDayNumber: number) => {
    const activityId = e.dataTransfer.getData('text/plain') || draggedActivityInfo?.activityId;
    if (activityId) {
      onReorderOrMove(activityId, targetDayNumber);
    }
    setDraggedActivityInfo(null);
  };

  // Filter helper
  const filterDayActivities = (day: ItineraryDay): boolean => {
    if (!searchQuery.trim() && filterCategory === 'all') return true;

    const query = searchQuery.toLowerCase().trim();
    const dayActs = (day.activities || []).filter((a) => a.status !== 'Unscheduled');

    if (query) {
      const matchSearch = dayActs.some(
        (a) =>
          a.title.toLowerCase().includes(query) ||
          a.location.toLowerCase().includes(query) ||
          (a.notes && a.notes.toLowerCase().includes(query)) ||
          a.category.toLowerCase().includes(query)
      );
      if (!matchSearch && !day.title.toLowerCase().includes(query)) return false;
    }

    if (filterCategory !== 'all') {
      if (filterCategory === 'conflicts') {
        const health = dayHealths[day.dayNumber];
        return health && health.conflictCount > 0;
      }
      if (filterCategory === 'free_time') {
        const health = dayHealths[day.dayNumber];
        return health && health.freeTimeMinutes >= 45;
      }
      if (filterCategory === 'travel') {
        const health = dayHealths[day.dayNumber];
        return health && health.totalTravelMinutes > 0;
      }
      return dayActs.some((a) => a.category === filterCategory);
    }

    return true;
  };

  const filteredDays = days.filter(filterDayActivities);

  return (
    <div className="space-y-6">
      {/* Controls Bar: Expand/Collapse All */}
      <div className="flex items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-extrabold text-[#17201D]">
            Daily Schedule Timeline
          </h2>
          <span className="text-xs text-[#556960] font-medium">
            ({filteredDays.length} {filteredDays.length === 1 ? 'day shown' : 'days shown'})
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={expandAll}
            className="text-xs font-bold text-[#556960] hover:text-[#17201D] px-2.5 py-1 rounded-lg hover:bg-[#F4F1EA] transition-colors cursor-pointer"
          >
            Expand All
          </button>
          <span className="text-[#D2CBC1]">·</span>
          <button
            type="button"
            onClick={collapseAll}
            className="text-xs font-bold text-[#556960] hover:text-[#17201D] px-2.5 py-1 rounded-lg hover:bg-[#F4F1EA] transition-colors cursor-pointer"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* Render Days */}
      {filteredDays.length === 0 ? (
        <div className="text-center py-12 px-6 rounded-3xl bg-[#FFFDF8] border border-[#EAE6DD] shadow-2xs">
          <Filter className="w-8 h-8 text-[#838F8B] mx-auto mb-2 opacity-60" />
          <h3 className="text-base font-extrabold text-[#17201D]">No matching activities found</h3>
          <p className="text-xs text-[#556960] mt-1 max-w-sm mx-auto">
            Try adjusting your search query or filter category to see your schedule.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredDays.map((day) => {
            const health = dayHealths[day.dayNumber] || {
              dayNumber: day.dayNumber,
              score: 90,
              status: 'Balanced',
              totalActivities: (day.activities || []).length,
              totalCost: 0,
              totalTravelMinutes: 0,
              freeTimeMinutes: 0,
              conflictCount: 0,
              reasons: [],
            };

            return (
              <TimelineDay
                key={day.id}
                day={day}
                health={health}
                currency={currency}
                tripBudget={tripBudget}
                isExpanded={!!expandedDays[day.dayNumber]}
                onToggleExpand={() => toggleDayExpand(day.dayNumber)}
                onEditActivity={onEditActivity}
                onMoveActivity={onMoveActivity}
                onDeleteActivity={onDeleteActivity}
                onViewOnMap={onViewOnMap}
                onAddActivity={onAddActivity}
                onFindFood={onFindFood}
                onOptimizeDay={onOptimizeDay}
                onDragStart={handleDragStart}
                onDropOnDay={handleDropOnDay}
                filterCategory={filterCategory}
                searchQuery={searchQuery}
              />
            );
          })}
        </div>
      )}

      {/* Unscheduled Activities Pocket if any exist */}
      {(itinerary.unscheduledActivities || []).length > 0 && (
        <div className="rounded-3xl border border-dashed border-[#D2CBC1] bg-[#FAF7EE] p-5">
          <div className="flex items-center gap-2 mb-3">
            <Inbox className="w-4 h-4 text-[#FF6B4A]" />
            <h3 className="text-sm font-extrabold text-[#17201D]">
              Needs Scheduling ({(itinerary.unscheduledActivities || []).length})
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {(itinerary.unscheduledActivities || []).map((act) => (
              <div
                key={act.id}
                className="p-3.5 rounded-2xl bg-white border border-[#EAE6DD] flex items-center justify-between gap-3 shadow-2xs"
              >
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-extrabold text-[#17201D] truncate">
                    {act.title}
                  </h4>
                  <p className="text-[11px] text-[#556960] truncate">{act.location}</p>
                </div>

                <button
                  type="button"
                  onClick={() => onMoveActivity(act)}
                  className="px-3 py-1 rounded-xl bg-[#17201D] text-white text-xs font-bold hover:bg-[#2A3833] transition-colors cursor-pointer shrink-0"
                >
                  Schedule
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
