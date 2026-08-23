import React from 'react';
import { Calendar, MapPin } from 'lucide-react';
import { ItineraryDay } from '../../types/itinerary';

interface MultiCityStopCardsProps {
  days: ItineraryDay[];
  selectedDayNumber: number;
  onSelectDay: (dayNumber: number) => void;
}

interface StopGroup {
  cityName: string;
  country?: string;
  stopIndex: number;
  firstDay: ItineraryDay;
  lastDay: ItineraryDay;
}

export const MultiCityStopCards: React.FC<MultiCityStopCardsProps> = ({
  days,
  selectedDayNumber,
  onSelectDay,
}) => {
  const stops = days.reduce((groups: StopGroup[], day) => {
    const cityName = day.cityName || 'Trip route';
    const previous = groups[groups.length - 1];
    if (previous && previous.cityName === cityName) {
      previous.lastDay = day;
    } else {
      groups.push({
        cityName,
        country: day.cityCountry,
        stopIndex: day.stopIndex ?? groups.length,
        firstDay: day,
        lastDay: day,
      });
    }
    return groups;
  }, []);

  if (stops.length < 2) return null;

  return (
    <section className="w-full bg-[#FCFBF8] border-b border-[#EAE6DD]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#FF6B4A]">Multi-city route</p>
            <h2 className="text-sm font-extrabold text-[#17201D]">Your stops, in sequence</h2>
          </div>
          <span className="text-[10px] font-bold text-[#68736F]">{stops.length} cities</span>
        </div>
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
          {stops.map((stop) => {
            const isSelected = selectedDayNumber >= stop.firstDay.dayNumber && selectedDayNumber <= stop.lastDay.dayNumber;
            return (
              <button
                key={`${stop.cityName}-${stop.stopIndex}`}
                type="button"
                onClick={() => onSelectDay(stop.firstDay.dayNumber)}
                className={`min-w-[190px] text-left p-3 rounded-2xl border transition-all cursor-pointer shrink-0 ${
                  isSelected
                    ? 'bg-white border-[#FF6B4A] shadow-sm ring-2 ring-[#FF6B4A]/10'
                    : 'bg-white/70 border-[#EAE6DD] hover:border-[#FF6B4A]/50'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded-full bg-[#FFF2EE] text-[#FF6B4A] flex items-center justify-center text-[10px] font-black">
                    {stop.stopIndex + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-extrabold text-[#17201D] truncate">{stop.cityName}</p>
                    <p className="text-[10px] text-[#68736F] truncate">{stop.country || 'Destination stop'}</p>
                  </div>
                </div>
                <p className="flex items-center gap-1.5 text-[10px] font-bold text-[#5E6B67]">
                  <Calendar className="w-3 h-3 text-[#20B8A6]" />
                  {stop.firstDay.dateDisplay} - {stop.lastDay.dateDisplay}
                </p>
                <p className="flex items-center gap-1.5 text-[10px] text-[#838F8B] mt-1">
                  <MapPin className="w-3 h-3" />
                  Days {stop.firstDay.dayNumber}-{stop.lastDay.dayNumber}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
