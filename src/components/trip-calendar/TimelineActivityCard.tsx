import React from 'react';
import {
  Clock,
  MapPin,
  Wallet,
  Landmark,
  Utensils,
  Hotel,
  Compass,
  AlertTriangle,
  Map as MapIcon,
  Edit2,
  ArrowRightLeft,
  Trash2,
  GripVertical,
  ExternalLink,
  Info,
} from 'lucide-react';
import { ItineraryActivity, ItineraryConflict } from '../../types/itinerary';
import { formatTimeDisplay, calculateEndTime } from '../../utils/itineraryConflictDetector';
import { formatCurrency } from '../../utils/currency';
import { getActivityImage, handleActivityImageError } from '../../utils/activityImage';

interface TimelineActivityCardProps {
  activity: ItineraryActivity;
  dayNumber: number;
  currency: string;
  conflict?: ItineraryConflict;
  onEdit: (activity: ItineraryActivity) => void;
  onMove: (activity: ItineraryActivity) => void;
  onDelete: (activity: ItineraryActivity) => void;
  onViewOnMap: (activity: ItineraryActivity) => void;
  onFixConflict?: (activity: ItineraryActivity) => void;
  isDraggable?: boolean;
  onDragStart?: (e: React.DragEvent, activityId: string, dayNumber: number) => void;
}

