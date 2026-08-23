/**
 * Comprehensive Itinerary Conflict & Issue Detector
 * 
 * Deeply analyzes schedules, geographical transitions, day pacing,
 * and meal coverage to provide structured, actionable issues.
 */

import { ItineraryActivity, ItineraryDay, ItineraryConflict } from '../types/itinerary';
import { TripHealthIssue } from '../types/intelligence';
import { estimateTravelTimeMinutes, formatTravelTime } from './travelTimeEstimator';

/**
 * Converts "HH:MM" 24h time to minutes from midnight
 */
export function timeStringToMinutes(timeStr: string): number {
  if (!timeStr || !timeStr.includes(':')) return 0;
  const parts = timeStr.split(':');
  const hours = parseInt(parts[0], 10) || 0;
  const minutes = parseInt(parts[1], 10) || 0;
  return hours * 60 + minutes;
}

/**
 * Converts minutes from midnight back to "HH:MM" 24h string
 */
export function minutesToTimeString(totalMinutes: number): string {
  const normalized = Math.max(0, Math.min(totalMinutes, 1439));
  const hours = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

/**
 * Formats "HH:MM" into 12h display string, e.g. "09:30" -> "9:30 AM", "14:00" -> "2:00 PM"
 */
export function formatTimeDisplay(timeStr: string): string {
  if (!timeStr || !timeStr.includes(':')) return timeStr || 'TBD';
  const mins = timeStringToMinutes(timeStr);
  const hours24 = Math.floor(mins / 60);
  const minutes = mins % 60;
  const period = hours24 >= 12 ? 'PM' : 'AM';
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  const formattedMins = minutes.toString().padStart(2, '0');
  return `${hours12}:${formattedMins} ${period}`;
}

/**
 * Calculates end time based on start time string and duration in minutes
 */
export function calculateEndTime(startTime: string, durationMinutes: number): string {
  const startMins = timeStringToMinutes(startTime);
  const endMins = startMins + (durationMinutes || 60);
  return minutesToTimeString(endMins);
}

/**
 * Legacy compatibility: Detects basic conflicts for ItineraryDay
 */
export function detectDayConflicts(day: ItineraryDay): ItineraryConflict[] {
  const conflicts: ItineraryConflict[] = [];
  const activities = (day.activities || []).filter(
    (a) => a.status !== 'Unscheduled' && a.startTime
  );

  if (activities.length <= 1) return conflicts;

  const sorted = [...activities].sort(
    (a, b) => timeStringToMinutes(a.startTime) - timeStringToMinutes(b.startTime)
  );

  for (let i = 0; i < sorted.length - 1; i++) {
    const current = sorted[i];
    const next = sorted[i + 1];

    const currentStartMins = timeStringToMinutes(current.startTime);
    const currentEndMins = currentStartMins + (current.durationMinutes || 60);
    const nextStartMins = timeStringToMinutes(next.startTime);

    // 1. Direct Overlap
    if (nextStartMins < currentEndMins) {
      const overlapMinutes = currentEndMins - nextStartMins;
      conflicts.push({
        id: `conflict_overlap_${day.dayNumber}_${current.id}_${next.id}`,
        type: 'overlap',
        severity: 'error',
        dayNumber: day.dayNumber,
        activityIds: [current.id, next.id],
        message: `Schedule conflict: "${next.title}" overlaps with "${current.title}".`,
        description: `"${current.title}" ends at ${formatTimeDisplay(
          minutesToTimeString(currentEndMins)
        )}, but "${next.title}" starts at ${formatTimeDisplay(
          next.startTime
        )} (${overlapMinutes} min overlap).`,
      });
      continue;
    }

    // 2. Insufficient Travel Time
    const gapMinutes = nextStartMins - currentEndMins;
    const estTravel = estimateTravelTimeMinutes(
      current.location,
      next.location,
      { lat: current.latitude, lng: current.longitude },
      { lat: next.latitude, lng: next.longitude }
    );

    if (gapMinutes < estTravel) {
      conflicts.push({
        id: `conflict_travel_${day.dayNumber}_${current.id}_${next.id}`,
        type: 'tight_travel',
        severity: 'warning',
        dayNumber: day.dayNumber,
        activityIds: [current.id, next.id],
        message: `Tight schedule between "${current.title}" and "${next.title}".`,
        description: `Allow approximately ${formatTravelTime(
          estTravel
        )} to travel between these locations (you currently have ${formatTravelTime(
          gapMinutes
        )} buffer).`,
        estimatedTravelMinutes: estTravel,
        availableMinutes: gapMinutes,
      });
    }
  }

  // 3. Overloaded day check
  const totalDayMinutes = sorted.reduce(
    (acc, a) => acc + (a.durationMinutes || 60),
    0
  );
  if (sorted.length >= 6 || totalDayMinutes > 600) {
    conflicts.push({
      id: `conflict_overload_${day.dayNumber}`,
      type: 'overloaded_day',
      severity: 'warning',
      dayNumber: day.dayNumber,
      activityIds: sorted.map((a) => a.id),
      message: `Day ${day.dayNumber} is overloaded (${sorted.length} activities).`,
      description: `Total active time is ~${Math.round(
        totalDayMinutes / 60
      )}h. Consider moving an activity to a lighter day.`,
    });
  }

  return conflicts;
}

/**
 * Legacy compatibility: Detects all basic conflicts across all days
 */
export function detectAllConflicts(days: ItineraryDay[]): ItineraryConflict[] {
  return days.flatMap((day) => detectDayConflicts(day));
}

/**
 * Deep, comprehensive issue detection for an Itinerary Day
 */
export function detectDeepDayIssues(day: ItineraryDay): TripHealthIssue[] {
  const issues: TripHealthIssue[] = [];
  const activities = (day.activities || []).filter((a) => a.status !== 'Unscheduled');

  if (activities.length === 0) {
    issues.push({
      id: `issue_empty_${day.dayNumber}`,
      type: 'empty_day',
      severity: 'suggestion',
      title: `Day ${day.dayNumber} has no planned activities`,
      description: 'This day is currently completely open. Add a morning activity or cultural experience.',
      dayNumber: day.dayNumber,
      activityIds: [],
      suggestedFix: 'Add recommendations to Day ' + day.dayNumber,
      fixActionType: 'EXPLORE_FOOD',
    });
    return issues;
  }

  const sorted = [...activities].sort(
    (a, b) => timeStringToMinutes(a.startTime || '09:00') - timeStringToMinutes(b.startTime || '09:00')
  );

  let hasLunch = false;
  let hasDinner = false;
  let totalActiveMinutes = 0;
  let totalTravelMinutes = 0;

  for (let i = 0; i < sorted.length; i++) {
    const current = sorted[i];
    const startMins = timeStringToMinutes(current.startTime || '09:00');
    const durMins = current.durationMinutes || 90;
    const endMins = startMins + durMins;
    totalActiveMinutes += durMins;

    // Check Meal coverage
    if (
      current.category === 'food' ||
      current.mealType === 'lunch' ||
      (startMins >= 11 * 60 + 30 && startMins <= 14 * 60 + 30) ||
      (endMins >= 12 * 60 && endMins <= 14 * 60)
    ) {
      if (current.category === 'food' || current.mealType === 'lunch') {
        hasLunch = true;
      }
    }

    if (
      current.category === 'food' ||
      current.mealType === 'dinner' ||
      startMins >= 19 * 60 ||
      (endMins >= 19 * 60 + 30 && endMins <= 22 * 60)
    ) {
      if (current.category === 'food' || current.mealType === 'dinner') {
        hasDinner = true;
      }
    }

    // Pairwise checks with next activity
    if (i < sorted.length - 1) {
      const next = sorted[i + 1];
      const nextStartMins = timeStringToMinutes(next.startTime || '10:00');

      // A. Overlap (CRITICAL)
      if (nextStartMins < endMins) {
        const overlapMins = endMins - nextStartMins;
        issues.push({
          id: `issue_overlap_${day.dayNumber}_${current.id}_${next.id}`,
          type: 'overlap',
          severity: 'critical',
          title: `Schedule Conflict: "${current.title}" & "${next.title}"`,
          description: `"${current.title}" ends at ${formatTimeDisplay(minutesToTimeString(endMins))}, but "${next.title}" is set to start at ${formatTimeDisplay(next.startTime)} (${overlapMins} min overlap).`,
          dayNumber: day.dayNumber,
          activityIds: [current.id, next.id],
          suggestedFix: `Shift "${next.title}" to ${formatTimeDisplay(minutesToTimeString(endMins + 30))} or move to another day.`,
          fixActionType: 'FIX_OVERLAP',
          metadata: {
            overlapMinutes: overlapMins,
            availableMinutes: 0,
            requiredMinutes: overlapMins,
          },
        });
      } else {
        // B. Travel Buffer vs Estimated Travel (CRITICAL or WARNING)
        const gapMins = nextStartMins - endMins;
        const estTravel = estimateTravelTimeMinutes(
          current.location,
          next.location,
          { lat: current.latitude, lng: current.longitude },
          { lat: next.latitude, lng: next.longitude }
        );
        totalTravelMinutes += estTravel;

        if (gapMins < estTravel) {
          const isImpossible = gapMins < Math.max(10, estTravel * 0.4);
          issues.push({
            id: `issue_travel_${day.dayNumber}_${current.id}_${next.id}`,
            type: isImpossible ? 'impossible_travel' : 'tight_travel',
            severity: isImpossible ? 'critical' : 'warning',
            title: isImpossible
              ? `Impossible Travel Time between "${current.title}" and "${next.title}"`
              : `Tight Schedule between "${current.title}" and "${next.title}"`,
            description: `Estimated travel between ${current.location} and ${next.location} is ~${formatTravelTime(estTravel)}, but only ${gapMins} min is available.`,
            dayNumber: day.dayNumber,
            activityIds: [current.id, next.id],
            suggestedFix: `Allow at least ${formatTravelTime(estTravel + 15)} buffer between these spots.`,
            fixActionType: 'ADD_TRAVEL_TIME',
            metadata: {
              availableMinutes: gapMins,
              requiredMinutes: estTravel,
              fromLocation: current.location,
              toLocation: next.location,
            },
          });
        }
      }
    }
  }

  // C. Overloaded Day Detection (WARNING)
  const totalDayMins = totalActiveMinutes + totalTravelMinutes;
  const freeTimeMins = Math.max(0, 14 * 60 - totalDayMins); // Assuming 8:00 AM - 10:00 PM (14h span)

  if (sorted.length >= 6 || totalDayMins > 600 || freeTimeMins < 45) {
    const hours = Math.round((totalDayMins / 60) * 10) / 10;
    issues.push({
      id: `issue_overload_day_${day.dayNumber}`,
      type: 'overloaded_day',
      severity: 'warning',
      title: `Day ${day.dayNumber} is overloaded (${sorted.length} activities, ~${hours}h active)`,
      description: `You only have ~${Math.round(freeTimeMins)} min of rest or transition time. Moving one experience to a lighter day creates a more relaxing journey.`,
      dayNumber: day.dayNumber,
      activityIds: sorted.map((a) => a.id),
      suggestedFix: `Move the last activity to a lighter day or spread out start times.`,
      fixActionType: 'SPREAD_ACTIVITIES',
    });
  } else if (sorted.length <= 1 && day.activities.length > 0) {
    // D. Underutilized Day Detection (SUGGESTION)
    issues.push({
      id: `issue_underutilized_day_${day.dayNumber}`,
      type: 'underutilized_day',
      severity: 'suggestion',
      title: `Day ${day.dayNumber} has plenty of free time (${Math.round(freeTimeMins / 60)}h open)`,
      description: `Only ${sorted.length} activity planned. Consider exploring top-rated spots or a dining reservation.`,
      dayNumber: day.dayNumber,
      activityIds: sorted.map((a) => a.id),
      suggestedFix: 'Explore local recommendations to add to this day.',
      fixActionType: 'EXPLORE_FOOD',
    });
  }

  // E. Meal Gaps (SUGGESTIONS)
  if (!hasLunch && sorted.length >= 2) {
    // If span covers 12:00-14:00
    const spansLunch = sorted.some((a) => {
      const start = timeStringToMinutes(a.startTime || '09:00');
      return start <= 13 * 60;
    }) && sorted.some((a) => {
      const start = timeStringToMinutes(a.startTime || '09:00');
      const end = start + (a.durationMinutes || 90);
      return end >= 13 * 60;
    });

    if (spansLunch || sorted.length >= 3) {
      issues.push({
        id: `issue_meal_lunch_${day.dayNumber}`,
        type: 'meal_gap_lunch',
        severity: 'suggestion',
        title: `🍽 Lunch not planned for Day ${day.dayNumber}`,
        description: 'You have activities spanning midday without a dedicated culinary stop or food tour.',
        dayNumber: day.dayNumber,
        activityIds: [],
        suggestedFix: `Add a 1:00 PM local lunch spot near your afternoon activities.`,
        fixActionType: 'ADD_MEAL',
        metadata: { mealType: 'lunch' },
      });
    }
  }

  if (!hasDinner && sorted.length >= 2) {
    const hasEveningAct = sorted.some((a) => {
      const start = timeStringToMinutes(a.startTime || '09:00');
      return start >= 17 * 60;
    });
    if (hasEveningAct) {
      issues.push({
        id: `issue_meal_dinner_${day.dayNumber}`,
        type: 'meal_gap_dinner',
        severity: 'suggestion',
        title: `🍽 Dinner not planned for Day ${day.dayNumber}`,
        description: 'No evening dining experience scheduled after your day exploring.',
        dayNumber: day.dayNumber,
        activityIds: [],
        suggestedFix: `Add a 7:30 PM dinner reservation to wrap up your day.`,
        fixActionType: 'ADD_MEAL',
        metadata: { mealType: 'dinner' },
      });
    }
  }

  return issues;
}

/**
 * Detects all issues across an entire itinerary
 */
export function detectAllItineraryIssues(days: ItineraryDay[]): TripHealthIssue[] {
  return days.flatMap((day) => detectDeepDayIssues(day));
}

/**
 * Checks if an activity has any active conflicts
 */
export function getActivityConflict(
  activityId: string,
  conflicts: ItineraryConflict[]
): ItineraryConflict | undefined {
  return conflicts.find((c) => c.activityIds.includes(activityId));
}
