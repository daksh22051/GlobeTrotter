/**
 * Trip Cost Estimator Utility
 * 
 * Computes realistic, transparent frontend cost estimations based on
 * duration, travellers, destination daily averages, accommodation style,
 * and transport preferences. Clearly labeled as estimated.
 */

import { FEATURED_DESTINATIONS } from '../data/destinations';
import { CurrencyCode, BudgetStyle } from '../types/profile';
import { AccommodationStyle, TransportPreference } from '../types/trip';
import { CURRENCIES, convertCurrency } from './currency';

interface CostEstimationParams {
  destination: string;
  country?: string;
  durationDays?: number;
  days?: number;
  travelersCount: number;
  budgetStyle?: BudgetStyle;
  accommodationStyle?: AccommodationStyle;
  transportPreferences?: TransportPreference[];
  currency?: CurrencyCode;
  targetCurrency?: CurrencyCode;
}

export interface EstimatedCostBreakdown {
  totalEstimatedCost: number;
  totalEstimated: number;
  dailyAveragePerPerson: number;
  dailyRate: number;
  accommodationEstimate: number;
  transportEstimate: number;
  activitiesFoodEstimate: number;
  currency: CurrencyCode;
  currencySymbol: string;
  formattedTotal: string;
  formattedDaily: string;
}

const ACCOMMODATION_MULTIPLIERS: Record<AccommodationStyle, number> = {
  hostel: 0.55,
  budget_hotel: 0.8,
  apartment: 0.95,
  boutique_hotel: 1.25,
  resort: 1.65,
  luxury_hotel: 2.3,
};

const BUDGET_TIER_MULTIPLIERS: Record<BudgetStyle, number> = {
  budget_friendly: 0.75,
  balanced: 1.0,
  comfort: 1.35,
  luxury: 2.0,
};

export const estimateTripCost = (params: CostEstimationParams): EstimatedCostBreakdown => {
  const {
    destination,
    durationDays,
    days,
    travelersCount = 1,
    budgetStyle = 'balanced',
    accommodationStyle = 'boutique_hotel',
    transportPreferences = ['flights', 'walking'],
    currency,
    targetCurrency = 'INR',
  } = params;

  const validDays = Math.max(1, durationDays || days || 1);
  const validTravelers = Math.max(1, travelersCount);
  const activeCurrency = currency || targetCurrency;

  // 1. Find matched destination or fallback base daily rate (in INR)
  const matched = FEATURED_DESTINATIONS.find(
    (d) =>
      d.name.toLowerCase() === destination.toLowerCase() ||
      d.id.toLowerCase() === destination.toLowerCase() ||
      destination.toLowerCase().includes(d.name.toLowerCase())
  );

  const baseDailyRateInINR = matched?.estimatedDailyBudget || 5500;

  // The destination card is the source of truth for the initial estimate.
  // Preferences can refine this later when explicit pricing data is available.
  const dailyPerPersonInINR = Math.max(0, baseDailyRateInINR);
  const totalInINR = Math.max(0, dailyPerPersonInINR * validDays * validTravelers);

  // 3. Convert to user currency
  const totalConverted = convertCurrency(totalInINR, 'INR', activeCurrency);
  const dailyPerPersonConverted = convertCurrency(dailyPerPersonInINR, 'INR', activeCurrency);

  // Round to pleasant figures
  const roundedTotal = Math.max(0, Math.round(totalConverted / 100) * 100 || Math.round(totalConverted));
  const roundedDaily = Math.max(0, Math.round(dailyPerPersonConverted / 10) * 10 || Math.round(dailyPerPersonConverted));

  // Sub-breakdowns
  const accomPortion = Math.round(roundedTotal * 0.45);
  const transPortion = Math.round(roundedTotal * 0.25);
  const actFoodPortion = Math.max(0, roundedTotal - accomPortion - transPortion);

  const currConfig = CURRENCIES[activeCurrency] || CURRENCIES.INR;

  const formattedTotal = `${currConfig.symbol}${roundedTotal.toLocaleString()}`;
  const formattedDaily = `${currConfig.symbol}${roundedDaily.toLocaleString()}`;

  return {
    totalEstimatedCost: roundedTotal,
    totalEstimated: roundedTotal,
    dailyAveragePerPerson: roundedDaily,
    dailyRate: roundedDaily,
    accommodationEstimate: Math.max(0, accomPortion),
    transportEstimate: Math.max(0, transPortion),
    activitiesFoodEstimate: Math.max(0, actFoodPortion),
    currency: activeCurrency,
    currencySymbol: currConfig.symbol,
    formattedTotal,
    formattedDaily,
  };
};
