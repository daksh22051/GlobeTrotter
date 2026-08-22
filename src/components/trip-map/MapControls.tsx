import React, { useState } from 'react';
import {
  Plus,
  Minus,
  Maximize2,
  Crosshair,
  Info,
  Layers,
  MapPin,
} from 'lucide-react';
import { UserCurrentLocation } from '../../types/map';

interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onRecenter: () => void;
  onLocateMe: () => void;
  isLocating: boolean;
  onToggleLegend: () => void;
  isLegendOpen: boolean;
}

export const MapControls: React.FC<MapControlsProps> = ({
  onZoomIn,
  onZoomOut,
  onRecenter,
  onLocateMe,
  isLocating,
  onToggleLegend,
  isLegendOpen,
}) => {
  return (
    <div className="flex flex-col gap-2 z-20">
      {/* Zoom Controls Card */}
      <div className="flex flex-col rounded-xl bg-white/95 backdrop-blur-md border border-[#EAE6DD] shadow-lg overflow-hidden">
        <button
          type="button"
          onClick={onZoomIn}
          className="p-2.5 hover:bg-[#F9F7F1] text-[#17201D] transition-colors border-b border-[#EAE6DD] cursor-pointer"
          title="Zoom In"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={onZoomOut}
          className="p-2.5 hover:bg-[#F9F7F1] text-[#17201D] transition-colors cursor-pointer"
          title="Zoom Out"
        >
          <Minus className="w-4 h-4" />
        </button>
      </div>

      {/* Recenter / Fit Bounds Button */}
      <button
        type="button"
        onClick={onRecenter}
        className="p-2.5 rounded-xl bg-white/95 backdrop-blur-md border border-[#EAE6DD] hover:border-[#17201D] text-[#17201D] shadow-lg transition-all cursor-pointer hover:scale-105"
        title="Recenter & Fit Route"
      >
        <Maximize2 className="w-4 h-4 text-[#5E6B67]" />
      </button>

      {/* My Location Button */}
      <button
        type="button"
        onClick={onLocateMe}
        className={`p-2.5 rounded-xl bg-white/95 backdrop-blur-md border shadow-lg transition-all cursor-pointer hover:scale-105 ${
          isLocating
            ? 'border-[#0284C7] text-[#0284C7] bg-[#E0F2FE]'
            : 'border-[#EAE6DD] text-[#5E6B67] hover:border-[#17201D] hover:text-[#17201D]'
        }`}
        title="My Location"
      >
        <Crosshair className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
      </button>

      {/* Legend Toggle Button */}
      <button
        type="button"
        onClick={onToggleLegend}
        className={`p-2.5 rounded-xl bg-white/95 backdrop-blur-md border shadow-lg transition-all cursor-pointer hover:scale-105 ${
          isLegendOpen
            ? 'border-[#FF6B4A] text-[#FF6B4A] bg-[#FFF0ED]'
            : 'border-[#EAE6DD] text-[#5E6B67] hover:border-[#17201D] hover:text-[#17201D]'
        }`}
        title="Map Legend"
      >
        <Info className="w-4 h-4" />
      </button>
    </div>
  );
};
