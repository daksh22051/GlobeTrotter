/**
 * Day Health & Summary Calculator
 * 
 * Computes health score, pacing balance, travel overhead, free time gaps,
 * and comprehensive itinerary statistics.
 */

import {
  Itinerary,
  ItineraryDay,
  ItineraryActivity,
  DayHealthResult,
  ItineraryStats,
  FreeTimeSlot,
} from '../types/itinerary';
import {
  timeStringToMinutes,
  minutesToTimeString,
  formatTimeDisplay,
  detectDayConflicts,
  detectAllConflicts,
} from './itineraryConflictDetector';
import { estimateTravelTimeMinutes, formatTravelTime } from './travelTimeEstimator';

/**
 * Identifies gaps/free time slots between activities in a day
 */
export function calculateDayFreeTimeSlots(day: ItineraryDay): FreeTimeSlot[] {
  const slots: FreeTimeSlot[] = [];
  const activities = (day.activities || []).filter(
    (a) => a.status !== 'Unscheduled' && a.startTime
  );

  if (activities.length === 0) {
    return [
      {
        startTime: '09:00',
        endTime: '18:00',
        durationMinutes: 540,
        durationDisplay: '9 hours free',
        previousActivityTitle: undefined,
        nextActivityTitle: undefined,
      },
    ];
  }

  // Sort activities chronologically
  const sorted = [...activities].sort(
    (a, b) => timeStringToMinutes(a.startTime) - timeStringToMinutes(b.startTime)
  );

  // Check gaps between sequential activities
  for (let i = 0; i < sorted.length - 1; i++) {
    const current = sorted[i];
    const next = sorted[i + 1];

    const currentEndMins =
      timeStringToMinutes(current.startTime) + (current.durationMinutes || 60);
    const nextStartMins = timeStringToMinutes(next.startTime);

    // Subtract transit time to find genuine leisurely free time
    const transitMins = estimateTravelTimeMinutes(
      current.location,
      next.location,
      { lat: current.latitude, lng: current.longitude },
      { lat: next.latitude, lng: next.longitude }
    );

    const rawGap = nextStartMins - currentEndMins;
    const leisureFreeGap = rawGap - transitMins;

    // Only surface meaningful free time slots (>= 45 minutes)
    if (leisureFreeGap >= 45) {
      const freeStartMins = currentEndMins + transitMins;
      slots.push({
        startTime: minutesToTimeString(freeStartMins),
        endTime: next.startTime,
        durationMinutes: leisureFreeGap,
        durationDisplay: formatTravelTime(leisureFreeGap),
        previousActivityTitle: current.title,
        nextActivityTitle: next.title,
      });
    }
  }

  return slots;
}

/**
 * Checks for missing meal periods during normal waking hours
 */
export function detectMissingMeals(day: ItineraryDay): {
  missingBreakfast: boolean;
  missingLunch: boolean;
  missingDinner: boolean;
} {
  const activities = (day.activities || []).filter((a) => a.status !== 'Unscheduled');
  
  const hasFood = (category: string, title: string, tags?: string[], mealType?: string) => {
    const combined = `${category} ${title} ${(tags || []).join(' ')} ${mealType || ''}`.toLowerCase();
    return (
      category === 'food' ||
      combined.includes('cafe') ||
      combined.includes('coffee') ||
      combined.includes('breakfast') ||
      combined.includes('lunch') ||
      combined.includes('dinner') ||
      combined.includes('restaurant') ||
      combined.includes('bistro') ||
      combined.includes('bakery') ||
      combined.includes('ramen') ||
      combined.includes('sushi') ||
      combined.includes('food tour') ||
      combined.includes('market')
    );
  };

  let hasBreakfast = false;
  let hasLunch = false;
  let hasDinner = false;

  for (const act of activities) {
    if (!act.startTime) continue;
    const startMins = timeStringToMinutes(act.startTime);
    const isFood = hasFood(act.category, act.title, act.tags, act.mealType);

    if (isFood) {
      if (startMins >= 420 && startMins <= 630) hasBreakfast = true; // 7:00 AM - 10:30 AM
      if (startMins >= 660 && startMins <= 900) hasLunch = true;     // 11:00 AM - 3:00 PM
      if (startMins >= 1080 && startMins <= 1350) hasDinner = true;  // 6:00 PM - 10:30 PM
    }
  }

  // If a day has 2 or more activities, check what meals might be missing
  const hasMultipleActivities = activities.length >= 2;

  return {
    missingBreakfast: hasMultipleActivities && !hasBreakfast,
    missingLunch: hasMultipleActivities && !hasLunch,
    missingDinner: hasMultipleActivities && !hasDinner,
  };
}

