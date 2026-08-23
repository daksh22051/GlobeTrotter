import React, { useState, useRef } from 'react';
import { motion, useMotionValue, useTransform } from 'motion/react';
import {
  GripVertical,
  MapPin,
  Wallet,
  MoreVertical,
  Edit2,
  Copy,
  Trash2,
  ArrowRightLeft,
  AlertTriangle,
  Compass,
  Utensils,
  Hotel,
  Landmark,
  ExternalLink,
  Check,
} from 'lucide-react';
import { ItineraryActivity, ItineraryConflict } from '../../types/itinerary';
import { formatTimeDisplay, calculateEndTime } from '../../utils/itineraryConflictDetector';
import { getActivityImage, handleActivityImageError } from '../../utils/activityImage';

interface ActivityCardProps {
  activity: ItineraryActivity;
  index: number;
  dayNumber: number;
  conflict?: ItineraryConflict;
  onEdit: (activity: ItineraryActivity) => void;
  onDuplicate: (activityId: string) => void;
  onRemove: (activityId: string) => void;
  onMoveToDay: (activity: ItineraryActivity) => void;
  onDragStart: (e: React.DragEvent, activityId: string, sourceDay: number) => void;
  onDragEnd: (e: React.DragEvent) => void;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({
  activity,
  index,
  dayNumber,
  conflict,
  onEdit,
  onDuplicate,
  onRemove,
  onMoveToDay,
  onDragStart,
  onDragEnd,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const pointerX = useMotionValue(0.5);
  const pointerY = useMotionValue(0.5);
  const rotateX = useTransform(pointerY, [0, 1], [4, -4]);
  const rotateY = useTransform(pointerX, [0, 1], [-4, 4]);

  // Close menu on click outside
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  // Category Icon & Accent Colors
  const getCategoryMeta = () => {
    switch (activity.category) {
      case 'food':
        return {
          icon: <Utensils className="w-3.5 h-3.5" />,
          label: 'Food & Dining',
          badgeColor: 'text-[#E55837] bg-[#FFF2EE] border-[#FF6B4A]/20',
          dotColor: 'bg-[#FF6B4A]',
        };
      case 'hotel':
        return {
          icon: <Hotel className="w-3.5 h-3.5" />,
          label: 'Stay / Accommodation',
          badgeColor: 'text-[#179E8E] bg-[#EAF8F5] border-[#20B8A6]/20',
          dotColor: 'bg-[#20B8A6]',
        };
      case 'experience':
        return {
          icon: <Compass className="w-3.5 h-3.5" />,
          label: 'Experience',
          badgeColor: 'text-[#B45309] bg-[#FFF8E7] border-[#F59E0B]/20',
          dotColor: 'bg-[#F59E0B]',
        };
      case 'place':
      default:
        return {
          icon: <Landmark className="w-3.5 h-3.5" />,
          label: 'Attraction / Sight',
          badgeColor: 'text-[#2563EB] bg-[#EFF6FF] border-[#3B82F6]/20',
          dotColor: 'bg-[#3B82F6]',
        };
    }
  };

  const categoryMeta = getCategoryMeta();

  // Calculated End Time
  const endTimeStr = activity.startTime
    ? calculateEndTime(activity.startTime, activity.durationMinutes || 90)
    : '';

  const costDisplay =
    activity.estimatedCost > 0
      ? `${activity.currency || '₹'}${activity.estimatedCost.toLocaleString()}`
      : 'Free';

  const handleDragStartInternal = (e: React.DragEvent) => {
    setIsDragging(true);
    e.dataTransfer.setData('text/plain', activity.id);
    e.dataTransfer.setData('application/json', JSON.stringify({ activityId: activity.id, sourceDay: dayNumber }));
    e.dataTransfer.effectAllowed = 'move';
    onDragStart(e, activity.id, dayNumber);
  };

  const handleDragEndInternal = (e: React.DragEvent) => {
    setIsDragging(false);
    onDragEnd(e);
  };

  const handlePointerMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const bounds = e.currentTarget.getBoundingClientRect();
    pointerX.set((e.clientX - bounds.left) / bounds.width);
    pointerY.set((e.clientY - bounds.top) / bounds.height);
  };

  const resetPointer = () => {
    pointerX.set(0.5);
    pointerY.set(0.5);
  };

  return (
    <motion.div
      draggable
      onDragStart={handleDragStartInternal}
      onDragEnd={handleDragEndInternal}
      onMouseMove={handlePointerMove}
      onMouseLeave={resetPointer}
      initial={{ opacity: 0, y: 14, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.06, 0.36), ease: 'easeOut' }}
      style={{ rotateX, rotateY, transformPerspective: 1000 }}
      className={`group relative rounded-2xl border bg-white/95 backdrop-blur-sm transition-[border-color,box-shadow,opacity] duration-200 ${
        conflict
          ? conflict.severity === 'error'
            ? 'border-[#FF8E72] shadow-[0_10px_30px_rgba(255,107,74,0.16)]'
            : 'border-[#F3C15D] shadow-[0_10px_30px_rgba(224,138,0,0.14)]'
          : 'border-[#DDE7E3] shadow-[0_6px_20px_rgba(23,32,29,0.06)] hover:border-[#20B8A6]/60 hover:shadow-[0_14px_32px_rgba(32,184,166,0.14)]'
      } ${isDragging ? 'opacity-40 scale-[0.98] border-dashed border-[#FF6B4A]' : ''}`}
    >
      <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Left Section: Drag Handle + Time + Thumb + Info */}
        <div className="flex items-start gap-3 w-full sm:w-auto flex-1">
          {/* Drag Handle */}
          <div
            className="mt-1 sm:mt-0 p-1.5 rounded-lg text-[#A0AAA6] group-hover:text-[#5E6B67] hover:bg-[#F4F1EA] cursor-grab active:cursor-grabbing transition-colors shrink-0"
            title="Drag to move"
          >
            <GripVertical className="w-4 h-4" />
          </div>

