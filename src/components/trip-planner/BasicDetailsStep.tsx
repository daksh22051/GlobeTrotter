import React, { useMemo } from 'react';
import { TripType } from '../../types/trip';
import { DestinationSearch } from './DestinationSearch';
import { TravellerSelector } from './TravellerSelector';
import { Calendar, Sparkles, Clock } from 'lucide-react';

interface BasicDetailsStepProps {
  name: string;
  destination: string;
  country: string;
  destinationImage: string;
  startDate: string;
  endDate: string;
  adultsCount: number;
  childrenCount: number;
  tripType: TripType;
  errors: Record<string, string>;
  onUpdate: (updates: Partial<{
    name: string;
    destination: string;
    country: string;
    destinationImage: string;
    destinationId: string;
    startDate: string;
    endDate: string;
    adultsCount: number;
    childrenCount: number;
    tripType: TripType;
  }>) => void;
}

const TRIP_TYPES: {
  id: TripType;
  label: string;
  emoji: string;
  description: string;
}[] = [
  { id: 'leisure', label: 'Leisure', emoji: '🏖', description: 'Relaxing escapes, scenic walks & downtime' },
  { id: 'adventure', label: 'Adventure', emoji: '🏔', description: 'Hiking, treks & high-adrenaline thrills' },
  { id: 'food_culture', label: 'Food & Culture', emoji: '🍜', description: 'Culinary tours, historical monuments & arts' },
  { id: 'romantic', label: 'Romantic', emoji: '❤️', description: 'Intimate sunset dining & secluded retreats' },
  { id: 'family', label: 'Family', emoji: '👨‍👩‍👧', description: 'Kid-friendly sights, parks & easy pacing' },
  { id: 'backpacking', label: 'Backpacking', emoji: '🎒', description: 'Budget hostels, flexible routes & new friends' },
  { id: 'photography', label: 'Photography', emoji: '📸', description: 'Golden hour spots, architecture & vistas' },
  { id: 'wellness', label: 'Wellness', emoji: '🧘', description: 'Yoga retreats, hot springs & mindfulness' },
  { id: 'business', label: 'Business', emoji: '💼', description: 'Efficient logistics, work hubs & transit' },
];

