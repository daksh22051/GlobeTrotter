import React from 'react';
import {
  MapPin,
  Calendar as CalendarIcon,
  Clock,
  Users,
  Wallet,
  AlertTriangle,
  Sparkles,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { Trip } from '../../types/trip';
import { Itinerary, DayHealthResult } from '../../types/itinerary';
import { formatCurrency } from '../../utils/currency';

interface TripSummaryBarProps {
  trip: Trip;
  itinerary: Itinerary;
  dayHealths: Record<number, DayHealthResult>;
  selectedDayNumber: number;
  onSelectDay: (dayNumber: number) => void;
  onOptimizeDay?: (dayNumber: number) => void;
}

export const TripSummaryBar: React.FC<TripSummaryBarProps> = ({
  trip,
  itinerary,
  dayHealths,
  selectedDayNumber,
  onSelectDay,
  onOptimizeDay,
}) => {
  const days = itinerary.days || [];
  const durationDays = days.length || trip.durationDays || 3;
  const nights = Math.max(0, durationDays - 1);
  const currency = trip.currency || 'INR';

  // Format dates: e.g. "12–20 Nov"
  const formattedDates = React.useMemo(() => {
    if (days.length > 0 && days[0].date && days[days.length - 1].date) {
      try {
        const start = new Date(days[0].date);
        const end = new Date(days[days.length - 1].date);
        const startMonth = start.toLocaleDateString('en-US', { month: 'short' });
        const endMonth = end.toLocaleDateString('en-US', { month: 'short' });
        const startDay = start.getDate();
        const endDay = end.getDate();

        if (startMonth === endMonth) {
          return `${startDay}–${endDay} ${startMonth}`;
        }
        return `${startDay} ${startMonth} – ${endDay} ${endMonth}`;
      } catch {
        return trip.startDate || 'Dates Planned';
      }
    }
    return trip.startDate ? `${trip.startDate}` : 'Dates Planned';
  }, [days, trip.startDate]);

  // Calculate total scheduled activities & total cost
  const totalActivities = days.reduce(
    (sum, d) => sum + (d.activities || []).filter((a) => a.status !== 'Unscheduled').length,
    0
  );

  const totalCost = days.reduce((sum, d) => {
    const health = dayHealths[d.dayNumber];
    return sum + (health ? health.totalCost : 0);
  }, 0);

  // Check if any day is overloaded or busy
  const busyDays = days.filter((d) => {
    const health = dayHealths[d.dayNumber];
    return health && (health.status === 'Busy' || health.status === 'Overloaded');
  });

  return (
    <div className="bg-[#FAF7EE] border-b border-[#EAE6DD] py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Top Info Badges Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
          {/* Destination */}
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-[#FFEAE5] text-[#FF6B4A] flex items-center justify-center font-black shrink-0">
              <MapPin className="w-4 h-4" />
            </span>
            <div>
              <span className="text-[10px] uppercase tracking-wider font-bold text-[#838F8B] block">
                Destination
              </span>
              <span className="font-extrabold text-[#17201D]">
                {trip.destination}
                {trip.country ? `, ${trip.country}` : ''}
              </span>
            </div>
          </div>

          {/* Dates */}
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-[#E8F8F5] text-[#20B8A6] flex items-center justify-center shrink-0">
              <CalendarIcon className="w-4 h-4" />
            </span>
            <div>
              <span className="text-[10px] uppercase tracking-wider font-bold text-[#838F8B] block">
                Dates
              </span>
              <span className="font-extrabold text-[#17201D]">{formattedDates}</span>
            </div>
          </div>

          {/* Duration */}
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-[#FFF3D6] text-[#E08A00] flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4" />
            </span>
            <div>
              <span className="text-[10px] uppercase tracking-wider font-bold text-[#838F8B] block">
                Duration
              </span>
              <span className="font-extrabold text-[#17201D]">
                {durationDays} days · {nights} {nights === 1 ? 'night' : 'nights'}
              </span>
            </div>
          </div>

          {/* Travellers */}
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-[#F0ECE1] text-[#556960] flex items-center justify-center shrink-0">
              <Users className="w-4 h-4" />
            </span>
            <div>
              <span className="text-[10px] uppercase tracking-wider font-bold text-[#838F8B] block">
                Travelers
              </span>
              <span className="font-extrabold text-[#17201D]">
                {trip.travelers || 1} {trip.travelers === 1 ? 'traveller' : 'travellers'}
              </span>
            </div>
          </div>

          {/* Budget */}
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-[#EBF5FB] text-[#2E86DE] flex items-center justify-center shrink-0">
              <Wallet className="w-4 h-4" />
            </span>
            <div>
              <span className="text-[10px] uppercase tracking-wider font-bold text-[#838F8B] block">
                Trip Budget
              </span>
              <span className="font-extrabold text-[#17201D]">
                {formatCurrency(trip.budget || 50000, currency)}
              </span>
            </div>
          </div>
        </div>

        {/* Weekly / Full Trip Overview Visualizer (Section 29: Day 1 ━━━, Day 2 ━━━━━...) */}
        <div className="pt-2 border-t border-[#EAE6DD]/70">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-[#17201D]">Trip Pace & Density Overview</span>
              <span className="text-[11px] text-[#556960]">({totalActivities} total activities)</span>
            </div>

            {busyDays.length > 0 && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#D9534F] bg-[#FFEAE5] px-2 py-0.5 rounded-full border border-[#FF6B4A]/20">
                <AlertTriangle className="w-3 h-3" />
                {busyDays.length} packed {busyDays.length === 1 ? 'day' : 'days'}
              </span>
            )}
          </div>

          {/* Interactive Day Density Bars */}
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
            {days.map((day) => {
              const health = dayHealths[day.dayNumber];
              const actCount = (day.activities || []).filter((a) => a.status !== 'Unscheduled').length;
              const isSelected = selectedDayNumber === day.dayNumber;
              const status = health?.status || 'Balanced';

              // Visual bar color & width calculation based on density
              let barColor = 'bg-[#20B8A6]'; // Balanced / Excellent
              let statusText = 'Balanced';
              if (status === 'Overloaded') {
                barColor = 'bg-[#E74C3C]';
                statusText = 'Overloaded';
              } else if (status === 'Busy') {
                barColor = 'bg-[#FF8566]';
                statusText = 'Busy';
              } else if (actCount === 0) {
                barColor = 'bg-[#D2CBC1]';
                statusText = 'Free';
              }

              // Relative bar length (min 20%, max 100%)
              const barPercent = Math.min(100, Math.max(20, actCount * 20));

              return (
                <button
                  key={day.id}
                  type="button"
                  onClick={() => onSelectDay(day.dayNumber)}
                  className={`text-left p-2 rounded-xl transition-all border cursor-pointer ${
                    isSelected
                      ? 'bg-white border-[#17201D] shadow-xs ring-1 ring-[#17201D]'
                      : 'bg-white/60 border-[#EAE6DD] hover:bg-white hover:border-[#838F8B]'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="font-extrabold text-[#17201D]">Day {day.dayNumber}</span>
                    <span className="text-[10px] text-[#556960] font-semibold">{actCount} act</span>
                  </div>

                  {/* Pace bar */}
                  <div className="w-full h-1.5 bg-[#EAE6DD] rounded-full overflow-hidden mb-1">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${barColor}`}
                      style={{ width: `${barPercent}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[9px] text-[#838F8B]">
                    <span>{statusText}</span>
                    <span>{health ? `${health.score}%` : ''}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
