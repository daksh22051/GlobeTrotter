import React, { useState, useEffect } from 'react';
import { X, Clock, Wallet, FileText, Check } from 'lucide-react';
import { ItineraryActivity } from '../../types/itinerary';
import { MapMarkerLocation } from '../../types/map';

interface EditActivityModalProps {
  activity: ItineraryActivity | MapMarkerLocation | null;
  dayNumber: number;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: Partial<ItineraryActivity>, dayNumber: number) => void;
}

export const EditActivityModal: React.FC<EditActivityModalProps> = ({
  activity,
  dayNumber,
  isOpen,
  onClose,
  onSave,
}) => {
  const [startTime, setStartTime] = useState('10:00');
  const [duration, setDuration] = useState('2 hours');
  const [estimatedCost, setEstimatedCost] = useState<number>(0);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (activity) {
      setStartTime(activity.startTime || '10:00');
      setDuration(activity.duration || '2 hours');
      setEstimatedCost(activity.estimatedCost || 0);
      setNotes(activity.notes || '');
    }
  }, [activity]);

  if (!isOpen || !activity) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let durationMinutes = 120;
    if (duration.includes('1 hour') || duration === '1 hr') durationMinutes = 60;
    else if (duration.includes('30 min')) durationMinutes = 30;
    else if (duration.includes('3 hour')) durationMinutes = 180;

    onSave(
      {
        startTime,
        duration,
        durationMinutes,
        estimatedCost: Number(estimatedCost),
        notes,
      },
      dayNumber
    );

    onClose();
  };

  const title = (activity as any).name || (activity as any).title;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md rounded-2xl bg-[#FFFDF8] border border-[#EAE6DD] shadow-2xl p-6 overflow-hidden font-sans z-10 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-[#EAE6DD]">
          <h3 className="text-sm font-extrabold text-[#17201D]">Edit Activity Details</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-[#838F8B] hover:text-[#17201D]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs font-sans">
          <div>
            <label className="block text-[11px] font-bold text-[#838F8B] uppercase mb-1">
              Place / Activity
            </label>
            <div className="p-2.5 rounded-xl bg-[#F9F7F1] border border-[#EAE6DD] font-bold text-[#17201D]">
              {title}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-[#5E6B67] mb-1">
                Start Time
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-[#EAE6DD] text-xs font-bold text-[#17201D] outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#5E6B67] mb-1">
                Duration
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-[#EAE6DD] text-xs font-bold text-[#17201D] outline-none"
              >
                <option value="30 min">30 min</option>
                <option value="1 hour">1 hour</option>
                <option value="1.5 hours">1.5 hours</option>
                <option value="2 hours">2 hours</option>
                <option value="3 hours">3 hours</option>
                <option value="Half Day">Half Day (4h)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#5E6B67] mb-1">
              Estimated Cost (₹)
            </label>
            <input
              type="number"
              value={estimatedCost}
              onChange={(e) => setEstimatedCost(Math.max(0, Number(e.target.value)))}
              className="w-full px-3 py-2 rounded-xl bg-white border border-[#EAE6DD] text-xs font-bold text-[#17201D] outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#5E6B67] mb-1">
              Personal Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Add reminders, reservation numbers, tips..."
              className="w-full px-3 py-2 rounded-xl bg-white border border-[#EAE6DD] text-xs text-[#17201D] outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#F4F1EA]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white border border-[#EAE6DD] hover:bg-[#F9F7F1] text-[#5E6B67] font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#17201D] hover:bg-[#FF6B4A] text-white font-bold transition-colors cursor-pointer"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
