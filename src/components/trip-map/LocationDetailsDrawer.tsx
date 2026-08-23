import React from 'react';
import {
  X,
  Clock,
  MapPin,
  Calendar,
  Wallet,
  Sparkles,
  Edit3,
  ArrowRightLeft,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { MapMarkerLocation } from '../../types/map';
import { MAP_CONFIG, getDayColor } from '../../config/mapConfig';
import { getActivityImage, handleActivityImageError } from '../../utils/activityImage';

interface LocationDetailsDrawerProps {
  marker: MapMarkerLocation | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (marker: MapMarkerLocation) => void;
  onMove: (marker: MapMarkerLocation) => void;
  onRemove: (marker: MapMarkerLocation) => void;
}

export const LocationDetailsDrawer: React.FC<LocationDetailsDrawerProps> = ({
  marker,
  isOpen,
  onClose,
  onEdit,
  onMove,
  onRemove,
}) => {
  if (!isOpen || !marker) return null;

  const dayColor = getDayColor(marker.dayNumber);
  const category =
    MAP_CONFIG.categoryConfig[marker.category] || MAP_CONFIG.categoryConfig.place;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-xs z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Container (Side drawer on desktop, bottom sheet on mobile) */}
      <div className="fixed right-0 top-0 bottom-0 w-full sm:max-w-md bg-[#FFFDF8] border-l border-[#EAE6DD] shadow-2xl z-50 flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
        {/* Header Image & Close */}
        <div className="relative h-56 w-full bg-[#17201D] shrink-0">
          <img
            src={getActivityImage(marker)}
            alt={marker.name}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
            onError={(event) => handleActivityImageError(event, marker.category)}
          />

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Top Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/80 hover:bg-white text-[#17201D] shadow-md backdrop-blur-xs transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Overlay Badges */}
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className="px-2.5 py-1 rounded-full text-xs font-black text-white shadow-xs"
                style={{ backgroundColor: dayColor.primary }}
              >
                Day {marker.dayNumber} · Stop {marker.stopNumber}
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-white/90 text-[#17201D] backdrop-blur-xs shadow-xs">
                {category.emoji} {category.label}
              </span>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 font-sans">
          <div>
            <h2 className="text-xl font-black text-[#17201D] leading-tight">
              {marker.name}
            </h2>
            <p className="flex items-center gap-1.5 text-xs text-[#68736F] mt-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#FF6B4A]" />
              <span>{marker.location}</span>
            </p>
          </div>

          {/* Timing & Cost Quick Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3 rounded-xl bg-white border border-[#EAE6DD]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#838F8B]">
                Scheduled Time
              </span>
              <div className="flex items-center gap-1.5 text-sm font-bold text-[#17201D] mt-0.5">
                <Clock className="w-4 h-4 text-[#20B8A6]" />
                <span>{marker.startTime}</span>
                <span className="text-xs font-normal text-[#838F8B]">
                  ({marker.duration})
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white border border-[#EAE6DD]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#838F8B]">
                Estimated Cost
              </span>
              <div className="flex items-center gap-1.5 text-sm font-bold text-[#17201D] mt-0.5">
                <Wallet className="w-4 h-4 text-[#FF6B4A]" />
                <span>
                  {marker.estimatedCost > 0
                    ? `₹${marker.estimatedCost.toLocaleString()}`
                    : 'Free'}
                </span>
              </div>
            </div>
          </div>

          {/* Why Recommended / Description */}
          {marker.whyRecommended && (
            <div className="p-4 rounded-xl bg-[#FFF8ED] border border-[#FFE4DD]/80 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#FF6B4A]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Why It's Recommended</span>
              </div>
              <p className="text-xs text-[#5E6B67] leading-relaxed">
                {marker.whyRecommended}
              </p>
            </div>
          )}

          {/* Notes */}
          {marker.notes && marker.notes !== marker.whyRecommended && (
            <div className="p-4 rounded-xl bg-white border border-[#EAE6DD] space-y-1">
              <span className="text-[11px] font-bold text-[#838F8B] uppercase tracking-wider">
                Personal Notes
              </span>
              <p className="text-xs text-[#17201D] leading-relaxed">
                {marker.notes}
              </p>
            </div>
          )}

          {/* Coordinates Info */}
          <div className="p-3 rounded-xl bg-[#F9F7F1] border border-[#EAE6DD] flex items-center justify-between text-xs text-[#838F8B]">
            <span>
              GPS: {marker.latitude.toFixed(4)}, {marker.longitude.toFixed(4)}
            </span>
            <span className="font-semibold text-[#5E6B67]">Resolved Coordinates</span>
          </div>
        </div>

        {/* Bottom Actions Bar */}
        <div className="p-4 bg-white border-t border-[#EAE6DD] flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              onClose();
              onEdit(marker);
            }}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#17201D] hover:bg-[#FF6B4A] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Details</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onMove(marker);
            }}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-white border border-[#EAE6DD] hover:border-[#17201D] text-[#17201D] text-xs font-bold transition-colors cursor-pointer shadow-2xs"
            title="Move to another day"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-[#5E6B67]" />
            <span>Move</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onRemove(marker);
            }}
            className="p-2.5 rounded-xl bg-white border border-[#EAE6DD] hover:border-[#E55837] text-[#E55837] hover:bg-[#FFF0ED] text-xs font-bold transition-colors cursor-pointer shadow-2xs"
            title="Remove from itinerary"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  );
};
