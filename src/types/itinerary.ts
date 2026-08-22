/**
 * GlobeTrotter Itinerary Data Model
 */

import { CurrencyCode } from './profile';

export type ActivityCategory = 'place' | 'hotel' | 'food' | 'experience';

export interface ItineraryActivity {
  id: string;
  recommendationId?: string;
  title: string;
  category: ActivityCategory;
  location: string;
  latitude?: number;
  longitude?: number;
  startTime: string; // e.g. "09:30" (24hr format)
  duration: string; // e.g. "2 hours"
  durationMinutes: number; // e.g. 120
  estimatedCost: number;
  currency: CurrencyCode;
  notes?: string;
  image?: string;
  status: 'Scheduled' | 'Unscheduled';
  bookingReference?: string;
  bookingUrl?: string;
  isCopied?: boolean;
  tags?: string[];
  mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  dayNumber?: number; // 1-indexed day, or undefined if unscheduled
}

export interface ItineraryDay {
  id: string;
  dayNumber: number; // 1, 2, 3, etc.
  date: string; // "YYYY-MM-DD"
  dateDisplay: string; // "Tuesday, Nov 13"
  title: string; // "Arrival & Shibuya Vibes"
  theme?: string; // "Culture & History"
  activities: ItineraryActivity[];
}

export interface Itinerary {
  id: string;
  tripId: string;
  userId?: string;
  title: string;
  destination: string;
  country: string;
  days: ItineraryDay[];
  unscheduledActivities: ItineraryActivity[];
  createdAt: string;
  updatedAt: string;
}

export interface ItineraryConflict {
  id: string;
  type: 'overlap' | 'tight_travel' | 'overloaded_day';
  severity: 'error' | 'warning' | 'info';
  dayNumber: number;
  activityIds: string[];
  message: string;
  description: string;
  estimatedTravelMinutes?: number;
  availableMinutes?: number;
}

export interface DayHealthResult {
  dayNumber: number;
  score: number; // 0 - 100
  status: 'Excellent' | 'Balanced' | 'Busy' | 'Overloaded';
  totalActivities: number;
  totalCost: number;
  totalTravelMinutes: number;
  freeTimeMinutes: number;
  conflictCount: number;
  reasons: string[];
}

export interface ItineraryStats {
  totalActivities: number;
  scheduledActivities: number;
  unscheduledActivities: number;
  totalEstimatedCost: number;
  tripBudget: number;
  remainingBudget: number;
  isOverBudget: boolean;
  overBudgetAmount: number;
  totalTravelMinutes: number;
  totalConflicts: number;
  planningHealthScore: number;
  dayHealths: Record<number, DayHealthResult>;
}

export interface OptimizationResult {
  itinerary: Itinerary;
  changes: string[];
  summary: string;
  healthImprovement: {
    before: number;
    after: number;
  };
  travelTimeSavedMinutes: number;
  conflictsResolved: number;
}

export interface FreeTimeSlot {
  startTime: string;
  endTime: string;
  durationMinutes: number;
  durationDisplay: string;
  previousActivityTitle?: string;
  nextActivityTitle?: string;
}
