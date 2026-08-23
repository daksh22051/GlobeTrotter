import React, { useLayoutEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Compass, Utensils, Navigation } from 'lucide-react';
import { ItineraryDay, ItineraryActivity, ItineraryConflict, DayHealthResult } from '../../types/itinerary';
import { ActivityCard } from './ActivityCard';
import { estimateTravelTimeMinutes, formatTravelTime } from '../../utils/travelTimeEstimator';
import { detectMissingMeals } from '../../utils/dayHealthCalculator';
import { getActivityConflict } from '../../utils/itineraryConflictDetector';

interface DayTimelineProps {
  day: ItineraryDay;
  conflicts: ItineraryConflict[];
  dayHealth: DayHealthResult;
  currency: string;
  onAddActivityClick: () => void;
  onFindFoodClick: () => void;
  onEditActivity: (activity: ItineraryActivity) => void;
  onDuplicateActivity: (activityId: string) => void;
  onRemoveActivity: (activityId: string) => void;
  onMoveToDay: (activity: ItineraryActivity) => void;
  onReorder: (dayNumber: number, sourceIndex: number, destinationIndex: number) => void;
  onMoveActivityAcrossDays: (activityId: string, targetDayNumber: number, insertIndex?: number) => void;
  onAutoFillDay?: () => void;
}

