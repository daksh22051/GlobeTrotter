import React, { useState } from 'react';
import {
  MapPin,
  Calendar,
  Users,
  Compass,
  Wallet,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  Clock,
  Layers,
} from 'lucide-react';
import { CurrencyCode, BudgetStyle, TravelStyle } from '../../types/profile';
import { TripType, TransportPreference, AccommodationStyle } from '../../types/trip';
import { estimateTripCost } from '../../utils/tripCostEstimator';
import { calculateTripReadiness } from '../../utils/tripReadiness';
import { CURRENCIES, formatCurrency } from '../../utils/currency';

interface TripSummaryProps {
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
  budgetStyle?: BudgetStyle;
  travelPace?: TravelStyle;
  transportPreferences: TransportPreference[];
  accommodationStyle?: AccommodationStyle;
  interests: string[];
  destinationId?: string;
  isBudgetConfigured?: boolean;
}

export const TripSummary: React.FC<TripSummaryProps> = ({
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
  destinationId,
  isBudgetConfigured = false,
}) => {
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);
  const totalTravelers = adultsCount + childrenCount;
  const currConfig = CURRENCIES[currency] || CURRENCIES.INR;
  const hasValidDestination = Boolean(destinationId && destination.trim());
  const selectedBudgetStyle = budgetStyle || 'balanced';
  const selectedTravelPace = travelPace || 'balanced';
  const selectedAccommodationStyle = accommodationStyle || 'boutique_hotel';

  // Calculate days & nights
  const durationInfo = React.useMemo(() => {
    if (!startDate || !endDate) return { days: 0, nights: 0, text: 'Dates pending' };
    const s = new Date(startDate);
    const e = new Date(endDate);
    const diffTime = e.getTime() - s.getTime();
    if (diffTime < 0) return { days: 0, nights: 0, text: 'Dates pending' };
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    const nights = Math.max(0, days - 1);
    return {
      days,
      nights,
      text: `${days} ${days === 1 ? 'day' : 'days'}${nights > 0 ? ` · ${nights} nights` : ''}`,
    };
  }, [startDate, endDate]);

  const hasRequiredCostInputs = hasValidDestination && durationInfo.days > 0 && totalTravelers > 0;

  // Estimated Cost calculation (deterministic)
  const costEstimate = React.useMemo(() => {
    if (!hasRequiredCostInputs) {
      return { totalEstimated: 0, dailyRate: 0 };
    }

    return estimateTripCost({
      destination,
      days: durationInfo.days,
      travelersCount: totalTravelers,
      budgetStyle: selectedBudgetStyle,
      accommodationStyle: selectedAccommodationStyle,
      transportPreferences,
      targetCurrency: currency,
    });
  }, [
    destination,
    durationInfo.days,
    totalTravelers,
    selectedBudgetStyle,
    selectedAccommodationStyle,
    transportPreferences,
    currency,
    hasRequiredCostInputs,
  ]);

  // Planning Readiness calculation
  const readiness = React.useMemo(() => {
    return calculateTripReadiness({
      name,
      destination,
      startDate,
      endDate,
      travelersCount: totalTravelers,
      tripType,
      budget,
      interests,
      accommodationStyle,
      transportPreferences,
    });
  }, [
    name,
    destination,
    startDate,
    endDate,
    totalTravelers,
    tripType,
    budget,
    interests,
    accommodationStyle,
    transportPreferences,
  ]);

  const safeBudget = Math.max(0, budget || 0);
  const hasTargetBudget = hasValidDestination && isBudgetConfigured && safeBudget > 0;
  const isOverBudget = hasTargetBudget && costEstimate.totalEstimated > budget;
  const isWellBudgeted = hasTargetBudget && costEstimate.totalEstimated <= budget;

  return (
    <aside
      id="trip-summary-panel"
      aria-label="Live Trip Summary"
      className="bg-white rounded-3xl border border-[#EAE6DD] shadow-xs overflow-hidden transition-all duration-200"
    >
      {/* Mobile Accordion Header */}
      <button
        type="button"
        onClick={() => setIsMobileExpanded(!isMobileExpanded)}
        className="w-full lg:hidden p-4 flex items-center justify-between text-left bg-[#FFFDFB] border-b border-[#F4F1EA]"
        aria-expanded={isMobileExpanded}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#FFF2EE] text-[#FF6B4A] flex items-center justify-center font-bold text-xs">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-extrabold text-[#17201D]">
              {name || 'Trip Summary'} · {readiness.percentage}% Ready
            </p>
            <p className="text-[11px] text-[#68736F] truncate">
              {destination ? `${destination}, ${country}` : 'Destination not selected'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-black text-[#FF6B4A]">
            {isBudgetConfigured && safeBudget > 0 ? `${currConfig.symbol}${safeBudget.toLocaleString()}` : 'Not set'}
          </span>
          {isMobileExpanded ? (
            <ChevronUp className="w-4 h-4 text-[#98A29F]" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[#98A29F]" />
          )}
        </div>
      </button>

      {/* Main Summary Body (Always visible on lg, toggled on mobile) */}
      <div className={`p-5 space-y-5 ${isMobileExpanded ? 'block' : 'hidden lg:block'}`}>
        {/* Header Title */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#FFF2EE] text-[#FF6B4A] flex items-center justify-center">
              <Compass className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-sm font-extrabold text-[#17201D] tracking-tight">
              Live Trip Summary
            </h3>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-[#FCFBF8] border border-[#EAE6DD] text-[10px] font-extrabold text-[#68736F] uppercase">
            Auto-Sync
          </span>
        </div>

        {/* Live Destination Visual Preview */}
        <div className="relative h-32 rounded-2xl overflow-hidden bg-[#F4F1EA] border border-[#EAE6DD]">
          <img
            src={destinationImage || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=600&q=80'}
            alt={destination || 'Travel Preview'}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
          <div className="absolute bottom-2.5 left-3 right-3 text-white">
            <p className="text-sm font-extrabold truncate">
              {destination || 'Choose a Destination'}
            </p>
            <p className="text-[11px] text-white/90 truncate">
              {country || 'Global Discovery'}
            </p>
          </div>
        </div>

        {/* Planning Readiness Score Bar */}
        <div className="p-3.5 rounded-2xl bg-[#FCFBF8] border border-[#EAE6DD] space-y-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-[#4A5551]">Planning Readiness</span>
            <span className="text-[#FF6B4A] font-black">{readiness.percentage}%</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 rounded-full bg-[#EAE6DD] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#FF8E72] to-[#FF6B4A] transition-all duration-300"
              style={{ width: `${readiness.percentage}%` }}
            />
          </div>

          <p className="text-[10px] text-[#68736F] leading-tight">
            {readiness.statusMessage}
          </p>
        </div>

        {/* Key Trip Details List */}
        <div className="space-y-2.5 text-xs text-[#4A5551]">
          {/* Trip Name */}
          <div className="flex items-center justify-between py-1 border-b border-[#F4F1EA]">
            <span className="text-[#98A29F] font-semibold">Trip Name</span>
            <span className="font-bold text-[#17201D] truncate max-w-[150px]">
              {name || 'Untitled Trip'}
            </span>
          </div>

          {/* Dates & Duration */}
          <div className="flex items-center justify-between py-1 border-b border-[#F4F1EA]">
            <span className="text-[#98A29F] font-semibold flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#68736F]" />
              <span>Duration</span>
            </span>
            <span className="font-bold text-[#17201D]">
              {durationInfo.text}
            </span>
          </div>

          {/* Travellers */}
          <div className="flex items-center justify-between py-1 border-b border-[#F4F1EA]">
            <span className="text-[#98A29F] font-semibold flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-[#68736F]" />
              <span>Travellers</span>
            </span>
            <span className="font-bold text-[#17201D]">
              {totalTravelers} {totalTravelers === 1 ? 'Person' : 'People'}
            </span>
          </div>

          {/* Style & Pace */}
          <div className="flex items-center justify-between py-1 border-b border-[#F4F1EA]">
            <span className="text-[#98A29F] font-semibold">Style & Pace</span>
            <span className="font-bold text-[#17201D] capitalize truncate max-w-[150px]">
              {tripType} · {selectedTravelPace}
            </span>
          </div>

          {/* Target Budget */}
          <div className="flex items-center justify-between py-1 border-b border-[#F4F1EA]">
            <span className="text-[#98A29F] font-semibold flex items-center gap-1">
              <Wallet className="w-3.5 h-3.5 text-[#68736F]" />
              <span>Your Target</span>
            </span>
            <span className="font-black text-[#FF6B4A]">
              {isBudgetConfigured && safeBudget > 0 ? `${currConfig.symbol}${safeBudget.toLocaleString()} ${currency}` : 'Not set'}
            </span>
          </div>
        </div>

        {/* Estimated Cost Breakdown (Frontend Deterministic Logic) */}
        {hasValidDestination && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#FFF9F6] to-[#FFF3EE] border border-[#FFD9CE] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#FF6B4A]">
              Estimated Trip Cost
            </span>
            {isWellBudgeted ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-[#179E8E] bg-[#DDF7F2] px-2 py-0.5 rounded-md">
                <CheckCircle2 className="w-3 h-3" />
                <span>Within Budget</span>
              </span>
            ) : isOverBudget ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-[#E55837] bg-[#FFE4DD] px-2 py-0.5 rounded-md">
                <AlertCircle className="w-3 h-3" />
                <span>Adjust Target</span>
              </span>
            ) : (
              <span className="text-[10px] font-extrabold text-[#68736F] bg-white px-2 py-0.5 rounded-md">
                Set target to compare
              </span>
            )}
          </div>

          <div className="flex items-baseline justify-between">
            <span className="text-lg font-black text-[#17201D]">
              {hasRequiredCostInputs ? `~${currConfig.symbol}${Math.max(0, costEstimate.totalEstimated).toLocaleString()}` : 'Pending input'}
            </span>
            <span className="text-[11px] text-[#68736F] font-medium">
              {hasRequiredCostInputs ? `~${currConfig.symbol}${Math.max(0, costEstimate.dailyRate).toLocaleString()} / day` : 'Add dates and travellers'}
            </span>
          </div>

          <p className="text-[10px] text-[#68736F] leading-tight">
            * Estimated based on your selected {selectedAccommodationStyle.replace('_', ' ')} stay and {selectedBudgetStyle.replace('_', ' ')} tier.
          </p>
        </div>
        )}

      </div>
    </aside>
  );
};
