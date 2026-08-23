import React, { useState } from 'react';
import {
  Plus,
  Minus,
  Maximize2,
  Crosshair,
  Info,
  Layers,
  Route,
  Eye,
  EyeOff,
  Hotel,
  Utensils,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { MapCategoryFilter, RouteDisplayMode } from '../../types/map';

interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onRecenter: () => void;
  onLocateMe: () => void;
  isLocating: boolean;
  onToggleLegend: () => void;
  isLegendOpen: boolean;
  categoryFilter?: MapCategoryFilter;
  onCategoryFilterChange?: (filter: MapCategoryFilter) => void;
  routeDisplayMode?: RouteDisplayMode;
  onRouteChangeMode?: (mode: RouteDisplayMode) => void;
}

export const MapControls: React.FC<MapControlsProps> = ({
  onZoomIn,
  onZoomOut,
  onRecenter,
  onLocateMe,
  isLocating,
  onToggleLegend,
  isLegendOpen,
  categoryFilter = 'all',
  onCategoryFilterChange,
  routeDisplayMode = 'active_day',
  onRouteChangeMode,
}) => {
  const [isLayersOpen, setIsLayersOpen] = useState(false);

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

      {/* Layer Filter Toggle Button */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsLayersOpen(!isLayersOpen)}
          className={`p-2.5 rounded-xl bg-white/95 backdrop-blur-md border shadow-lg transition-all cursor-pointer hover:scale-105 ${
            isLayersOpen || categoryFilter !== 'all' || routeDisplayMode !== 'active_day'
              ? 'border-[#FF6B4A] text-[#FF6B4A] bg-[#FFF0ED]'
              : 'border-[#EAE6DD] text-[#5E6B67] hover:border-[#17201D] hover:text-[#17201D]'
          }`}
          title="Map Layers & Route Filter"
        >
          <Layers className="w-4 h-4" />
        </button>

        {/* Layers Popup Menu */}
        {isLayersOpen && (
          <div className="absolute right-12 top-0 w-64 bg-white/98 backdrop-blur-lg border border-[#EAE6DD] rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-[#F4F1EA]">
              <span className="text-xs font-black text-[#17201D] uppercase tracking-wider">Map Layers</span>
              <button
                type="button"
                onClick={() => setIsLayersOpen(false)}
                className="text-[10px] text-[#838F8B] hover:text-[#17201D] font-bold cursor-pointer"
              >
                Done
              </button>
            </div>

            {/* Place Categories Filter */}
            <div className="mt-2.5">
              <label className="text-[10px] font-bold text-[#838F8B] uppercase tracking-wider block mb-1.5">
                Filter Places
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'all', label: 'All Places', icon: Sparkles },
                  { id: 'hotel', label: 'Hotels Only', icon: Hotel },
                  { id: 'place', label: 'Attractions', icon: MapPin },
                  { id: 'food', label: 'Food & Dining', icon: Utensils },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = categoryFilter === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onCategoryFilterChange?.(item.id as MapCategoryFilter)}
                      className={`flex items-center gap-1.5 px-2 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#17201D] text-white shadow-xs'
                          : 'bg-[#FDFBF7] hover:bg-[#F4F1EA] text-[#5E6B67] border border-[#EAE6DD]'
                      }`}
                    >
                      <Icon className="w-3 h-3" />
                      <span className="text-[11px] truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Route Lines Visibility Toggle */}
            <div className="mt-3 pt-2.5 border-t border-[#F4F1EA]">
              <label className="text-[10px] font-bold text-[#838F8B] uppercase tracking-wider block mb-1.5">
                Route Display Mode
              </label>
              <div className="flex flex-col gap-1">
                {[
                  { id: 'active_day', label: 'Active Day Route (Clean)', icon: Route, desc: 'Avoids visual clutter' },
                  { id: 'all_days', label: 'Show All Routes', icon: Eye, desc: 'Connects all stops' },
                  { id: 'none', label: 'Hide Routes', icon: EyeOff, desc: 'Markers only' },
                ].map((mode) => {
                  const Icon = mode.icon;
                  const isSelected = routeDisplayMode === mode.id;
                  return (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => onRouteChangeMode?.(mode.id as RouteDisplayMode)}
                      className={`flex items-center justify-between p-2 rounded-xl text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#FFF2EE] border border-[#FF6B4A]/40 text-[#FF6B4A]'
                          : 'hover:bg-[#F9F7F1] text-[#5E6B67]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-[#FF6B4A]' : 'text-[#838F8B]'}`} />
                        <div>
                          <p className="text-xs font-bold text-[#17201D]">{mode.label}</p>
                          <p className="text-[10px] text-[#838F8B]">{mode.desc}</p>
                        </div>
                      </div>
                      {isSelected && <div className="w-2 h-2 rounded-full bg-[#FF6B4A]"></div>}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

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
