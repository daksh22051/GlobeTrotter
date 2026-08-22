import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Sparkles,
  Check,
  RotateCcw,
  Calendar as CalendarIcon,
  Clock,
  Save,
  CheckCircle2,
  Map as MapIcon,
  Wallet,
} from 'lucide-react';
import { Trip } from '../../types/trip';

interface ItineraryHeaderProps {
  trip: Trip;
  onOpenAIOptimize: () => void;
  onSave: () => void;
  onUndo: () => void;
  canUndo: boolean;
  isSaving: boolean;
  lastSavedAt: string | null;
  viewMode: 'timeline' | 'calendar';
  onViewModeChange: (mode: 'timeline' | 'calendar') => void;
}

export const ItineraryHeader: React.FC<ItineraryHeaderProps> = ({
  trip,
  onOpenAIOptimize,
  onSave,
  onUndo,
  canUndo,
  isSaving,
  lastSavedAt,
  viewMode,
  onViewModeChange,
}) => {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 bg-[#FFFDF8]/95 backdrop-blur-md border-b border-[#EAE6DD] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4">
        {/* Top Utility Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          {/* Back button & Breadcrumb */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(`/trip/${trip.id}/recommendations`)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#EAE6DD] text-[#5E6B67] hover:text-[#17201D] hover:border-[#FF6B4A]/40 text-xs font-bold transition-colors cursor-pointer shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Trip</span>
            </button>

            <div className="hidden sm:flex items-center gap-2 text-xs text-[#838F8B]">
              <span>/</span>
              <span className="font-medium text-[#17201D] truncate max-w-[200px]">
                {trip.name}
              </span>
              <span>/</span>
              <span className="font-semibold text-[#FF6B4A]">Itinerary Builder</span>
            </div>
          </div>

          {/* Right Action Group: Autosave, Undo, View Toggle, Save, AI Optimize */}
          <div className="flex items-center flex-wrap gap-2 sm:gap-3">
            {/* Autosave Status indicator */}
            <div className="hidden md:flex items-center gap-1.5 text-xs text-[#838F8B] px-2.5 py-1 rounded-full bg-[#F4F1EA]/80 border border-[#EAE6DD]/60">
              {isSaving ? (
                <>
                  <div className="w-2 h-2 rounded-full bg-[#FFB020] animate-pulse" />
                  <span className="text-[11px] font-medium text-[#5E6B67]">Saving...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#20B8A6]" />
                  <span className="text-[11px] font-medium text-[#5E6B67]">Saved</span>
                </>
              )}
            </div>

            {/* Undo Button */}
            {canUndo && (
              <button
                type="button"
                onClick={onUndo}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#EAE6DD] text-[#5E6B67] hover:text-[#17201D] hover:bg-[#F9F7F1] text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                title="Undo last change"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Undo</span>
              </button>
            )}

            {/* View Mode Toggle: Timeline | Calendar */}
            <div className="flex items-center p-0.5 rounded-full bg-[#F4F1EA] border border-[#EAE6DD]">
              <button
                type="button"
                onClick={() => onViewModeChange('timeline')}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'timeline'
                    ? 'bg-white text-[#17201D] shadow-2xs'
                    : 'text-[#68736F] hover:text-[#17201D]'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Timeline</span>
              </button>
              <button
                type="button"
                onClick={() => onViewModeChange('calendar')}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'calendar'
                    ? 'bg-white text-[#17201D] shadow-2xs'
                    : 'text-[#68736F] hover:text-[#17201D]'
                }`}
              >
                <CalendarIcon className="w-3.5 h-3.5" />
                <span>Calendar</span>
              </button>
            </div>

            {/* Interactive Map Button */}
            <button
              type="button"
              onClick={() => navigate(`/trip/${trip.id}/map`)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-[#EAE6DD] hover:border-[#17201D] text-[#17201D] text-xs font-bold shadow-2xs transition-colors cursor-pointer"
            >
              <MapIcon className="w-3.5 h-3.5 text-[#FF6B4A]" />
              <span>Map</span>
            </button>

            {/* Smart Budget Tracker Button */}
            <button
              type="button"
              onClick={() => navigate(`/trip/${trip.id}/budget`)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-[#EAE6DD] hover:border-[#17201D] text-[#17201D] text-xs font-bold shadow-2xs transition-colors cursor-pointer"
            >
              <Wallet className="w-3.5 h-3.5 text-[#20B8A6]" />
              <span>Budget</span>
            </button>

            {/* Smart Calendar & Timeline Button */}
            <button
              type="button"
              onClick={() => navigate(`/trip/${trip.id}/calendar`)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-[#EAE6DD] hover:border-[#17201D] text-[#17201D] text-xs font-bold shadow-2xs transition-colors cursor-pointer"
            >
              <CalendarIcon className="w-3.5 h-3.5 text-[#E08A00]" />
              <span>Timeline</span>
            </button>

            {/* Save Button */}
            <button
              type="button"
              onClick={onSave}
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-[#EAE6DD] hover:border-[#17201D] text-[#17201D] text-xs sm:text-sm font-bold shadow-2xs transition-colors cursor-pointer"
            >
              <Save className="w-3.5 h-3.5 text-[#5E6B67]" />
              <span>Save</span>
            </button>

            {/* AI Optimize ✨ Button */}
            <button
              type="button"
              onClick={onOpenAIOptimize}
              className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full bg-gradient-to-r from-[#FF6B4A] via-[#FF7E5F] to-[#20B8A6] text-white text-xs sm:text-sm font-black shadow-md shadow-[#FF6B4A]/25 hover:shadow-lg hover:shadow-[#FF6B4A]/30 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#FFF275] animate-spin-slow" />
              <span>AI Optimize ✨</span>
            </button>
          </div>
        </div>

        {/* Main Heading & Concept */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-2 pt-1">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#17201D] tracking-tight">
              Build your itinerary
            </h1>
            <p className="text-xs sm:text-sm text-[#68736F] mt-0.5">
              Arrange your experiences into the perfect journey.
            </p>
          </div>

          {/* Mobile Quick Save */}
          <div className="flex sm:hidden items-center justify-between pt-1">
            <span className="text-[11px] text-[#838F8B]">
              {isSaving ? 'Autosaving...' : 'All changes saved locally'}
            </span>
            <button
              type="button"
              onClick={onSave}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white border border-[#EAE6DD] text-xs font-bold text-[#17201D]"
            >
              <Save className="w-3 h-3" />
              <span>Save</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
