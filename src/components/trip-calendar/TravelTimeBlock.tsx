import React from 'react';
import { Train, Clock, ArrowDown, MapPin } from 'lucide-react';
import { formatTravelTime } from '../../utils/travelTimeEstimator';

interface TravelTimeBlockProps {
  durationMinutes: number;
  fromLocation: string;
  toLocation: string;
}

export const TravelTimeBlock: React.FC<TravelTimeBlockProps> = ({
  durationMinutes,
  fromLocation,
  toLocation,
}) => {
  if (durationMinutes <= 0) return null;

  return (
    <div className="relative pl-8 sm:pl-10 my-2.5">
      {/* Travel connection vertical line connector */}
      <div className="absolute left-3.5 sm:left-4.5 top-0 bottom-0 w-0.5 border-l-2 border-dashed border-[#D2CBC1]" />

      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F4F1EA]/90 border border-[#EAE6DD] text-xs text-[#556960] shadow-2xs hover:bg-[#EAE6DD]/80 transition-colors">
        <div className="w-5 h-5 rounded-full bg-[#EAE6DD] text-[#17201D] flex items-center justify-center shrink-0">
          <Train className="w-3 h-3 text-[#FF6B4A]" />
        </div>
        
        <span className="font-bold text-[#17201D]">
          {formatTravelTime(durationMinutes)}
        </span>
        
        <span className="text-[11px] text-[#838F8B] hidden sm:inline">
          transit between {fromLocation.split(',')[0]} → {toLocation.split(',')[0]}
        </span>
      </div>
    </div>
  );
};
