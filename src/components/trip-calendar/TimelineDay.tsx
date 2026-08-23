import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronDown,
  ChevronUp,
  Clock,
  MapPin,
  Wallet,
  AlertTriangle,
  Sparkles,
  Utensils,
  Plus,
  Train,
  HeartPulse,
  Compass,
} from 'lucide-react';
import {
  ItineraryDay,
  ItineraryActivity,
  DayHealthResult,
  ItineraryConflict,
  FreeTimeSlot,
} from '../../types/itinerary';
import { TimelineActivityCard } from './TimelineActivityCard';
import { TravelTimeBlock } from './TravelTimeBlock';
import { FreeTimeBlock } from './FreeTimeBlock';
import { formatCurrency } from '../../utils/currency';
import { formatTravelTime, estimateTravelTimeMinutes } from '../../utils/travelTimeEstimator';
import {
  timeStringToMinutes,
  detectDayConflicts,
} from '../../utils/itineraryConflictDetector';
import {
  calculateDayFreeTimeSlots,
  detectMissingMeals,
} from '../../utils/dayHealthCalculator';

interface TimelineDayProps {
  day: ItineraryDay;
  health: DayHealthResult;
  currency: string;
  tripBudget: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onEditActivity: (activity: ItineraryActivity) => void;
  onMoveActivity: (activity: ItineraryActivity) => void;
  onDeleteActivity: (activity: ItineraryActivity) => void;
  onViewOnMap: (activity: ItineraryActivity) => void;
  onAddActivity: (dayNumber: number, suggestedStartTime?: string) => void;
  onFindFood: (dayNumber: number, mealType: 'breakfast' | 'lunch' | 'dinner') => void;
  onOptimizeDay?: (dayNumber: number) => void;
  onDragStart?: (e: React.DragEvent, activityId: string, dayNumber: number) => void;
  onDropOnDay?: (e: React.DragEvent, targetDayNumber: number) => void;
  onDragOverDay?: (e: React.DragEvent) => void;
  filterCategory?: string;
  searchQuery?: string;
}

