/**
 * GlobeTrotter Trip Search Utility
 * 
 * Performs fast, case-insensitive multi-token client search across
 * trip name, destination, country, notes, trip type, and interests.
 */

import { Trip } from '../types/trip';

export function searchTrips(trips: Trip[], query: string): Trip[] {
  if (!query || !query.trim()) {
    return trips;
  }

  const normalizedQuery = query.toLowerCase().trim();
  const tokens = normalizedQuery.split(/\s+/).filter(Boolean);

  if (tokens.length === 0) {
    return trips;
  }

  return trips.filter((trip) => {
    // Build searchable content string
    const searchableFields = [
      trip.name || '',
      trip.destination || '',
      trip.country || '',
      trip.notes || '',
      trip.tripType || '',
      trip.accommodationStyle || '',
      trip.travelPace || '',
      ...(trip.interests || []),
    ]
      .join(' ')
      .toLowerCase();

    // Must match all tokens
    return tokens.every((token) => searchableFields.includes(token));
  });
}
