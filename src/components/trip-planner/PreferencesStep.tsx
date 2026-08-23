import React from 'react';
import { CurrencyCode, BudgetStyle, TravelStyle } from '../../types/profile';
import { TransportPreference, AccommodationStyle } from '../../types/trip';
import { BudgetSelector } from './BudgetSelector';
import { Sparkles, Check } from 'lucide-react';

interface PreferencesStepProps {
  budget: number;
  currency: CurrencyCode;
  budgetStyle?: BudgetStyle;
  travelPace?: TravelStyle;
  transportPreferences: TransportPreference[];
  accommodationStyle?: AccommodationStyle;
  onUpdate: (updates: Partial<{
    budget: number;
    currency: CurrencyCode;
    budgetStyle: BudgetStyle;
    travelPace: TravelStyle;
    transportPreferences: TransportPreference[];
    accommodationStyle: AccommodationStyle;
  }>) => void;
}

const TRAVEL_PACES: {
  id: TravelStyle;
  label: string;
  emoji: string;
  description: string;
  highlights: string;
}[] = [
  {
    id: 'relaxed',
    label: 'Relaxed',
    emoji: '🌴',
    description: 'Unrushed mornings, cafe afternoons & leisurely evening walks.',
    highlights: '1–2 activities per day · Lots of downtime',
  },
  {
    id: 'balanced',
    label: 'Balanced',
    emoji: '⚖️',
    description: 'The golden ratio of iconic sightseeing and spontaneous exploration.',
    highlights: '3–4 highlights per day · Scenic breaks',
  },
  {
    id: 'packed',
    label: 'Packed / Fast-Paced',
    emoji: '⚡',
    description: 'See as much as humanly possible, sunrise excursions to night markets.',
    highlights: '5+ sights daily · High energy itineraries',
  },
];

const TRANSPORT_OPTIONS: {
  id: TransportPreference;
  label: string;
  emoji: string;
  subtitle: string;
}[] = [
  { id: 'flights', label: 'Flights', emoji: '✈️', subtitle: 'Fast aerial connections' },
  { id: 'train', label: 'Trains', emoji: '🚆', subtitle: 'Railways & high-speed lines' },
  { id: 'road_trip', label: 'Cabs / Private Car', emoji: '🚗', subtitle: 'Private rides & scenic drives' },
  { id: 'bus', label: 'Public Transit', emoji: '🚌', subtitle: 'Metro, buses & shuttles' },
];

const ACCOMMODATION_STYLES: {
  id: AccommodationStyle;
  label: string;
  emoji: string;
  subtitle: string;
}[] = [
  { id: 'budget_hotel', label: 'Budget', emoji: '🏨', subtitle: 'Clean, reliable & cost-effective' },
  { id: 'boutique_hotel', label: 'Comfort / Hotel', emoji: '🌿', subtitle: 'Comfortable stays with local character' },
  { id: 'luxury_hotel', label: 'Luxury', emoji: '👑', subtitle: 'Premium hospitality & concierge service' },
];

