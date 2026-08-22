import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  AlertTriangle,
  Plus,
  Compass,
  Utensils,
  Hotel,
  Landmark,
  Sparkles,
} from 'lucide-react';
import {
  Itinerary,
  ItineraryDay,
  ItineraryActivity,
  DayHealthResult,
} from '../../types/itinerary';
import { formatTimeDisplay } from '../../utils/itineraryConflictDetector';
import { formatCurrency } from '../../utils/currency';

interface TripMonthCalendarProps {
  itinerary: Itinerary;
  dayHealths: Record<number, DayHealthResult>;
  currency: string;
  selectedDayNumber: number;
  onSelectDay: (dayNumber: number) => void;
  onAddActivity: (dayNumber: number) => void;
  onActivityClick: (activity: ItineraryActivity) => void;
  onMoveActivityDate: (activityId: string, targetDateISO: string, targetDayNumber?: number) => void;
}

export const TripMonthCalendar: React.FC<TripMonthCalendarProps> = ({
  itinerary,
  dayHealths,
  currency,
  selectedDayNumber,
  onSelectDay,
  onAddActivity,
  onActivityClick,
  onMoveActivityDate,
}) => {
  const days = itinerary.days || [];

  // Determine initial calendar month based on trip start date
  const tripStartDate = useMemo(() => {
    if (days.length > 0 && days[0].date) {
      const parsed = new Date(days[0].date);
      if (!isNaN(parsed.getTime())) return parsed;
    }
    return new Date();
  }, [days]);

  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(
    new Date(tripStartDate.getFullYear(), tripStartDate.getMonth(), 1)
  );

  // Drag state
  const [draggedActivityId, setDraggedActivityId] = useState<string | null>(null);
  const [dragOverDateISO, setDragOverDateISO] = useState<string | null>(null);

  // Month navigation
  const prevMonth = () => {
    setCurrentMonthDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
    );
  };

  const nextMonth = () => {
    setCurrentMonthDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
    );
  };

  const goToTripToday = () => {
    setCurrentMonthDate(
      new Date(tripStartDate.getFullYear(), tripStartDate.getMonth(), 1)
    );
    if (days.length > 0) {
      onSelectDay(days[0].dayNumber);
    }
  };

  // Map of itinerary days by ISO date string ("YYYY-MM-DD")
  const itineraryDaysByDate = useMemo(() => {
    const map: Record<string, ItineraryDay> = {};
    days.forEach((d) => {
      if (d.date) {
        map[d.date] = d;
      }
    });
    return map;
  }, [days]);

  // Calendar grid calculations
  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();
  const monthName = currentMonthDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const calendarMatrix = useMemo(() => {
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sun
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();

    const cells: {
      date: Date;
      dateISO: string;
      dayNumberInMonth: number;
      isCurrentMonth: boolean;
      itineraryDay?: ItineraryDay;
      isTripDay: boolean;
    }[] = [];

    // 1. Previous month trailing days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthDays - i);
      const dateISO = d.toISOString().split('T')[0];
      const itinDay = itineraryDaysByDate[dateISO];
      cells.push({
        date: d,
        dateISO,
        dayNumberInMonth: prevMonthDays - i,
        isCurrentMonth: false,
        itineraryDay: itinDay,
        isTripDay: !!itinDay,
      });
    }

    // 2. Current month days
    for (let i = 1; i <= totalDaysInMonth; i++) {
      const d = new Date(year, month, i);
      const dateISO = d.toISOString().split('T')[0];
      const itinDay = itineraryDaysByDate[dateISO];
      cells.push({
        date: d,
        dateISO,
        dayNumberInMonth: i,
        isCurrentMonth: true,
        itineraryDay: itinDay,
        isTripDay: !!itinDay,
      });
    }

    // 3. Next month leading days (to fill 35 or 42 grid cells)
    const remaining = (7 - (cells.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i);
      const dateISO = d.toISOString().split('T')[0];
      const itinDay = itineraryDaysByDate[dateISO];
      cells.push({
        date: d,
        dateISO,
        dayNumberInMonth: i,
        isCurrentMonth: false,
        itineraryDay: itinDay,
        isTripDay: !!itinDay,
      });
    }

    return cells;
  }, [year, month, itineraryDaysByDate]);

  // Trip period label
  const tripPeriodLabel = useMemo(() => {
    if (days.length === 0) return 'No dates set';
    const first = days[0].dateDisplay || days[0].date;
    const last = days[days.length - 1].dateDisplay || days[days.length - 1].date;
    return `Trip Period: ${first} → ${last} (${days.length} days)`;
  }, [days]);

  // Category Icon helper
  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'food':
        return Utensils;
      case 'hotel':
        return Hotel;
      case 'experience':
        return Compass;
      case 'place':
      default:
        return Landmark;
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. Mobile Date Strip (Section 41) */}
      <div className="lg:hidden bg-[#FFFDF8] p-3 rounded-2xl border border-[#EAE6DD] shadow-2xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-black text-[#17201D]">Trip Dates</span>
          <span className="text-[11px] text-[#556960]">{days.length} Days</span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {days.map((d) => {
            const isSelected = selectedDayNumber === d.dayNumber;
            const health = dayHealths[d.dayNumber];
            const dateObj = new Date(d.date || '');
            const weekday = isNaN(dateObj.getTime())
              ? `D${d.dayNumber}`
              : dateObj.toLocaleDateString('en-US', { weekday: 'short' });
            const dayNum = isNaN(dateObj.getTime()) ? d.dayNumber : dateObj.getDate();

            return (
              <button
                key={d.id}
                type="button"
                onClick={() => onSelectDay(d.dayNumber)}
                className={`flex flex-col items-center justify-center min-w-[56px] py-2 px-1 rounded-2xl border transition-all cursor-pointer shrink-0 ${
                  isSelected
                    ? 'bg-[#17201D] text-white border-[#17201D] shadow-xs'
                    : 'bg-white text-[#556960] border-[#EAE6DD] hover:border-[#838F8B]'
                }`}
              >
                <span
                  className={`text-[10px] font-bold uppercase ${
                    isSelected ? 'text-[#FF6B4A]' : 'text-[#838F8B]'
                  }`}
                >
                  {weekday}
                </span>
                <span className="text-base font-black my-0.5">{dayNum}</span>
                <span
                  className={`text-[9px] font-extrabold px-1.5 rounded-full ${
                    isSelected
                      ? 'bg-[#2A3833] text-white'
                      : 'bg-[#F0ECE1] text-[#17201D]'
                  }`}
                >
                  Day {d.dayNumber}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Month Calendar Card */}
      <div className="bg-[#FFFDF8] rounded-3xl border border-[#EAE6DD] p-4 sm:p-6 shadow-2xs">
        {/* Calendar Header Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#EAE6DD]">
          <div>
            <h3 className="text-lg font-black text-[#17201D] tracking-tight flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-[#20B8A6]" />
              <span>{monthName}</span>
            </h3>
            <p className="text-xs text-[#556960] mt-0.5">{tripPeriodLabel}</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={goToTripToday}
              className="px-3 py-1.5 rounded-xl bg-[#F4F1EA] hover:bg-[#EAE6DD] text-[#17201D] text-xs font-bold transition-colors cursor-pointer"
            >
              First Day
            </button>

            <div className="inline-flex items-center rounded-xl bg-white border border-[#EAE6DD] shadow-2xs">
              <button
                type="button"
                onClick={prevMonth}
                className="p-1.5 hover:bg-[#F4F1EA] rounded-l-xl text-[#556960] hover:text-[#17201D] transition-colors cursor-pointer"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={nextMonth}
                className="p-1.5 hover:bg-[#F4F1EA] rounded-r-xl text-[#556960] hover:text-[#17201D] transition-colors cursor-pointer"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 my-2 text-center text-[11px] font-black text-[#838F8B] uppercase tracking-wider">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        {/* Calendar Day Cells Grid */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {calendarMatrix.map((cell, idx) => {
            const itinDay = cell.itineraryDay;
            const isTripDay = !!itinDay;
            const isSelected = isTripDay && selectedDayNumber === itinDay.dayNumber;
            const isDragTarget = dragOverDateISO === cell.dateISO;
            const activities = itinDay
              ? (itinDay.activities || []).filter((a) => a.status !== 'Unscheduled')
              : [];

            return (
              <div
                key={idx}
                onClick={() => {
                  if (isTripDay) {
                    onSelectDay(itinDay.dayNumber);
                  }
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  if (isTripDay) {
                    setDragOverDateISO(cell.dateISO);
                  }
                }}
                onDragLeave={() => setDragOverDateISO(null)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOverDateISO(null);
                  const actId = e.dataTransfer.getData('text/plain') || draggedActivityId;
                  if (actId && isTripDay) {
                    onMoveActivityDate(actId, cell.dateISO, itinDay.dayNumber);
                  }
                }}
                className={`min-h-[90px] sm:min-h-[110px] p-1.5 sm:p-2 rounded-2xl border transition-all flex flex-col justify-between ${
                  !cell.isCurrentMonth
                    ? 'bg-[#FAF8F5]/40 opacity-40 border-transparent'
                    : isTripDay
                    ? isSelected
                      ? 'bg-[#FAF7EE] border-[#17201D] ring-2 ring-[#17201D] shadow-md'
                      : isDragTarget
                      ? 'bg-[#E8F8F5] border-2 border-dashed border-[#20B8A6]'
                      : 'bg-white border-[#EAE6DD] hover:border-[#838F8B] hover:shadow-2xs cursor-pointer'
                    : 'bg-[#F9F7F1]/30 border-transparent text-[#838F8B]'
                }`}
              >
                {/* Cell Header: Date Number + Day Badge */}
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-black ${
                      isTripDay
                        ? isSelected
                          ? 'text-[#FF6B4A]'
                          : 'text-[#17201D]'
                        : 'text-[#838F8B]'
                    }`}
                  >
                    {cell.dayNumberInMonth}
                  </span>

                  {isTripDay && (
                    <span
                      className={`text-[9px] font-black px-1.5 py-0.2 rounded-md ${
                        isSelected
                          ? 'bg-[#17201D] text-white'
                          : 'bg-[#F0ECE1] text-[#556960]'
                      }`}
                    >
                      Day {itinDay.dayNumber}
                    </span>
                  )}
                </div>

                {/* Event Chips */}
                <div className="space-y-1 my-1 flex-1 overflow-hidden">
                  {activities.slice(0, 2).map((act) => {
                    const CatIcon = getCategoryIcon(act.category);
                    return (
                      <div
                        key={act.id}
                        draggable
                        onDragStart={(e) => {
                          e.stopPropagation();
                          e.dataTransfer.setData('text/plain', act.id);
                          setDraggedActivityId(act.id);
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onActivityClick(act);
                        }}
                        className="px-1.5 py-0.5 rounded-lg bg-[#FAF7EE] hover:bg-[#F0ECE1] border border-[#EAE6DD] text-[10px] font-semibold text-[#17201D] flex items-center gap-1 truncate cursor-grab active:cursor-grabbing transition-colors"
                        title={`${act.startTime} - ${act.title}`}
                      >
                        <CatIcon className="w-2.5 h-2.5 text-[#FF6B4A] shrink-0" />
                        <span className="truncate">{act.title}</span>
                      </div>
                    );
                  })}

                  {activities.length > 2 && (
                    <div className="text-[9px] font-extrabold text-[#20B8A6] px-1 truncate">
                      +{activities.length - 2} more
                    </div>
                  )}
                </div>

                {/* Cell Footer Quick Add Action */}
                {isTripDay && (
                  <div className="pt-0.5 flex justify-end">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddActivity(itinDay.dayNumber);
                      }}
                      className="text-[10px] text-[#838F8B] hover:text-[#17201D] hover:bg-[#EAE6DD] p-0.5 rounded-md transition-colors"
                      title="Add Activity to Day"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
