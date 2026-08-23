import React from 'react';
import { Camera, Clock3, Coffee, Heart, Palette, Sparkles, Video } from 'lucide-react';
import { Itinerary } from '../../types/itinerary';
import { Trip } from '../../types/trip';

interface PreWeddingScheduleViewProps {
  trip: Trip;
  itinerary: Itinerary;
}

const slots = [
  { time: '07:30', label: 'Makeup Session', detail: 'Hair, makeup, and final styling checks', icon: Palette, color: 'bg-[#FFF4D6] text-[#A66B00]', duration: '90 min' },
  { time: '09:15', label: 'Outfit Change', detail: 'Look one, accessories, and detail portraits', icon: Heart, color: 'bg-[#FFEAE5] text-[#D9534F]', duration: '45 min' },
  { time: '10:00', label: 'Heritage Portraits', detail: 'Editorial frames at the day\'s first location', icon: Camera, color: 'bg-[#F3E8FF] text-[#9333EA]', duration: '2 hrs' },
  { time: '13:30', label: 'Outfit Change', detail: 'Second look and a relaxed couple set', icon: Sparkles, color: 'bg-[#E8F8F5] text-[#167F73]', duration: '45 min' },
  { time: '17:00', label: 'Golden Hour Shoot', detail: 'Soft light portraits and cinematic movement', icon: Camera, color: 'bg-[#FFF4D6] text-[#A66B00]', duration: '90 min' },
  { time: '19:00', label: 'Cinematic Video Preview', detail: 'Review selects and confirm tomorrow\'s call time', icon: Video, color: 'bg-[#EBF5FB] text-[#2E86DE]', duration: '30 min' },
];

export const PreWeddingScheduleView: React.FC<PreWeddingScheduleViewProps> = ({ trip, itinerary }) => {
  const days = itinerary.days || [];

  return (
    <section aria-label="Pre-wedding photoshoot schedule" className="mx-auto max-w-4xl space-y-6">
      <div className="rounded-3xl border border-[#F1D9C8] bg-gradient-to-br from-[#FFF8F3] via-white to-[#FFF4D6] p-5 sm:p-7 shadow-2xs">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFEAE5] px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide text-[#B85C48]">
              <Camera className="h-3.5 w-3.5" /> Pre-wedding production
            </span>
            <h2 className="mt-3 text-2xl font-black tracking-tight text-[#17201D]">Photoshoot call sheet</h2>
            <p className="mt-1 text-sm leading-relaxed text-[#556960]">
              A dedicated production view for {trip.destination}. Your regular travel itinerary stays unchanged.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#68736F]">
            <Coffee className="h-4 w-4 text-[#FF6B4A]" /> {days.length || 1} production day{days.length === 1 ? '' : 's'}
          </div>
        </div>
      </div>

      {days.length === 0 ? (
        <div className="rounded-3xl border border-[#EAE6DD] bg-white p-10 text-center shadow-2xs">
          <Camera className="mx-auto h-9 w-9 text-[#FF6B4A]" />
          <h3 className="mt-3 text-base font-black text-[#17201D]">No production days yet</h3>
          <p className="mt-1 text-sm text-[#68736F]">Add itinerary dates to generate the photoshoot call sheet.</p>
        </div>
      ) : (
        days.map((day, dayIndex) => (
          <article key={day.id} className="overflow-hidden rounded-3xl border border-[#EAE6DD] bg-white shadow-2xs">
            <div className="flex flex-col gap-2 border-b border-[#F4F1EA] bg-[#FFFDF8] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#FF6B4A]">Production Day {dayIndex + 1}</p>
                <h3 className="mt-0.5 text-lg font-black text-[#17201D]">{day.dateDisplay || day.title || `Day ${day.dayNumber}`}</h3>
              </div>
              <span className="text-xs font-semibold text-[#68736F]">{day.cityName || trip.destination}</span>
            </div>
            <div className="divide-y divide-[#F4F1EA]">
              {slots.map((slot) => {
                const Icon = slot.icon;
                return (
                  <div key={`${day.id}-${slot.time}-${slot.label}`} className="flex items-start gap-3 p-4 sm:gap-5 sm:p-5">
                    <span className="w-12 shrink-0 pt-1 text-xs font-black text-[#68736F]">{slot.time}</span>
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${slot.color}`}><Icon className="h-4 w-4" /></span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2"><h4 className="text-sm font-black text-[#17201D]">{slot.label}</h4><span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#8C9B95]"><Clock3 className="h-3 w-3" /> {slot.duration}</span></div>
                      <p className="mt-1 text-xs leading-relaxed text-[#68736F]">{slot.detail}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </article>
        ))
      )}
    </section>
  );
};
