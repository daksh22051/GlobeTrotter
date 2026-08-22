/**
 * GlobeTrotter Interactive Map Types & Data Models
 */

import { ActivityCategory, ItineraryActivity } from './itinerary';
import { CurrencyCode } from './profile';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface MapMarkerLocation extends Coordinates {
  id: string;
  activityId: string;
  recommendationId?: string;
  name: string;
  category: ActivityCategory;
  location: string;
  dayNumber: number;
  stopNumber: number; // 1-indexed order within the day
  startTime: string;
  duration: string;
  durationMinutes: number;
  estimatedCost: number;
  currency: CurrencyCode;
  image?: string;
  rating?: number;
  notes?: string;
  whyRecommended?: string;
}

export interface RouteSegment {
  fromLocationId: string;
  toLocationId: string;
  fromName: string;
  toName: string;
  fromCoords: Coordinates;
  toCoords: Coordinates;
  distanceKm: number;
  estimatedMinutes: number;
  polyline: [number, number][];
  dayNumber: number;
}

export interface DayRouteSummary {
  dayNumber: number;
  dateDisplay?: string;
  stopsCount: number;
  totalDistanceKm: number;
  totalTravelMinutes: number;
  totalCost: number;
  segments: RouteSegment[];
}

export interface TripMapStats {
  totalPlaces: number;
  totalDays: number;
  totalDistanceKm: number;
  totalTravelMinutes: number;
  totalCost: number;
  conflictsCount: number;
  healthScore: number;
  healthStatus: 'Excellent' | 'Great' | 'Needs Attention';
  healthMessage: string;
}

export interface RouteHealthAssessment {
  score: number; // 0 - 100
  status: 'Excellent' | 'Great' | 'Needs Attention';
  totalDistanceKm: number;
  totalTravelMinutes: number;
  backtrackWarnings: string[];
  tightScheduleWarnings: string[];
  suggestions: string[];
}

export interface MapBounds {
  northEast: Coordinates;
  southWest: Coordinates;
}

export interface UserCurrentLocation extends Coordinates {
  accuracy?: number;
  timestamp?: number;
}
