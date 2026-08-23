import React, { useMemo, useState } from 'react';
import { CalendarDays, Camera, Check, Clock3, Heart, Palette, Sparkles, Video } from 'lucide-react';
import { Itinerary, ItineraryDay } from '../../types/itinerary';
import { Trip } from '../../types/trip';

interface PreWeddingCalendarViewProps {
  trip: Trip;
  itinerary: Itinerary;
  selectedDayNumber: number;
  onSelectDay: (dayNumber: number) => void;
}

const formatDateISO = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const schedulePlans = [
  [
    { time: '07:30', label: 'Makeup Session', detail: 'Fresh, natural styling for a relaxed first look', icon: Palette, tone: 'bg-[#FFF4D6] text-[#9A6B16]', duration: '90 min' },
    { time: '09:15', label: 'Casual Outfit Change', detail: 'Linen layers and barefoot portraits by the water', icon: Heart, tone: 'bg-[#FFEAE5] text-[#B85B48]', duration: '45 min' },
    { time: '10:00', label: 'Beach & Coastline Shoot', detail: 'Candid movement, shoreline frames, and wide landscapes', icon: Camera, tone: 'bg-[#E8F8F5] text-[#167F73]', duration: '2 hrs' },
    { time: '17:00', label: 'Sunset Golden Hour', detail: 'Warm backlight portraits at the day\'s final viewpoint', icon: Camera, tone: 'bg-[#FFF4D6] text-[#9A6B16]', duration: '90 min' },
  ],
  [
    { time: '08:00', label: 'Royal Styling Session', detail: 'Jewel tones, antique gold, and traditional beauty details', icon: Palette, tone: 'bg-[#FFF4D6] text-[#9A6B16]', duration: '2 hrs' },
    { time: '10:30', label: 'Traditional Outfit Change', detail: 'Lehenga and sherwani look with final accessory checks', icon: Heart, tone: 'bg-[#FFEAE5] text-[#B85B48]', duration: '45 min' },
    { time: '11:30', label: 'Heritage Fort Portraits', detail: 'Architectural frames through the fort courtyards and arches', icon: Camera, tone: 'bg-[#F3E8FF] text-[#7C3AED]', duration: '2 hrs' },
    { time: '17:15', label: 'Palace Golden Hour', detail: 'Regal wide shots and a slow cinematic couple sequence', icon: Camera, tone: 'bg-[#FFF4D6] text-[#9A6B16]', duration: '90 min' },
  ],
  [
    { time: '09:00', label: 'Editorial Makeup', detail: 'Polished skin and graphic detail for the city look', icon: Palette, tone: 'bg-[#FFF4D6] text-[#9A6B16]', duration: '90 min' },
    { time: '10:45', label: 'Modern Look Change', detail: 'Monochrome tailoring and a statement outer layer', icon: Heart, tone: 'bg-[#FFEAE5] text-[#B85B48]', duration: '45 min' },
    { time: '14:00', label: 'Cinematic Street Shoot', detail: 'Candid frames through markets, lanes, and local landmarks', icon: Camera, tone: 'bg-[#EBF5FB] text-[#2E86DE]', duration: '2 hrs' },
    { time: '19:30', label: 'Night Lights Sequence', detail: 'City glow, motion blur, and a cinematic video pass', icon: Video, tone: 'bg-[#F3E8FF] text-[#7C3AED]', duration: '90 min' },
  ],
  [
    { time: '08:30', label: 'Island Styling Session', detail: 'Dewy beauty and botanical finishing touches', icon: Palette, tone: 'bg-[#FFF4D6] text-[#9A6B16]', duration: '90 min' },
    { time: '10:15', label: 'Tropical Outfit Change', detail: 'Airy whites, botanical prints, and warm metallics', icon: Heart, tone: 'bg-[#FFEAE5] text-[#B85B48]', duration: '45 min' },
    { time: '11:15', label: 'Garden & Temple Frames', detail: 'Lush greenery, texture, and quiet editorial portraits', icon: Camera, tone: 'bg-[#E8F8F5] text-[#167F73]', duration: '2 hrs' },
    { time: '17:30', label: 'Cliffside Golden Hour', detail: 'Open-sky portraits with a sweeping destination view', icon: Camera, tone: 'bg-[#FFF4D6] text-[#9A6B16]', duration: '90 min' },
  ],
  [
    { time: '10:00', label: 'Final Look Prep', detail: 'Touch-ups and a final styling check for the closing story', icon: Palette, tone: 'bg-[#FFF4D6] text-[#9A6B16]', duration: '90 min' },
    { time: '12:00', label: 'Statement Outfit Change', detail: 'The hero look, signature accessories, and detail frames', icon: Heart, tone: 'bg-[#FFEAE5] text-[#B85B48]', duration: '45 min' },
    { time: '15:00', label: 'Signature Location Shoot', detail: 'The best local landmark reserved for your hero portraits', icon: Camera, tone: 'bg-[#F3E8FF] text-[#7C3AED]', duration: '2 hrs' },
    { time: '18:00', label: 'Final Golden Hour Film', detail: 'Closing sequence, champagne frames, and production wrap', icon: Video, tone: 'bg-[#EBF5FB] text-[#2E86DE]', duration: '90 min' },
  ],
];

