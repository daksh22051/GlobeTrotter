import React from 'react';
import { MapPin, Calendar, Wallet } from 'lucide-react';
import { Trip } from '../../types/trip';

interface TripOverviewBarProps {
  trip: Trip;
}

export const TripOverviewBar: React.FC<TripOverviewBarProps> = ({ trip }) => {
  if (!trip) return null;

  const nights = Math.max(0, (trip.durationDays || 1) - 1);
  const durationDisplay = `${trip.durationDays} ${trip.durationDays === 1 ? 'day' : 'days'}${
    nights > 0 ? ` · ${nights} ${nights === 1 ? 'night' : 'nights'}` : ''
  }`;

  const formattedBudget = `${trip.currency || '₹'}${trip.budget.toLocaleString()}`;

  return (
    <div className="w-full bg-white border-b border-[#EAE6DD] shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          {/* Destination */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F9F7F1] border border-[#EAE6DD] text-xs font-semibold text-[#17201D] shrink-0">
            <MapPin className="w-3.5 h-3.5 text-[#FF6B4A]" />
            <span>
              {trip.destination}, {trip.country}
            </span>
          </div>

          {/* Duration & Dates */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F9F7F1] border border-[#EAE6DD] text-xs font-semibold text-[#17201D] shrink-0">
            <Calendar className="w-3.5 h-3.5 text-[#20B8A6]" />
            <span>{durationDisplay}</span>
            <span className="text-[#838F8B] font-normal">({trip.dateDisplay})</span>
          </div>

          {/* Budget */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F9F7F1] border border-[#EAE6DD] text-xs font-semibold text-[#17201D] shrink-0">
            <Wallet className="w-3.5 h-3.5 text-[#179E8E]" />
            <span>{formattedBudget} budget</span>
          </div>
        </div>
      </div>
    </div>
  );
};
