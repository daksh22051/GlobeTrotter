import React from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Wallet,
  HeartPulse,
  Plus,
  Map as MapIcon,
  Sparkles,
  Train,
  ChevronRight,
  Edit2,
  Trash2,
  ArrowRightLeft,
} from 'lucide-react';
import {
  ItineraryDay,
  ItineraryActivity,
  DayHealthResult,
} from '../../types/itinerary';
import { formatTimeDisplay, calculateEndTime } from '../../utils/itineraryConflictDetector';
import { formatCurrency } from '../../utils/currency';
import { formatTravelTime } from '../../utils/travelTimeEstimator';

interface DayDetailsPanelProps {
  day: ItineraryDay;
  health: DayHealthResult;
  currency: string;
  onAddActivity: (dayNumber: number) => void;
  onViewOnMap: (activity?: ItineraryActivity) => void;
  onEditActivity: (activity: ItineraryActivity) => void;
  onMoveActivity: (activity: ItineraryActivity) => void;
  onDeleteActivity: (activity: ItineraryActivity) => void;
  onOptimizeDay?: (dayNumber: number) => void;
}

export const DayDetailsPanel: React.FC<DayDetailsPanelProps> = ({
  day,
  health,
  currency,
  onAddActivity,
  onViewOnMap,
  onEditActivity,
  onMoveActivity,
  onDeleteActivity,
  onOptimizeDay,
}) => {
  const activities = (day.activities || []).filter((a) => a.status !== 'Unscheduled');

  const getHealthBadge = (status: string) => {
    switch (status) {
      case 'Excellent':
        return 'bg-[#E8F8F5] text-[#20B8A6] border-[#20B8A6]/30';
      case 'Busy':
        return 'bg-[#FFF3D6] text-[#D97706] border-[#FDE68A]';
      case 'Overloaded':
        return 'bg-[#FFEAE5] text-[#D9534F] border-[#FF6B4A]/30';
      case 'Balanced':
      default:
        return 'bg-[#EBF5FB] text-[#2E86DE] border-[#BDC3C7]';
    }
  };

  return (
    <div className="bg-[#FFFDF8] rounded-3xl border border-[#EAE6DD] p-5 shadow-2xs space-y-4">
      {/* Header Info */}
      <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#EAE6DD]">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-[#17201D] text-white text-xs font-black">
              Day {day.dayNumber}
            </span>
            <h3 className="text-base font-black text-[#17201D]">
              {day.dateDisplay || `Day ${day.dayNumber}`}
            </h3>
          </div>
          {day.theme && (
            <p className="text-xs text-[#556960] mt-0.5 font-medium">{day.theme}</p>
          )}
        </div>

        {/* Health Badge */}
        <div
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black border ${getHealthBadge(
            health.status
          )}`}
        >
          <HeartPulse className="w-3.5 h-3.5" />
          <span>{health.score}%</span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="p-2.5 rounded-2xl bg-[#FAF7EE] border border-[#EAE6DD]">
          <span className="text-[10px] text-[#838F8B] font-bold block uppercase">Activities</span>
          <span className="text-sm font-black text-[#17201D]">{activities.length}</span>
        </div>

        <div className="p-2.5 rounded-2xl bg-[#FAF7EE] border border-[#EAE6DD]">
          <span className="text-[10px] text-[#838F8B] font-bold block uppercase">Travel</span>
          <span className="text-sm font-black text-[#17201D]">
            {formatTravelTime(health.totalTravelMinutes)}
          </span>
        </div>

        <div className="p-2.5 rounded-2xl bg-[#FAF7EE] border border-[#EAE6DD]">
          <span className="text-[10px] text-[#838F8B] font-bold block uppercase">Est. Cost</span>
          <span className="text-sm font-black text-[#17201D]">
            {formatCurrency(health.totalCost, currency)}
          </span>
        </div>
      </div>

      {/* Primary Actions */}
      <div className="flex items-center gap-2 pt-1">
        <button
          type="button"
          onClick={() => onAddActivity(day.dayNumber)}
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#17201D] text-white hover:bg-[#2A3833] text-xs font-bold transition-all shadow-2xs cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 text-[#FF6B4A]" />
          <span>Add Activity</span>
        </button>

        <button
          type="button"
          onClick={() => onViewOnMap()}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-[#EAE6DD] text-[#17201D] hover:border-[#17201D] text-xs font-bold transition-all shadow-2xs cursor-pointer"
          title="View Day on Map"
        >
          <MapIcon className="w-3.5 h-3.5 text-[#FF6B4A]" />
          <span>View on Map</span>
        </button>
      </div>

      {/* Day's Activities List */}
      <div className="space-y-2 pt-2 border-t border-[#EAE6DD]">
        <span className="text-xs font-black text-[#17201D] block">
          Day {day.dayNumber} Schedule ({activities.length})
        </span>

        {activities.length === 0 ? (
          <p className="text-xs text-[#838F8B] py-3 text-center italic">
            No experiences added for this day yet.
          </p>
        ) : (
          <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
            {activities.map((act) => {
              const end = calculateEndTime(act.startTime, act.durationMinutes || 60);

              return (
                <div
                  key={act.id}
                  className="p-3 rounded-2xl bg-white border border-[#EAE6DD] hover:border-[#17201D] transition-all flex items-center justify-between gap-2 shadow-2xs"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#FF6B4A]">
                      <Clock className="w-3 h-3" />
                      <span>
                        {formatTimeDisplay(act.startTime)} – {formatTimeDisplay(end)}
                      </span>
                    </div>

                    <h5 className="text-xs font-black text-[#17201D] truncate mt-0.5">
                      {act.title}
                    </h5>

                    <p className="text-[10px] text-[#556960] truncate">{act.location}</p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => onEditActivity(act)}
                      className="p-1 rounded-lg text-[#838F8B] hover:text-[#17201D] hover:bg-[#F4F1EA]"
                      title="Edit Activity"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onMoveActivity(act)}
                      className="p-1 rounded-lg text-[#838F8B] hover:text-[#17201D] hover:bg-[#F4F1EA]"
                      title="Move Activity"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteActivity(act)}
                      className="p-1 rounded-lg text-[#838F8B] hover:text-[#D9534F] hover:bg-[#FFEAE5]"
                      title="Remove Activity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
