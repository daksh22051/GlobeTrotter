import React from 'react';
import { Clock, MapPin, Sun, Sunset, Moon, Utensils, Hotel, Landmark } from 'lucide-react';
import { GuideDayPlan } from '../../types/travelGuide';
import { ItineraryActivity } from '../../types/itinerary';
import { formatCurrency } from '../../utils/currency';
import { CurrencyCode } from '../../types/profile';

interface GuideDayProps {
  day: GuideDayPlan;
  currency: string;
}

export const GuideDay: React.FC<GuideDayProps> = ({ day, currency }) => {
  const currencyCode = (currency || 'INR') as CurrencyCode;
  const renderActivityBlock = (
    title: string,
    icon: React.ReactNode,
    activities: ItineraryActivity[]
  ) => {
    if (!activities || activities.length === 0) return null;

    return (
      <div className="space-y-2.5">
        <div className="flex items-center gap-1.5 text-xs font-black text-[#17201D] uppercase tracking-wider">
          {icon}
          <span>{title}</span>
        </div>

        <div className="space-y-2 pl-2 border-l-2 border-[#EAE6DD]">
          {activities.map((act, idx) => (
            <div
              key={act.id || idx}
              className="p-3.5 rounded-2xl bg-[#FCFBF8] border border-[#EAE6DD] hover:border-[#FF6B4A]/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-[#FF6B4A] bg-[#FFF2EE] px-2 py-0.5 rounded-md font-mono">
                    {act.startTime || 'Scheduled'}
                  </span>
                  <h4 className="text-xs sm:text-sm font-black text-[#17201D]">{act.title}</h4>
                </div>

                <p className="text-xs text-[#68736F] flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#98A29F] shrink-0" />
                  <span className="truncate">{act.location}</span>
                </p>

                {act.notes && <p className="text-[11px] text-[#838F8B] italic">{act.notes}</p>}
              </div>

              {act.estimatedCost > 0 && (
                <span className="text-xs font-bold text-[#17201D] shrink-0 self-start sm:self-center">
                  {formatCurrency(act.estimatedCost, (act.currency || currencyCode) as CurrencyCode)}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-3xl border border-[#EAE6DD] p-6 sm:p-8 shadow-xs space-y-6 break-inside-avoid">
      {/* Day Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#F4F1EA]">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#17201D] text-white flex flex-col items-center justify-center font-black shrink-0 shadow-xs">
            <span className="text-[10px] text-[#FF8E72] uppercase font-bold leading-none">Day</span>
            <span className="text-lg leading-none mt-0.5">{day.dayNumber}</span>
          </div>

          <div>
            <h3 className="text-base sm:text-lg font-black text-[#17201D] tracking-tight">
              {day.title}
            </h3>
            <p className="text-xs text-[#838F8B]">
              {day.dateDisplay} · {day.theme}
            </p>
          </div>
        </div>

        {day.estimatedCost > 0 && (
          <div className="text-left sm:text-right">
            <span className="text-[10px] font-bold text-[#838F8B] uppercase">Estimated Day Cost</span>
            <p className="text-xs sm:text-sm font-black text-[#20B8A6]">
              {formatCurrency(day.estimatedCost, currency)}
            </p>
          </div>
        )}
      </div>

      {/* Activity Blocks */}
      <div className="space-y-5">
        {day.morningActivities.length > 0 &&
          renderActivityBlock(
            'Morning Exploration',
            <Sun className="w-4 h-4 text-[#FFB020]" />,
            day.morningActivities
          )}

        {day.afternoonActivities.length > 0 &&
          renderActivityBlock(
            'Afternoon Adventures',
            <Sunset className="w-4 h-4 text-[#FF6B4A]" />,
            day.afternoonActivities
          )}

        {day.eveningActivities.length > 0 &&
          renderActivityBlock(
            'Evening & Night Atmosphere',
            <Moon className="w-4 h-4 text-[#7C5CFC]" />,
            day.eveningActivities
          )}

        {day.allActivities.length === 0 && (
          <p className="text-xs text-[#838F8B] italic py-2">
            No fixed timetable scheduled for this day. Free time for leisurely discoveries.
          </p>
        )}
      </div>
    </div>
  );
};
