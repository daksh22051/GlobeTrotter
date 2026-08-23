/**
 * Route Health & Efficiency Calculator
 * Analyzes geographic routing flow, detect zig-zag backtracking,
 * tight schedule bottlenecks, and computes actionable route recommendations.
 */

import { RouteHealthAssessment } from '../types/map';
import { ItineraryDay } from '../types/itinerary';
import { locationService } from '../services/locationService';
import { calculateDayRouteSegments } from './routeCalculator';

export function calculateRouteHealth(
  day: ItineraryDay,
  destinationName: string
): RouteHealthAssessment {
  const activities = day.activities || [];
  const segments = calculateDayRouteSegments(day, destinationName);

  const totalDistanceKm = segments.reduce((sum, s) => sum + s.distanceKm, 0);
  const totalTravelMinutes = segments.reduce((sum, s) => sum + s.estimatedMinutes, 0);

  const backtrackWarnings: string[] = [];
  const tightScheduleWarnings: string[] = [];
  const suggestions: string[] = [];

  // 1. Backtracking Detection (Triangles A -> B -> C where dist(A,C) < dist(A,B) and dist(B,C) > dist(A,C))
  if (activities.length >= 3) {
    for (let i = 0; i < activities.length - 2; i++) {
      const p1 = locationService.resolveCoordinates(activities[i], destinationName);
      const p2 = locationService.resolveCoordinates(activities[i + 1], destinationName);
      const p3 = locationService.resolveCoordinates(activities[i + 2], destinationName);

      const d12 = locationService.calculateDistanceKm(p1, p2);
      const d23 = locationService.calculateDistanceKm(p2, p3);
      const d13 = locationService.calculateDistanceKm(p1, p3);

      // If B is far away and C is right next to A, it's a detour
      if (d12 > 4 && d23 > 4 && d13 < 2) {
        backtrackWarnings.push(
          `Possible detour between "${activities[i].title}", "${activities[i + 1].title}", and "${activities[i + 2].title}"`
        );
      }
    }
  }

  // 2. Excessive travel time detection
  if (totalTravelMinutes > 120) {
    tightScheduleWarnings.push(`High estimated transit time (${Math.round(totalTravelMinutes)} min) for ${activities.length} stops.`);
  }

  // 3. Excessive stops in single day
  if (activities.length > 5) {
    tightScheduleWarnings.push(`Day has ${activities.length} stops; consider spacing activities to prevent fatigue.`);
  }

  // 4. Calculate Score
  let score = 100;
  score -= backtrackWarnings.length * 15;
  if (totalDistanceKm > 25) score -= 15;
  else if (totalDistanceKm > 15) score -= 8;
  if (activities.length > 5) score -= 10;

  score = Math.max(40, Math.min(100, score));

  const status: 'Excellent' | 'Great' | 'Needs Attention' =
    score >= 85 ? 'Excellent' : score >= 70 ? 'Great' : 'Needs Attention';

  if (backtrackWarnings.length > 0) {
    suggestions.push('Run AI Route Optimization to group neighboring stops in geographical order.');
  }
  if (totalTravelMinutes > 90) {
    suggestions.push('Reorder morning and afternoon stops to minimize crosstown travel.');
  }
  if (activities.length > 4) {
    suggestions.push('Add a 45-minute cafe or park buffer between main afternoon attractions.');
  }

  if (suggestions.length === 0) {
    suggestions.push('Route is clean, well-spaced, and follows an efficient geographical path.');
  }

  return {
    score,
    status,
    totalDistanceKm: Math.round(totalDistanceKm * 10) / 10,
    totalTravelMinutes,
    backtrackWarnings,
    tightScheduleWarnings,
    suggestions,
  };
}
