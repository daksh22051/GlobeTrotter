import { Trip } from './trip';
import { Itinerary, ItineraryActivity, DayHealthResult } from './itinerary';
import { Expense } from './budget';
import { CurrencyCode, TravelStyle } from './profile';

export type HealthRating = 'Excellent' | 'Good' | 'Needs Attention' | 'At Risk';

export type IssueSeverity = 'critical' | 'warning' | 'suggestion';

export type IssueType =
  | 'overlap'
  | 'impossible_travel'
  | 'tight_travel'
  | 'overloaded_day'
  | 'underutilized_day'
  | 'meal_gap_lunch'
  | 'meal_gap_dinner'
  | 'budget_overrun'
  | 'unassigned_time'
  | 'empty_day';

export type FixActionType =
  | 'FIX_OVERLAP'
  | 'ADD_TRAVEL_TIME'
  | 'MOVE_TO_DAY'
  | 'SPREAD_ACTIVITIES'
  | 'ADD_MEAL'
  | 'REDUCE_BUDGET'
  | 'EXPLORE_FOOD'
  | 'OPTIMIZE_SCHEDULE';

export interface TripHealthIssue {
  id: string;
  type: IssueType;
  severity: IssueSeverity;
  title: string;
  description: string;
  dayNumber?: number;
  activityIds: string[];
  suggestedFix: string;
  fixActionType: FixActionType;
  metadata?: {
    overlapMinutes?: number;
    availableMinutes?: number;
    requiredMinutes?: number;
    fromLocation?: string;
    toLocation?: string;
    mealType?: 'lunch' | 'dinner';
    overrunAmount?: number;
    targetDayNumber?: number;
  };
}

export interface HealthComponentScore {
  name: string;
  key: 'scheduleBalance' | 'conflictFree' | 'travelEfficiency' | 'freeTime' | 'budgetHealth' | 'activityDistribution' | 'planningCompleteness';
  weight: number; // e.g. 0.20 for 20%
  score: number; // 0 - 100
  weightedScore: number;
  status: HealthRating;
  summary: string;
}

export interface TripHealthBreakdown {
  score: number; // Overall 0 - 100
  label: HealthRating;
  colorClass: string;
  badgeBg: string;
  badgeText: string;
  progressColor: string;
  components: {
    scheduleBalance: HealthComponentScore;
    conflictFree: HealthComponentScore;
    travelEfficiency: HealthComponentScore;
    freeTime: HealthComponentScore;
    budgetHealth: HealthComponentScore;
    activityDistribution: HealthComponentScore;
    planningCompleteness: HealthComponentScore;
  };
  subscores: {
    schedule: number;
    budget: number;
    travel: number;
    balance: number;
    planning: number;
    conflictFree: number;
  };
  positiveHighlights: string[];
  issues: TripHealthIssue[];
  criticalCount: number;
  warningCount: number;
  suggestionCount: number;
  dayHealths: Record<number, DayHealthResult>;
  recommendation: string;
}

export type TransportPreference = 'flight' | 'train' | 'rental_car' | 'public_transit' | 'budget_saver';
export type AccommodationLevel = 'luxury' | 'premium' | 'comfort' | 'budget';
export type TravelPace = TravelStyle | 'fast-paced';
export type ScenarioPreset = 'Save Money' | 'More Relaxed' | 'More Experiences' | 'Faster Trip' | 'Family Friendly' | 'Custom';

export interface WhatIfScenario {
  budget: number;
  durationDays: number;
  travelersCount: number;
  transportPreference: TransportPreference;
  accommodationLevel: AccommodationLevel;
  travelPace: TravelPace;
  presetName: ScenarioPreset;
}

export interface WhatIfAlternative {
  id: string;
  category: 'hotel' | 'transport' | 'activity' | 'pace';
  title: string;
  currentChoice: {
    name: string;
    cost: number;
    detail: string;
    icon?: string;
  };
  suggestedChoice: {
    name: string;
    cost: number;
    detail: string;
    icon?: string;
  };
  savings: number;
  timeImpactMinutes?: number;
  explanation: string;
}

export interface WhatIfSimulationResult {
  originalTrip: Trip;
  scenario: WhatIfScenario;
  simulatedTrip: Trip;
  simulatedItinerary: Itinerary;
  simulatedExpenses: Expense[];
  originalHealth: TripHealthBreakdown;
  simulatedHealth: TripHealthBreakdown;
  healthImpact: number; // positive or negative
  budgetImpact: {
    originalBudget: number;
    simulatedBudget: number;
    estimatedCost: number;
    potentialSavings: number;
    breakdown: {
      hotelSavings: number;
      transportSavings: number;
      activitySavings: number;
      foodAdjustment: number;
    };
  };
  durationImpact: {
    originalDays: number;
    simulatedDays: number;
    removedDays: number[];
    condensedSummary: string;
  };
  transportImpact: {
    originalMode: string;
    simulatedMode: string;
    costDelta: number;
    timeDeltaMinutes: number;
    description: string;
  };
  paceImpact: {
    originalPace: string;
    simulatedPace: string;
    freeTimeHoursPerDay: number;
    averageActivitiesPerDay: number;
  };
  alternatives: WhatIfAlternative[];
  aiExplanation: string;
  changesSummary: string[];
}

export type AssistantActionType =
  | 'MOVE_ACTIVITY'
  | 'SHIFT_TIMING'
  | 'OPTIMIZE_DAY'
  | 'REDUCE_BUDGET'
  | 'REPLACE_HOTEL'
  | 'ADD_MEAL'
  | 'APPLY_WHAT_IF'
  | 'FIX_ALL_CONFLICTS';

export interface AssistantAction {
  id: string;
  type: AssistantActionType;
  title: string;
  description: string;
  impact: {
    healthBefore: number;
    healthAfter: number;
    budgetDelta?: number;
    freeTimeDeltaMinutes?: number;
    summary: string;
  };
  payload: {
    activityId?: string;
    activityTitle?: string;
    fromDayNumber?: number;
    toDayNumber?: number;
    newStartTime?: string;
    dayNumber?: number;
    newBudget?: number;
    mealType?: 'lunch' | 'dinner';
    scenario?: WhatIfScenario;
    autoFixedItinerary?: Itinerary;
  };
  status: 'pending' | 'applied' | 'cancelled';
}

export interface AssistantMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  action?: AssistantAction;
  isStreaming?: boolean;
}
