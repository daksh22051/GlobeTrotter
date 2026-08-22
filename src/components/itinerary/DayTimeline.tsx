import React, { useState } from 'react';
import {
  Plus,
  Compass,
  Sparkles,
  Utensils,
  Navigation,
  Clock,
  Wallet,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Layers,
} from 'lucide-react';
import {
  ItineraryDay,
  ItineraryActivity,
  ItineraryConflict,
  DayHealthResult,
} from '../../types/itinerary';
import { ActivityCard } from './ActivityCard';
import { estimateTravelTimeMinutes, formatTravelTime } from '../../utils/travelTimeEstimator';
import { calculateDayFreeTimeSlots, detectMissingMeals } from '../../utils/dayHealthCalculator';
import { getActivityConflict } from '../../utils/itineraryConflictDetector';

interface DayTimelineProps {
  day: ItineraryDay;
  conflicts: ItineraryConflict[];
  dayHealth: DayHealthResult;
  currency: string;
  onAddActivityClick: () => void;
  onFindFoodClick: () => void;
  onEditActivity: (activity: ItineraryActivity) => void;
  onDuplicateActivity: (activityId: string) => void;
  onRemoveActivity: (activityId: string) => void;
  onMoveToDay: (activity: ItineraryActivity) => void;
  onReorder: (dayNumber: number, sourceIndex: number, destinationIndex: number) => void;
  onMoveActivityAcrossDays: (activityId: string, targetDayNumber: number, insertIndex?: number) => void;
}

