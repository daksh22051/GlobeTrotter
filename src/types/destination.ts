/**
 * GlobeTrotter Destination Model
 */

export interface Destination {
  id: string;
  name: string;
  country: string;
  region?: string;
  rating: number;
  reviewCount?: number;
  image: string;
  imageUrl?: string;
  shortDescription: string;
  tagline?: string;
  tags: string[];
  estimatedDailyBudget: number; // in base currency (INR)
  estimatedCostPerDay?: number;
  bestFor: string;
  highlights?: string[];
  matchScore?: number;
  matchReason?: string;
  isDomestic?: boolean;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  costIndex?: 'Budget' | 'Mid-range' | 'Luxury';
}

