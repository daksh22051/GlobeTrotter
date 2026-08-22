import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Trip } from '../../types/trip';
import { TripCoverImage } from './TripCoverImage';
import { getTripCountdown } from '../../utils/tripStatus';
import { calculateTripProgress } from '../../utils/tripProgressCalculator';
import { calculateTripHealthSummary } from '../../utils/tripHealthSummary';
import { determineNextTripAction } from '../../utils/nextTripAction';
import { formatCurrency } from '../../utils/currency';
import {
  Sparkles,
  Calendar,
  MapPin,
  Users,
  Wallet,
  ArrowRight,
  Clock,
  Compass,
  CheckCircle2,
} from 'lucide-react';

interface FeaturedNextTripCardProps {
  trip: Trip;
}

export const FeaturedNextTripCard: React.FC<FeaturedNextTripCardProps> = ({ trip }) => {
  const navigate = useNavigate();
  const countdown = getTripCountdown(trip);
  const progress = calculateTripProgress(trip);
  const health = calculateTripHealthSummary(trip);
  const nextAction = determineNextTripAction(trip);

  const travelersCount = trip.travelersCount || trip.travelersCount || 1;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#17201D] to-[#25332E] text-white p-6 sm:p-8 shadow-xl border border-[#2F3F39]">
      {/* Decorative ambient backdrop */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#FF6B4A]/20 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-gradient-to-tr from-[#20B8A6]/20 to-transparent rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left / Top Information */}
        <div className="lg:col-span-7 space-y-4">
          {/* Badge indicator */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold tracking-wide uppercase bg-[#FF6B4A] text-white shadow-xs">
              <Sparkles className="w-3.5 h-3.5" />
              {countdown.isOngoing ? 'Currently Traveling' : 'Your Next Adventure'}
            </span>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/10 backdrop-blur-md border border-white/10 text-[#FAF8F5]">
              <Clock className="w-3.5 h-3.5 text-[#20B8A6]" />
              <span>{countdown.label}</span>
            </span>

            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/10 border border-white/10 ${health.colorClass}`}
            >
              <span>Health: {health.score} ({health.label})</span>
            </span>
          </div>

          {/* Title & Destination */}
          <div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              {trip.name}
            </h2>
            <p className="text-sm sm:text-base text-[#D3DDD8] flex items-center gap-2 mt-1">
              <MapPin className="w-4 h-4 text-[#FF6B4A] shrink-0" />
              <span>
                {trip.destination}
                {trip.country && trip.country !== trip.destination ? ` · ${trip.country}` : ''}
              </span>
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-2.5">
              <div className="text-[11px] font-semibold text-[#A2B3AC] flex items-center gap-1">
                <Calendar className="w-3 h-3 text-[#FF6B4A]" />
                Dates
              </div>
              <div className="text-xs font-bold text-white mt-0.5 truncate">
                {trip.dateDisplay || `${trip.startDate || 'TBD'}`}
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-2.5">
              <div className="text-[11px] font-semibold text-[#A2B3AC] flex items-center gap-1">
                <Users className="w-3 h-3 text-[#20B8A6]" />
                Travelers
              </div>
              <div className="text-xs font-bold text-white mt-0.5">
                {trip.durationDays || 3}d · {travelersCount} {travelersCount === 1 ? 'person' : 'people'}
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-2.5">
              <div className="text-[11px] font-semibold text-[#A2B3AC] flex items-center gap-1">
                <Wallet className="w-3 h-3 text-[#E08A00]" />
                Budget
              </div>
              <div className="text-xs font-bold text-white mt-0.5">
                {formatCurrency(trip.budget || 50000, trip.currency || 'INR')}
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-2.5">
              <div className="text-[11px] font-semibold text-[#A2B3AC] flex items-center gap-1">
                <Compass className="w-3 h-3 text-[#FF8E72]" />
                Activities
              </div>
              <div className="text-xs font-bold text-white mt-0.5">
                {progress.scheduledActivitiesCount} scheduled
              </div>
            </div>
          </div>

          {/* Planning Progress Bar */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#C3D2CC]">Planning Readiness</span>
              <span className="font-extrabold text-white">{progress.percentage}%</span>
            </div>
            <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden p-0.5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#FF6B4A] via-[#FF8E72] to-[#20B8A6] transition-all duration-500"
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
          </div>

          {/* CTA Actions */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate(nextAction.route)}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-[#FF6B4A] to-[#FF8E72] hover:from-[#E85535] hover:to-[#FF7859] text-white text-sm font-bold shadow-lg shadow-[#FF6B4A]/30 transition-all transform active:scale-98 cursor-pointer"
            >
              <span>{countdown.isOngoing ? "Open Today's Plan" : nextAction.ctaText}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => navigate(`/trip/${trip.id}/itinerary`)}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-sm font-bold backdrop-blur-md transition-all cursor-pointer"
            >
              <span>Itinerary Workspace</span>
            </button>
          </div>
        </div>

        {/* Right Cover Preview Image */}
        <div className="lg:col-span-5 h-56 sm:h-72 rounded-2xl overflow-hidden relative shadow-2xl border border-white/15 group">
          <TripCoverImage
            src={trip.coverImage}
            destination={trip.destination}
            tripName={trip.name}
            imageClassName="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white/90">
            <span className="font-semibold bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10">
              {trip.tripType ? trip.tripType.replace('_', ' ').toUpperCase() : 'TRAVEL'}
            </span>
            <span className="font-bold bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10">
              {trip.durationDays || 3} Days Trip
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