export const DayTimeline: React.FC<DayTimelineProps> = ({
  day,
  conflicts,
  dayHealth,
  currency,
  onAddActivityClick,
  onFindFoodClick,
  onEditActivity,
  onDuplicateActivity,
  onRemoveActivity,
  onMoveToDay,
  onReorder,
  onMoveActivityAcrossDays,
}) => {
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [activeDragSourceDay, setActiveDragSourceDay] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const activities = day.activities || [];
  const freeTimeSlots = calculateDayFreeTimeSlots(day);
  const mealAlerts = detectMissingMeals(day);

  // Drag handlers
  const handleDragStart = (e: React.DragEvent, activityId: string, sourceDay: number) => {
    setActiveDragId(activityId);
    setActiveDragSourceDay(sourceDay);
  };

  const handleDragEnd = () => {
    setActiveDragId(null);
    setActiveDragSourceDay(null);
    setDragOverIndex(null);
  };

  const handleDropZone = (targetIndex: number) => {
    if (!activeDragId) return;

    if (activeDragSourceDay === day.dayNumber) {
      // Reordering within same day
      const sourceIndex = activities.findIndex((a) => a.id === activeDragId);
      if (sourceIndex !== -1 && sourceIndex !== targetIndex) {
        onReorder(day.dayNumber, sourceIndex, targetIndex);
      }
    } else {
      // Moving from another day or unscheduled
      onMoveActivityAcrossDays(activeDragId, day.dayNumber, targetIndex);
    }

    handleDragEnd();
  };

  return (
    <div className="w-full space-y-6">
      {/* Day Title & Pacing Banner */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#EAE6DD] shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-[#FF6B4A] text-white text-[11px] font-black uppercase tracking-wider">
                DAY {day.dayNumber}
              </span>
              <span className="text-xs font-semibold text-[#838F8B]">
                {day.dateDisplay}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-[#17201D] mt-1.5">
              {day.title || `Day ${day.dayNumber} Itinerary`}
            </h2>
          </div>

          {/* Health Score Pill */}
          <div className="flex items-center gap-3">
            <div className="flex flex-col sm:items-end">
              <span className="text-[10px] uppercase tracking-wider font-bold text-[#838F8B]">
                Day Health
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-sm sm:text-base font-black text-[#17201D]">
                  {dayHealth.score}%
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    dayHealth.status === 'Excellent'
                      ? 'bg-[#EAF8F5] text-[#179E8E]'
                      : dayHealth.status === 'Balanced'
                      ? 'bg-[#EAF8F5] text-[#20B8A6]'
                      : dayHealth.status === 'Busy'
                      ? 'bg-[#FFF8E7] text-[#B45309]'
                      : 'bg-[#FFF0EC] text-[#E55837]'
                  }`}
                >
                  {dayHealth.status}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Vertical Timeline */}
      <div className="relative pl-3 sm:pl-6">
        {/* Timeline Line */}
        <div className="absolute top-4 bottom-4 left-5 sm:left-8 w-0.5 bg-gradient-to-b from-[#FF6B4A]/40 via-[#20B8A6]/30 to-[#EAE6DD]" />

        {/* Empty State if No Activities */}
        {activities.length === 0 ? (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = 'move';
              setDragOverIndex(0);
            }}
            onDragLeave={() => setDragOverIndex(null)}
            onDrop={() => handleDropZone(0)}
            className={`relative ml-6 sm:ml-8 p-8 sm:p-12 rounded-3xl border-2 border-dashed text-center transition-all ${
              dragOverIndex === 0
                ? 'border-[#FF6B4A] bg-[#FFF2EE]/50 ring-4 ring-[#FF6B4A]/10'
                : 'border-[#EAE6DD] bg-white/70'
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-[#FFF2EE] text-[#FF6B4A] flex items-center justify-center mx-auto mb-3">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#17201D]">
              No activities scheduled for Day {day.dayNumber}
            </h3>
            <p className="text-xs sm:text-sm text-[#68736F] max-w-sm mx-auto mt-1 mb-5">
              Drag unscheduled places from the drawer or click below to pick recommended stops.
            </p>
            <button
              type="button"
              onClick={onAddActivityClick}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#FF6B4A] hover:bg-[#E55837] text-white text-xs sm:text-sm font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add First Activity</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity, idx) => {
              const conflict = getActivityConflict(activity.id, conflicts);
              const nextActivity = activities[idx + 1];

              // Transit calculation to next activity
              const travelTimeMins = nextActivity
                ? estimateTravelTimeMinutes(
                    activity.location,
                    nextActivity.location,
                    { lat: activity.latitude, lng: activity.longitude },
                    { lat: nextActivity.latitude, lng: nextActivity.longitude }
                  )
                : 0;

              return (
                <div key={activity.id} className="relative">
                  {/* Top Drop Marker if dragging */}
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = 'move';
                      setDragOverIndex(idx);
                    }}
                    onDragLeave={() => setDragOverIndex(null)}
                    onDrop={() => handleDropZone(idx)}
                    className={`h-3 -my-1.5 transition-all rounded-full ${
                      dragOverIndex === idx ? 'bg-[#FF6B4A] scale-y-150 my-1' : 'opacity-0'
                    }`}
                  />

                  {/* Activity Item Container */}
                  <div className="relative flex items-start gap-3 sm:gap-4">
                    {/* Timeline Node Point */}
                    <div className="relative z-10 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white border-2 border-[#FF6B4A] shadow-xs flex items-center justify-center shrink-0 mt-4.5">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#FF6B4A]" />
                    </div>

                    {/* The Activity Card */}
                    <div className="flex-1">
                      <ActivityCard
                        activity={activity}
                        index={idx}
                        dayNumber={day.dayNumber}
                        conflict={conflict}
                        onEdit={onEditActivity}
                        onDuplicate={onDuplicateActivity}
                        onRemove={onRemoveActivity}
                        onMoveToDay={onMoveToDay}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                      />
                    </div>
                  </div>

                  {/* Travel Time Connector & Interstitial Gaps */}
                  {nextActivity && (
                    <div className="ml-8 sm:ml-10 my-2.5 pl-6 py-1">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F4F1EA]/90 border border-[#EAE6DD] text-[11px] font-semibold text-[#5E6B67]">
                        <Navigation className="w-3 h-3 text-[#20B8A6]" />
                        <span>
                          Estimated travel: <strong className="text-[#17201D]">{formatTravelTime(travelTimeMins)}</strong>
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Bottom Drop Zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                setDragOverIndex(activities.length);
              }}
              onDragLeave={() => setDragOverIndex(null)}
              onDrop={() => handleDropZone(activities.length)}
              className={`h-4 transition-all rounded-full ${
                dragOverIndex === activities.length ? 'bg-[#FF6B4A] scale-y-150 my-1' : 'opacity-0'
              }`}
            />
          </div>
        )}

        {/* Free Time Discovery Highlight */}
        {freeTimeSlots.length > 0 && activities.length > 0 && (
          <div className="ml-8 sm:ml-10 my-4 p-4 rounded-2xl bg-gradient-to-r from-[#FFFDF8] to-[#FFF9EE] border border-[#FFDE99]/60 shadow-2xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#FFF2D6] text-[#D97706] flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#17201D]">
                  ✨ {freeTimeSlots[0].durationDisplay} free window
                </p>
                <p className="text-[11px] text-[#785412]">
                  Perfect for spontaneous local street walks, boutique shopping, or coffee.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Meal Suggestions Banner if meal is missing */}
        {(mealAlerts.missingLunch || mealAlerts.missingDinner) && (
          <div className="ml-8 sm:ml-10 my-4 p-4 rounded-2xl bg-[#FFF5F2] border border-[#FF6B4A]/20 shadow-2xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#FFE4DC] text-[#FF6B4A] flex items-center justify-center shrink-0">
                <Utensils className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#17201D]">
                  🍜 No {mealAlerts.missingLunch ? 'lunch' : 'dinner'} planned yet
                </p>
                <p className="text-[11px] text-[#A83D24]">
                  Discover top-rated local cafes and signature dining spots nearby.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onFindFoodClick}
              className="px-3.5 py-1.5 rounded-full bg-white hover:bg-[#FFF0EC] text-[#FF6B4A] border border-[#FF6B4A]/30 text-xs font-bold transition-colors shrink-0 cursor-pointer"
            >
              Find food nearby
            </button>
          </div>
        )}

        {/* Add Activity Button */}
        <div className="ml-8 sm:ml-10 pt-2">
          <button
            type="button"
            onClick={onAddActivityClick}
            className="w-full flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-white hover:bg-[#F9F7F1] border-2 border-dashed border-[#EAE6DD] hover:border-[#FF6B4A]/40 text-[#5E6B67] hover:text-[#17201D] text-xs sm:text-sm font-bold transition-colors cursor-pointer shadow-2xs group"
          >
            <Plus className="w-4 h-4 text-[#FF6B4A] group-hover:scale-110 transition-transform" />
            <span>+ Add Activity to Day {day.dayNumber}</span>
          </button>
        </div>
      </div>

      {/* Daily Summary Footer */}
      <div className="bg-[#F9F7F1] rounded-3xl p-5 border border-[#EAE6DD]">
        <h4 className="text-xs font-black uppercase tracking-wider text-[#838F8B] mb-3">
          Day {day.dayNumber} Summary
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
          <div className="bg-white p-3 rounded-2xl border border-[#EAE6DD]/70 shadow-2xs">
            <span className="text-[10px] font-bold text-[#838F8B]">Activities</span>
            <p className="text-base font-black text-[#17201D] mt-0.5">
              {dayHealth.totalActivities} stops
            </p>
          </div>

          <div className="bg-white p-3 rounded-2xl border border-[#EAE6DD]/70 shadow-2xs">
            <span className="text-[10px] font-bold text-[#838F8B]">Estimated Cost</span>
            <p className="text-base font-black text-[#20B8A6] mt-0.5">
              {currency}{dayHealth.totalCost.toLocaleString()}
            </p>
          </div>

          <div className="bg-white p-3 rounded-2xl border border-[#EAE6DD]/70 shadow-2xs">
            <span className="text-[10px] font-bold text-[#838F8B]">Travel Time</span>
            <p className="text-base font-black text-[#17201D] mt-0.5">
              {formatTravelTime(dayHealth.totalTravelMinutes)}
            </p>
          </div>

          <div className="bg-white p-3 rounded-2xl border border-[#EAE6DD]/70 shadow-2xs">
            <span className="text-[10px] font-bold text-[#838F8B]">Free Time</span>
            <p className="text-base font-black text-[#FFB020] mt-0.5">
              {formatTravelTime(dayHealth.freeTimeMinutes)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
