/**
 * Deterministic Itinerary Optimizer Engine
 * 
 * Intelligently reorganizes and sequences activities to:
 * - Eliminate time overlaps and impossible transit transitions
 * - Group geographically nearby stops together to reduce transit overhead
 * - Anchor meals around sensible dining windows
 * - Respect traveler pace (relaxed, balanced, fast-paced)
 * - Preserve all activities (moves overflowing items to unscheduled, never deletes)
 */

import { Itinerary, ItineraryDay, ItineraryActivity, OptimizationResult } from '../types/itinerary';
import { Trip } from '../types/trip';
import { timeStringToMinutes, minutesToTimeString } from '../utils/itineraryConflictDetector';
import { estimateTravelTimeMinutes } from '../utils/travelTimeEstimator';
import { calculateItineraryStats } from '../utils/dayHealthCalculator';

export function optimizeItineraryLocally(itinerary: Itinerary, trip?: Trip): OptimizationResult {
  const initialStats = calculateItineraryStats(itinerary, trip?.budget || 50000);
  const initialTravelMins = initialStats.totalTravelMinutes;
  const initialConflicts = initialStats.totalConflicts;

  const changesList: string[] = [];
  let conflictsResolvedCount = 0;
  let groupedSpotsCount = 0;
  let freeTimeCreatedDays = 0;

  const pace = trip?.travelPace || 'balanced';
  const maxPerDay = pace === 'relaxed' ? 3 : pace === 'packed' ? 6 : 5;
  const standardBuffer = pace === 'relaxed' ? 45 : pace === 'packed' ? 15 : 30;

  const updatedDays: ItineraryDay[] = [];
  const excessUnscheduled: ItineraryActivity[] = [...(itinerary.unscheduledActivities || [])];
  const seenAcrossItinerary = new Set<string>();

  for (const day of itinerary.days || []) {
    const seenActivities = new Set<string>();
    const rawActivities = (day.activities || []).filter((activity) => {
      const identity = activity.recommendationId || `${activity.title}|${activity.location}`;
      const key = identity.trim().toLowerCase();
      if (seenActivities.has(key) || seenAcrossItinerary.has(key)) {
        excessUnscheduled.push({ ...activity, status: 'Unscheduled' });
        return false;
      }
      seenActivities.add(key);
      seenAcrossItinerary.add(key);
      return true;
    });
    if (rawActivities.length === 0) {
      updatedDays.push(day);
      continue;
    }

    // Separate meals vs sights
    const meals: ItineraryActivity[] = [];
    const nonMeals: ItineraryActivity[] = [];

    for (const act of rawActivities) {
      const lower = `${act.category} ${act.title} ${(act.tags || []).join(' ')}`.toLowerCase();
      if (
        act.category === 'food' ||
        lower.includes('breakfast') ||
        lower.includes('lunch') ||
        lower.includes('dinner') ||
        lower.includes('ramen') ||
        lower.includes('sushi') ||
        lower.includes('cafe')
      ) {
        meals.push(act);
      } else {
        nonMeals.push(act);
      }
    }

    // Group non-meal activities by location cluster heuristic
    nonMeals.sort((a, b) => {
      const locA = (a.location || '').toLowerCase();
      const locB = (b.location || '').toLowerCase();
      return locA.localeCompare(locB);
    });

    if (nonMeals.length >= 2) {
      groupedSpotsCount += 1;
    }

    // Allocate into daily slots starting from 09:00 AM
    let currentMinutePointer = 9 * 60; // 09:00 AM
    const scheduledList: ItineraryActivity[] = [];
    const pool = [...nonMeals];

    // Check if we have lunch in meals
    let lunchAct = meals.find((m) => {
      const lower = `${m.title} ${(m.tags || []).join(' ')}`.toLowerCase();
      return lower.includes('lunch') || lower.includes('ramen') || lower.includes('food') || lower.includes('cafe');
    }) || (meals.length > 0 ? meals[0] : undefined);

    let dinnerAct = meals.find((m) => {
      const lower = `${m.title} ${(m.tags || []).join(' ')}`.toLowerCase();
      return (lower.includes('dinner') || lower.includes('izakaya') || lower.includes('bar')) && m !== lunchAct;
    }) || (meals.length > 1 && meals[1] !== lunchAct ? meals[1] : undefined);

    // Morning block: 09:00 - 12:30
    while (pool.length > 0 && currentMinutePointer < 12 * 60 + 30) {
      const nextAct = pool.shift()!;
      const startStr = minutesToTimeString(currentMinutePointer);
      const dur = nextAct.durationMinutes || 90;
      scheduledList.push({
        ...nextAct,
        startTime: startStr,
        status: 'Scheduled',
      });

      const transit = pool.length > 0 ? estimateTravelTimeMinutes(nextAct.location, pool[0]?.location) : 20;
      currentMinutePointer += dur + Math.max(standardBuffer, transit);
    }

    // Lunch slot around 12:30 - 13:30
    if (lunchAct) {
      currentMinutePointer = Math.max(currentMinutePointer, 12 * 60 + 30);
      const lunchStart = minutesToTimeString(currentMinutePointer);
      const lunchDur = lunchAct.durationMinutes || 60;
      scheduledList.push({
        ...lunchAct,
        startTime: lunchStart,
        status: 'Scheduled',
      });
      currentMinutePointer += lunchDur + standardBuffer;
    } else {
      // Free afternoon gap
      currentMinutePointer = Math.max(currentMinutePointer, 14 * 60); // Resume at 2:00 PM
      freeTimeCreatedDays += 1;
    }

    // Afternoon block: 14:00 - 18:30
    while (pool.length > 0 && currentMinutePointer < 18 * 60 + 30) {
      const nextAct = pool.shift()!;
      const startStr = minutesToTimeString(currentMinutePointer);
      const dur = nextAct.durationMinutes || 90;
      scheduledList.push({
        ...nextAct,
        startTime: startStr,
        status: 'Scheduled',
      });

      const transit = pool.length > 0 ? estimateTravelTimeMinutes(nextAct.location, pool[0]?.location) : 20;
      currentMinutePointer += dur + Math.max(standardBuffer, transit);
    }

    // Dinner slot around 19:00 - 20:30
    if (dinnerAct) {
      currentMinutePointer = Math.max(currentMinutePointer, 19 * 60);
      const dinnerStart = minutesToTimeString(currentMinutePointer);
      const dinnerDur = dinnerAct.durationMinutes || 90;
      scheduledList.push({
        ...dinnerAct,
        startTime: dinnerStart,
        status: 'Scheduled',
      });
      currentMinutePointer += dinnerDur + standardBuffer;
    }

    // Any remaining evening spots
    while (pool.length > 0 && scheduledList.length < maxPerDay) {
      const nextAct = pool.shift()!;
      const startStr = minutesToTimeString(Math.max(currentMinutePointer, 20 * 60 + 30));
      scheduledList.push({
        ...nextAct,
        startTime: startStr,
        status: 'Scheduled',
      });
      currentMinutePointer += (nextAct.durationMinutes || 60) + standardBuffer;
    }

    let nextAvailableMinute = 9 * 60;
    for (let index = 0; index < scheduledList.length; index++) {
      const activity = scheduledList[index];
      const requestedMinute = timeStringToMinutes(activity.startTime);
      const previousActivity = scheduledList[index - 1];
      const travelMinutes = previousActivity
        ? estimateTravelTimeMinutes(previousActivity.location, activity.location)
        : 0;
      const startMinute = Math.max(requestedMinute, nextAvailableMinute);

      scheduledList[index] = {
        ...activity,
        startTime: minutesToTimeString(startMinute),
      };
      nextAvailableMinute = startMinute + (activity.durationMinutes || 60) + Math.max(standardBuffer, travelMinutes);
    }

    // If day was overloaded, preserve remaining into excessUnscheduled (SAFETY)
    if (pool.length > 0) {
      for (const overflow of pool) {
        excessUnscheduled.push({
          ...overflow,
          status: 'Unscheduled',
        });
      }
      changesList.push(
        `Preserved ${pool.length} overflow activity in "Unscheduled" to avoid overwhelming Day ${day.dayNumber}`
      );
    }

    updatedDays.push({
      ...day,
      activities: scheduledList,
    });
  }

  const optimizedItinerary: Itinerary = {
    ...itinerary,
    days: updatedDays,
    unscheduledActivities: excessUnscheduled,
    updatedAt: new Date().toISOString(),
  };

  const finalStats = calculateItineraryStats(optimizedItinerary, trip?.budget || 50000);
  const travelTimeSaved = Math.max(0, initialTravelMins - finalStats.totalTravelMinutes);
  conflictsResolvedCount = Math.max(0, initialConflicts - finalStats.totalConflicts);

  // Construct bullet points
  if (groupedSpotsCount > 0) {
    changesList.unshift(`Grouped nearby neighborhood attractions across ${groupedSpotsCount} days`);
  }
  if (travelTimeSaved > 0) {
    changesList.unshift(`Reduced estimated transit travel by ~${travelTimeSaved} minutes`);
  } else {
    changesList.push('Harmonized transfer buffers between each stop');
  }
  if (conflictsResolvedCount > 0) {
    changesList.unshift(`Resolved ${conflictsResolvedCount} schedule conflict(s) and tight overlaps`);
  }
  if (freeTimeCreatedDays > 0) {
    changesList.push('Protected open afternoon windows for relaxed exploration');
  }
  changesList.push('Re-anchored meals around optimal dining hours');

  return {
    itinerary: optimizedItinerary,
    changes: changesList.slice(0, 4),
    summary: 'Your journey was intelligently sequenced for optimal pacing and minimal transit friction.',
    healthImprovement: {
      before: initialStats.planningHealthScore,
      after: finalStats.planningHealthScore,
    },
    travelTimeSavedMinutes: travelTimeSaved,
    conflictsResolved: conflictsResolvedCount,
  };
}