/**
 * Repairs overlapping or impossible transitions before a day is displayed.
 */
export function normalizeDaySchedule(day: ItineraryDay): ItineraryDay {
  const activities = [...(day.activities || [])]
    .filter((activity) => activity.status !== 'Unscheduled')
    .sort((first, second) =>
      timeStringToMinutes(first.startTime || '09:00') - timeStringToMinutes(second.startTime || '09:00')
    );
  let nextAvailableMinute = 9 * 60;
  let changed = false;
  const normalizedActivitiesForTravel: ItineraryActivity[] = [];

  const normalizedActivities = activities.map((activity, index) => {
    const previous = normalizedActivitiesForTravel[index - 1];
    const travelMinutes = previous
      ? estimateTravelTimeMinutes(previous.location, activity.location, { lat: previous.latitude, lng: previous.longitude }, { lat: activity.latitude, lng: activity.longitude })
      : 0;
    const requestedMinute = timeStringToMinutes(activity.startTime || '09:00');
    const startMinute = Math.max(requestedMinute, nextAvailableMinute);
    const normalized = startMinute === requestedMinute
      ? activity
      : { ...activity, startTime: minutesToTimeString(startMinute) };

    if (normalized !== activity) changed = true;
    nextAvailableMinute = startMinute + (activity.durationMinutes || 60) + travelMinutes;
    normalizedActivitiesForTravel[index] = normalized;
    return normalized;
  });

  if (!changed || normalizedActivities.length === day.activities.length) {
    return changed ? { ...day, activities: normalizedActivities } : day;
  }

  return {
    ...day,
    activities: [
      ...normalizedActivities,
      ...(day.activities || []).filter((activity) => activity.status === 'Unscheduled'),
    ],
  };
}

