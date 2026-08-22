/**
 * GlobeTrotter Trip Progress Calculator
 * 
 * Computes an authentic 0-100% planning progress based on weighted modules:
 * - Basic Details: 20%
 * - Preferences & Travel Style: 15%
 * - Recommendations Reviewed / Saved: 15%
 * - Itinerary Created & Scheduled: 25%
 * - Budget Planned & Allocated: 10%
 * - Map Reviewed / Geo Pinned: 5%
 * - Calendar Scheduled: 10%
 */

import { Trip } from '../types/trip';
import { itineraryService } from '../services/itineraryService';
import { budgetService } from '../services/budgetService';

export interface TripProgressDetail {
  percentage: number;
  basicDetailsScore: number; // Max 20
  preferencesScore: number; // Max 15
  recommendationsScore: number; // Max 15
  itineraryScore: number; // Max 25
  budgetScore: number; // Max 10
  mapScore: number; // Max 5
  calendarScore: number; // Max 10
  completedTasks: string[];
  pendingTasks: string[];
  totalActivitiesCount: number;
  scheduledActivitiesCount: number;
  expensesCount: number;
  isFullyPlanned: boolean;
}

/**
 * Calculates planning progress for a trip using real state from all connected services
 */
export function calculateTripProgress(trip: Trip): TripProgressDetail {
  const completedTasks: string[] = [];
  const pendingTasks: string[] = [];

  // 1. Basic Details (20%)
  let basicDetailsScore = 0;
  if (trip.name && trip.name.trim().length >= 2) basicDetailsScore += 5;
  if (trip.destination && trip.destination.trim().length >= 2) basicDetailsScore += 5;
  if (trip.startDate && trip.endDate) basicDetailsScore += 5;
  if ((trip.travelersCount || 1) >= 1) basicDetailsScore += 5;

  if (basicDetailsScore >= 20) {
    completedTasks.push('Trip destination & dates set');
  } else {
    pendingTasks.push('Complete basic trip information');
  }

  // 2. Preferences & Travel Style (15%)
  let preferencesScore = 0;
  if (trip.tripType) preferencesScore += 5;
  if (trip.budgetStyle || trip.travelPace) preferencesScore += 5;
  if (trip.interests && trip.interests.length > 0) preferencesScore += 5;

  if (preferencesScore >= 15) {
    completedTasks.push('Travel preferences configured');
  } else {
    pendingTasks.push('Select travel style & interests');
  }

  // 3. Recommendations Reviewed / Saved (15%)
  let recommendationsScore = 0;
  const savedCount = (trip.savedRecommendationIds?.length || 0) + (trip.items?.length || 0);
  if (savedCount >= 5) {
    recommendationsScore = 15;
    completedTasks.push(`${savedCount} places & activities curated`);
  } else if (savedCount > 0) {
    recommendationsScore = Math.round((savedCount / 5) * 15);
    pendingTasks.push('Explore and bookmark more recommendations');
  } else {
    pendingTasks.push('Explore AI recommendations');
  }

  // 4. Itinerary Created & Scheduled (25%)
  let itineraryScore = 0;
  let totalActivitiesCount = 0;
  let scheduledActivitiesCount = 0;

  try {
    const itinerary = itineraryService.getItinerary(trip.id, trip);
    if (itinerary && itinerary.days && itinerary.days.length > 0) {
      let daysWithActivities = 0;
      itinerary.days.forEach((day) => {
        const count = day.activities?.length || 0;
        totalActivitiesCount += count;
        scheduledActivitiesCount += count;
        if (count > 0) daysWithActivities++;
      });

      const unscheduledCount = itinerary.unscheduledActivities?.length || 0;
      totalActivitiesCount += unscheduledCount;

      if (totalActivitiesCount > 0) {
        // Points for having days structured
        itineraryScore += 10;
        // Points for scheduled activities coverage
        const ratio = daysWithActivities / Math.max(1, itinerary.days.length);
        itineraryScore += Math.round(ratio * 15);

        if (daysWithActivities === itinerary.days.length) {
          completedTasks.push(`Itinerary built across all ${itinerary.days.length} days`);
        } else {
          pendingTasks.push(`Schedule activities for Day ${daysWithActivities + 1}`);
        }
      } else {
        pendingTasks.push('Add activities to your daily itinerary');
      }
    } else {
      pendingTasks.push('Generate day-by-day itinerary');
    }
  } catch {
    pendingTasks.push('Build day-by-day itinerary');
  }

  // 5. Budget Planned & Allocated (10%)
  let budgetScore = 0;
  let expensesCount = 0;
  try {
    if (trip.budget && trip.budget > 0) {
      budgetScore += 5;
    }
    const expenses = budgetService.getExpenses(trip.id);
    expensesCount = expenses.length;
    if (expensesCount > 0) {
      budgetScore += 5;
      completedTasks.push(`Budget set & ${expensesCount} expenses tracked`);
    } else if (trip.budget > 0) {
      budgetScore += 3;
      completedTasks.push(`Budget target defined (${trip.currency || 'INR'} ${trip.budget.toLocaleString()})`);
      pendingTasks.push('Track planned expenses');
    } else {
      pendingTasks.push('Set your travel budget');
    }
  } catch {
    if (trip.budget && trip.budget > 0) budgetScore += 5;
  }

  // 6. Map Reviewed / Geo Pinned (5%)
  let mapScore = 0;
  if (scheduledActivitiesCount >= 3) {
    mapScore = 5;
    completedTasks.push('Interactive route map populated');
  } else if (scheduledActivitiesCount > 0) {
    mapScore = 3;
  } else {
    pendingTasks.push('Review locations on interactive map');
  }

  // 7. Calendar Reviewed / Time Blocks (10%)
  let calendarScore = 0;
  if (scheduledActivitiesCount >= 4) {
    calendarScore = 10;
    completedTasks.push('Timeline scheduled with time slots');
  } else if (scheduledActivitiesCount > 0) {
    calendarScore = 5;
    pendingTasks.push('Refine time slots on timeline');
  } else {
    pendingTasks.push('Check calendar timeline');
  }

  const totalRaw =
    basicDetailsScore +
    preferencesScore +
    recommendationsScore +
    itineraryScore +
    budgetScore +
    mapScore +
    calendarScore;

  const percentage = Math.min(100, Math.max(0, totalRaw));

  return {
    percentage,
    basicDetailsScore,
    preferencesScore,
    recommendationsScore,
    itineraryScore,
    budgetScore,
    mapScore,
    calendarScore,
    completedTasks,
    pendingTasks,
    totalActivitiesCount,
    scheduledActivitiesCount,
    expensesCount,
    isFullyPlanned: percentage >= 90,
  };
}
