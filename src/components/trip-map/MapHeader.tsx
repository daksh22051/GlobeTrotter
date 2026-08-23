import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Share2, Check, MapPin, Calendar, Wallet } from 'lucide-react';
import { Trip } from '../../types/trip';

interface MapHeaderProps {
  trip: Trip;
  onOpenOptimize: () => void;
  isSaving?: boolean;
}

export const MapHeader: React.FC<MapHeaderProps> = ({
  trip,
  onOpenOptimize,
  isSaving,
}) => {
  const navigate = useNavigate();
  const [copiedShare, setCopiedShare] = useState(false);

  const handleShareClick = () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}${window.location.search}${window.location.hash}`;
    try {
      navigator.clipboard.writeText(shareUrl);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    } catch {
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    }
  };

  const nights = Math.max(0, (trip.durationDays || 1) - 1);
  const durationDisplay = `${trip.durationDays} ${trip.durationDays === 1 ? 'day' : 'days'}${
    nights > 0 ? ` · ${nights} ${nights === 1 ? 'night' : 'nights'}` : ''
  }`;

  return (
    <header className="sticky top-0 z-30 bg-[#FFFDF8]/95 backdrop-blur-md border-b border-[#EAE6DD] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-3.5">
        <div className="flex items-center justify-between gap-3">
          {/* Left: Back to Itinerary */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(`/trip/${trip.id}/itinerary`)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#EAE6DD] text-[#5E6B67] hover:text-[#17201D] hover:border-[#FF6B4A]/40 text-xs font-bold transition-colors cursor-pointer shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Itinerary</span>
            </button>

            {/* Center/Left Trip Details (Desktop) */}
            <div className="hidden md:flex flex-col">
              <div className="flex items-center gap-2">
                <h1 className="text-base font-extrabold text-[#17201D] tracking-tight">
                  {trip.name}
                </h1>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#FFE4DD] text-[#FF6B4A] font-bold">
                  Interactive Map
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#68736F] mt-0.5">
                <span className="flex items-center gap-1 font-medium text-[#17201D]">
                  <MapPin className="w-3 h-3 text-[#FF6B4A]" />
                  {trip.destination}, {trip.country}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-[#20B8A6]" />
                  {trip.dateDisplay} ({durationDisplay})
                </span>
              </div>
            </div>
          </div>

          {/* Right Action Group: Autosave, Share, AI Optimize */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Autosave Status Indicator */}
            {isSaving && (
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#838F8B] px-2.5 py-1 rounded-full bg-[#F4F1EA]">
                <div className="w-2 h-2 rounded-full bg-[#FFB020] animate-pulse" />
                <span className="text-[11px] font-medium text-[#5E6B67]">Saving...</span>
              </div>
            )}

            {/* Budget Tracker Button */}
            <button
              type="button"
              onClick={() => navigate(`/trip/${trip.id}/budget`)}
              className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-full bg-white border border-[#EAE6DD] text-[#17201D] hover:border-[#17201D] text-xs font-bold transition-all shadow-2xs cursor-pointer"
              title="Trip Budget Tracker & Optimizer"
            >
              <Wallet className="w-3.5 h-3.5 text-[#20B8A6]" />
              <span className="hidden sm:inline">Budget</span>
            </button>

            {/* Timeline & Calendar Button */}
            <button
              type="button"
              onClick={() => navigate(`/trip/${trip.id}/calendar`)}
              className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-full bg-white border border-[#EAE6DD] text-[#17201D] hover:border-[#17201D] text-xs font-bold transition-all shadow-2xs cursor-pointer"
              title="Trip Timeline & Calendar"
            >
              <Calendar className="w-3.5 h-3.5 text-[#E08A00]" />
              <span className="hidden sm:inline">Timeline</span>
            </button>

            {/* Share Placeholder Button */}
            <button
              type="button"
              onClick={handleShareClick}
              className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-full bg-white border border-[#EAE6DD] text-[#5E6B67] hover:text-[#17201D] hover:border-[#17201D] text-xs font-bold transition-all shadow-2xs cursor-pointer"
              title="Copy interactive trip link"
            >
              {copiedShare ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#20B8A6]" />
                  <span className="text-[#20B8A6]">Link Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-[#5E6B67]" />
                  <span>Share</span>
                </>
              )}
            </button>

            {/* Optimize Route Button */}
            <button
              type="button"
              onClick={onOpenOptimize}
              className="inline-flex items-center px-4 sm:px-5 py-1.5 sm:py-2 rounded-full bg-gradient-to-r from-[#FF6B4A] via-[#FF7E5F] to-[#20B8A6] text-white text-xs sm:text-sm font-black shadow-md shadow-[#FF6B4A]/25 hover:shadow-lg hover:shadow-[#FF6B4A]/30 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
            >
              <span>Optimize Route</span>
            </button>
          </div>
        </div>

        {/* Mobile Trip Subheading */}
        <div className="md:hidden mt-2 pt-2 border-t border-[#F4F1EA] flex items-center justify-between text-xs text-[#68736F]">
          <span className="font-bold text-[#17201D] truncate max-w-[180px]">
            {trip.destination}, {trip.country}
          </span>
          <span>{trip.dateDisplay}</span>
        </div>
      </div>
    </header>
  );
};
