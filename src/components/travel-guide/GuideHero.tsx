import React from 'react';
import { MapPin, Calendar, Users, Compass, Sparkles } from 'lucide-react';
import { Trip } from '../../types/trip';

interface GuideHeroProps {
  trip: Trip;
}

export const GuideHero: React.FC<GuideHeroProps> = ({ trip }) => {
  return (
    <div className="relative rounded-3xl overflow-hidden bg-[#17201D] text-white shadow-xl">
      {/* Background Cover Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={
            trip.coverImage ||
            'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1600&q=80'
          }
          alt={trip.destination}
          className="w-full h-full object-cover opacity-40 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#17201D] via-[#17201D]/40 to-transparent" />
      </div>

      <div className="relative z-10 p-6 sm:p-10 lg:p-14 space-y-6">
        {/* Magazine Eyebrow */}
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-[#FF6B4A] text-white text-[11px] font-black uppercase tracking-wider shadow-sm">
            GlobeTrotter Travel Guide
          </span>
          <span className="text-xs font-semibold text-white/80 hidden sm:inline">
            Curated Edition · {trip.destination.toUpperCase()}
          </span>
        </div>

        {/* Destination & Title */}
        <div className="space-y-2 max-w-3xl">
          <div className="text-xs sm:text-sm font-black text-[#20B8A6] uppercase tracking-widest flex items-center gap-1.5">
            <MapPin className="w-4 h-4" />
            <span>
              {trip.destination}, {trip.country}
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
            {trip.name}
          </h1>
        </div>

        {/* Meta Pills */}
        <div className="flex flex-wrap items-center gap-3 pt-2 text-xs sm:text-sm font-semibold text-white/95">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
            <Calendar className="w-4 h-4 text-[#20B8A6]" />
            <span>{trip.dateDisplay || `${trip.startDate} – ${trip.endDate}`}</span>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
            <Users className="w-4 h-4 text-[#FFB020]" />
            <span>
              {trip.durationDays} Days · {trip.travelersCount} {trip.travelersCount === 1 ? 'Traveller' : 'Travellers'}
            </span>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
            <Compass className="w-4 h-4 text-[#FF8E72]" />
            <span className="capitalize">{trip.tripType || 'Leisure'} Journey</span>
          </div>
        </div>
      </div>
    </div>
  );
};
