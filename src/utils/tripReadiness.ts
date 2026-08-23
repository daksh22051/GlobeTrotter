/**
 * Trip Planning Readiness Utility
 * 
 * Computes a deterministic, frontend readiness score (0 - 100%)
 * indicating how complete and well-defined the journey plan is.
 */

export interface ReadinessScoreResult {
  score: number; // 0 to 100
  percentage: number;
  label: string; // "Getting Started", "Drafting Details", "Looking Great", "Ready to Launch"
  statusMessage: string;
  missingFields: string[];
  completedCount: number;
  totalCriteria: number;
}

export interface ReadinessInput {
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  travellersCount?: number;
  travelersCount?: number;
  tripType?: string;
  budget?: number;
  travelPace?: string;
  accommodationStyle?: string;
  transportPreferences?: string[];
  interests?: string[];
  notes?: string;
}

export const calculateTripReadiness = (input: ReadinessInput): ReadinessScoreResult => {
  let score = 0;
  const missingFields: string[] = [];
  const effectiveTravelers = input.travelersCount ?? input.travellersCount ?? 1;

  // 1. Trip Name (15 pts)
  if (input.name && input.name.trim().length >= 2) {
    score += 15;
  } else {
    missingFields.push('Trip name');
  }

  // 2. Destination (20 pts)
  if (input.destination && input.destination.trim().length >= 2) {
    score += 20;
  } else {
    missingFields.push('Destination');
  }

  // 3. Dates & Duration (15 pts)
  if (input.startDate && input.endDate && new Date(input.endDate) >= new Date(input.startDate)) {
    score += 15;
  } else {
    missingFields.push('Travel dates');
  }

  // 4. Travellers (10 pts)
  if (effectiveTravelers >= 1) {
    score += 10;
  } else {
    missingFields.push('Traveller count');
  }

  // 5. Trip Type (10 pts)
  if (input.tripType) {
    score += 10;
  } else {
    missingFields.push('Trip theme');
  }

  // 6. Budget & Currency (10 pts)
  if (input.budget && input.budget > 0) {
    score += 10;
  } else {
    missingFields.push('Budget target');
  }

  // 7. Pace, Transport, Stay (10 pts)
  if (input.travelPace && input.accommodationStyle && (input.transportPreferences?.length ?? 0) > 0) {
    score += 10;
  } else {
    missingFields.push('Travel style & stay');
  }

  // 8. Interests (10 pts)
  if (input.interests && input.interests.length > 0) {
    score += 10;
  } else {
    missingFields.push('Experiences & interests');
  }

  // Cap score between 0 and 100
  const finalScore = Math.min(100, Math.max(0, score));

  let label = 'Getting Started';
  let statusMessage = 'Fill in basic details to get your itinerary ready.';
  if (finalScore >= 90) {
    label = 'Ready to Launch';
    statusMessage = 'Your trip blueprint is fully detailed and ready to build.';
  } else if (finalScore >= 70) {
    label = 'Looking Great';
    statusMessage = 'Almost done! Review your style and budget preferences.';
  } else if (finalScore >= 40) {
    label = 'Drafting Details';
    statusMessage = 'Good start. Add travel dates and select preferences.';
  }

  const completedCount = 8 - missingFields.length;

  return {
    score: finalScore,
    percentage: finalScore,
    label,
    statusMessage,
    missingFields,
    completedCount,
    totalCriteria: 8,
  };
};
