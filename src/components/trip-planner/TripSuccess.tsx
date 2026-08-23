import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Compass, Calendar, Users, MapPin, CheckCircle2, Home } from 'lucide-react';
import { Trip } from '../../types/trip';
import { TripRecommendations } from '../../types/recommendation';
import { formatCurrency } from '../../utils/currency';
import { TripCoverImage } from '../trips/TripCoverImage';
import { motion } from 'motion/react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface TripSuccessProps {
  trip: Trip;
  recommendations: TripRecommendations;
  onBuildAIItinerary: () => void;
}

export const TripSuccess: React.FC<TripSuccessProps> = ({ trip, recommendations, onBuildAIItinerary }) => {
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="w-full max-w-2xl mx-auto text-center py-6 sm:py-10 px-4 select-none">
      {/* Pill Badge */}
      <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#DDF7F2] text-[#179E8E] text-xs font-extrabold border border-[#20B8A6]/20 mb-3">
        <CheckCircle2 className="w-3.5 h-3.5" />
        <span>Trip Created Successfully</span>
      </div>

      {/* Main Title */}
      <h1 className="text-2xl sm:text-4xl font-black text-[#17201D] tracking-tight mb-3">
        Your journey is officially planned.
      </h1>
      <p className="text-sm sm:text-base text-[#5E6B67] max-w-md mx-auto mb-8 leading-relaxed">
        Next, let's assemble your day-by-day activities, reservations, and explore hidden gems.
      </p>

      {/* Trip Snapshot Card */}
      <div className="bg-white rounded-3xl overflow-hidden border border-[#EAE6DD] shadow-sm text-left mb-8 max-w-lg mx-auto">
        {/* Cover Photo */}
        <div className="relative h-44 bg-[#F4F1EA]">
          <TripCoverImage
            src={trip.coverImage}
            destination={trip.destination}
            tripName={trip.name}
            alt={trip.name}
            imageClassName="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute bottom-3 left-4 right-4 text-white">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#FF8E72] block">
              {trip.tripType} Adventure
            </span>
            <p className="text-xl font-extrabold truncate drop-shadow-xs">{trip.name}</p>
            <p className="text-xs text-white/90 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#FF8E72]" />
              <span>{trip.destination}, {trip.country}</span>
            </p>
          </div>
        </div>

        {/* Details Strip */}
        <div className="p-4 sm:p-5 grid grid-cols-2 gap-3 text-xs bg-[#FCFBF8]">
          <div className="space-y-0.5">
            <span className="text-[#98A29F] font-bold uppercase text-[10px]">Dates</span>
            <p className="font-extrabold text-[#17201D] flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#FF6B4A]" />
              <span className="truncate">{trip.dateDisplay}</span>
            </p>
          </div>

          <div className="space-y-0.5">
            <span className="text-[#98A29F] font-bold uppercase text-[10px]">Travelers</span>
            <p className="font-extrabold text-[#17201D] flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-[#20B8A6]" />
              <span>{trip.travelersCount} Travelers</span>
            </p>
          </div>

          <div className="space-y-0.5">
            <span className="text-[#98A29F] font-bold uppercase text-[10px]">Total Budget</span>
            <p className="font-black text-[#17201D]">
              {formatCurrency(trip.budget, trip.currency)}
            </p>
          </div>

          <div className="space-y-0.5">
            <span className="text-[#98A29F] font-bold uppercase text-[10px]">Pace</span>
            <p className="font-bold text-[#17201D] capitalize">
              {trip.travelPace} pace
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto mb-8 text-left">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#FF6B4A]">AI destination brief</p>
            <h2 className="text-lg font-black text-[#17201D] mt-1">A strong first draft for {trip.destination}</h2>
          </div>
          <span className="text-[10px] font-bold text-[#68736F]">{recommendations.allRecommendations.length} picks</span>
        </div>
        <p className="text-xs text-[#5E6B67] leading-relaxed mb-4">{recommendations.destinationSummary}</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: 'Stays', items: recommendations.hotels, color: '#20B8A6' },
            { label: 'Dining', items: recommendations.food, color: '#F59E0B' },
            { label: 'Sights', items: recommendations.places, color: '#FF6B4A' },
          ].map((group) => (
            <div key={group.label} className="bg-white rounded-2xl border border-[#EAE6DD] p-3 shadow-2xs">
              <div className="flex items-center gap-1.5 mb-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: group.color }} />
                <span className="text-[10px] font-black uppercase tracking-wider text-[#68736F]">{group.label}</span>
              </div>
              <div className="space-y-1.5">
                {group.items.slice(0, 2).map((item) => (
                  <p key={item.id} className="text-xs font-bold text-[#17201D] truncate" title={item.name}>{item.name}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="max-w-md mx-auto space-y-3">
        {/* Primary CTA: Build AI Itinerary */}
        <button
          type="button"
          onClick={onBuildAIItinerary}
          className="w-full py-4 px-6 rounded-full bg-[#FF6B4A] hover:bg-[#E55837] text-white font-extrabold text-sm sm:text-base shadow-md shadow-[#FF6B4A]/25 hover:shadow-lg hover:shadow-[#FF6B4A]/30 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer group"
        >
          <Compass className="w-5 h-5" />
          <span>Build AI Itinerary</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>

        {/* Return to Dashboard */}
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="w-full py-2.5 text-xs font-bold text-[#68736F] hover:text-[#17201D] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Home className="w-3.5 h-3.5" />
          <span>Return to Dashboard</span>
        </button>
      </div>
    </div>
  );
};
