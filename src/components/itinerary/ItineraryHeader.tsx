import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  Check,
  RotateCcw,
  Calendar as CalendarIcon,
  Clock,
  Save,
  Map as MapIcon,
  Wallet,
} from 'lucide-react';
import { Trip } from '../../types/trip';

interface ItineraryHeaderProps {
  trip: Trip;
  onSave: () => void;
  onUndo: () => void;
  canUndo: boolean;
  viewMode: 'timeline' | 'calendar';
  onViewModeChange: (mode: 'timeline' | 'calendar') => void;
}

export const ItineraryHeader: React.FC<ItineraryHeaderProps> = ({
  trip,
  onSave,
  onUndo,
  canUndo,
  viewMode,
  onViewModeChange,
}) => {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 bg-[#FFFDF8]/95 backdrop-blur-md border-b border-[#EAE6DD] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4">
        {/* Top Utility Row */}
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 mb-2 min-w-0">
          {/* Back button & Breadcrumb */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#EAE6DD] text-[#5E6B67] hover:text-[#17201D] hover:border-[#FF6B4A]/40 text-xs font-bold transition-colors cursor-pointer shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Dashboard</span>
            </button>

            <div className="hidden sm:flex items-center gap-2 text-xs text-[#838F8B]">
              <span>/</span>
                <span className="font-medium text-[#17201D] truncate max-w-[min(200px,25vw)]">
                {trip.name}
              </span>
              <span>/</span>
              <span className="font-semibold text-[#FF6B4A]">Itinerary Builder</span>
            </div>
          </div>

          {/* Right Action Group: Autosave, Undo, View Toggle, Save */}
          <div className="flex items-center justify-end flex-wrap gap-2 sm:gap-3 min-w-0 max-w-full">
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

            {/* Save Button */}
            <motion.button
              type="button"
              onClick={onSave}
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.96 }}
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-[#EAE6DD] hover:border-[#17201D] text-[#17201D] text-xs sm:text-sm font-bold shadow-2xs transition-colors cursor-pointer"
            >
              <Save className="w-3.5 h-3.5 text-[#5E6B67]" />
              <span>Save</span>
            </motion.button>

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
          <div className="flex sm:hidden items-center justify-end pt-1">
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
