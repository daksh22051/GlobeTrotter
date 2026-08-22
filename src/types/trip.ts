/**
 * GlobeTrotter Trip Data Model
 */

import { CurrencyCode, TravelStyle, BudgetStyle } from './profile';

export type TripStatus = 'upcoming' | 'planning' | 'completed';

export type TripType =
  | 'leisure'
  | 'adventure'
  | 'food_culture'
  | 'business'
  | 'romantic'
  | 'family'
  | 'backpacking'
  | 'photography'
  | 'wellness';

export type TransportPreference =
  | 'flights'
  | 'train'
  | 'road_trip'
  | 'bus'
  | 'walking'
  | 'mixed';

export type AccommodationStyle =
  | 'budget_hotel'
  | 'boutique_hotel'
  | 'resort'
  | 'hostel'
  | 'apartment'
  | 'luxury_hotel';

export interface TripItem {
  id: string;
  tripId: string;
  recommendationId: string;
  type: 'place' | 'hotel' | 'food' | 'experience';
  name: string;
  location?: string;
  image?: string;
  estimatedCost: number;
  currency: CurrencyCode;
  status: 'Unscheduled' | 'Scheduled';
  date?: string;
  notes?: string;
  addedAt: string;
}

export interface Trip {
  id: string;
  userId?: string;
  name: string;
  destination: string;
  country: string;
  coverImage: string;
  startDate: string;
  endDate: string;
  dateDisplay: string;
  durationDays: number;
  travelersCount: number;
  adultsCount?: number;
  childrenCount?: number;
  tripType: TripType;
  budget: number;
  currency: CurrencyCode;
  budgetStyle: BudgetStyle;
  travelPace: TravelStyle;
  transportPreferences: TransportPreference[];
  accommodationStyle: AccommodationStyle;
  interests: string[];
  notes?: string;
  estimatedCost?: number;
  tripHealthScore?: number;
  status: TripStatus;
  items?: TripItem[];
  savedRecommendationIds?: string[];
  isFavorite?: boolean;
  isPinned?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface TripStats {
  tripsPlanned: number;
  countriesVisited: number;
  citiesExplored: number;
  preferredBudget: number;
}

export interface TripPlannerDraft {
  step?: number;
  currentStep?: number;
  name: string;
  destination: string;
  country: string;
  destinationImage: string;
  destinationId?: string;
  startDate: string;
  endDate: string;
  adultsCount: number;
  childrenCount: number;
  travelersCount?: number;
  tripType: TripType;
  budget: number;
  currency: CurrencyCode;
  budgetStyle: BudgetStyle;
  travelPace: TravelStyle;
  transportPreferences: TransportPreference[];
  accommodationStyle: AccommodationStyle;
  interests: string[];
  notes?: string;
  updatedAt?: string;
}