export const TimelineActivityCard: React.FC<TimelineActivityCardProps> = ({
  activity,
  dayNumber,
  currency,
  conflict,
  onEdit,
  onMove,
  onDelete,
  onViewOnMap,
  onFixConflict,
  isDraggable = true,
  onDragStart,
}) => {
  const endTime = calculateEndTime(activity.startTime, activity.durationMinutes || 60);

  // Category Icon & Styling
  const getCategoryConfig = (cat: string) => {
    switch (cat) {
      case 'food':
        return {
          icon: Utensils,
          label: 'Dining & Food',
          bg: 'bg-[#FFF3D6]',
          text: 'text-[#D97706]',
          border: 'border-[#FDE68A]',
          dot: 'bg-[#D97706]',
        };
      case 'hotel':
        return {
          icon: Hotel,
          label: 'Accommodation',
          bg: 'bg-[#EBF5FB]',
          text: 'text-[#2E86DE]',
          border: 'border-[#BDC3C7]',
          dot: 'bg-[#2E86DE]',
        };
      case 'experience':
        return {
          icon: Compass,
          label: 'Experience',
          bg: 'bg-[#F3E8FF]',
          text: 'text-[#9333EA]',
          border: 'border-[#E9D5FF]',
          dot: 'bg-[#9333EA]',
        };
      case 'place':
      default:
        return {
          icon: Landmark,
          label: 'Sight & Culture',
          bg: 'bg-[#FFEAE5]',
          text: 'text-[#FF6B4A]',
          border: 'border-[#FFD0C6]',
          dot: 'bg-[#FF6B4A]',
        };
    }
  };

  const catConfig = getCategoryConfig(activity.category);
  const CatIcon = catConfig.icon;
  const hasConflict = !!conflict;
  const isErrorConflict = conflict?.severity === 'error';

  return (
    <div
      draggable={isDraggable}
      onDragStart={(e) => onDragStart && onDragStart(e, activity.id, dayNumber)}
      className="relative pl-8 sm:pl-10 my-3 group"
    >
      {/* Continuous Timeline Vertical Line */}
      <div className="absolute left-3.5 sm:left-4.5 top-0 bottom-0 w-0.5 bg-[#EAE6DD]" />

      {/* Timeline Node / Circle Indicator */}
      <div
        className={`absolute left-2 sm:left-3 top-5 w-3.5 h-3.5 rounded-full border-2 border-white shadow-xs transition-transform group-hover:scale-125 z-10 ${
          hasConflict
            ? isErrorConflict
              ? 'bg-[#D9534F] ring-2 ring-[#FF6B4A]/30'
              : 'bg-[#F39C12] ring-2 ring-[#F39C12]/30'
            : catConfig.dot
        }`}
      />

      {/* Main Card Container */}
      <div
        className={`rounded-2xl border bg-white transition-all duration-200 overflow-hidden shadow-2xs hover:shadow-md ${
          hasConflict
            ? isErrorConflict
              ? 'border-[#FF6B4A] bg-[#FFFBFB]'
              : 'border-[#F1C40F] bg-[#FFFEFA]'
            : 'border-[#EAE6DD] hover:border-[#17201D]'
        }`}
      >
        {/* Conflict Warning Banner (if overlapping) */}
        {hasConflict && (
          <div
            className={`px-4 py-2 border-b flex items-center justify-between gap-2 text-xs ${
              isErrorConflict
                ? 'bg-[#FFEAE5] border-[#FFD0C6] text-[#D9534F]'
                : 'bg-[#FFF3D6] border-[#FFE58F] text-[#B7791F]'
            }`}
          >
            <div className="flex items-center gap-1.5 font-bold">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>{conflict?.message || 'Schedule conflict detected'}</span>
            </div>

            <button
              type="button"
              onClick={() => (onFixConflict ? onFixConflict(activity) : onEdit(activity))}
              className="px-2.5 py-0.5 rounded-lg bg-white font-extrabold text-[11px] hover:shadow-2xs border border-current transition-all cursor-pointer"
            >
              Fix Schedule
            </button>
          </div>
        )}

        <div className="p-3.5 sm:p-4.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Left: Thumbnail & Core Details */}
          <div className="flex items-start gap-3.5 min-w-0 flex-1">
            {/* Drag Handle */}
            <div
              className="hidden sm:flex items-center justify-center text-[#838F8B] hover:text-[#17201D] cursor-grab active:cursor-grabbing self-center pr-1"
              title="Drag to reorder or move across days"
            >
              <GripVertical className="w-4 h-4" />
            </div>

            {/* Thumbnail Image */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-[#F4F1EA] shrink-0 border border-[#EAE6DD]/80">
              <img
                src={getActivityImage(activity)}
                alt={activity.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                referrerPolicy="no-referrer"
                loading="lazy"
                onError={(event) => handleActivityImageError(event, activity.category)}
              />
            </div>

            {/* Information */}
            <div className="min-w-0 flex-1">
              {/* Category & Time Tag */}
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wide border ${catConfig.bg} ${catConfig.text} ${catConfig.border}`}
                >
                  <CatIcon className="w-3 h-3" />
                  <span>{catConfig.label}</span>
                </span>

                <span className="inline-flex items-center gap-1 text-xs font-black text-[#17201D] bg-[#F4F1EA] px-2 py-0.5 rounded-md border border-[#EAE6DD]">
                  <Clock className="w-3 h-3 text-[#FF6B4A]" />
                  <span>
                    {formatTimeDisplay(activity.startTime)} – {formatTimeDisplay(endTime)}
                  </span>
                </span>

                <span className="text-[11px] text-[#556960] font-medium hidden md:inline">
                  ({activity.duration || `${activity.durationMinutes}m`})
                </span>
              </div>

              {/* Title */}
              <h4 className="text-sm sm:text-base font-extrabold text-[#17201D] tracking-tight truncate">
                {activity.title}
              </h4>

              {/* Location & Cost Details */}
              <div className="flex items-center gap-3 text-xs text-[#556960] mt-1 flex-wrap">
                <span className="inline-flex items-center gap-1 truncate max-w-[200px] sm:max-w-xs">
                  <MapPin className="w-3.5 h-3.5 text-[#838F8B] shrink-0" />
                  <span className="truncate">{activity.location}</span>
                </span>

                <span className="inline-flex items-center gap-1 font-semibold text-[#17201D]">
                  <Wallet className="w-3.5 h-3.5 text-[#20B8A6] shrink-0" />
                  <span>
                    {activity.estimatedCost > 0
                      ? formatCurrency(activity.estimatedCost, activity.currency || currency)
                      : 'Free'}
                  </span>
                </span>

                {activity.bookingReference && (
                  <span className="text-[10px] text-[#2E86DE] bg-[#EBF5FB] px-2 py-0.5 rounded-md font-semibold border border-[#BDC3C7]">
                    Ref: {activity.bookingReference}
                  </span>
                )}
              </div>

              {/* Notes excerpt if any */}
              {activity.notes && (
                <p className="text-[11px] text-[#838F8B] line-clamp-1 mt-1 italic">
                  "{activity.notes}"
                </p>
              )}
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#EAE6DD] w-full sm:w-auto justify-end">
            {/* View on Map */}
            <button
              type="button"
              onClick={() => onViewOnMap(activity)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white border border-[#EAE6DD] hover:border-[#17201D] hover:bg-[#F9F7F1] text-xs font-bold text-[#17201D] transition-colors cursor-pointer shadow-2xs"
              title="View on Interactive Map"
            >
              <MapIcon className="w-3.5 h-3.5 text-[#FF6B4A]" />
              <span className="hidden md:inline">Map</span>
            </button>

            {/* Edit Schedule / Activity */}
            <button
              type="button"
              onClick={() => onEdit(activity)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white border border-[#EAE6DD] hover:border-[#17201D] hover:bg-[#F9F7F1] text-xs font-bold text-[#17201D] transition-colors cursor-pointer shadow-2xs"
              title="Edit Schedule & Details"
            >
              <Edit2 className="w-3.5 h-3.5 text-[#556960]" />
              <span className="hidden md:inline">Edit</span>
            </button>

            {/* Move */}
            <button
              type="button"
              onClick={() => onMove(activity)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white border border-[#EAE6DD] hover:border-[#17201D] hover:bg-[#F9F7F1] text-xs font-bold text-[#17201D] transition-colors cursor-pointer shadow-2xs"
              title="Move to another Day"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-[#556960]" />
              <span className="hidden md:inline">Move</span>
            </button>

            {/* Delete */}
            <button
              type="button"
              onClick={() => onDelete(activity)}
              className="p-1.5 rounded-xl bg-white border border-[#EAE6DD] hover:border-[#D9534F] hover:bg-[#FFEAE5] text-[#838F8B] hover:text-[#D9534F] transition-colors cursor-pointer shadow-2xs"
              title="Remove Activity"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
