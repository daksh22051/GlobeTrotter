/**
 * GlobeTrotter Onboarding & User Profile Preference Types
 */

export type TravelInterest =
  | 'food'
  | 'mountains'
  | 'beaches'
  | 'history'
  | 'art'
  | 'nature'
  | 'adventure'
  | 'photography'
  | 'shopping'
  | 'nightlife'
  | 'spirituality'
  | 'architecture';

export type TravelStyle = 'relaxed' | 'balanced' | 'packed';

export type BudgetStyle = 'budget_friendly' | 'balanced' | 'comfort' | 'luxury';

export type CurrencyCode =
  | 'INR'
  | 'USD'
  | 'EUR'
  | 'GBP'
  | 'AED'
  | 'JPY'
  | 'AUD'
  | 'CAD'
  | 'SGD';

export type TravelCompanion =
  | 'solo'
  | 'partner'
  | 'family'
  | 'friends'
  | 'business';

export type TravelPersonality =
  | 'explorer'
  | 'foodie'
  | 'culture_lover'
  | 'adventure_seeker'
  | 'relaxer'
  | 'photographer';

export type AccommodationPreference = 'budget' | 'comfort' | 'premium' | 'luxury';

export type TransportStylePreference =
  | 'walking'
  | 'public_transport'
  | 'train'
  | 'bus'
  | 'rental_car'
  | 'taxi'
  | 'flight';

export interface UserPreferences {
  userId?: string;
  interests: TravelInterest[];
  travelStyle: TravelStyle;
  travelStylePace: number; // 0 to 100
  budget: number;
  budgetStyle: BudgetStyle;
  currency: CurrencyCode;
  travelCompanion: TravelCompanion;
  travelPersonality: TravelPersonality;
  accommodationPreference?: AccommodationPreference;
  transportPreference?: TransportStylePreference;
  bio?: string;
  languagePreference?: string;
  isComplete: boolean;
  updatedAt: string;
}

export interface InterestOption {
  id: TravelInterest;
  label: string;
  emoji: string;
  description: string;
  category: string;
}

export interface TravelStyleOption {
  id: TravelStyle;
  label: string;
  description: string;
  defaultPace: number;
  badge: string;
}

export interface BudgetStyleOption {
  id: BudgetStyle;
  label: string;
  description: string;
  multiplier: number;
}

export interface CompanionOption {
  id: TravelCompanion;
  label: string;
  description: string;
  iconName: string;
}

export interface PersonalityOption {
  id: TravelPersonality;
  title: string;
  tagline: string;
  description: string;
  badge: string;
  accentColor: string;
}
