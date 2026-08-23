import React from 'react';
import { Calendar, Users, Gauge, Coins, RefreshCw, SlidersHorizontal, ArrowRight, ArrowLeft } from 'lucide-react';
import { Trip } from '../../types/trip';
import { formatCurrency } from '../../utils/currency';
import { motion } from 'motion/react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface AIHeroProps {
  trip: Trip;
  destinationHeroImage: string;
  destinationSummary: string;
  onRefresh: () => void;
  onOpenPersonalize: () => void;
  onBuildItinerary: () => void;
  onBackToDashboard: () => void;
  isRefreshing?: boolean;
}

export const AIHero: React.FC<AIHeroProps> = ({
  trip,
  destinationHeroImage,
  destinationSummary,
  onRefresh,
  onOpenPersonalize,
  onBuildItinerary,
  onBackToDashboard,
  isRefreshing = false,
}) => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="relative w-full rounded-3xl overflow-hidden shadow-md border border-[#EAE6DD] bg-white text-[#17201D] mb-8 select-none">
      {/* Top Background Image with Cinematic Gradient Overlay */}
      <div className="relative h-64 sm:h-80 md:h-96 w-full bg-[#202725] overflow-hidden">
        <img
          src={destinationHeroImage || trip.coverImage}
          alt={trip.destination}
          className="w-full h-full object-cover object-center transform scale-105 hover:scale-100 transition-transform duration-700 opacity-90"
        />
        {/* Soft Multi-Layered Dark & Tint Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#141C1A] via-[#141C1A]/60 to-black/30" />

        {/* Top Header Navigation Strip */}
        <div className="absolute top-4 sm:top-6 left-4 sm:left-6 right-4 sm:right-6 flex items-center justify-between z-10">
          <button
            type="button"
            onClick={onBackToDashboard}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 hover:bg-white text-[#17201D] text-xs sm:text-sm font-bold backdrop-blur-md shadow-xs transition-all cursor-pointer hover:-translate-x-0.5"
          >
            <ArrowLeft className="w-4 h-4 text-[#FF6B4A]" />
            <span>Back to Dashboard</span>
          </button>

          {/* AI Badge */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#17201D]/80 backdrop-blur-md border border-white/20 text-white text-xs font-semibold shadow-xs">
            <span className="text-white/90">AI Destination Brief</span>
          </div>
        </div>

        {/* Hero Bottom Content Over Image */}
        <div className="absolute bottom-6 left-4 sm:left-8 right-4 sm:right-8 z-10 text-white">
          <div className="max-w-3xl">
            <span className="inline-block px-3 py-1 rounded-md bg-[#FF6B4A] text-white text-[11px] font-extrabold uppercase tracking-wider mb-2.5 shadow-xs">
              {trip.tripType || 'Personalized'} Journey
            </span>

            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-white drop-shadow-sm mb-2">
              Your destination, intelligently understood.
            </h1>

            <p className="text-xs sm:text-sm md:text-base text-white/85 max-w-2xl leading-relaxed">
              We've analyzed your destination, travel style, interests, and budget to find experiences that fit your journey.
            </p>
          </div>
        </div>
      </div>

      {/* Snapshot Strip & Narrative Summary */}
      <div className="p-4 sm:p-6 md:p-8 bg-[#FCFBF8]">
        {/* Compact Trip Summary Badges */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 pb-6 border-b border-[#EAE6DD]">
          {/* Destination */}
          <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white border border-[#EAE6DD] shadow-2xs">
            <span className="text-sm">📍</span>
            <div>
              <p className="text-[10px] uppercase font-bold text-[#838F8B]">Destination</p>
              <p className="text-xs sm:text-sm font-extrabold text-[#17201D]">{trip.destination}, {trip.country}</p>
            </div>
          </div>

          {/* Dates & Duration */}
          <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white border border-[#EAE6DD] shadow-2xs">
            <Calendar className="w-4 h-4 text-[#FF6B4A]" />
            <div>
              <p className="text-[10px] uppercase font-bold text-[#838F8B]">Dates</p>
              <p className="text-xs sm:text-sm font-extrabold text-[#17201D]">
                {trip.durationDays} days · {trip.dateDisplay || 'Upcoming'}
              </p>
            </div>
          </div>

          {/* Travelers */}
          <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white border border-[#EAE6DD] shadow-2xs">
            <Users className="w-4 h-4 text-[#20B8A6]" />
            <div>
              <p className="text-[10px] uppercase font-bold text-[#838F8B]">Travelers</p>
              <p className="text-xs sm:text-sm font-extrabold text-[#17201D]">
                {trip.travelersCount} {trip.travelersCount === 1 ? 'Traveler' : 'Travelers'}
              </p>
            </div>
          </div>

          {/* Travel Pace */}
          <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white border border-[#EAE6DD] shadow-2xs">
            <Gauge className="w-4 h-4 text-[#F59E0B]" />
            <div>
              <p className="text-[10px] uppercase font-bold text-[#838F8B]">Travel Pace</p>
              <p className="text-xs sm:text-sm font-extrabold text-[#17201D] capitalize">
                {trip.travelPace} pace
              </p>
            </div>
          </div>

          {/* Budget */}
          <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white border border-[#EAE6DD] shadow-2xs">
            <Coins className="w-4 h-4 text-[#FF6B4A]" />
            <div>
              <p className="text-[10px] uppercase font-bold text-[#838F8B]">Target Budget</p>
              <p className="text-xs sm:text-sm font-extrabold text-[#17201D]">
                {formatCurrency(trip.budget, trip.currency)}
              </p>
            </div>
          </div>
        </div>

        {/* Why this destination fits you Narrative & Controls */}
        <div className="mt-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-[#FF6B4A]" />
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#FF6B4A]">
                Why this destination fits you
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-[#4E5955] leading-relaxed">
              {destinationSummary}
            </p>
          </div>

          {/* Action Button Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Personalize Button */}
            <button
              type="button"
              onClick={onOpenPersonalize}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white hover:bg-[#F4F1EA] text-[#17201D] text-xs font-bold border border-[#EAE6DD] shadow-2xs transition-colors cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#FF6B4A]" />
              <span>Personalize Results</span>
            </button>

            {/* Refresh Recommendations */}
            <button
              type="button"
              disabled={isRefreshing}
              onClick={onRefresh}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white hover:bg-[#F4F1EA] text-[#17201D] text-xs font-bold border border-[#EAE6DD] shadow-2xs transition-colors cursor-pointer disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#20B8A6] ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Regenerating...' : 'Refresh'}</span>
            </button>

            {/* Build Itinerary CTA */}
            <button
              type="button"
              onClick={onBuildItinerary}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#FF6B4A] hover:bg-[#E55837] text-white text-xs sm:text-sm font-extrabold shadow-sm shadow-[#FF6B4A]/25 transition-all cursor-pointer group"
            >
              <span>Build Itinerary</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
