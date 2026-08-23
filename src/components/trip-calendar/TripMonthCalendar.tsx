import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
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

const formatLocalDateISO = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

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

    const cells: {
      date: Date;
      dateISO: string;
      dayNumberInMonth: number;
      isPlaceholder: boolean;
      itineraryDay?: ItineraryDay;
      isTripDay: boolean;
    }[] = [];

    // Keep week alignment without creating interactive dates from adjacent months.
    for (let i = 0; i < firstDayIndex; i++) {
      cells.push({
        date: new Date(year, month, 1),
        dateISO: '',
        dayNumberInMonth: 0,
        isPlaceholder: true,
        isTripDay: false,
      });
    }

    for (let dayOfMonth = 1; dayOfMonth <= totalDaysInMonth; dayOfMonth++) {
      const d = new Date(year, month, dayOfMonth);
      const dateISO = formatLocalDateISO(d);
      const itinDay = itineraryDaysByDate[dateISO];
      cells.push({
        date: d,
        dateISO,
        dayNumberInMonth: d.getDate(),
        isPlaceholder: false,
        itineraryDay: itinDay,
        isTripDay: !!itinDay,
      });
    }

    while (cells.length % 7 !== 0) {
      cells.push({
        date: new Date(year, month, 1),
        dateISO: '',
        dayNumberInMonth: 0,
        isPlaceholder: true,
        isTripDay: false,
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
        <div className="grid min-w-[560px] grid-cols-7 gap-1.5 overflow-x-auto sm:min-w-0 sm:gap-2">
          {calendarMatrix.map((cell, idx) => {
            const itinDay = cell.itineraryDay;
            const isTripDay = !!itinDay;
            const isSelected = isTripDay && selectedDayNumber === itinDay.dayNumber;
            const isDragTarget = dragOverDateISO === cell.dateISO;
            const activities = itinDay
              ? (itinDay.activities || []).filter((a) => a.status !== 'Unscheduled')
              : [];

            if (cell.isPlaceholder) {
              return (
                <div
                  key={idx}
                  aria-hidden="true"
                  className="min-h-[104px] sm:min-h-[118px] rounded-2xl border border-transparent"
                />
              );
            }

            return (
              <motion.div
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
                whileHover={isTripDay ? { y: -2, scale: 1.015 } : undefined}
                transition={{ type: 'spring', stiffness: 360, damping: 24 }}
                className={`min-h-[104px] sm:min-h-[118px] p-1.5 sm:p-2 rounded-2xl border transition-all flex flex-col justify-between ${
                  isTripDay
                    ? isSelected
                      ? 'bg-[#FFF7F2] border-[#FF6B4A] ring-2 ring-[#FF6B4A]/15 shadow-[0_6px_16px_rgba(255,107,74,0.12)]'
                      : isDragTarget
                      ? 'bg-[#E8F8F5] border-2 border-dashed border-[#20B8A6]'
                      : 'bg-white border-[#EAE6DD] hover:border-[#FFB09B] hover:shadow-[0_5px_14px_rgba(23,32,29,0.07)] cursor-pointer'
                    : 'bg-[#F9F7F1]/30 border-transparent text-[#838F8B]'
                }`}
              >
                {/* Cell Header: Date Number + Day Badge */}
                <div className="flex items-center justify-between gap-1 pb-0.5">
                  <span
                    className={`text-sm font-black ${
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
                          ? 'bg-[#FF6B4A] text-white'
                          : 'bg-[#F0ECE1] text-[#556960]'
                      }`}
                    >
                      Day {itinDay.dayNumber}
                    </span>
                  )}
                </div>

                {/* Event Chips */}
                <div className="space-y-1.5 my-1.5 flex-1 overflow-hidden">
                  {activities.slice(0, 2).map((act) => {
                    const CatIcon = getCategoryIcon(act.category);
                    return (
                      <motion.div
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
                        whileHover={{ scale: 1.03, x: 1 }}
                        className={`group relative px-1.5 py-1 rounded-lg border text-[10px] font-bold leading-tight flex items-center gap-1 truncate cursor-grab active:cursor-grabbing transition-all hover:shadow-xs ${
                          act.category === 'hotel'
                            ? 'bg-[#E8F8F5] border-[#20B8A6]/25 text-[#13796D]'
                            : act.category === 'food'
                            ? 'bg-[#FFF3D6] border-[#F59E0B]/25 text-[#9A5B00]'
                            : act.category === 'experience'
                            ? 'bg-[#F3EEFF] border-[#8B5CF6]/25 text-[#6D3DB8]'
                            : 'bg-[#EFF6FF] border-[#3B82F6]/20 text-[#245BA3]'
                        }`}
                      >
                        <CatIcon className="w-3 h-3 text-[#FF6B4A] shrink-0" />
                        <span className="truncate">{act.title}</span>
                        <span className="pointer-events-none absolute left-0 bottom-full z-20 mb-1 w-max max-w-[180px] -translate-y-1 rounded-lg bg-[#17201D] px-2 py-1 text-[10px] font-semibold text-white opacity-0 shadow-lg transition-all duration-150 group-hover:translate-y-0 group-hover:opacity-100">
                          {act.startTime} · {act.title}
                        </span>
                      </motion.div>
                    );
                  })}

                  {activities.length > 2 && (
                    <div className="text-[10px] font-extrabold text-[#179E8E] px-1 truncate">
                      +{activities.length - 2} more
                    </div>
                  )}
                </div>

                {/* Cell Footer Quick Add Action */}
                {isTripDay && (
                  <div className="pt-1 flex justify-end">
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
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
