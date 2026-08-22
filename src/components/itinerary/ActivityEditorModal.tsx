import React, { useState } from 'react';
import {
  X,
  Clock,
  MapPin,
  Wallet,
  FileText,
  Tag,
  Save,
  Compass,
  Utensils,
  Hotel,
  Landmark,
  ExternalLink,
} from 'lucide-react';
import { ItineraryActivity } from '../../types/itinerary';
import { RecommendationCategory } from '../../types/recommendation';

interface ActivityEditorModalProps {
  isOpen: boolean;
  activity: Partial<ItineraryActivity> | null;
  dayCount: number;
  currency: string;
  onClose: () => void;
  onSave: (updatedActivity: Partial<ItineraryActivity>) => void;
}

export const ActivityEditorModal: React.FC<ActivityEditorModalProps> = ({
  isOpen,
  activity,
  dayCount,
  currency,
  onClose,
  onSave,
}) => {
  if (!isOpen || !activity) return null;

  const [title, setTitle] = useState(activity.title || '');
  const [category, setCategory] = useState<RecommendationCategory>(
    activity.category || 'place'
  );
  const [location, setLocation] = useState(activity.location || '');
  const [dayNumber, setDayNumber] = useState<number | ''>(
    activity.dayNumber ?? ''
  );
  const [startTime, setStartTime] = useState(activity.startTime || '10:00');
  const [durationMinutes, setDurationMinutes] = useState(
    activity.durationMinutes || 90
  );
  const [estimatedCost, setEstimatedCost] = useState(
    activity.estimatedCost ?? 0
  );
  const [notes, setNotes] = useState(activity.notes || '');
  const [bookingReference, setBookingReference] = useState(
    activity.bookingReference || ''
  );
  const [image, setImage] = useState(
    activity.image ||
      'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=600&q=80'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    // Calculate duration display string
    const hours = Math.floor(durationMinutes / 60);
    const mins = durationMinutes % 60;
    let durationStr = `${durationMinutes} mins`;
    if (hours > 0 && mins === 0) durationStr = `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
    else if (hours > 0 && mins > 0) durationStr = `${hours}h ${mins}m`;

    onSave({
      ...activity,
      title: title.trim(),
      category,
      location: location.trim() || 'Central Area',
      dayNumber: dayNumber === '' ? undefined : Number(dayNumber),
      status: dayNumber === '' ? 'Unscheduled' : 'Scheduled',
      startTime: dayNumber === '' ? '' : startTime,
      duration: durationStr,
      durationMinutes,
      estimatedCost: Number(estimatedCost) || 0,
      notes: notes.trim(),
      bookingReference: bookingReference.trim() || undefined,
      image: image.trim(),
    });
  };

  const daysArray = Array.from({ length: dayCount }, (_, i) => i + 1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#17201D]/50 backdrop-blur-xs transition-opacity animate-in fade-in"
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-lg bg-[#FFFDF8] rounded-3xl p-6 sm:p-7 shadow-2xl border border-[#EAE6DD] z-10 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#EAE6DD]">
          <h3 className="text-lg font-extrabold text-[#17201D]">
            {activity.id ? 'Edit Activity Details' : 'Add Custom Activity'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-[#838F8B] hover:text-[#17201D] hover:bg-[#F4F1EA] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-[#17201D] mb-1">
              Activity Name *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. TeamLab Planets / Tsukiji Outer Market"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#EAE6DD] text-xs sm:text-sm text-[#17201D] focus:outline-none focus:border-[#FF6B4A]"
            />
          </div>

          {/* Category Picker */}
          <div>
            <label className="block text-xs font-bold text-[#17201D] mb-1.5">
              Category
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(
                [
                  { id: 'place', label: 'Place', icon: <Landmark className="w-3.5 h-3.5" /> },
                  { id: 'food', label: 'Food', icon: <Utensils className="w-3.5 h-3.5" /> },
                  { id: 'hotel', label: 'Stay', icon: <Hotel className="w-3.5 h-3.5" /> },
                  { id: 'experience', label: 'Activity', icon: <Compass className="w-3.5 h-3.5" /> },
                ] as const
              ).map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    category === cat.id
                      ? 'bg-[#17201D] text-white border-[#17201D] shadow-2xs'
                      : 'bg-white text-[#5E6B67] border-[#EAE6DD] hover:border-[#D0C9B8]'
                  }`}
                >
                  {cat.icon}
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Day & Start Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#17201D] mb-1">
                Day Assignment
              </label>
              <select
                value={dayNumber}
                onChange={(e) =>
                  setDayNumber(e.target.value === '' ? '' : Number(e.target.value))
                }
                className="w-full px-3 py-2.5 rounded-xl bg-white border border-[#EAE6DD] text-xs sm:text-sm text-[#17201D] focus:outline-none focus:border-[#FF6B4A] cursor-pointer"
              >
                <option value="">Unscheduled</option>
                {daysArray.map((d) => (
                  <option key={d} value={d}>
                    Day {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#17201D] mb-1">
                Start Time
              </label>
              <input
                type="time"
                disabled={dayNumber === ''}
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-[#EAE6DD] text-xs sm:text-sm text-[#17201D] focus:outline-none focus:border-[#FF6B4A] disabled:opacity-50 disabled:bg-[#F4F1EA]"
              />
            </div>
          </div>

          {/* Duration & Estimated Cost */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#17201D] mb-1">
                Duration (Minutes)
              </label>
              <input
                type="number"
                min="15"
                step="15"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#EAE6DD] text-xs sm:text-sm text-[#17201D] focus:outline-none focus:border-[#FF6B4A]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#17201D] mb-1">
                Estimated Cost ({currency})
              </label>
              <input
                type="number"
                min="0"
                step="50"
                value={estimatedCost}
                onChange={(e) => setEstimatedCost(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#EAE6DD] text-xs sm:text-sm text-[#17201D] focus:outline-none focus:border-[#FF6B4A]"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-bold text-[#17201D] mb-1">
              Location / Area
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Asakusa, Taito City, Tokyo"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#EAE6DD] text-xs sm:text-sm text-[#17201D] focus:outline-none focus:border-[#FF6B4A]"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-[#17201D] mb-1">
              Traveler Notes & Tips
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Bring socks for museum entry, book tickets in advance..."
              className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#EAE6DD] text-xs sm:text-sm text-[#17201D] focus:outline-none focus:border-[#FF6B4A]"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-3 border-t border-[#EAE6DD]">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-full bg-white border border-[#EAE6DD] hover:bg-[#F9F7F1] text-xs sm:text-sm font-bold text-[#5E6B67] transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="flex-1 py-2.5 rounded-full bg-[#FF6B4A] hover:bg-[#E55837] text-white text-xs sm:text-sm font-bold shadow-xs transition-colors cursor-pointer"
            >
              Save Activity
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