export const DayTimeline: React.FC<DayTimelineProps> = ({
  day, conflicts, dayHealth, currency, onAddActivityClick, onFindFoodClick,
  onEditActivity, onDuplicateActivity, onRemoveActivity, onMoveToDay,
  onReorder, onMoveActivityAcrossDays, onAutoFillDay,
}) => {
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [activeDragSourceDay, setActiveDragSourceDay] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const firstNodeRef = useRef<HTMLDivElement>(null);
  const lastNodeRef = useRef<HTMLDivElement>(null);
  const [trackBounds, setTrackBounds] = useState<{ top: number; height: number } | null>(null);
  const activities = day.activities || [];
  const mealAlerts = detectMissingMeals(day);

  useLayoutEffect(() => {
    const updateTrackBounds = () => {
      const timeline = timelineRef.current;
      const firstNode = firstNodeRef.current;
      const lastNode = lastNodeRef.current;
      if (!timeline || !firstNode || !lastNode) { setTrackBounds(null); return; }
      const timelineTop = timeline.getBoundingClientRect().top;
      const firstRect = firstNode.getBoundingClientRect();
      const lastRect = lastNode.getBoundingClientRect();
      const top = firstRect.top + firstRect.height / 2 - timelineTop;
      const bottom = lastRect.top + lastRect.height / 2 - timelineTop;
      setTrackBounds({ top, height: Math.max(0, bottom - top) });
    };
    updateTrackBounds();
    window.addEventListener('resize', updateTrackBounds);
    return () => window.removeEventListener('resize', updateTrackBounds);
  }, [activities, day.dayNumber]);

  const handleDragStart = (_event: React.DragEvent, activityId: string, sourceDay: number) => {
    setActiveDragId(activityId);
    setActiveDragSourceDay(sourceDay);
  };
  const handleDragEnd = () => {
    setActiveDragId(null);
    setActiveDragSourceDay(null);
    setDragOverIndex(null);
  };
  const handleDropZone = (targetIndex: number) => {
    if (!activeDragId) return;
    if (activeDragSourceDay === day.dayNumber) {
      const sourceIndex = activities.findIndex((activity) => activity.id === activeDragId);
      if (sourceIndex !== -1 && sourceIndex !== targetIndex) onReorder(day.dayNumber, sourceIndex, targetIndex);
    } else {
      onMoveActivityAcrossDays(activeDragId, day.dayNumber, targetIndex);
    }
    handleDragEnd();
  };

  return (
    <div className="w-full max-w-full overflow-visible space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="bg-gradient-to-br from-[#FFF0EA] via-[#FFF8ED] to-[#EAF8F5] rounded-3xl p-5 sm:p-6 border border-[#FFD3C4] shadow-[0_14px_34px_rgba(255,107,74,0.14)]"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-[#17201D] tracking-tight">{day.title || `Day ${day.dayNumber} Itinerary`}</h2>
            <p className="text-xs text-[#68736F] mt-1 flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-[#17201D]">{activities.length} {activities.length === 1 ? 'stop' : 'stops'} planned</span>
              <span>•</span>
              <span>Est. Cost: <strong className="text-[#FFB020]">{dayHealth.totalCost > 0 ? `${currency}${dayHealth.totalCost.toLocaleString()}` : 'Free'}</strong></span>
              {day.theme && day.theme !== day.title && <><span>•</span><span className="text-[#68736F] italic">{day.theme}</span></>}
            </p>
          </div>
          <div className="flex flex-col sm:items-end">
            <span className="text-[10px] uppercase tracking-wider font-bold text-[#68736F]">Day Pacing Health</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-sm sm:text-base font-black text-[#17201D]">{dayHealth.score}%</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${conflicts.some((conflict) => conflict.severity === 'error') ? 'bg-[#FFF0EC] text-[#E55837]' : conflicts.length > 0 ? 'bg-[#FFF8E7] text-[#B45309]' : dayHealth.status === 'Excellent' ? 'bg-[#EAF8F5] text-[#179E8E]' : 'bg-[#EBF5FB] text-[#2E86DE]'}`}>{dayHealth.status}</span>
            </div>
          </div>
        </div>
      </motion.div>

      <div ref={timelineRef} className="relative">
        {trackBounds && <div className="absolute left-7 sm:left-9 w-0.5 bg-gradient-to-b from-[#20B8A6] via-[#FFB020]/70 to-[#20B8A6]/35" style={{ top: trackBounds.top, height: trackBounds.height }} />}
        {activities.length === 0 ? (
          <div onDragOver={(event) => { event.preventDefault(); setDragOverIndex(0); }} onDragLeave={() => setDragOverIndex(null)} onDrop={() => handleDropZone(0)} className={`relative p-8 sm:p-12 rounded-3xl border-2 border-dashed text-center transition-all ${dragOverIndex === 0 ? 'border-[#FF6B4A] bg-[#FFF2EE]/50 ring-4 ring-[#FF6B4A]/10' : 'border-[#DDE7E3] bg-white/80 shadow-sm'}`}>
            <div className="w-12 h-12 rounded-2xl bg-[#FFF2EE] text-[#FF6B4A] flex items-center justify-center mx-auto mb-3"><Compass className="w-6 h-6" /></div>
            <h3 className="text-base font-bold text-[#17201D]">No activities scheduled for Day {day.dayNumber}</h3>
            <p className="text-xs sm:text-sm text-[#68736F] max-w-sm mx-auto mt-1 mb-5">Drag unscheduled places from the drawer or click below to pick recommended stops.</p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button type="button" onClick={onAddActivityClick} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#FF6B4A] hover:bg-[#E55837] text-white text-xs sm:text-sm font-bold shadow-xs transition-colors cursor-pointer"><Plus className="w-4 h-4" /><span>Add First Activity</span></button>
              {onAutoFillDay && <button type="button" onClick={onAutoFillDay} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#EAF8F5] text-[#179E8E] hover:bg-[#D5F2EC] text-xs sm:text-sm font-bold transition-colors cursor-pointer"><span>Auto-Fill Recommendations</span></button>}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity, index) => {
              const conflict = getActivityConflict(activity.id, conflicts);
              const nextActivity = activities[index + 1];
              const travelTimeMins = nextActivity ? estimateTravelTimeMinutes(activity.location, nextActivity.location, { lat: activity.latitude, lng: activity.longitude }, { lat: nextActivity.latitude, lng: nextActivity.longitude }) : 0;
              return (
                <div key={activity.id} className="relative">
                  <div onDragOver={(event) => { event.preventDefault(); setDragOverIndex(index); }} onDragLeave={() => setDragOverIndex(null)} onDrop={() => handleDropZone(index)} className={`h-3 -my-1.5 transition-all rounded-full ${dragOverIndex === index ? 'bg-[#FF6B4A] scale-y-150 my-1' : 'opacity-0'}`} />
                  <div className="relative">
                    <div ref={(node) => { if (index === 0) firstNodeRef.current = node; if (index === activities.length - 1) lastNodeRef.current = node; }} className="absolute z-10 left-[18px] sm:left-6 top-4.5 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#FFF8ED] border-2 border-[#20B8A6] shadow-[0_0_14px_rgba(32,184,166,0.45)] flex items-center justify-center"><div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#FFB020] animate-pulse" /></div>
                    <div className="w-full"><ActivityCard activity={activity} index={index} dayNumber={day.dayNumber} conflict={conflict} onEdit={onEditActivity} onDuplicate={onDuplicateActivity} onRemove={onRemoveActivity} onMoveToDay={onMoveToDay} onDragStart={handleDragStart} onDragEnd={handleDragEnd} /></div>
                  </div>
                  {nextActivity && <div className="my-2 flex items-center pl-7 sm:pl-9"><div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#F8FAF8] border border-[#DDEBE5] text-[10px] font-semibold text-[#5E6B67]" title={`Travel buffer: ${formatTravelTime(travelTimeMins)} to the next activity`} aria-label={`Travel buffer: ${formatTravelTime(travelTimeMins)} to the next activity`}><Navigation className="w-3 h-3 text-[#20B8A6]" /><span>{formatTravelTime(travelTimeMins)}</span></div></div>}
                </div>
              );
            })}
            <div onDragOver={(event) => { event.preventDefault(); setDragOverIndex(activities.length); }} onDragLeave={() => setDragOverIndex(null)} onDrop={() => handleDropZone(activities.length)} className={`h-4 transition-all rounded-full ${dragOverIndex === activities.length ? 'bg-[#FF6B4A] scale-y-150 my-1' : 'opacity-0'}`} />
          </div>
        )}

        {(mealAlerts.missingLunch || mealAlerts.missingDinner) && <div className="my-4 p-4 rounded-2xl bg-[#FFF5F2] border border-[#FF6B4A]/20 shadow-sm flex items-center justify-between gap-3"><div className="flex items-center gap-3"><div className="w-9 h-9 rounded-xl bg-[#FFE4DC] text-[#FF6B4A] flex items-center justify-center shrink-0"><Utensils className="w-4 h-4" /></div><div><p className="text-xs font-bold text-[#17201D]">No {mealAlerts.missingLunch ? 'lunch' : 'dinner'} planned yet</p><p className="text-[11px] text-[#A83D24]">Discover top-rated local cafes and signature dining spots nearby.</p></div></div><button type="button" onClick={onFindFoodClick} className="px-3.5 py-1.5 rounded-full bg-white hover:bg-[#FFF0EC] text-[#FF6B4A] border border-[#FF6B4A]/30 text-xs font-bold transition-colors shrink-0 cursor-pointer">Find food nearby</button></div>}
        <div className="pt-2"><button type="button" onClick={onAddActivityClick} className="w-full flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-white hover:bg-[#F9F7F1] border-2 border-dashed border-[#DDE7E3] hover:border-[#FF6B4A]/40 text-[#5E6B67] hover:text-[#17201D] text-xs sm:text-sm font-bold transition-colors cursor-pointer shadow-sm group"><Plus className="w-4 h-4 text-[#FF6B4A] group-hover:scale-110 transition-transform" /><span>+ Add Activity to Day {day.dayNumber}</span></button></div>
      </div>
    </div>
  );
};
