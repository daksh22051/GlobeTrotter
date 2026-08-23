/**
 * Route Calculation & Geometry Utility
 * Computes route segments, total distances, estimated travel times,
 * and geographic bounds for map fitting.
 */

import { Coordinates, MapMarkerLocation, RouteSegment, DayRouteSummary, TripMapStats } from '../types/map';
import { Itinerary, ItineraryDay, ItineraryActivity } from '../types/itinerary';
import { locationService } from '../services/locationService';
import { calculateDayHealth } from './dayHealthCalculator';
import { timeStringToMinutes } from './itineraryConflictDetector';

function sortActivitiesChronologically(activities: ItineraryActivity[]): ItineraryActivity[] {
  return [...activities].sort((first, second) =>
    timeStringToMinutes(first.startTime || '09:00') - timeStringToMinutes(second.startTime || '09:00')
  );
}

/**
 * Extracts structured MapMarkerLocation items from an Itinerary
 */
export function extractMapMarkers(
  itinerary: Itinerary,
  filterDayNumber: number | 'all' = 'all'
): MapMarkerLocation[] {
  const markers: MapMarkerLocation[] = [];

  const targetDays =
    filterDayNumber === 'all'
      ? itinerary.days
      : itinerary.days.filter((d) => d.dayNumber === filterDayNumber);

  targetDays.forEach((day) => {
    sortActivitiesChronologically(day.activities).forEach((act, index) => {
      const coords = locationService.resolveCoordinates(
        act,
        itinerary.destination
      );

      markers.push({
        id: `marker_${day.dayNumber}_${act.id}`,
        activityId: act.id,
        recommendationId: act.recommendationId,
        name: act.title,
        category: act.category,
        location: act.location,
        dayNumber: day.dayNumber,
        stopNumber: index + 1,
        startTime: act.startTime,
        duration: act.duration,
        durationMinutes: act.durationMinutes,
        estimatedCost: act.estimatedCost,
        currency: act.currency,
        image: act.image,
        notes: act.notes,
        whyRecommended: act.notes,
        latitude: coords.latitude,
        longitude: coords.longitude,
      });
    });
  });

  return markers;
}

/**
 * Calculates route segments for a day in chronological order
 */
export function calculateDayRouteSegments(
  day: ItineraryDay,
  destinationName: string
): RouteSegment[] {
  if (!day.activities || day.activities.length < 2) {
    return [];
  }

  const segments: RouteSegment[] = [];
  const chronologicalActivities = sortActivitiesChronologically(day.activities);

  for (let i = 0; i < chronologicalActivities.length - 1; i++) {
    const fromAct = chronologicalActivities[i];
    const toAct = chronologicalActivities[i + 1];

    const fromCoords = locationService.resolveCoordinates(fromAct, destinationName);
    const toCoords = locationService.resolveCoordinates(toAct, destinationName);

    const distanceKm = locationService.calculateDistanceKm(fromCoords, toCoords);
    const estimatedMinutes = locationService.estimateTravelTimeMinutes(distanceKm);

    segments.push({
      fromLocationId: fromAct.id,
      toLocationId: toAct.id,
      fromName: fromAct.title,
      toName: toAct.title,
      fromCoords,
      toCoords,
      distanceKm,
      estimatedMinutes,
      polyline: [
        [fromCoords.latitude, fromCoords.longitude],
        [toCoords.latitude, toCoords.longitude],
      ],
      dayNumber: day.dayNumber,
    });
  }

  return segments;
}

/**
 * Calculates comprehensive DayRouteSummary
 */
export function calculateDaySummary(
  day: ItineraryDay,
  destinationName: string
): DayRouteSummary {
  const segments = calculateDayRouteSegments(day, destinationName);
  
  const totalDistanceKm = segments.reduce((sum, s) => sum + s.distanceKm, 0);
  const totalTravelMinutes = segments.reduce((sum, s) => sum + s.estimatedMinutes, 0);
  const totalCost = day.activities.reduce((sum, a) => sum + (a.estimatedCost || 0), 0);

  return {
    dayNumber: day.dayNumber,
    dateDisplay: day.dateDisplay,
    stopsCount: day.activities.length,
    totalDistanceKm: Math.round(totalDistanceKm * 10) / 10,
    totalTravelMinutes,
    totalCost,
    segments,
  };
}