export const BasicDetailsStep: React.FC<BasicDetailsStepProps> = ({
  name,
  destination,
  country,
  destinationImage,
  startDate,
  endDate,
  adultsCount,
  childrenCount,
  tripType,
  errors,
  onUpdate,
}) => {
  // Today's date string for min date (YYYY-MM-DD)
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Compute duration display
  const durationText = useMemo(() => {
    if (!startDate || !endDate) return null;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end.getTime() - start.getTime();
    if (diffTime < 0) return null;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    const nights = Math.max(0, diffDays - 1);
    if (diffDays === 1) return '1 day excursion';
    return `${diffDays} days · ${nights} ${nights === 1 ? 'night' : 'nights'}`;
  }, [startDate, endDate]);

  const handleStartDateChange = (val: string) => {
    const updates: Partial<{ startDate: string; endDate: string }> = { startDate: val };
    // If end date is earlier than new start date, push end date
    if (endDate && new Date(endDate) < new Date(val)) {
      updates.endDate = val;
    }
    onUpdate(updates);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF2EE] text-[#FF6B4A] text-xs font-bold mb-2 border border-[#FFE0D6]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Step 01 / Basic Details</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#17201D] tracking-tight">
          Where are you going?
        </h2>
        <p className="text-sm text-[#5E6B67] mt-1 leading-relaxed">
          Let's start with the basics of your journey.
        </p>
      </div>

      {/* Field 1: Trip Name */}
      <div className="space-y-1.5">
        <label
          htmlFor="trip-name-input"
          className="block text-xs font-bold uppercase tracking-wider text-[#4A5551]"
        >
          Trip Name <span className="text-[#FF6B4A]">*</span>
        </label>
        <input
          id="trip-name-input"
          type="text"
          value={name}
          onChange={(e) => onUpdate({ name: e.target.value })}
          placeholder="e.g. Summer Escape, Tokyo Sakura Season, Amalfi Sunshine"
          aria-invalid={!!errors.name}
          className={`w-full px-4 py-3 rounded-2xl bg-white text-sm font-semibold text-[#17201D] placeholder:text-[#98A29F] border transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#FF6B4A]/20 ${
            errors.name
              ? 'border-[#E55837] focus:border-[#E55837] bg-[#FFF8F6]'
              : 'border-[#EAE6DD] hover:border-[#D1CCC2] focus:border-[#FF6B4A]'
          }`}
        />
        {errors.name && (
          <p className="text-xs font-semibold text-[#E55837] mt-1">{errors.name}</p>
        )}
      </div>

      {/* Field 2: Destination Search */}
      <DestinationSearch
        value={destination}
        country={country}
        imageUrl={destinationImage}
        error={errors.destination}
        onSelect={(res) => {
          onUpdate({
            destination: res.name,
            country: res.country,
            destinationImage: res.imageUrl,
            destinationId: res.destinationId,
          });
        }}
      />

      {/* Field 3: Dates & Duration */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#4A5551]">
            Travel Dates <span className="text-[#FF6B4A]">*</span>
          </label>
          {durationText && (
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#DDF7F2] text-[#179E8E] text-xs font-bold border border-[#20B8A6]/20">
              <Clock className="w-3.5 h-3.5" />
              <span>{durationText}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Start Date */}
          <div className="space-y-1">
            <label
              htmlFor="trip-start-date"
              className="text-[11px] font-bold text-[#68736F] flex items-center gap-1"
            >
              <Calendar className="w-3.5 h-3.5 text-[#FF6B4A]" />
              <span>Departure / Start Date</span>
            </label>
            <input
              id="trip-start-date"
              type="date"
              min={todayStr}
              value={startDate}
              onChange={(e) => handleStartDateChange(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-white text-sm font-semibold text-[#17201D] border border-[#EAE6DD] hover:border-[#D1CCC2] focus:border-[#FF6B4A] focus:outline-none focus:ring-2 focus:ring-[#FF6B4A]/20"
            />
          </div>

          {/* End Date */}
          <div className="space-y-1">
            <label
              htmlFor="trip-end-date"
              className="text-[11px] font-bold text-[#68736F] flex items-center gap-1"
            >
              <Calendar className="w-3.5 h-3.5 text-[#20B8A6]" />
              <span>Return / End Date</span>
            </label>
            <input
              id="trip-end-date"
              type="date"
              min={startDate || todayStr}
              value={endDate}
              onChange={(e) => onUpdate({ endDate: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-white text-sm font-semibold text-[#17201D] border border-[#EAE6DD] hover:border-[#D1CCC2] focus:border-[#FF6B4A] focus:outline-none focus:ring-2 focus:ring-[#FF6B4A]/20"
            />
          </div>
        </div>

        {errors.dates && (
          <p className="text-xs font-semibold text-[#E55837] mt-1">{errors.dates}</p>
        )}
      </div>

      {/* Field 4: Traveller Selector */}
      <TravellerSelector
        adultsCount={adultsCount}
        childrenCount={childrenCount}
        onAdultsChange={(count) => onUpdate({ adultsCount: count })}
        onChildrenChange={(count) => onUpdate({ childrenCount: count })}
      />

      {/* Field 5: Trip Type Selection */}
      <div className="space-y-3">
        <label className="block text-xs font-bold uppercase tracking-wider text-[#4A5551]">
          Trip Style & Theme <span className="text-[#FF6B4A]">*</span>
        </label>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {TRIP_TYPES.map((type) => {
            const isSelected = tripType === type.id;
            return (
              <div
                key={type.id}
                role="button"
                tabIndex={0}
                aria-pressed={isSelected}
                onClick={() => onUpdate({ tripType: type.id })}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onUpdate({ tripType: type.id })}
                className={`p-3 sm:p-3.5 rounded-2xl border-2 text-left cursor-pointer transition-all duration-150 flex flex-col justify-between ${
                  isSelected
                    ? 'border-[#FF6B4A] bg-[#FFF2EE] shadow-sm shadow-[#FF6B4A]/15 scale-[1.01]'
                    : 'border-[#EAE6DD] bg-white hover:border-[#D1CCC2] hover:bg-[#FAF9F5]'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xl sm:text-2xl" role="img" aria-hidden="true">
                    {type.emoji}
                  </span>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-[#FF6B4A]" />
                  )}
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-extrabold text-[#17201D]">
                    {type.label}
                  </p>
                  <p className="text-[10px] text-[#68736F] line-clamp-1 mt-0.5">
                    {type.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
