import React from 'react';
import {
  MapPin,
  Calendar,
  Users,
  Compass,
  Wallet,
  Hotel,
  Car,
  Heart,
  Edit3,
  Sparkles,
  ArrowRight,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { CurrencyCode, BudgetStyle, TravelStyle } from '../../types/profile';
import { TripType, TransportPreference, AccommodationStyle } from '../../types/trip';
import { CURRENCIES, formatCurrency } from '../../utils/currency';

interface ReviewStepProps {
  name: string;
  destination: string;
  country: string;
  destinationImage: string;
  startDate: string;
  endDate: string;
  adultsCount: number;
  childrenCount: number;
  tripType: TripType;
  budget: number;
  currency: CurrencyCode;
  budgetStyle: BudgetStyle;
  travelPace: TravelStyle;
  transportPreferences: TransportPreference[];
  accommodationStyle: AccommodationStyle;
  interests: string[];
  notes?: string;
  isSubmitting: boolean;
  onGoToStep: (step: number) => void;
  onSubmit: () => void;
}

export const ReviewStep: React.FC<ReviewStepProps> = ({
  name,
  destination,
  country,
  destinationImage,
  startDate,
  endDate,
  adultsCount,
  childrenCount,
  tripType,
  budget,
  currency,
  budgetStyle,
  travelPace,
  transportPreferences,
  accommodationStyle,
  interests,
  notes,
  isSubmitting,
  onGoToStep,
  onSubmit,
}) => {
  const totalTravelers = adultsCount + childrenCount;
  const currConfig = CURRENCIES[currency] || CURRENCIES.INR;

  // Format date range
  const formattedDates = React.useMemo(() => {
    if (!startDate || !endDate) return 'Dates to be selected';
    const s = new Date(startDate);
    const e = new Date(endDate);
    const startStr = s.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    const endStr = e.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    const diffTime = e.getTime() - s.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    const nights = Math.max(0, diffDays - 1);
    return {
      dateRange: `${startStr} – ${endStr}`,
      duration: `${diffDays} days · ${nights} nights`,
      days: diffDays,
    };
  }, [startDate, endDate]);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF2EE] text-[#FF6B4A] text-xs font-bold mb-2 border border-[#FFE0D6]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Step 04 / Review Trip</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#17201D] tracking-tight">
          Ready to create your trip?
        </h2>
        <p className="text-sm text-[#5E6B67] mt-1 leading-relaxed">
          Review your journey blueprint. You can always refine activities and schedules later.
        </p>
      </div>

      {/* Destination Hero Visual Card */}
      <div className="relative rounded-3xl overflow-hidden shadow-md border border-[#EAE6DD] bg-[#17201D] text-white">
        <div className="h-56 sm:h-64 w-full relative">
          <img
            src={destinationImage || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=85'}
            alt={destination}
            className="w-full h-full object-cover brightness-[0.8]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
        </div>

        {/* Hero Overlay Content */}
        <div className="absolute bottom-0 inset-x-0 p-5 sm:p-6 space-y-3">
          <div>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-white text-[10px] font-extrabold uppercase tracking-wider mb-2">
              <MapPin className="w-3 h-3 text-[#FF8E72]" />
              <span>{destination}, {country}</span>
            </span>
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white drop-shadow-xs">
              {name || 'My Journey'}
            </h3>
            <p className="text-xs sm:text-sm font-medium text-white/90 mt-0.5">
              {typeof formattedDates === 'object' ? `${formattedDates.dateRange} · ${formattedDates.duration}` : formattedDates}
            </p>
          </div>

          {/* Quick Badges Strip */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="px-3 py-1 rounded-full bg-white/15 backdrop-blur-xs text-xs font-bold text-white border border-white/20">
              {typeof formattedDates === 'object' ? `${formattedDates.days} Days` : 'Trip'}
            </span>
            <span className="px-3 py-1 rounded-full bg-white/15 backdrop-blur-xs text-xs font-bold text-white border border-white/20">
              {totalTravelers} {totalTravelers === 1 ? 'Traveler' : 'Travelers'}
            </span>
            <span className="px-3 py-1 rounded-full bg-white/15 backdrop-blur-xs text-xs font-bold text-white border border-white/20 capitalize">
              {travelPace} Pace
            </span>
            <span className="px-3 py-1 rounded-full bg-[#FF6B4A] text-xs font-extrabold text-white shadow-xs">
              {currConfig.symbol}{budget.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Structured Review Sections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Section: WHERE */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#EAE6DD] shadow-2xs flex flex-col justify-between">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#FF6B4A]">
              <MapPin className="w-4 h-4" />
              <span>Where</span>
            </div>
            <button
              type="button"
              onClick={() => onGoToStep(1)}
              className="text-xs font-bold text-[#FF6B4A] hover:text-[#E55837] flex items-center gap-1 cursor-pointer"
            >
              <Edit3 className="w-3 h-3" />
              <span>Edit</span>
            </button>
          </div>
          <div>
            <p className="text-base font-extrabold text-[#17201D]">{destination}</p>
            <p className="text-xs text-[#68736F]">{country || 'Global Destination'}</p>
          </div>
        </div>

        {/* Section: WHEN */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#EAE6DD] shadow-2xs flex flex-col justify-between">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#FF6B4A]">
              <Calendar className="w-4 h-4" />
              <span>When</span>
            </div>
            <button
              type="button"
              onClick={() => onGoToStep(1)}
              className="text-xs font-bold text-[#FF6B4A] hover:text-[#E55837] flex items-center gap-1 cursor-pointer"
            >
              <Edit3 className="w-3 h-3" />
              <span>Edit</span>
            </button>
          </div>
          <div>
            <p className="text-base font-extrabold text-[#17201D]">
              {typeof formattedDates === 'object' ? formattedDates.dateRange : 'Dates selected'}
            </p>
            <p className="text-xs text-[#20B8A6] font-semibold">
              {typeof formattedDates === 'object' ? formattedDates.duration : ''}
            </p>
          </div>
        </div>

        {/* Section: WHO */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#EAE6DD] shadow-2xs flex flex-col justify-between">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#FF6B4A]">
              <Users className="w-4 h-4" />
              <span>Who</span>
            </div>
            <button
              type="button"
              onClick={() => onGoToStep(1)}
              className="text-xs font-bold text-[#FF6B4A] hover:text-[#E55837] flex items-center gap-1 cursor-pointer"
            >
              <Edit3 className="w-3 h-3" />
              <span>Edit</span>
            </button>
          </div>
          <div>
            <p className="text-base font-extrabold text-[#17201D]">
              {totalTravelers} {totalTravelers === 1 ? 'Traveler' : 'Travelers'}
            </p>
            <p className="text-xs text-[#68736F]">
              {adultsCount} {adultsCount === 1 ? 'Adult' : 'Adults'}
              {childrenCount > 0 ? ` · ${childrenCount} ${childrenCount === 1 ? 'Child' : 'Children'}` : ''}
            </p>
          </div>
        </div>

        {/* Section: STYLE & THEME */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#EAE6DD] shadow-2xs flex flex-col justify-between">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#FF6B4A]">
              <Compass className="w-4 h-4" />
              <span>Style & Pace</span>
            </div>
            <button
              type="button"
              onClick={() => onGoToStep(2)}
              className="text-xs font-bold text-[#FF6B4A] hover:text-[#E55837] flex items-center gap-1 cursor-pointer"
            >
              <Edit3 className="w-3 h-3" />
              <span>Edit</span>
            </button>
          </div>
          <div>
            <p className="text-base font-extrabold text-[#17201D] capitalize">
              {tripType.replace('_', ' ')} Trip
            </p>
            <p className="text-xs text-[#68736F] capitalize">
              {travelPace} daily pace
            </p>
          </div>
        </div>

        {/* Section: BUDGET */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#EAE6DD] shadow-2xs flex flex-col justify-between">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#FF6B4A]">
              <Wallet className="w-4 h-4" />
              <span>Budget</span>
            </div>
            <button
              type="button"
              onClick={() => onGoToStep(2)}
              className="text-xs font-bold text-[#FF6B4A] hover:text-[#E55837] flex items-center gap-1 cursor-pointer"
            >
              <Edit3 className="w-3 h-3" />
              <span>Edit</span>
            </button>
          </div>
          <div>
            <p className="text-base font-extrabold text-[#17201D]">
              {currConfig.symbol}{budget.toLocaleString()} {currency}
            </p>
            <p className="text-xs text-[#68736F] capitalize">
              {budgetStyle.replace('_', ' ')} tier
            </p>
          </div>
        </div>

        {/* Section: STAY & GETTING AROUND */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#EAE6DD] shadow-2xs flex flex-col justify-between">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#FF6B4A]">
              <Hotel className="w-4 h-4" />
              <span>Stay & Transit</span>
            </div>
            <button
              type="button"
              onClick={() => onGoToStep(2)}
              className="text-xs font-bold text-[#FF6B4A] hover:text-[#E55837] flex items-center gap-1 cursor-pointer"
            >
              <Edit3 className="w-3 h-3" />
              <span>Edit</span>
            </button>
          </div>
          <div>
            <p className="text-base font-extrabold text-[#17201D] capitalize">
              {accommodationStyle.replace('_', ' ')}
            </p>
            <p className="text-xs text-[#68736F] capitalize truncate">
              {transportPreferences.map((t) => t.replace('_', ' ')).join(', ')}
            </p>
          </div>
        </div>
      </div>

      {/* Section: INTERESTS */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#EAE6DD] shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#FF6B4A]">
            <Heart className="w-4 h-4" />
            <span>Selected Interests & Experiences ({interests.length})</span>
          </div>
          <button
            type="button"
            onClick={() => onGoToStep(3)}
            className="text-xs font-bold text-[#FF6B4A] hover:text-[#E55837] flex items-center gap-1 cursor-pointer"
          >
            <Edit3 className="w-3 h-3" />
            <span>Edit</span>
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {interests.map((interest) => (
            <span
              key={interest}
              className="px-3 py-1 rounded-full bg-[#FFF2EE] text-[#FF6B4A] text-xs font-bold border border-[#FFD9CE]"
            >
              {interest}
            </span>
          ))}
        </div>

        {notes && (
          <div className="mt-3 pt-3 border-t border-[#F4F1EA]">
            <span className="text-[11px] font-bold text-[#98A29F] uppercase block mb-1">
              Traveler Notes
            </span>
            <p className="text-xs text-[#4A5551] italic leading-relaxed bg-[#FCFBF8] p-3 rounded-xl border border-[#EAE6DD]">
              "{notes}"
            </p>
          </div>
        )}
      </div>

      {/* Create My Trip Button */}
      <div className="pt-4 flex flex-col sm:flex-row items-center gap-4">
        <button
          type="button"
          disabled={isSubmitting}
          onClick={onSubmit}
          className="w-full sm:flex-1 py-4 px-8 rounded-full bg-[#FF6B4A] hover:bg-[#E55837] text-white font-extrabold text-base shadow-md shadow-[#FF6B4A]/25 hover:shadow-lg hover:shadow-[#FF6B4A]/30 active:scale-[0.99] transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Creating your trip...</span>
            </>
          ) : (
            <>
              <span>Create My Trip</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