/**
 * Calculates overall trip map stats
 */
export function calculateTripMapStats(itinerary: Itinerary): TripMapStats {
  let totalPlaces = 0;
  let totalDistanceKm = 0;
  let totalTravelMinutes = 0;
  let totalCost = 0;
  let totalConflicts = 0;

  itinerary.days.forEach((day) => {
    totalPlaces += day.activities.length;
    const summary = calculateDaySummary(day, itinerary.destination);
    totalDistanceKm += summary.totalDistanceKm;
    totalTravelMinutes += summary.totalTravelMinutes;
    totalCost += summary.totalCost;

    const health = calculateDayHealth(day);
    totalConflicts += health.conflictCount;
  });

  // Calculate Health Assessment
  let healthScore = 95;
  if (totalDistanceKm > 40) healthScore -= 10;
  if (totalTravelMinutes > 240) healthScore -= 15;
  if (totalConflicts > 0) healthScore -= totalConflicts * 15;
  healthScore = Math.max(30, Math.min(100, healthScore));

  const healthStatus: 'Excellent' | 'Great' | 'Needs Attention' =
    healthScore >= 85 ? 'Excellent' : healthScore >= 70 ? 'Great' : 'Needs Attention';

  const healthMessage =
    healthScore >= 85
      ? 'Optimal geographical flow with minimal transit'
      : healthScore >= 70
      ? 'Good pacing with minor transit optimizations possible'
      : 'Contains long transit stretches or tight stops';

  return {
    totalPlaces,
    totalDays: itinerary.days.length,
    totalDistanceKm: Math.round(totalDistanceKm * 10) / 10,
    totalTravelMinutes,
    totalCost,
    conflictsCount: totalConflicts,
    healthScore,
    healthStatus,
    healthMessage,
  };
}

/**
 * Computes bounding coordinates for a list of coordinates or markers
 */
export function computeBoundingBox(
  markers: Coordinates[],
  destinationName?: string
): {
  center: [number, number];
  bounds?: [[number, number], [number, number]];
} {
  if (markers.length === 0) {
    const dest = locationService.getDestinationCenter(destinationName || 'Manali');
    return {
      center: [dest.lat, dest.lng],
      bounds: [
        [dest.lat - 0.05, dest.lng - 0.05],
        [dest.lat + 0.05, dest.lng + 0.05],
      ],
    };
  }

  const validMarkers = markers.filter(
    (marker) =>
      typeof marker.latitude === 'number' &&
      typeof marker.longitude === 'number' &&
      Number.isFinite(marker.latitude) &&
      Number.isFinite(marker.longitude)
  );

  if (validMarkers.length === 0) {
    const dest = locationService.getDestinationCenter(destinationName || 'Manali');
    return {
      center: [dest.lat, dest.lng],
      bounds: [
        [dest.lat - 0.05, dest.lng - 0.05],
        [dest.lat + 0.05, dest.lng + 0.05],
      ],
    };
  }

  let minLat = validMarkers[0].latitude;
  let maxLat = validMarkers[0].latitude;
  let minLng = validMarkers[0].longitude;
  let maxLng = validMarkers[0].longitude;

  validMarkers.forEach((marker) => {
    minLat = Math.min(minLat, marker.latitude);
    maxLat = Math.max(maxLat, marker.latitude);
    minLng = Math.min(minLng, marker.longitude);
    maxLng = Math.max(maxLng, marker.longitude);
  });

  const centerLat = (minLat + maxLat) / 2;
  const centerLng = (minLng + maxLng) / 2;

  // Add small padding if single point
  if (minLat === maxLat && minLng === maxLng) {
    return {
      center: [centerLat, centerLng],
      bounds: [
        [minLat - 0.02, minLng - 0.02],
        [maxLat + 0.02, maxLng + 0.02],
      ],
    };
  }

  return {
    center: [centerLat, centerLng],
    bounds: [
      [minLat, minLng],
      [maxLat, maxLng],
    ],
  };
}
