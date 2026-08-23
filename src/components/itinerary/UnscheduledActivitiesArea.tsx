import React from 'react';
import {
  Layers,
  GripVertical,
  Calendar,
  Trash2,
  Clock,
  Wallet,
  MapPin,
  Plus,
} from 'lucide-react';
import { ItineraryActivity } from '../../types/itinerary';
import { getActivityImage, handleActivityImageError } from '../../utils/activityImage';

interface UnscheduledActivitiesAreaProps {
  activities: ItineraryActivity[];
  currency: string;
  onScheduleToDay: (activity: ItineraryActivity, dayNumber: number) => void;
  onRemove: (activityId: string) => void;
  availableDays: number[];
  onOpenAddDrawer: () => void;
}

export const UnscheduledActivitiesArea: React.FC<UnscheduledActivitiesAreaProps> = ({
  activities,
  currency,
  onScheduleToDay,
  onRemove,
  availableDays,
  onOpenAddDrawer,
}) => {
  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#EAE6DD] shadow-2xs">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#F4F1EA]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#F4F1EA] text-[#5E6B67] flex items-center justify-center">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-[#17201D]">
              Unscheduled Activities
            </h3>
            <p className="text-[11px] text-[#838F8B]">
              Saved spots waiting for a day placement
            </p>
          </div>
        </div>

        <span className="px-2.5 py-0.5 rounded-full bg-[#F4F1EA] text-[#5E6B67] text-xs font-bold">
          {activities.length} {activities.length === 1 ? 'spot' : 'spots'}
        </span>
      </div>

      {/* List */}
      {activities.length === 0 ? (
        <div className="text-center py-6 px-4 rounded-2xl bg-[#FAF9F5] border border-[#EAE6DD]/60">
          <p className="text-xs font-medium text-[#838F8B]">
            All saved activities are currently scheduled across your days!
          </p>
          <button
            type="button"
            onClick={onOpenAddDrawer}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 mt-2 rounded-full bg-white border border-[#EAE6DD] hover:border-[#FF6B4A]/30 text-xs font-bold text-[#FF6B4A] transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Browse Recommendations</span>
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {activities.map((act) => (
            <div
              key={act.id}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('text/plain', act.id);
                e.dataTransfer.setData(
                  'application/json',
                  JSON.stringify({ activityId: act.id, sourceDay: 0 })
                );
                e.dataTransfer.effectAllowed = 'move';
              }}
              className="group bg-[#FFFDF8] hover:bg-white rounded-2xl p-3 border border-[#EAE6DD] hover:border-[#FF6B4A]/40 shadow-2xs flex items-center justify-between gap-3 transition-all"
            >
              {/* Drag Handle + Image + Title */}
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div
                  className="text-[#A0AAA6] group-hover:text-[#5E6B67] cursor-grab active:cursor-grabbing p-1"
                  title="Drag to any Day"
                >
                  <GripVertical className="w-4 h-4" />
                </div>

                <div className="w-10 h-10 rounded-xl overflow-hidden bg-[#F4F1EA] shrink-0 border border-[#EAE6DD]/60">
                  <img
                    src={getActivityImage(act)}
                    alt={act.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                    onError={(event) => handleActivityImageError(event, act.category)}
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-[#17201D] truncate">
                    {act.title}
                  </h4>
                  <div className="flex items-center gap-2 text-[10px] text-[#838F8B] mt-0.5">
                    <span className="truncate max-w-[120px]">{act.location}</span>
                    <span>·</span>
                    <span>
                      {act.estimatedCost > 0
                        ? `${currency}${act.estimatedCost.toLocaleString()}`
                        : 'Free'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Move Select Dropdown */}
              <div className="flex items-center gap-1.5 shrink-0">
                <select
                  aria-label="Assign to day"
                  value=""
                  onChange={(e) => {
                    const dayNum = parseInt(e.target.value, 10);
                    if (dayNum) onScheduleToDay(act, dayNum);
                  }}
                  className="text-[11px] font-bold px-2 py-1 rounded-lg bg-white border border-[#EAE6DD] hover:border-[#FF6B4A]/40 text-[#17201D] focus:outline-none cursor-pointer"
                >
                  <option value="" disabled>
                    + Add to Day
                  </option>
                  {availableDays.map((d) => (
                    <option key={d} value={d}>
                      Day {d}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => onRemove(act.id)}
                  className="p-1.5 rounded-lg text-[#838F8B] hover:text-[#E55837] hover:bg-[#FFF0EC] transition-colors cursor-pointer"
                  title="Remove from unscheduled"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
