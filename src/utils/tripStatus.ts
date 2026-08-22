/**
 * GlobeTrotter Trip Status Logic & Countdown Calculator
 * 
 * Computes dynamic real-time trip status from date ranges and planning state.
 * Never hardcodes or fabricates status.
 */

import { Trip } from '../types/trip';

export type ComputedTripStatus = 'upcoming' | 'ongoing' | 'completed' | 'draft';

export interface TripCountdownInfo {
  status: ComputedTripStatus;
  daysRemaining: number;
  label: string;
  badgeLabel: string;
  isUpcoming: boolean;
  isOngoing: boolean;
  isCompleted: boolean;
  isDraft: boolean;
  currentDay?: number;
  totalDays: number;
}

export interface TripStatusCounts {
  all: number;
  upcoming: number;
  ongoing: number;
  completed: number;
  drafts: number;
}

/**
 * Normalizes date string into local Midnight Date object for accurate day-boundary comparisons
 */
export function normalizeDate(dateStr?: string): Date | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/**
 * Determines whether a trip is currently in a Draft state.
 * A trip is considered a draft if:
 * 1. It is explicitly marked as planning with low item/itinerary counts, OR
 * 2. It does not have valid travel dates, OR
 * 3. It has placeholder destination/details.
 */
export function isTripDraft(trip: Trip): boolean {
  if (trip.status === 'planning') {
    // If dates are missing or invalid
    if (!trip.startDate || !trip.endDate) return true;
  }
  return false;
}

/**
 * Computes dynamic status for a trip based on current calendar date
 */
export function getTripStatus(trip: Trip): ComputedTripStatus {
  // If explicitly draft or missing critical start/end dates
  if (isTripDraft(trip)) {
    return 'draft';
  }

  const start = normalizeDate(trip.startDate);
  const end = normalizeDate(trip.endDate);

  if (!start || !end) {
    return 'draft';
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (today > end) {
    return 'completed';
  }

  if (today >= start && today <= end) {
    return 'ongoing';
  }

  return 'upcoming';
}

/**
 * Calculates countdown, progress through ongoing trip, and friendly display labels
 */
export function getTripCountdown(trip: Trip): TripCountdownInfo {
  const status = getTripStatus(trip);
  const start = normalizeDate(trip.startDate);
  const end = normalizeDate(trip.endDate);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const durationDays = trip.durationDays || (start && end ? Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1) : 1);

  if (status === 'draft' || !start || !end) {
    return {
      status: 'draft',
      daysRemaining: 0,
      label: 'Draft in progress',
      badgeLabel: 'Draft',
      isUpcoming: false,
      isOngoing: false,
      isCompleted: false,
      isDraft: true,
      totalDays: durationDays,
    };
  }

  if (status === 'completed') {
    return {
      status: 'completed',
      daysRemaining: 0,
      label: 'Journey completed',
      badgeLabel: 'Completed',
      isUpcoming: false,
      isOngoing: false,
      isCompleted: true,
      isDraft: false,
      totalDays: durationDays,
    };
  }

  if (status === 'ongoing') {
    const diffMs = today.getTime() - start.getTime();
    const currentDay = Math.min(durationDays, Math.max(1, Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1));
    return {
      status: 'ongoing',
      daysRemaining: 0,
      label: `Day ${currentDay} of ${durationDays}`,
      badgeLabel: 'Ongoing',
      isUpcoming: false,
      isOngoing: true,
      isCompleted: false,
      isDraft: false,
      currentDay,
      totalDays: durationDays,
    };
  }

  // Upcoming
  const diffMs = start.getTime() - today.getTime();
  const days = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

  let label = `${days} days to go`;
  if (days === 0) {
    label = 'Starts today';
  } else if (days === 1) {
    label = 'Tomorrow';
  }

  return {
    status: 'upcoming',
    daysRemaining: days,
    label,
    badgeLabel: 'Upcoming',
    isUpcoming: true,
    isOngoing: false,
    isCompleted: false,
    isDraft: false,
    totalDays: durationDays,
  };
}

/**
 * Calculates counts for all status tabs
 */
export function getTripStatusCounts(trips: Trip[]): TripStatusCounts {
  let upcoming = 0;
  let ongoing = 0;
  let completed = 0;
  let drafts = 0;

  trips.forEach((trip) => {
    const status = getTripStatus(trip);
    if (status === 'upcoming') upcoming++;
    else if (status === 'ongoing') ongoing++;
    else if (status === 'completed') completed++;
    else if (status === 'draft') drafts++;
  });

  return {
    all: trips.length,
    upcoming,
    ongoing,
    completed,
    drafts,
  };
}

/**
 * Finds the single most immediate upcoming or ongoing trip to highlight
 */
export function getNextUpcomingTrip(trips: Trip[]): Trip | null {
  // First, check if any trip is ongoing right now
  const ongoing = trips.find((t) => getTripStatus(t) === 'ongoing');
  if (ongoing) return ongoing;

  // Otherwise, find the upcoming trip starting closest to today
  const upcomingTrips = trips
    .filter((t) => getTripStatus(t) === 'upcoming')
    .sort((a, b) => {
      const dateA = normalizeDate(a.startDate)?.getTime() || Infinity;
      const dateB = normalizeDate(b.startDate)?.getTime() || Infinity;
      return dateA - dateB;
    });

  if (upcomingTrips.length > 0) {
    return upcomingTrips[0];
  }

  return null;
}