export function normalizeItinerarySchedule(itinerary: Itinerary): Itinerary {
  return {
    ...itinerary,
    days: (itinerary.days || []).map(normalizeDaySchedule),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Calculates day health metric and status
 */
export function calculateDayHealth(day: ItineraryDay): DayHealthResult {
  const activities = (day.activities || []).filter((a) => a.status !== 'Unscheduled');
  const conflicts = detectDayConflicts(day);
  
  let score = 100;
  const reasons: string[] = [];

  // Deduct for conflicts
  const errorConflicts = conflicts.filter((c) => c.severity === 'error');
  const warningConflicts = conflicts.filter((c) => c.severity === 'warning');

  if (errorConflicts.length > 0) {
    score -= errorConflicts.length * 20;
    reasons.push(`${errorConflicts.length} direct schedule conflict(s)`);
  }

  if (warningConflicts.length > 0) {
    score -= warningConflicts.length * 10;
    reasons.push(`${warningConflicts.length} tight schedule transition(s)`);
  }

  // Calculate total travel time
  let totalTravelMinutes = 0;
  const sorted = [...activities].sort(
    (a, b) => timeStringToMinutes(a.startTime || '00:00') - timeStringToMinutes(b.startTime || '00:00')
  );

  for (let i = 0; i < sorted.length - 1; i++) {
    const travel = estimateTravelTimeMinutes(
      sorted[i].location,
      sorted[i + 1].location,
      { lat: sorted[i].latitude, lng: sorted[i].longitude },
      { lat: sorted[i + 1].latitude, lng: sorted[i + 1].longitude }
    );
    totalTravelMinutes += travel;
  }

  // Deduct if travel exceeds 2.5 hours
  if (totalTravelMinutes > 150) {
    score -= 15;
    reasons.push('High transit travel time');
  }

  // Evaluate activity density
  if (activities.length === 0) {
    score = 70;
    reasons.push('No activities scheduled yet');
  } else if (activities.length <= 2) {
    score -= 10;
    reasons.push('Light activity volume');
  } else if (activities.length <= 5) {
    reasons.push('Ideal activity pacing (3-5 spots)');
  } else {
    score -= Math.min(30, (activities.length - 5) * 8);
    reasons.push('Heavy activity volume');
  }

  // Evaluate free time
  const freeSlots = calculateDayFreeTimeSlots(day);
  const totalFreeMinutes = freeSlots.reduce((acc, s) => acc + s.durationMinutes, 0);

  if (activities.length > 0 && totalFreeMinutes < 30) {
    score -= 10;
    reasons.push('Very little downtime for rest');
  }

  // Clamp score
  const finalScore = Math.max(20, Math.min(100, score));

  let status: 'Excellent' | 'Balanced' | 'Busy' | 'Overloaded' = 'Balanced';
  if (finalScore >= 88) status = 'Excellent';
  else if (finalScore >= 72) status = 'Balanced';
  else if (finalScore >= 52) status = 'Busy';
  else status = 'Overloaded';

  const totalCost = activities.reduce((acc, a) => acc + (a.estimatedCost || 0), 0);

  return {
    dayNumber: day.dayNumber,
    score: finalScore,
    status,
    totalActivities: activities.length,
    totalCost,
    totalTravelMinutes,
    freeTimeMinutes: totalFreeMinutes,
    conflictCount: conflicts.length,
    reasons,
  };
}

/**
 * Calculates overall statistics across all days in an itinerary
 */
export function calculateItineraryStats(
  itinerary: Itinerary,
  tripBudget: number = 50000
): ItineraryStats {
  const dayHealths: Record<number, DayHealthResult> = {};
  let totalScheduled = 0;
  let totalCost = 0;
  let totalTravelMinutes = 0;
  let sumHealthScores = 0;

  for (const day of itinerary.days || []) {
    const health = calculateDayHealth(day);
    dayHealths[day.dayNumber] = health;
    totalScheduled += health.totalActivities;
    totalCost += health.totalCost;
    totalTravelMinutes += health.totalTravelMinutes;
    sumHealthScores += health.score;
  }

  const unscheduled = (itinerary.unscheduledActivities || []).length;
  const totalActivities = totalScheduled + unscheduled;

  // Add cost of unscheduled activities to estimated total if added
  const unscheduledCost = (itinerary.unscheduledActivities || []).reduce(
    (acc, a) => acc + (a.estimatedCost || 0),
    0
  );
  const totalEstimatedCost = totalCost + unscheduledCost;

  const allConflicts = detectAllConflicts(itinerary.days || []);
  const daysCount = Math.max(1, (itinerary.days || []).length);
  const avgHealth = Math.round(sumHealthScores / daysCount);

  const remainingBudget = tripBudget - totalEstimatedCost;
  const isOverBudget = remainingBudget < 0;
  const overBudgetAmount = isOverBudget ? Math.abs(remainingBudget) : 0;

  return {
    totalActivities,
    scheduledActivities: totalScheduled,
    unscheduledActivities: unscheduled,
    totalEstimatedCost,
    tripBudget,
    remainingBudget,
    isOverBudget,
    overBudgetAmount,
    totalTravelMinutes,
    totalConflicts: allConflicts.length,
    planningHealthScore: avgHealth,
    dayHealths,
  };
}
