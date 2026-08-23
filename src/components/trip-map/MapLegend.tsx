import React from 'react';
import { X } from 'lucide-react';
import { MAP_CONFIG } from '../../config/mapConfig';
import { ItineraryDay } from '../../types/itinerary';
import { getDayColor } from '../../config/mapConfig';

interface MapLegendProps {
  isOpen: boolean;
  onClose: () => void;
  days: ItineraryDay[];
}

export const MapLegend: React.FC<MapLegendProps> = ({
  isOpen,
  onClose,
  days,
}) => {
  if (!isOpen) return null;

  return (
    <div className="rounded-2xl bg-white/95 backdrop-blur-md border border-[#EAE6DD] shadow-xl p-4 w-64 text-left font-sans animate-in fade-in zoom-in-95 duration-200">
      <div className="flex items-center justify-between pb-2 border-b border-[#F4F1EA]">
        <h4 className="text-xs font-extrabold text-[#17201D] uppercase tracking-wider">
          Map Legend
        </h4>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-md text-[#838F8B] hover:text-[#17201D] hover:bg-[#F4F1EA] transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Categories */}
      <div className="mt-2.5 space-y-1.5">
        <span className="text-[10px] font-bold text-[#838F8B] uppercase">Categories</span>
        <div className="space-y-1">
          {Object.entries(MAP_CONFIG.categoryConfig).map(([key, cat]) => (
            <div key={key} className="flex items-center gap-2 text-xs text-[#17201D]">
              <span className="text-sm">{cat.emoji}</span>
              <span>{cat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Days Indicators */}
      <div className="mt-3.5 pt-2.5 border-t border-[#F4F1EA] space-y-1.5">
        <span className="text-[10px] font-bold text-[#838F8B] uppercase">Day Colors</span>
        <div className="grid grid-cols-2 gap-1.5 max-h-32 overflow-y-auto no-scrollbar">
          {days.map((day) => {
            const color = getDayColor(day.dayNumber);
            return (
              <div key={day.id || day.dayNumber} className="flex items-center gap-1.5 text-xs text-[#5E6B67]">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs"
                  style={{ backgroundColor: color.primary }}
                />
                <span className="truncate">Day {day.dayNumber}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
