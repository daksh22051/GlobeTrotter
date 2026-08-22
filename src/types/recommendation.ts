/**
 * AI Recommendation Type Definitions
 */

import { CurrencyCode } from './profile';

export type RecommendationCategory = 'place' | 'hotel' | 'food' | 'experience';
export type PriceLevel = '$' | '$$' | '$$$' | '$$$$';

export interface Recommendation {
  id: string;
  name: string;
  category: RecommendationCategory;
  description: string;
  image: string;
  location: string;
  destination?: string;
  country?: string;
  rating: number;
  reviewCount?: number;
  priceLevel: PriceLevel;
  estimatedCost: number;
  currency: CurrencyCode;
  duration?: string; // e.g. "2–3 hours", "Full Day", "Overnight"
  bestTime?: string; // e.g. "Morning & Golden Hour", "Sunset & Evening"
  tags: string[];
  whyRecommended: string;
  matchScore: number; // e.g. 95 (for 95% match)
  hotelDetails?: {
    pricePerNight: number;
    accommodationType: string;
    amenities: string[];
  };
  foodDetails?: {
    cuisine: string;
    signatureDish?: string;
    diningStyle: string;
  };
  experienceDetails?: {
    activityType: string;
    fitnessLevel?: string;
    groupSize?: string;
  };
}

export interface EstimatedCategoryBreakdown {
  accommodation: number;
  food: number;
  transport: number;
  activities: number;
  shoppingMisc: number;
  totalEstimated: number;
  budget: number;
  remainingOrOver: number;
  isOverBudget: boolean;
  isCloseToBudget: boolean;
  statusMessage: string;
  confidence: 'High' | 'Medium' | 'Estimated';
  confidenceReason: string;
}

export interface SmartTravelTip {
  id: string;
  iconName: string;
  title: string;
  tip: string;
  category: string;
}

export interface AIInsightData {
  title: string;
  highlight: string;
  description: string;
  adviceList: string[];
}

export interface TripRecommendations {
  tripId: string;
  destination: string;
  country: string;
  destinationSummary: string;
  destinationHeroImage: string;
  places: Recommendation[];
  hotels: Recommendation[];
  food: Recommendation[];
  attractions: Recommendation[];
  allRecommendations: Recommendation[];
  costEstimate: EstimatedCategoryBreakdown;
  aiInsight: AIInsightData;
  travelTips: SmartTravelTip[];
  generatedAt: string;
  isAiGenerated: boolean;
  provider: 'gemini' | 'hybrid-engine' | 'local-intelligence';
}
