import React, { useState } from 'react';
import { X, ArrowRightLeft, Calendar } from 'lucide-react';
import { ItineraryActivity, ItineraryDay } from '../../types/itinerary';
import { MapMarkerLocation } from '../../types/map';

interface MoveActivityModalProps {
  activity: ItineraryActivity | MapMarkerLocation | null;
  currentDayNumber: number;
  days: ItineraryDay[];
  isOpen: boolean;
  onClose: () => void;
  onConfirmMove: (targetDayNumber: number) => void;
}

export const MoveActivityModal: React.FC<MoveActivityModalProps> = ({
  activity,
  currentDayNumber,
  days,
  isOpen,
  onClose,
  onConfirmMove,
}) => {
  const [targetDay, setTargetDay] = useState<number>(currentDayNumber);

  if (!isOpen || !activity) return null;

  const title = (activity as any).name || (activity as any).title;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-sm rounded-2xl bg-[#FFFDF8] border border-[#EAE6DD] shadow-2xl p-6 overflow-hidden font-sans z-10 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-[#EAE6DD]">
          <h3 className="text-sm font-extrabold text-[#17201D]">Move to Another Day</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-[#838F8B] hover:text-[#17201D]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-4 space-y-4 text-xs font-sans">
          <div>
            <span className="text-[11px] font-bold text-[#838F8B] uppercase">
              Selected Stop
            </span>
            <div className="p-2.5 rounded-xl bg-[#F9F7F1] border border-[#EAE6DD] font-bold text-[#17201D] mt-1">
              {title}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#5E6B67] mb-1">
              Destination Day
            </label>
            <select
              value={targetDay}
              onChange={(e) => setTargetDay(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl bg-white border border-[#EAE6DD] text-xs font-bold text-[#17201D] outline-none"
            >
              {days.map((d) => (
                <option key={d.id || d.dayNumber} value={d.dayNumber}>
                  Day {d.dayNumber}: {d.title || d.dateDisplay} ({d.activities.length} stops)
                </option>
              ))}
            </select>
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
              type="button"
              onClick={() => {
                onConfirmMove(targetDay);
                onClose();
              }}
              className="px-5 py-2 rounded-xl bg-[#17201D] hover:bg-[#FF6B4A] text-white font-bold transition-colors cursor-pointer"
            >
              Move Stop
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
