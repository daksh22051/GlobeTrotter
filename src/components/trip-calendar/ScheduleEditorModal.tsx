import React, { useState } from 'react';
import {
  X,
  Clock,
  Calendar as CalendarIcon,
  AlertCircle,
  Save,
  Check,
} from 'lucide-react';
import { ItineraryActivity, ItineraryDay } from '../../types/itinerary';
import {
  calculateEndTime,
  formatTimeDisplay,
  timeStringToMinutes,
} from '../../utils/itineraryConflictDetector';

interface ScheduleEditorModalProps {
  isOpen: boolean;
  activity: ItineraryActivity | null;
  days: ItineraryDay[];
  onClose: () => void;
  onSave: (
    activityId: string,
    updates: {
      dayNumber: number;
      startTime: string;
      durationMinutes: number;
      duration: string;
    }
  ) => void;
}

export const ScheduleEditorModal: React.FC<ScheduleEditorModalProps> = ({
  isOpen,
  activity,
  days,
  onClose,
  onSave,
}) => {
  if (!isOpen || !activity) return null;

  const [dayNumber, setDayNumber] = useState<number>(
    activity.dayNumber || (days[0]?.dayNumber ?? 1)
  );
  const [startTime, setStartTime] = useState<string>(activity.startTime || '10:00');
  const [durationMinutes, setDurationMinutes] = useState<number>(
    activity.durationMinutes || 90
  );
  const [error, setError] = useState<string | null>(null);

  // Calculate dynamic end time
  const endTime = calculateEndTime(startTime, durationMinutes);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const startMins = timeStringToMinutes(startTime);
    if (isNaN(startMins)) {
      setError('Please provide a valid start time');
      return;
    }

    if (durationMinutes <= 0) {
      setError('Duration must be greater than 0 minutes');
      return;
    }

    // Format human duration
    const hrs = Math.floor(durationMinutes / 60);
    const mins = durationMinutes % 60;
    let durationString = '';
    if (hrs > 0 && mins > 0) {
      durationString = `${hrs} hr ${mins} min`;
    } else if (hrs > 0) {
      durationString = `${hrs} ${hrs === 1 ? 'hour' : 'hours'}`;
    } else {
      durationString = `${mins} min`;
    }

    onSave(activity.id, {
      dayNumber,
      startTime,
      durationMinutes,
      duration: durationString,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#17201D]/50 backdrop-blur-xs transition-opacity animate-in fade-in"
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-md bg-[#FFFDF8] rounded-3xl p-6 shadow-2xl border border-[#EAE6DD] z-10 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#EAE6DD]">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#FF6B4A]" />
            <h3 className="text-base font-extrabold text-[#17201D]">
              Edit Activity Schedule
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

        {/* Activity Name Preview */}
        <div className="my-4 p-3 rounded-2xl bg-[#F9F7F1] border border-[#EAE6DD]/70">
          <span className="text-[10px] uppercase font-bold text-[#838F8B] tracking-wider block">
            Target Experience
          </span>
          <h4 className="text-sm font-extrabold text-[#17201D] mt-0.5 truncate">
            {activity.title}
          </h4>
          <p className="text-xs text-[#556960] truncate">{activity.location}</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-[#FFEAE5] border border-[#FF6B4A]/30 text-xs text-[#D9534F] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Day Selection */}
          <div>
            <label className="block text-xs font-black text-[#17201D] uppercase tracking-wider mb-1.5">
              Trip Day
            </label>
            <select
              value={dayNumber}
              onChange={(e) => setDayNumber(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl bg-white border border-[#EAE6DD] text-xs sm:text-sm font-semibold text-[#17201D] focus:border-[#FF6B4A] focus:outline-none"
            >
              {days.map((d) => (
                <option key={d.id} value={d.dayNumber}>
                  Day {d.dayNumber} {d.dateDisplay ? `(${d.dateDisplay})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Start Time Picker */}
          <div>
            <label className="block text-xs font-black text-[#17201D] uppercase tracking-wider mb-1.5">
              Start Time
            </label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => {
                setStartTime(e.target.value);
                setError(null);
              }}
              className="w-full px-3 py-2 rounded-xl bg-white border border-[#EAE6DD] text-xs sm:text-sm font-semibold text-[#17201D] focus:border-[#FF6B4A] focus:outline-none"
              required
            />
          </div>

          {/* Duration in Minutes */}
          <div>
            <label className="block text-xs font-black text-[#17201D] uppercase tracking-wider mb-1.5">
              Duration
            </label>
            <div className="grid grid-cols-4 gap-2 mb-2">
              {[45, 60, 90, 120].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setDurationMinutes(mins)}
                  className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                    durationMinutes === mins
                      ? 'bg-[#17201D] text-white border-[#17201D]'
                      : 'bg-white text-[#556960] border-[#EAE6DD] hover:border-[#17201D]'
                  }`}
                >
                  {mins >= 60 ? `${mins / 60}h` : `${mins}m`}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="number"
                min="10"
                max="480"
                step="5"
                value={durationMinutes}
                onChange={(e) => {
                  setDurationMinutes(Number(e.target.value));
                  setError(null);
                }}
                className="w-full px-3 py-2 rounded-xl bg-white border border-[#EAE6DD] text-xs sm:text-sm font-semibold text-[#17201D] focus:border-[#FF6B4A] focus:outline-none"
              />
              <span className="text-xs font-bold text-[#838F8B] shrink-0">minutes</span>
            </div>
          </div>

          {/* Calculated End Time Indicator */}
          <div className="p-3 rounded-xl bg-[#E8F8F5] border border-[#20B8A6]/20 flex items-center justify-between text-xs">
            <span className="font-bold text-[#556960]">Scheduled Window:</span>
            <span className="font-black text-[#17201D]">
              {formatTimeDisplay(startTime)} → {formatTimeDisplay(endTime)}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#EAE6DD]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white border border-[#EAE6DD] hover:bg-[#F4F1EA] text-xs font-bold text-[#556960] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#FF6B4A] hover:bg-[#FF8566] text-white text-xs font-extrabold transition-all shadow-md shadow-[#FF6B4A]/25 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Update Schedule</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