const getScheduleForDay = (day?: ItineraryDay) => {
  const index = Math.max(0, (day?.dayNumber || 1) - 1) % schedulePlans.length;
  return schedulePlans[index];
};

export const PreWeddingCalendarView: React.FC<PreWeddingCalendarViewProps> = ({ trip, itinerary, selectedDayNumber, onSelectDay }) => {
  const days = itinerary.days || [];
  const [monthDate, setMonthDate] = useState(() => {
    const firstDate = days[0]?.date ? new Date(`${days[0].date}T00:00:00`) : new Date();
    return new Date(firstDate.getFullYear(), firstDate.getMonth(), 1);
  });

  const daysByDate = useMemo(() => {
    const map: Record<string, ItineraryDay> = {};
    days.forEach((day) => { if (day.date) map[day.date] = day; });
    return map;
  }, [days]);

  const selectedDay = days.find((day) => day.dayNumber === selectedDayNumber) || days[0];
  const cells = useMemo(() => {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const firstWeekday = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const monthStart = new Date(year, month, 1);
    const monthCells = Array.from({ length: firstWeekday }, () => ({
      date: monthStart,
      dateISO: '',
      isPlaceholder: true,
      day: undefined,
    }));

    for (let dayOfMonth = 1; dayOfMonth <= totalDays; dayOfMonth += 1) {
      const date = new Date(year, month, dayOfMonth);
      const dateISO = formatDateISO(date);
      monthCells.push({
        date,
        dateISO,
        isPlaceholder: false,
        day: daysByDate[dateISO],
      });
    }

    while (monthCells.length % 7 !== 0) {
      monthCells.push({
        date: monthStart,
        dateISO: '',
        isPlaceholder: true,
        day: undefined,
      });
    }

    return monthCells;
  }, [monthDate, daysByDate]);

  const selectDate = (day?: ItineraryDay) => { if (day) onSelectDay(day.dayNumber); };

  return (
    <section aria-label="Pre-wedding photoshoot calendar" className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="min-w-0 rounded-3xl border border-[#EAE6DD] bg-[#FFFDF8] p-4 shadow-2xs sm:p-6">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div><span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-[#B85B48]"><Camera className="h-3.5 w-3.5" /> Pre-wedding schedule</span><h2 className="mt-1 text-xl font-black text-[#17201D]">{monthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h2><p className="text-xs text-[#68736F]">Select a shoot date to open its production schedule.</p></div>
          <div className="flex items-center gap-2"><button type="button" onClick={() => setMonthDate((date) => new Date(date.getFullYear(), date.getMonth() - 1, 1))} className="h-8 w-8 rounded-lg border border-[#EAE6DD] bg-white text-[#556960] hover:border-[#FF6B4A]" aria-label="Previous month">‹</button><button type="button" onClick={() => setMonthDate((date) => new Date(date.getFullYear(), date.getMonth() + 1, 1))} className="h-8 w-8 rounded-lg border border-[#EAE6DD] bg-white text-[#556960] hover:border-[#FF6B4A]" aria-label="Next month">›</button></div>
        </div>
        <div className="mb-2 grid grid-cols-7 text-center text-[10px] font-black uppercase tracking-wider text-[#9BA3A0]">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => <span key={day} className="py-2">{day}</span>)}</div>
        <div className="grid grid-cols-7 overflow-hidden rounded-2xl border-l border-t border-[#EAE6DD]">
          {cells.map(({ date, dateISO, isPlaceholder, day }, index) => {
            if (isPlaceholder) {
              return <div key={`empty-${index}`} className="min-h-24 border-b border-r border-[#EAE6DD] bg-[#FAF8F5]/45 sm:min-h-28" aria-hidden="true" />;
            }

            const isSelected = day?.dayNumber === selectedDayNumber;
            return <button type="button" key={dateISO} onClick={() => selectDate(day)} disabled={!day} className={`min-h-24 border-b border-r border-[#EAE6DD] bg-white p-2 text-left transition-colors sm:min-h-28 ${day ? 'cursor-pointer hover:bg-[#FFF8F4]' : 'cursor-default'} ${isSelected ? 'bg-[#FFF8F4] ring-2 ring-inset ring-[#FF6B4A]' : ''}`}><span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-black ${isSelected ? 'bg-[#FF6B4A] text-white' : 'text-[#17201D]'}`}>{date.getDate()}</span>{day && <div className="mt-2 space-y-1">{getScheduleForDay(day).slice(0, 3).map((slot) => { const Icon = slot.icon; return <span key={`${day.id}-${slot.time}`} className={`flex items-center gap-1 truncate rounded-md px-1.5 py-1 text-[9px] font-extrabold ${slot.tone}`}><Icon className="h-2.5 w-2.5 shrink-0" /><span className="truncate">{slot.label}</span></span>; })}</div>}</button>;
          })}
        </div>
        <div className="mt-4 flex flex-wrap gap-3 text-[11px] font-bold text-[#68736F]"><span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#FFF4D6]" /> Makeup</span><span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#FFEAE5]" /> Outfit change</span><span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#E8F8F5]" /> Golden hour</span></div>
      </div>
      <aside className="h-fit overflow-hidden rounded-3xl border border-[#EAE6DD] bg-white shadow-2xs lg:sticky lg:top-24"><div className="bg-gradient-to-br from-[#FFF8F3] to-[#FFF4D6] p-5"><p className="text-[11px] font-black uppercase tracking-wider text-[#B85B48]">Selected shoot day</p><h3 className="mt-1 text-xl font-black text-[#17201D]">{selectedDay?.dateDisplay || `Day ${selectedDay?.dayNumber || 1}`}</h3><p className="mt-1 text-xs text-[#68736F]">{selectedDay?.cityName || trip.destination}</p></div>{selectedDay ? <div className="divide-y divide-[#F4F1EA]">{getScheduleForDay(selectedDay).map((slot) => { const Icon = slot.icon; return <div key={slot.label + slot.time} className="flex items-start gap-3 p-4"><span className="w-10 shrink-0 pt-1 text-[11px] font-black text-[#68736F]">{slot.time}</span><span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${slot.tone}`}><Icon className="h-4 w-4" /></span><div className="min-w-0"><p className="text-xs font-black text-[#17201D]">{slot.label}</p><p className="mt-0.5 text-[11px] leading-relaxed text-[#68736F]">{slot.detail} · {selectedDay.cityName || trip.destination}</p><span className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold text-[#9BA3A0]"><Clock3 className="h-3 w-3" /> {slot.duration}</span></div></div>; })}</div> : <div className="p-6 text-center text-sm text-[#68736F]">Choose a highlighted date to view its shoot schedule.</div>}<div className="border-t border-[#F4F1EA] p-4 text-xs font-bold text-[#167F73]"><Check className="mr-1 inline h-3.5 w-3.5" /> {days.length} scheduled production day{days.length === 1 ? '' : 's'}</div></aside>
    </section>
  );
};
