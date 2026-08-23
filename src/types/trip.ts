/**
 * GlobeTrotter Trip Data Model
 */

import { CurrencyCode, TravelStyle, BudgetStyle } from './profile';

export type TripStatus = 'draft' | 'upcoming' | 'planning' | 'completed';

export type TripType =
  | 'leisure'
  | 'adventure'
  | 'food_culture'
  | 'business'
  | 'romantic'
  | 'family'
  | 'backpacking'
  | 'photography'
  | 'photoshoot'
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

export interface TripCity {
  id?: string;
  tripId?: string;
  cityName: string;
  country?: string;
  orderIndex: number;
  arrivalDate?: string;
  departureDate?: string;
  stayDurationDays?: number;
  latitude?: number;
  longitude?: number;
}

export interface TripItem {
  id: string;
  tripId: string;
  recommendationId: string;
  type: 'place' | 'hotel' | 'food' | 'experience';
  name: string;
  location?: string;
  latitude?: number;
  longitude?: number;
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
  origin?: string;
  originCountry?: string;
  destination: string;
  country: string;
  coverImage: string;
  startDate: string;
  endDate: string;
  arrivalLocation?: string;
  arrivalTime?: string;
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
  cities?: TripCity[];
  role?: string;
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
  origin?: string;
  originCountry?: string;
  destination: string;
  country: string;
  destinationImage: string;
  destinationId?: string;
  cities?: TripCity[];
  startDate: string;
  endDate: string;
  arrivalLocation?: string;
  arrivalTime?: string;
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