export const PreferencesStep: React.FC<PreferencesStepProps> = ({
  budget,
  currency,
  budgetStyle,
  travelPace,
  transportPreferences,
  accommodationStyle,
  onUpdate,
}) => {
  const selectTransport = (opt: TransportPreference) => {
    onUpdate({ transportPreferences: [opt] });
  };

  return (
    <div className="space-y-10 animate-fadeIn">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF2EE] text-[#FF6B4A] text-xs font-bold mb-2 border border-[#FFE0D6]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Step 02 / Travel Preferences</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#17201D] tracking-tight">
          Let's shape your perfect trip.
        </h2>
        <p className="text-sm text-[#5E6B67] mt-1 leading-relaxed">
          Tell us what matters most for this journey. Pre-filled with your saved defaults.
        </p>
      </div>

      {/* Section 1: Budget & Currency Selector */}
      <div>
        <BudgetSelector
          budget={budget}
          currency={currency}
          budgetStyle={budgetStyle}
          onBudgetChange={(amount) => onUpdate({ budget: amount })}
        />
      </div>

      {/* Section 2: Travel Pace */}
      <div className="space-y-3">
        <label className="block text-xs font-bold uppercase tracking-wider text-[#4A5551]">
          How do you want to spend your days? (Travel Pace)
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {TRAVEL_PACES.map((pace) => {
            const isSelected = travelPace === pace.id;
            return (
              <div
                key={pace.id}
                role="button"
                tabIndex={0}
                aria-pressed={isSelected}
                onClick={() => onUpdate({ travelPace: pace.id })}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onUpdate({ travelPace: pace.id })}
                className={`p-4 rounded-2xl border-2 text-left cursor-pointer transition-all duration-150 flex flex-col justify-between ${
                  isSelected
                    ? 'border-[#FF6B4A] bg-[#FFF2EE] shadow-sm shadow-[#FF6B4A]/15 scale-[1.01]'
                    : 'border-[#EAE6DD] bg-white hover:border-[#D1CCC2] hover:bg-[#FAF9F5]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl" role="img" aria-hidden="true">
                      {pace.emoji}
                    </span>
                    {isSelected && (
                      <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B4A]" />
                    )}
                  </div>
                  <h4 className="text-sm font-extrabold text-[#17201D] mb-1">
                    {pace.label}
                  </h4>
                  <p className="text-xs text-[#5E6B67] leading-relaxed mb-2">
                    {pace.description}
                  </p>
                </div>
                <span className="text-[10px] font-bold text-[#FF6B4A] bg-white/80 px-2 py-0.5 rounded-md border border-[#FFD9CE] self-start">
                  {pace.highlights}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 3: Transport Preferences (Multi-Select) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#4A5551]">
            How do you prefer to get around?
          </label>
          <span className="text-[11px] font-semibold text-[#68736F]">Select one primary mode</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {TRANSPORT_OPTIONS.map((opt) => {
            const isSelected = transportPreferences.includes(opt.id);
            return (
              <div
                key={opt.id}
                role="radio"
                tabIndex={0}
                aria-checked={isSelected}
                onClick={() => selectTransport(opt.id)}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && selectTransport(opt.id)}
                className={`p-3 sm:p-3.5 rounded-2xl border-2 text-left cursor-pointer transition-all duration-150 flex items-center gap-3 ${
                  isSelected
                    ? 'border-[#20B8A6] bg-[#EDFAF7] shadow-xs'
                    : 'border-[#EAE6DD] bg-white hover:border-[#D1CCC2]'
                }`}
              >
                <span className="text-xl shrink-0" role="img" aria-hidden="true">
                  {opt.emoji}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-extrabold text-[#17201D] truncate">
                    {opt.label}
                  </p>
                  <p className="text-[10px] text-[#68736F] truncate">
                    {opt.subtitle}
                  </p>
                </div>
                {isSelected && (
                  <div className="w-5 h-5 rounded-full bg-[#20B8A6] text-white flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 stroke-[2.5]" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 4: Accommodation Style (Single-Select) */}
      <div className="space-y-3">
        <label className="block text-xs font-bold uppercase tracking-wider text-[#4A5551]">
          Where would you like to stay?
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {ACCOMMODATION_STYLES.map((style) => {
            const isSelected = accommodationStyle === style.id;
            return (
              <div
                key={style.id}
                role="button"
                tabIndex={0}
                aria-pressed={isSelected}
                onClick={() => onUpdate({ accommodationStyle: style.id })}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onUpdate({ accommodationStyle: style.id })}
                className={`p-3 sm:p-3.5 rounded-2xl border-2 text-left cursor-pointer transition-all duration-150 flex items-center gap-3 ${
                  isSelected
                    ? 'border-[#FF6B4A] bg-[#FFF2EE] shadow-xs'
                    : 'border-[#EAE6DD] bg-white hover:border-[#D1CCC2]'
                }`}
              >
                <span className="text-xl shrink-0" role="img" aria-hidden="true">
                  {style.emoji}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-extrabold text-[#17201D] truncate">
                    {style.label}
                  </p>
                  <p className="text-[10px] text-[#68736F] truncate">
                    {style.subtitle}
                  </p>
                </div>
                {isSelected && (
                  <div className="w-5 h-5 rounded-full bg-[#FF6B4A] text-white flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 stroke-[2.5]" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
