/**
 * GlobeTrotter Trip Sorting Utility
 * 
 * Implements pure sorting methods for trip collections without mutating original arrays.
 */

import { Trip } from '../types/trip';
import { getTripStatus, normalizeDate } from './tripStatus';
import { calculateTripProgress } from './tripProgressCalculator';
import { calculateTripHealthSummary } from './tripHealthSummary';

export type TripSortOption =
  | 'upcoming_first'
  | 'recently_created'
  | 'recently_updated'
  | 'start_date_asc'
  | 'start_date_desc'
  | 'budget_asc'
  | 'budget_desc'
  | 'alphabetical'
  | 'progress_desc'
  | 'health_desc';

export interface SortOptionConfig {
  value: TripSortOption;
  label: string;
}

export const SORT_OPTIONS: SortOptionConfig[] = [
  { value: 'upcoming_first', label: 'Upcoming First' },
  { value: 'recently_updated', label: 'Recently Updated' },
  { value: 'recently_created', label: 'Recently Created' },
  { value: 'start_date_asc', label: 'Start Date: Earliest First' },
  { value: 'start_date_desc', label: 'Start Date: Latest First' },
  { value: 'budget_asc', label: 'Budget: Low → High' },
  { value: 'budget_desc', label: 'Budget: High → Low' },
  { value: 'alphabetical', label: 'Alphabetical: A → Z' },
  { value: 'progress_desc', label: 'Planning Progress: High → Low' },
  { value: 'health_desc', label: 'Trip Health: High → Low' },
];

export function sortTrips(
  trips: Trip[],
  sortOption: TripSortOption = 'upcoming_first',
  keepPinnedOnTop: boolean = true
): Trip[] {
  const cloned = [...trips];

  cloned.sort((a, b) => {
    // 1. Pinned priority
    if (keepPinnedOnTop) {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
    }

    switch (sortOption) {
      case 'upcoming_first': {
        const statusOrder: Record<string, number> = {
          ongoing: 1,
          upcoming: 2,
          draft: 3,
          completed: 4,
        };
        const statusA = getTripStatus(a);
        const statusB = getTripStatus(b);
        const orderA = statusOrder[statusA] || 5;
        const orderB = statusOrder[statusB] || 5;

        if (orderA !== orderB) {
          return orderA - orderB;
        }

        // Within same status, sort by startDate
        const dateA = normalizeDate(a.startDate)?.getTime() || 0;
        const dateB = normalizeDate(b.startDate)?.getTime() || 0;
        return dateA - dateB;
      }

      case 'recently_created': {
        const timeA = new Date(a.createdAt || 0).getTime();
        const timeB = new Date(b.createdAt || 0).getTime();
        return timeB - timeA;
      }

      case 'recently_updated': {
        const timeA = new Date(a.updatedAt || a.createdAt || 0).getTime();
        const timeB = new Date(b.updatedAt || b.createdAt || 0).getTime();
        return timeB - timeA;
      }

      case 'start_date_asc': {
        const dateA = normalizeDate(a.startDate)?.getTime() || Infinity;
        const dateB = normalizeDate(b.startDate)?.getTime() || Infinity;
        return dateA - dateB;
      }

      case 'start_date_desc': {
        const dateA = normalizeDate(a.startDate)?.getTime() || 0;
        const dateB = normalizeDate(b.startDate)?.getTime() || 0;
        return dateB - dateA;
      }

      case 'budget_asc': {
        return (a.budget || 0) - (b.budget || 0);
      }

      case 'budget_desc': {
        return (b.budget || 0) - (a.budget || 0);
      }

      case 'alphabetical': {
        return (a.name || '').localeCompare(b.name || '');
      }

      case 'progress_desc': {
        const progressA = calculateTripProgress(a).percentage;
        const progressB = calculateTripProgress(b).percentage;
        return progressB - progressA;
      }

      case 'health_desc': {
        const healthA = calculateTripHealthSummary(a).score;
        const healthB = calculateTripHealthSummary(b).score;
        return healthB - healthA;
      }

      default:
        return 0;
    }
  });

  return cloned;
}