export const TimelineDay: React.FC<TimelineDayProps> = ({
  day,
  health,
  currency,
  tripBudget,
  isExpanded,
  onToggleExpand,
  onEditActivity,
  onMoveActivity,
  onDeleteActivity,
  onViewOnMap,
  onAddActivity,
  onFindFood,
  onOptimizeDay,
  onDragStart,
  onDropOnDay,
  onDragOverDay,
  filterCategory = 'all',
  searchQuery = '',
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  // Filter activities
  const scheduledActivities = useMemo(() => {
    const list = (day.activities || []).filter((a) => a.status !== 'Unscheduled');
    return list.sort(
      (a, b) => timeStringToMinutes(a.startTime || '00:00') - timeStringToMinutes(b.startTime || '00:00')
    );
  }, [day.activities]);

  const conflicts = useMemo(() => detectDayConflicts(day), [day]);
  const freeSlots = useMemo(() => calculateDayFreeTimeSlots(day), [day]);
  const mealStatus = useMemo(() => detectMissingMeals(day), [day]);

  // High spending calculation (>20% of trip budget)
  const isHighSpending = tripBudget > 0 && health.totalCost > tripBudget * 0.2;
  const costPercentageOfTrip = tripBudget > 0 ? Math.round((health.totalCost / tripBudget) * 100) : 0;

  // Day health badge styling
  const getHealthBadge = (status: string, score: number) => {
    if (conflicts.some((conflict) => conflict.severity === 'error')) {
      return {
        bg: 'bg-[#FFEAE5]',
        text: 'text-[#D9534F]',
        border: 'border-[#FF6B4A]/30',
      };
    }
    if (conflicts.length > 0) {
      return {
        bg: 'bg-[#FFF3D6]',
        text: 'text-[#D97706]',
        border: 'border-[#FDE68A]',
      };
    }

    switch (status) {
      case 'Excellent':
        return {
          bg: 'bg-[#E8F8F5]',
          text: 'text-[#20B8A6]',
          border: 'border-[#20B8A6]/30',
        };
      case 'Busy':
        return {
          bg: 'bg-[#EBF5FB]',
          text: 'text-[#2E86DE]',
          border: 'border-[#BDC3C7]',
        };
      case 'Overloaded':
        return {
          bg: 'bg-[#EBF5FB]',
          text: 'text-[#2E86DE]',
          border: 'border-[#BDC3C7]',
        };
      case 'Balanced':
      default:
        return {
          bg: 'bg-[#EBF5FB]',
          text: 'text-[#2E86DE]',
          border: 'border-[#BDC3C7]',
        };
    }
  };

  const healthBadge = getHealthBadge(health.status, health.score);

  // Drag & Drop event handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (onDropOnDay) {
      onDropOnDay(e, day.dayNumber);
    }
  };

  return (
    <div
      id={`timeline-day-${day.dayNumber}`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={(e) => {
        e.preventDefault();
        if (onDragOverDay) onDragOverDay(e);
      }}
      onDrop={handleDrop}
      className={`rounded-3xl border transition-all duration-200 overflow-hidden mb-6 ${
        isDragOver
          ? 'bg-[#E8F8F5]/40 border-2 border-dashed border-[#20B8A6] shadow-lg'
          : 'bg-[#FFFDF8] border-[#EAE6DD] shadow-2xs hover:border-[#D2CBC1]'
      }`}
    >
      {/* Day Header Card (Click to expand/collapse) */}
      <div
        onClick={onToggleExpand}
        className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-[#FAF7EE] transition-colors border-b border-[#EAE6DD]/80 select-none"
      >
        {/* Left: Day Number, Date, Theme */}
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#17201D] text-white flex flex-col items-center justify-center font-black shrink-0 shadow-xs">
            <span className="text-[10px] uppercase tracking-wider text-[#A1B0AB] leading-none">Day</span>
            <span className="text-lg leading-none mt-0.5">{day.dayNumber}</span>
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-black text-[#17201D] tracking-tight">
                {day.dateDisplay || `Day ${day.dayNumber}`}
              </h3>
              {day.theme && (
                <span className="text-xs font-semibold text-[#556960] px-2.5 py-0.5 rounded-full bg-[#F0ECE1] border border-[#EAE6DD]">
                  {day.theme}
                </span>
              )}
            </div>

            {/* Quick Metrics Line */}
            <div className="flex items-center gap-3 sm:gap-4 text-xs text-[#556960] mt-1 flex-wrap font-medium">
              <span className="inline-flex items-center gap-1 font-semibold text-[#17201D]">
                <Clock className="w-3.5 h-3.5 text-[#FF6B4A]" />
                {scheduledActivities.length} {scheduledActivities.length === 1 ? 'activity' : 'activities'}
              </span>

              {health.totalTravelMinutes > 0 && (
                <span className="inline-flex items-center gap-1">
                  <Train className="w-3.5 h-3.5 text-[#838F8B]" />
                  {formatTravelTime(health.totalTravelMinutes)} travel
                </span>
              )}

              <span className="inline-flex items-center gap-1 font-semibold text-[#17201D]">
                <Wallet className="w-3.5 h-3.5 text-[#20B8A6]" />
                {formatCurrency(health.totalCost, currency)}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Health Score & Expand Indicator */}
        <div className="flex items-center gap-3 self-end md:self-center">
          {/* Day Health Badge */}
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border ${healthBadge.bg} ${healthBadge.text} ${healthBadge.border}`}
            title={`Day Planning Health: ${health.score}% (${health.status})`}
          >
            <HeartPulse className="w-3.5 h-3.5" />
            <span>{health.score}%</span>
            <span className="font-bold hidden sm:inline">· {health.status}</span>
          </div>

          <button
            type="button"
            className="p-1.5 rounded-full text-[#838F8B] hover:text-[#17201D] hover:bg-[#EAE6DD] transition-colors"
            title={isExpanded ? 'Collapse Day' : 'Expand Day'}
          >
            {isExpanded ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Expanded Content Area */}
      {isExpanded && (
        <div className="p-4 sm:p-6 space-y-4 bg-[#FFFEFC]">
          {/* 1. Contextual Day Warnings / Alerts */}

          {/* Overloaded Warning (Section 30) */}
          {(health.status === 'Busy' || health.status === 'Overloaded') && (
            <div className="p-3.5 rounded-2xl bg-[#FFEAE5] border border-[#FF6B4A]/30 flex items-center justify-between gap-3 text-xs text-[#D9534F]">
              <div className="flex items-center gap-2 font-semibold">
                <AlertTriangle className="w-4 h-4 text-[#FF6B4A] shrink-0" />
                <span>
                  <strong>Day {day.dayNumber} is {health.status.toLowerCase()}</strong> — {scheduledActivities.length} activities and {formatTravelTime(health.totalTravelMinutes)} of travel.
                </span>
              </div>

              {onOptimizeDay && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOptimizeDay(day.dayNumber);
                  }}
                  className="px-3 py-1 rounded-xl bg-white border border-[#FF6B4A]/40 text-[#FF6B4A] hover:bg-[#FF6B4A] hover:text-white font-extrabold transition-all shadow-2xs cursor-pointer shrink-0"
                >
                  Optimize Day
                </button>
              )}
            </div>
          )}

          {/* Underutilized Day Notice (Section 31) */}
          {scheduledActivities.length <= 1 && (
            <div className="p-3.5 rounded-2xl bg-[#E8F8F5] border border-[#20B8A6]/30 flex items-center justify-between gap-3 text-xs text-[#1E7E6E]">
              <div className="flex items-center gap-2 font-semibold">
                <Sparkles className="w-4 h-4 text-[#20B8A6] shrink-0" />
                <span>
                  <strong>Day {day.dayNumber} has plenty of free time</strong> — Consider adding an experience or relaxing cafe stop.
                </span>
              </div>

              <button
                type="button"
                onClick={() => onAddActivity(day.dayNumber)}
                className="px-3 py-1 rounded-xl bg-white border border-[#20B8A6]/40 text-[#20B8A6] hover:bg-[#20B8A6] hover:text-white font-extrabold transition-all shadow-2xs cursor-pointer shrink-0"
              >
                Add Activities
              </button>
            </div>
          )}

          {/* High Spending Alert (Section 33) */}
          {isHighSpending && (
            <div className="p-3 rounded-xl bg-[#FFF3D6] border border-[#FFE58F] flex items-center gap-2 text-xs text-[#B7791F]">
              <Wallet className="w-4 h-4 text-[#D97706] shrink-0" />
              <span>
                <strong>High spending day:</strong> Day {day.dayNumber} accounts for {costPercentageOfTrip}% of your entire trip budget.
              </span>
            </div>
          )}

          {/* Meal Reminders (Section 32) */}
          {(mealStatus.missingBreakfast || mealStatus.missingLunch || mealStatus.missingDinner) && (
            <div className="flex items-center gap-2 flex-wrap text-xs pt-1">
              <span className="text-[#838F8B] font-bold">Meal suggestions:</span>

              {mealStatus.missingBreakfast && (
                <button
                  type="button"
                  onClick={() => onFindFood(day.dayNumber, 'breakfast')}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FAF7EE] border border-[#EAE6DD] text-[#556960] hover:text-[#17201D] hover:border-[#17201D] font-medium transition-colors cursor-pointer"
                >
                  <Utensils className="w-3 h-3 text-[#D97706]" />
                  <span>🍳 Breakfast not planned</span>
                  <span className="text-[10px] text-[#FF6B4A] font-bold underline ml-0.5">Find Food</span>
                </button>
              )}

              {mealStatus.missingLunch && (
                <button
                  type="button"
                  onClick={() => onFindFood(day.dayNumber, 'lunch')}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FAF7EE] border border-[#EAE6DD] text-[#556960] hover:text-[#17201D] hover:border-[#17201D] font-medium transition-colors cursor-pointer"
                >
                  <Utensils className="w-3 h-3 text-[#D97706]" />
                  <span>🍜 Lunch not planned</span>
                  <span className="text-[10px] text-[#FF6B4A] font-bold underline ml-0.5">Find Food</span>
                </button>
              )}

              {mealStatus.missingDinner && (
                <button
                  type="button"
                  onClick={() => onFindFood(day.dayNumber, 'dinner')}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FAF7EE] border border-[#EAE6DD] text-[#556960] hover:text-[#17201D] hover:border-[#17201D] font-medium transition-colors cursor-pointer"
                >
                  <Utensils className="w-3 h-3 text-[#D97706]" />
                  <span>🍽 Dinner not planned</span>
                  <span className="text-[10px] text-[#FF6B4A] font-bold underline ml-0.5">Find Food</span>
                </button>
              )}
            </div>
          )}

          {/* 2. Chronological Timeline List with Activities, Travel Blocks, and Free Time Blocks */}
          <div className="pt-2">
            {scheduledActivities.length === 0 ? (
              <div className="text-center py-8 px-4 rounded-2xl bg-[#F9F7F1] border border-dashed border-[#EAE6DD]">
                <Clock className="w-8 h-8 text-[#838F8B] mx-auto mb-2 opacity-50" />
                <p className="text-sm font-bold text-[#17201D]">No activities scheduled for Day {day.dayNumber}</p>
                <p className="text-xs text-[#556960] mt-1 mb-3">Add sights, restaurants, or experiences to craft this day's journey.</p>
                <button
                  type="button"
                  onClick={() => onAddActivity(day.dayNumber)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#17201D] text-white text-xs font-bold hover:bg-[#2A3833] transition-colors cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5 text-[#FF6B4A]" />
                  <span>Add First Activity</span>
                </button>
              </div>
            ) : (
              <div className="space-y-0.5">
                {scheduledActivities.map((activity, index) => {
                  const conflict = conflicts.find((c) => c.activityIds.includes(activity.id));
                  const nextActivity = scheduledActivities[index + 1];

                  // Travel calculation between current and next
                  let travelMinutes = 0;
                  if (nextActivity) {
                    travelMinutes = estimateTravelTimeMinutes(
                      activity.location,
                      nextActivity.location,
                      { lat: activity.latitude, lng: activity.longitude },
                      { lat: nextActivity.latitude, lng: nextActivity.longitude }
                    );
                  }

                  // Free time block calculation between current and next
                  const matchingFreeSlot = freeSlots.find(
                    (s) => s.previousActivityTitle === activity.title
                  );

                  return (
                    <React.Fragment key={activity.id}>
                      {/* Activity Card */}
                      <TimelineActivityCard
                        activity={activity}
                        dayNumber={day.dayNumber}
                        currency={currency}
                        conflict={conflict}
                        onEdit={onEditActivity}
                        onMove={onMoveActivity}
                        onDelete={onDeleteActivity}
                        onViewOnMap={onViewOnMap}
                        onDragStart={onDragStart}
                      />

                      {/* Travel Transit Connector between consecutive locations */}
                      {nextActivity && travelMinutes > 0 && (
                        <TravelTimeBlock
                          durationMinutes={travelMinutes}
                          fromLocation={activity.location}
                          toLocation={nextActivity.location}
                        />
                      )}

                      {/* Free time gap block if present */}
                      {matchingFreeSlot && (
                        <FreeTimeBlock
                          startTime={matchingFreeSlot.startTime}
                          endTime={matchingFreeSlot.endTime}
                          durationDisplay={matchingFreeSlot.durationDisplay}
                          dayNumber={day.dayNumber}
                          onAddActivity={onAddActivity}
                        />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            )}
          </div>

          {/* Bottom Add Activity Action */}
          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={() => onAddActivity(day.dayNumber)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-[#EAE6DD] text-[#17201D] hover:border-[#17201D] hover:bg-[#F9F7F1] text-xs font-bold transition-all shadow-2xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-[#FF6B4A]" />
              <span>+ Add Activity to Day {day.dayNumber}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
