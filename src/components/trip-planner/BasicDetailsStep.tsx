import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { TripType, TripCity } from '../../types/trip';
import { MultiCitySelector } from './MultiCitySelector';
import { TravellerSelector } from './TravellerSelector';
import { Calendar, Clock } from 'lucide-react';

interface BasicDetailsStepProps {
  name: string;
  destination: string;
  country: string;
  destinationImage: string;
  cities?: TripCity[];
  startDate: string;
  endDate: string;
  arrivalLocation: string;
  arrivalTime: string;
  adultsCount: number;
  childrenCount: number;
  tripType: TripType;
  errors: Record<string, string>;
  cityDurationMismatch?: string;
  onUpdate: (updates: Partial<{
    name: string;
    destination: string;
    country: string;
    destinationImage: string;
    destinationId: string;
    cities: TripCity[];
    startDate: string;
    endDate: string;
    arrivalLocation: string;
    arrivalTime: string;
    adultsCount: number;
    childrenCount: number;
    tripType: TripType;
  }>) => void;
}

const TRIP_TYPES: {
  id: TripType;
  label: string;
  emoji: string;
}[] = [
  { id: 'leisure', label: 'Leisure', emoji: '🏖' },
  { id: 'adventure', label: 'Adventure', emoji: '🏔' },
  { id: 'food_culture', label: 'Cultural', emoji: '🏛' },
  { id: 'romantic', label: 'Romantic', emoji: '❤️' },
];

export const BasicDetailsStep: React.FC<BasicDetailsStepProps> = ({
  name,
  destination,
  country,
  destinationImage,
  cities = [],
  startDate,
  endDate,
  arrivalLocation,
  arrivalTime,
  adultsCount,
  childrenCount,
  tripType,
  errors,
  cityDurationMismatch,
  onUpdate,
}) => {
  const [isMultiCity, setIsMultiCity] = useState(cities.length > 1);

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

      {/* Field 2: Multi-City or Single Destination Search */}
      <MultiCitySelector
        isMultiCity={isMultiCity}
        onToggleMultiCity={(multi) => {
          setIsMultiCity(multi);
          if (!multi && cities.length > 0) {
            onUpdate({
              destination: cities[0].cityName,
              country: cities[0].country,
              cities: [cities[0]],
            });
          }
        }}
        primaryDestination={destination}
        primaryCountry={country}
        primaryImage={destinationImage}
        cities={cities}
        startDate={startDate}
        endDate={endDate}
        error={errors.destination}
        onUpdatePrimary={(res) => {
          onUpdate({
            destination: res.name,
            country: res.country,
            destinationImage: res.imageUrl,
            destinationId: res.destinationId,
            cities: [
              { cityName: res.name, country: res.country, orderIndex: 0, stayDurationDays: 3 }
            ],
          });
        }}
        onUpdateCities={(newCities) => {
          const primary = newCities[0];
          onUpdate({
            cities: newCities,
            ...(primary ? { destination: primary.cityName, country: primary.country } : {}),
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

        {(errors.dates || cityDurationMismatch) && (
          <p className="text-xs font-semibold text-[#E55837] mt-1">{errors.dates || cityDurationMismatch}</p>
        )}
      </div>

      {/* Field 4: Arrival Details */}
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#4A5551]">
            Arrival Details <span className="text-[#98A29F] font-normal normal-case">(Optional)</span>
          </label>
          <p className="text-xs text-[#68736F] mt-1">
            Start your first day from the place and time you arrive.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_150px] gap-3">
          <div className="space-y-1">
            <label htmlFor="arrival-location" className="text-[11px] font-bold text-[#68736F] flex items-center gap-1">
              Arrival point
            </label>
            <input
              id="arrival-location"
              type="text"
              value={arrivalLocation}
              onChange={(e) => onUpdate({ arrivalLocation: e.target.value })}
              placeholder="e.g. Manali Bus Stand or Bhuntar Airport"
              className="w-full px-3.5 py-2.5 rounded-2xl bg-white text-sm font-semibold text-[#17201D] border border-[#EAE6DD] hover:border-[#D1CCC2] focus:border-[#FF6B4A] focus:outline-none focus:ring-2 focus:ring-[#FF6B4A]/20"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="arrival-time" className="text-[11px] font-bold text-[#68736F] flex items-center gap-1">
              Arrival time
            </label>
            <input
              id="arrival-time"
              type="time"
              value={arrivalTime}
              onChange={(e) => onUpdate({ arrivalTime: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-white text-sm font-semibold text-[#17201D] border border-[#EAE6DD] hover:border-[#D1CCC2] focus:border-[#FF6B4A] focus:outline-none focus:ring-2 focus:ring-[#FF6B4A]/20"
            />
          </div>
        </div>
      </div>

      {/* Field 5: Traveller Selector */}
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {TRIP_TYPES.map((type) => {
            const isSelected = tripType === type.id;
            return (
              <motion.button
                key={type.id}
                type="button"
                role="button"
                aria-pressed={isSelected}
                onClick={() => onUpdate({ tripType: type.id })}
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.96 }}
                className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full border text-sm font-bold cursor-pointer transition-all duration-150 ${
                  isSelected
                    ? 'border-[#FF6B4A] bg-[#FFF2EE] text-[#E55837] shadow-sm shadow-[#FF6B4A]/15'
                    : 'border-[#EAE6DD] bg-white text-[#4A5551] hover:border-[#FF6B4A]/50 hover:bg-[#FAF9F5]'
                }`}
              >
                <span role="img" aria-hidden="true">{type.emoji}</span>
                <span>{type.label}</span>
                {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B4A]" />}
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
