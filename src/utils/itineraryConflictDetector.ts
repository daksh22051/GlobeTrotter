/**
 * Itinerary Conflict Detector
 * 
 * Analyzes activity schedules to identify:
 * 1. Direct Time Overlaps (Activity A and Activity B happening at the same time)
 * 2. Tight Transitions / Insufficient Travel Time between locations
 * 3. Overloaded day schedules
 */

import { ItineraryActivity, ItineraryConflict, ItineraryDay } from '../types/itinerary';
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
 * Detects all schedule conflicts for a specific day
 */
export function detectDayConflicts(day: ItineraryDay): ItineraryConflict[] {
  const conflicts: ItineraryConflict[] = [];
  const activities = (day.activities || []).filter(
    (a) => a.status !== 'Unscheduled' && a.startTime
  );

  if (activities.length <= 1) return conflicts;

  // Sort activities chronologically by start time for analysis
  const sorted = [...activities].sort(
    (a, b) => timeStringToMinutes(a.startTime) - timeStringToMinutes(b.startTime)
  );

  for (let i = 0; i < sorted.length - 1; i++) {
    const current = sorted[i];
    const next = sorted[i + 1];

    const currentStartMins = timeStringToMinutes(current.startTime);
    const currentEndMins = currentStartMins + (current.durationMinutes || 60);
    const nextStartMins = timeStringToMinutes(next.startTime);

    // 1. Direct Time Overlap Detection
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

    // 2. Travel Time Insufficiency Detection (Tight Schedule)
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

  // 3. Overloaded Day Detection (> 6 activities or > 11 total active hours)
  const totalDayMinutes = sorted.reduce(
    (acc, a) => acc + (a.durationMinutes || 60),
    0
  );
  if (sorted.length >= 7 || totalDayMinutes > 660) {
    conflicts.push({
      id: `conflict_overload_${day.dayNumber}`,
      type: 'overloaded_day',
      severity: 'warning',
      dayNumber: day.dayNumber,
      activityIds: sorted.map((a) => a.id),
      message: `Day ${day.dayNumber} is very packed (${sorted.length} activities).`,
      description: `Total planned time is ${Math.round(
        totalDayMinutes / 60
      )} hours. Consider moving 1 or 2 activities to lighter days.`,
    });
  }

  return conflicts;
}

/**
 * Detects conflicts across the whole itinerary
 */
export function detectAllConflicts(days: ItineraryDay[]): ItineraryConflict[] {
  return days.flatMap((day) => detectDayConflicts(day));
}

/**
 * Checks if a specific activity ID is involved in any conflict
 */
export function getActivityConflict(
  activityId: string,
  conflicts: ItineraryConflict[]
): ItineraryConflict | undefined {
  return conflicts.find((c) => c.activityIds.includes(activityId));
}
