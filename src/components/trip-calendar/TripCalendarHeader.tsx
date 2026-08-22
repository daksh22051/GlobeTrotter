import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  Clock,
  Sparkles,
  Share2,
  Download,
  Check,
  RotateCcw,
  Layers,
  Map as MapIcon,
  Wallet,
} from 'lucide-react';
import { Trip } from '../../types/trip';

interface TripCalendarHeaderProps {
  trip: Trip;
  viewMode: 'timeline' | 'calendar';
  onViewModeChange: (mode: 'timeline' | 'calendar') => void;
  onOptimizeClick: () => void;
  onExportClick: () => void;
  onShareClick: () => void;
  isSaving?: boolean;
  lastSavedAt?: string | null;
  canUndo?: boolean;
  onUndo?: () => void;
}

export const TripCalendarHeader: React.FC<TripCalendarHeaderProps> = ({
  trip,
  viewMode,
  onViewModeChange,
  onOptimizeClick,
  onExportClick,
  onShareClick,
  isSaving = false,
  lastSavedAt,
  canUndo = false,
  onUndo,
}) => {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 bg-[#FFFDF8]/95 backdrop-blur-md border-b border-[#EAE6DD] px-4 sm:px-6 lg:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4">
        {/* Left: Back Link & Title */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(`/trip/${trip.id}/itinerary`)}
            className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-white border border-[#EAE6DD] text-[#556960] hover:text-[#17201D] hover:border-[#17201D] hover:bg-[#F9F7F1] transition-colors cursor-pointer shadow-2xs shrink-0"
            title="Back to Itinerary"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase bg-[#E8F8F5] text-[#20B8A6] border border-[#20B8A6]/20">
                <Clock className="w-3 h-3" />
                Trip Timeline & Calendar
              </span>

              {/* Autosave Indicator */}
              <div className="inline-flex items-center gap-1 text-[11px] text-[#838F8B] pl-1 font-medium">
                {isSaving ? (
                  <span className="flex items-center gap-1 text-[#FF6B4A]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B4A] animate-ping" />
                    Saving...
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[#20B8A6]">
                    <Check className="w-3 h-3" />
                    Saved
                  </span>
                )}
              </div>
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold text-[#17201D] tracking-tight mt-0.5">
              Your trip timeline
            </h1>
            <p className="text-xs sm:text-sm text-[#556960] hidden sm:block">
              See every day, experience and moment of your journey at a glance.
            </p>
          </div>
        </div>

        {/* Right: Quick Links, View Switcher & Action CTAs */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-between md:justify-end">
          {/* Quick Cross-Nav Buttons */}
          <div className="hidden lg:flex items-center gap-1.5 border-r border-[#EAE6DD] pr-3 mr-1">
            <button
              type="button"
              onClick={() => navigate(`/trip/${trip.id}/itinerary`)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#556960] hover:text-[#17201D] hover:bg-[#F4F1EA] transition-colors cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Itinerary</span>
            </button>
            <button
              type="button"
              onClick={() => navigate(`/trip/${trip.id}/map`)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#556960] hover:text-[#17201D] hover:bg-[#F4F1EA] transition-colors cursor-pointer"
            >
              <MapIcon className="w-3.5 h-3.5 text-[#FF6B4A]" />
              <span>Map</span>
            </button>
            <button
              type="button"
              onClick={() => navigate(`/trip/${trip.id}/budget`)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#556960] hover:text-[#17201D] hover:bg-[#F4F1EA] transition-colors cursor-pointer"
            >
              <Wallet className="w-3.5 h-3.5 text-[#20B8A6]" />
              <span>Budget</span>
            </button>
          </div>

          {/* Undo Button */}
          {canUndo && onUndo && (
            <button
              type="button"
              onClick={onUndo}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#EAE6DD] text-[#556960] hover:text-[#17201D] hover:border-[#17201D] text-xs font-bold transition-all shadow-2xs cursor-pointer"
              title="Undo last change"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Undo</span>
            </button>
          )}

          {/* View Switcher: Timeline vs Calendar */}
          <div className="inline-flex p-1 rounded-xl bg-[#F0ECE1] border border-[#EAE6DD]">
            <button
              type="button"
              onClick={() => onViewModeChange('timeline')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'timeline'
                  ? 'bg-white text-[#17201D] shadow-2xs'
                  : 'text-[#556960] hover:text-[#17201D]'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-[#FF6B4A]" />
              <span>Timeline</span>
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange('calendar')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'calendar'
                  ? 'bg-white text-[#17201D] shadow-2xs'
                  : 'text-[#556960] hover:text-[#17201D]'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5 text-[#20B8A6]" />
              <span>Calendar</span>
            </button>
          </div>

          {/* Export & Share buttons */}
          <button
            type="button"
            onClick={onExportClick}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-full bg-white border border-[#EAE6DD] text-[#17201D] hover:border-[#17201D] text-xs font-bold transition-all shadow-2xs cursor-pointer"
            title="Export Trip Guide (PDF)"
          >
            <Download className="w-3.5 h-3.5 text-[#556960]" />
            <span className="hidden sm:inline">Export</span>
          </button>

          <button
            type="button"
            onClick={onShareClick}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-full bg-white border border-[#EAE6DD] text-[#17201D] hover:border-[#17201D] text-xs font-bold transition-all shadow-2xs cursor-pointer"
            title="Share Trip"
          >
            <Share2 className="w-3.5 h-3.5 text-[#556960]" />
            <span className="hidden sm:inline">Share</span>
          </button>

          {/* Primary Action: Optimize Schedule */}
          <button
            type="button"
            onClick={onOptimizeClick}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 sm:py-2 rounded-full bg-gradient-to-r from-[#FF6B4A] to-[#FF8566] text-white hover:brightness-105 active:scale-98 text-xs sm:text-sm font-extrabold shadow-md shadow-[#FF6B4A]/25 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#FFE58F]" />
            <span>Optimize Schedule ✨</span>
          </button>
        </div>
      </div>
    </header>
  );
};
