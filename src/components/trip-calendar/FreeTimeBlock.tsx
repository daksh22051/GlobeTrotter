import React from 'react';
import { Sparkles, Plus, Clock } from 'lucide-react';
import { formatTimeDisplay } from '../../utils/itineraryConflictDetector';

interface FreeTimeBlockProps {
  startTime: string;
  endTime: string;
  durationDisplay: string;
  dayNumber: number;
  onAddActivity: (dayNumber: number, suggestedStartTime?: string) => void;
}

export const FreeTimeBlock: React.FC<FreeTimeBlockProps> = ({
  startTime,
  endTime,
  durationDisplay,
  dayNumber,
  onAddActivity,
}) => {
  return (
    <div className="relative pl-8 sm:pl-10 my-3 group">
      {/* Dashed connector line */}
      <div className="absolute left-3.5 sm:left-4.5 top-0 bottom-0 w-0.5 border-l-2 border-dashed border-[#20B8A6]/40" />

      {/* Free time card */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#E8F8F5]/80 to-[#F0FAF7]/60 border border-[#20B8A6]/30 hover:border-[#20B8A6] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs">
        <div className="flex items-start sm:items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-[#20B8A6]/15 text-[#20B8A6] flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
            <Sparkles className="w-4 h-4" />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-extrabold text-[#17201D]">
                ✨ Free Time ({durationDisplay})
              </span>
              <span className="text-[11px] font-semibold text-[#20B8A6]">
                {formatTimeDisplay(startTime)} → {formatTimeDisplay(endTime)}
              </span>
            </div>
            <p className="text-[11px] text-[#556960] mt-0.5">
              Perfect for spontaneous exploration, local cafes, or resting.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onAddActivity(dayNumber, startTime)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#20B8A6]/40 text-[#20B8A6] hover:bg-[#20B8A6] hover:text-white text-xs font-bold transition-all shadow-2xs cursor-pointer self-start sm:self-auto shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Activity</span>
        </button>
      </div>
    </div>
  );
};
