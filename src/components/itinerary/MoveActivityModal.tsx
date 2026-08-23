import React, { useState } from 'react';
import { X, ArrowRightLeft, Layers, Calendar, Clock } from 'lucide-react';
import { ItineraryActivity, ItineraryDay } from '../../types/itinerary';

const formatDayTitle = (day: ItineraryDay): string => {
  const title = day.title || day.dateDisplay || '';
  return title.replace(/^Day\s+\d+\s*:\s*/i, '');
};

interface MoveActivityModalProps {
  isOpen: boolean;
  activity: ItineraryActivity | null;
  days: ItineraryDay[];
  onClose: () => void;
  onMove: (activityId: string, targetDayNumber: number | null, newStartTime?: string) => void;
}

export const MoveActivityModal: React.FC<MoveActivityModalProps> = ({
  isOpen,
  activity,
  days,
  onClose,
  onMove,
}) => {
  if (!isOpen || !activity) return null;

  const [targetDay, setTargetDay] = useState<number | 'unscheduled'>(
    activity.dayNumber ?? 'unscheduled'
  );
  const [startTime, setStartTime] = useState(activity.startTime || '10:00');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (targetDay === 'unscheduled') {
      onMove(activity.id, null);
    } else {
      onMove(activity.id, targetDay, startTime);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#17201D]/50 backdrop-blur-xs transition-opacity animate-in fade-in"
      />

      <div className="relative w-full max-w-md bg-[#FFFDF8] rounded-3xl p-6 shadow-2xl border border-[#EAE6DD] z-10 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-[#EAE6DD]">
          <div className="flex items-center gap-2">
            <ArrowRightLeft className="w-4 h-4 text-[#FF6B4A]" />
            <h3 className="text-base font-extrabold text-[#17201D]">
              Move Activity
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-[#838F8B] hover:text-[#17201D] hover:bg-[#F4F1EA] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="my-4 p-3 rounded-2xl bg-[#F9F7F1] border border-[#EAE6DD]/70 flex items-center gap-3">
          <img
            src={activity.image || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=200&q=80'}
            alt={activity.title}
            referrerPolicy="no-referrer"
            className="w-12 h-12 rounded-xl object-cover"
          />
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-bold text-[#17201D] truncate">
              {activity.title}
            </h4>
            <p className="text-[11px] text-[#838F8B] truncate">
              Currently: {activity.dayNumber ? `Day ${activity.dayNumber}` : 'Unscheduled'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#17201D] mb-1.5">
              Select Destination
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              <button
                type="button"
                onClick={() => setTargetDay('unscheduled')}
                className={`w-full flex items-center justify-between p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  targetDay === 'unscheduled'
                    ? 'bg-[#17201D] text-white border-[#17201D] shadow-2xs'
                    : 'bg-white text-[#5E6B67] border-[#EAE6DD] hover:border-[#D0C9B8]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  <span>Unscheduled Pool</span>
                </div>
              </button>

              {days.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setTargetDay(d.dayNumber)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    targetDay === d.dayNumber
                      ? 'bg-[#17201D] text-white border-[#17201D] shadow-2xs'
                      : 'bg-white text-[#5E6B67] border-[#EAE6DD] hover:border-[#D0C9B8]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#FF6B4A]" />
                    <span>
                      Day {d.dayNumber}: {formatDayTitle(d)}
                    </span>
                  </div>
                  <span className="text-[10px] opacity-75">
                    {d.activities.length} stops
                  </span>
                </button>
              ))}
            </div>
          </div>

          {targetDay !== 'unscheduled' && (
            <div>
              <label className="block text-xs font-bold text-[#17201D] mb-1">
                Preferred Start Time
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-[#EAE6DD] text-xs font-semibold text-[#17201D] focus:outline-none focus:border-[#FF6B4A]"
              />
            </div>
          )}

          <div className="flex items-center gap-3 pt-3 border-t border-[#EAE6DD]">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-full bg-white border border-[#EAE6DD] hover:bg-[#F9F7F1] text-xs font-bold text-[#5E6B67] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-full bg-[#FF6B4A] hover:bg-[#E55837] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              Confirm Move
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
