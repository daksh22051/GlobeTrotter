/**
 * Travel Guide & PDF Export Presentation Types
 */

import { Trip } from './trip';
import { Itinerary, ItineraryActivity } from './itinerary';
import { Recommendation } from './recommendation';
import { BudgetSnapshot, CategorySummary } from './budget';

export interface GuideQuickFact {
  label: string;
  value: string;
  iconName?: string;
}

export interface GuideHighlightItem {
  id: string;
  name: string;
  category: 'place' | 'food' | 'hotel' | 'experience';
  location: string;
  description: string;
  image?: string;
  rating?: number;
  cost?: number;
  whySpecial?: string;
}

export interface GuideDayPlan {
  dayNumber: number;
  dateDisplay: string;
  date: string;
  title: string;
  theme?: string;
  estimatedCost: number;
  morningActivities: ItineraryActivity[];
  afternoonActivities: ItineraryActivity[];
  eveningActivities: ItineraryActivity[];
  allActivities: ItineraryActivity[];
}

export interface TravelGuideData {
  trip: Trip;
  itinerary: Itinerary | null;
  quickFacts: GuideQuickFact[];
  highlights: GuideHighlightItem[];
  days: GuideDayPlan[];
  places: Recommendation[];
  food: Recommendation[];
  hotels: Recommendation[];
  budgetSnapshot: BudgetSnapshot | null;
  categorySummaries: CategorySummary[];
  travelNotes: string[];
  totalActivitiesCount: number;
  generatedAt: string;
}

export interface PDFGenerationStep {
  step: number;
  totalSteps: number;
  label: string;
  description: string;
}