          {/* Time Block (Desktop / Tablet) */}
          {activity.startTime && (
            <div className="hidden sm:flex flex-col items-center justify-center px-2.5 py-1.5 rounded-xl bg-[#F9F7F1] border border-[#EAE6DD] min-w-[76px] text-center shrink-0">
              <span className="text-xs font-black text-[#17201D] leading-tight">
                {formatTimeDisplay(activity.startTime)}
              </span>
              <span className="text-[10px] text-[#838F8B] font-medium leading-tight mt-0.5">
                to {formatTimeDisplay(endTimeStr)}
              </span>
            </div>
          )}

          {/* Activity Image Thumbnail */}
          <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-xl overflow-hidden bg-[#F4F1EA] border border-[#EAE6DD] shrink-0">
            <img
              src={getActivityImage(activity)}
              alt={activity.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(event) => handleActivityImageError(event, activity.category)}
            />
            {activity.isCopied && (
              <span className="absolute top-1 left-1 px-1.5 py-0.2 rounded bg-[#17201D]/80 text-white text-[9px] font-bold">
                Copy
              </span>
            )}
          </div>

          {/* Activity Details */}
          <div className="flex-1 min-w-0">
            {/* Top Tag & Time for Mobile */}
            <div className="flex items-center flex-wrap gap-2 mb-1">
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${categoryMeta.badgeColor}`}
              >
                {categoryMeta.icon}
                <span>{categoryMeta.label}</span>
              </span>

              {/* Mobile Time */}
              {activity.startTime && (
                <span className="sm:hidden text-[11px] font-bold text-[#17201D] bg-[#F4F1EA] px-2 py-0.5 rounded-md">
                  {formatTimeDisplay(activity.startTime)} - {formatTimeDisplay(endTimeStr)}
                </span>
              )}
            </div>

            {/* Title */}
            <h3 className="text-sm sm:text-base font-extrabold text-[#17201D] truncate max-w-full">
              {activity.title}
            </h3>

            {/* Meta Row: Location & Cost */}
            <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-xs text-[#68736F] mt-1">
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#FF6B4A] shrink-0" />
                <span className="truncate max-w-[130px] sm:max-w-[200px]">{activity.location}</span>
              </div>

              <div className="flex items-center gap-1 font-semibold text-[#17201D]">
                <Wallet className="w-3 h-3 text-[#20B8A6] shrink-0" />
                <span>{costDisplay}</span>
              </div>
            </div>

            {/* User Notes Preview if present */}
            {activity.notes && (
              <p className="text-[11px] text-[#838F8B] line-clamp-1 mt-1 italic">
                "{activity.notes}"
              </p>
            )}
          </div>
        </div>

        {/* Right Section: Conflict Badge & Actions */}
        <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto border-t sm:border-t-0 pt-2 sm:pt-0 border-[#F4F1EA]">
          {/* Conflict Pill if present */}
          {conflict && (
            <button
              type="button"
              className={`inline-flex items-center justify-center p-2 rounded-lg text-xs font-bold border cursor-help ${
                conflict.severity === 'error'
                  ? 'bg-[#FFF0EC] text-[#E55837] border-[#FF6B4A]/25'
                  : 'bg-[#FFF8E7] text-[#B45309] border-[#FFB020]/25'
              }`}
              title={conflict.description}
              aria-label={`${conflict.type === 'overlap' ? 'Conflict' : 'Tight schedule'}: ${conflict.description}`}
            >
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            </button>
          )}

          {/* Quick Edit button */}
          <button
            type="button"
            onClick={() => onEdit(activity)}
            className="p-2 rounded-xl text-[#5E6B67] hover:text-[#17201D] hover:bg-[#F4F1EA] transition-colors cursor-pointer"
            title="Edit Activity"
          >
            <Edit2 className="w-4 h-4" />
          </button>

          {/* More Menu Trigger & Dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-xl text-[#5E6B67] hover:text-[#17201D] hover:bg-[#F4F1EA] transition-colors cursor-pointer"
              title="More actions"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-44 bg-white rounded-2xl border border-[#EAE6DD] shadow-lg py-1.5 z-20 text-xs font-semibold text-[#17201D] animate-in fade-in zoom-in-95">
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onEdit(activity);
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-[#F9F7F1] text-left transition-colors cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5 text-[#5E6B67]" />
                  <span>Edit Details</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onMoveToDay(activity);
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-[#F9F7F1] text-left transition-colors cursor-pointer"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5 text-[#5E6B67]" />
                  <span>Move to Day...</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onDuplicate(activity.id);
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-[#F9F7F1] text-left transition-colors cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5 text-[#5E6B67]" />
                  <span>Duplicate</span>
                </button>

                <div className="h-px bg-[#F0ECE1] my-1" />

                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onRemove(activity.id);
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-[#FFF0EC] text-[#E55837] text-left transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Inline Conflict Warning Banner if active */}
      {conflict && (
        <div
          className={`px-4 py-2 border-t text-xs flex items-center gap-2 rounded-b-2xl ${
            conflict.severity === 'error'
              ? 'bg-[#FFF5F2] border-[#FF6B4A]/20 text-[#D84928]'
              : 'bg-[#FFFBF0] border-[#FFB020]/20 text-[#A66D03]'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          <span className="flex-1">{conflict.description}</span>
        </div>
      )}
    </motion.div>
  );
};
