/**
 * GlobeTrotter Smart Next Action Utility
 * 
 * Inspects real trip state and determines the single most impactful next action
 * for the user to take, providing button label, path, and descriptive context.
 */

import { Trip } from '../types/trip';
import { itineraryService } from '../services/itineraryService';
import { budgetService } from '../services/budgetService';
import { detectDayConflicts } from './itineraryConflictDetector';
import { calculateTripProgress } from './tripProgressCalculator';

export interface NextTripAction {
  label: string;
  ctaText: string;
  description: string;
  route: string;
  priority: 'high' | 'medium' | 'low';
  category: 'itinerary' | 'recommendations' | 'budget' | 'calendar' | 'map' | 'view';
}

export function determineNextTripAction(trip: Trip): NextTripAction {
  const progress = calculateTripProgress(trip);
  const totalActivities = progress.totalActivitiesCount;
  const scheduledCount = progress.scheduledActivitiesCount;

  // 1. Check for schedule conflicts (High priority)
  try {
    const itinerary = itineraryService.getItinerary(trip.id, trip);
    if (itinerary && itinerary.days) {
      let totalConflicts = 0;
      itinerary.days.forEach((day) => {
        const conflicts = detectDayConflicts(day);
        totalConflicts += conflicts.length;
      });

      if (totalConflicts > 0) {
        return {
          label: `Resolve ${totalConflicts} timing conflict${totalConflicts > 1 ? 's' : ''}`,
          ctaText: 'Resolve Conflicts',
          description: 'Activities on your timeline overlap in scheduled hours.',
          route: `/trip/${trip.id}/calendar`,
          priority: 'high',
          category: 'calendar',
        };
      }
    }
  } catch {
    // Graceful fallback
  }

  // 2. Check if no activities scheduled at all
  if (totalActivities === 0) {
    const savedRecs = trip.savedRecommendationIds?.length || 0;
    if (savedRecs === 0) {
      return {
        label: 'Build your day-by-day itinerary',
        ctaText: 'Build Itinerary',
        description: 'Start with a personalized workspace for your destination, budget, and travel style.',
        route: `/trip/${trip.id}/itinerary`,
        priority: 'high',
        category: 'itinerary',
      };
    }

    return {
      label: 'Build your day-by-day itinerary',
      ctaText: 'Build Itinerary',
      description: 'Organize your bookmarked places into daily travel slots.',
      route: `/trip/${trip.id}/itinerary`,
      priority: 'high',
      category: 'itinerary',
    };
  }

  // 3. Check if activities exist but unscheduled
  if (scheduledCount < totalActivities && scheduledCount === 0) {
    return {
      label: 'Schedule activities onto daily timeline',
      ctaText: 'Schedule Days',
      description: `You have ${totalActivities} places waiting to be scheduled.`,
      route: `/trip/${trip.id}/itinerary`,
      priority: 'medium',
      category: 'itinerary',
    };
  }

  // 4. Check budget setup
  try {
    const expenses = budgetService.getExpenses(trip.id);
    if ((!trip.budget || trip.budget <= 0) && expenses.length === 0) {
      return {
        label: 'Set target travel budget',
        ctaText: 'Set Budget',
        description: 'Allocate estimated spending across stays, food, and activities.',
        route: `/trip/${trip.id}/budget`,
        priority: 'medium',
        category: 'budget',
      };
    }
  } catch {
    // Graceful fallback
  }

  // 5. Check if some days are empty
  try {
    const itinerary = itineraryService.getItinerary(trip.id, trip);
    if (itinerary && itinerary.days && itinerary.days.length > 0) {
      const emptyDays = itinerary.days.filter((d) => !d.activities || d.activities.length === 0);
      if (emptyDays.length > 0) {
        return {
          label: `Add places for Day ${emptyDays[0].dayNumber}`,
          ctaText: 'Complete Itinerary',
          description: `${emptyDays.length} day(s) currently have no scheduled stops.`,
          route: `/trip/${trip.id}/itinerary`,
          priority: 'medium',
          category: 'itinerary',
        };
      }
    }
  } catch {
    // Graceful fallback
  }

  // 6. If progress is high, prompt Map or View
  if (progress.percentage >= 85) {
    return {
      label: 'Trip is fully planned — explore route map',
      ctaText: 'View Trip',
      description: 'Review your complete itinerary, geographic route, and timeline.',
      route: `/trip/${trip.id}/itinerary`,
      priority: 'low',
      category: 'view',
    };
  }

  // Default fallback
  return {
    label: 'Continue planning your journey',
    ctaText: 'Continue Planning',
    description: 'Refine activities, budget, and travel schedule.',
    route: `/trip/${trip.id}/itinerary`,
    priority: 'medium',
    category: 'itinerary',
  };
}
