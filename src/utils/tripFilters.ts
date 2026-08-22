/**
 * GlobeTrotter Trip Filters Utility
 * 
 * Clean, composable filtering for trip collections by status, destination,
 * date range, budget, trip type, and favorite/pinned flags.
 */

import { Trip } from '../types/trip';
import { getTripStatus, normalizeDate } from './tripStatus';

export type StatusFilter = 'all' | 'upcoming' | 'ongoing' | 'completed' | 'draft';
export type BudgetFilter = 'all' | 'under50k' | '50k_150k' | 'above150k';
export type DateFilter = 'all' | 'this_month' | 'next_3_months' | 'this_year' | 'future' | 'past';

export interface TripFilterState {
  status: StatusFilter;
  destination: string; // 'all' or specific destination name
  tripType: string; // 'all' or specific TripType
  budgetRange: BudgetFilter;
  dateRange: DateFilter;
  favoriteOnly: boolean;
  pinnedOnly: boolean;
}

export const DEFAULT_TRIP_FILTERS: TripFilterState = {
  status: 'all',
  destination: 'all',
  tripType: 'all',
  budgetRange: 'all',
  dateRange: 'all',
  favoriteOnly: false,
  pinnedOnly: false,
};

export function filterByStatus(trips: Trip[], status: StatusFilter): Trip[] {
  if (status === 'all') return trips;
  return trips.filter((trip) => getTripStatus(trip) === status);
}

export function filterByDestination(trips: Trip[], destination: string): Trip[] {
  if (!destination || destination === 'all') return trips;
  const destLower = destination.toLowerCase().trim();
  return trips.filter(
    (trip) =>
      trip.destination?.toLowerCase().includes(destLower) ||
      trip.country?.toLowerCase().includes(destLower)
  );
}

export function filterByTripType(trips: Trip[], tripType: string): Trip[] {
  if (!tripType || tripType === 'all') return trips;
  return trips.filter((trip) => trip.tripType?.toLowerCase() === tripType.toLowerCase());
}

export function filterByBudget(trips: Trip[], budgetRange: BudgetFilter): Trip[] {
  if (budgetRange === 'all') return trips;

  return trips.filter((trip) => {
    const budget = trip.budget || 0;
    if (budgetRange === 'under50k') return budget <= 50000;
    if (budgetRange === '50k_150k') return budget > 50000 && budget <= 150000;
    if (budgetRange === 'above150k') return budget > 150000;
    return true;
  });
}

export function filterByDate(trips: Trip[], dateRange: DateFilter): Trip[] {
  if (dateRange === 'all') return trips;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  return trips.filter((trip) => {
    const start = normalizeDate(trip.startDate);
    const end = normalizeDate(trip.endDate);
    if (!start) return false;

    if (dateRange === 'past') {
      return end ? end < today : start < today;
    }

    if (dateRange === 'future') {
      return start >= today;
    }

    if (dateRange === 'this_month') {
      return (
        start.getFullYear() === today.getFullYear() &&
        start.getMonth() === today.getMonth()
      );
    }

    if (dateRange === 'next_3_months') {
      const threeMonthsLater = new Date(today);
      threeMonthsLater.setMonth(today.getMonth() + 3);
      return start >= today && start <= threeMonthsLater;
    }

    if (dateRange === 'this_year') {
      return start.getFullYear() === today.getFullYear();
    }

    return true;
  });
}

export function filterByFavorites(trips: Trip[], favoriteOnly: boolean): Trip[] {
  if (!favoriteOnly) return trips;
  return trips.filter((trip) => Boolean(trip.isFavorite));
}

export function filterByPinned(trips: Trip[], pinnedOnly: boolean): Trip[] {
  if (!pinnedOnly) return trips;
  return trips.filter((trip) => Boolean(trip.isPinned));
}

/**
 * Applies all active filter state criteria in sequence
 */
export function applyTripFilters(trips: Trip[], filters: TripFilterState): Trip[] {
  let result = [...trips];

  result = filterByStatus(result, filters.status);
  result = filterByDestination(result, filters.destination);
  result = filterByTripType(result, filters.tripType);
  result = filterByBudget(result, filters.budgetRange);
  result = filterByDate(result, filters.dateRange);
  result = filterByFavorites(result, filters.favoriteOnly);
  result = filterByPinned(result, filters.pinnedOnly);

  return result;
}

/**
 * Checks if any non-default filter is currently active
 */
export function countActiveFilters(filters: TripFilterState): number {
  let count = 0;
  if (filters.status !== 'all') count++;
  if (filters.destination !== 'all') count++;
  if (filters.tripType !== 'all') count++;
  if (filters.budgetRange !== 'all') count++;
  if (filters.dateRange !== 'all') count++;
  if (filters.favoriteOnly) count++;
  if (filters.pinnedOnly) count++;
  return count;
}
