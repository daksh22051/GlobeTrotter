/**
 * GlobeTrotter Trip Health Summary Utility
 * 
 * Lightweight aggregator synthesizing planning progress, schedule conflicts,
 * and budget health into an overall 0-100 health score with actionable guidance.
 */

import { Trip } from '../types/trip';
import { itineraryService } from '../services/itineraryService';
import { budgetService } from '../services/budgetService';
import { detectDayConflicts } from './itineraryConflictDetector';
import { calculateTripProgress } from './tripProgressCalculator';

export type HealthRating = 'Excellent' | 'Good' | 'Needs Attention' | 'At Risk';

export interface TripHealthResult {
  score: number; // 0 to 100
  label: HealthRating;
  colorClass: string;
  badgeBg: string;
  badgeText: string;
  conflictCount: number;
  hasBudgetAlert: boolean;
  highlights: string[];
  recommendation: string;
}

export function calculateTripHealthSummary(trip: Trip): TripHealthResult {
  const progress = calculateTripProgress(trip);
  let healthScore = 75; // Baseline starting score
  const highlights: string[] = [];
  let conflictCount = 0;
  let hasBudgetAlert = false;

  // 1. Progress Factor (Contributes up to +15 or -20)
  if (progress.percentage >= 80) {
    healthScore += 15;
    highlights.push('Itinerary & details extensively planned');
  } else if (progress.percentage >= 50) {
    healthScore += 5;
    highlights.push('Core itinerary structured');
  } else if (progress.percentage < 30) {
    healthScore -= 15;
    highlights.push('Trip is in early draft stage');
  }

  // 2. Itinerary Conflict Factor
  try {
    const itinerary = itineraryService.getItinerary(trip.id, trip);
    if (itinerary && itinerary.days) {
      let totalConflicts = 0;
      itinerary.days.forEach((day) => {
        const conflicts = detectDayConflicts(day);
        totalConflicts += conflicts.length;
      });
      conflictCount = totalConflicts;

      if (totalConflicts === 0 && progress.scheduledActivitiesCount > 0) {
        healthScore += 10;
        highlights.push('Zero schedule conflicts detected');
      } else if (totalConflicts > 0) {
        healthScore -= Math.min(30, totalConflicts * 10);
        highlights.push(`${totalConflicts} schedule overlap(s) need resolution`);
      }
    }
  } catch {
    // Graceful fallback
  }

  // 3. Budget Health Factor
  try {
    const expenses = budgetService.getExpenses(trip.id);
    const totalSpent = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const totalBudget = trip.budget || 50000;

    if (totalSpent > totalBudget && totalBudget > 0) {
      hasBudgetAlert = true;
      healthScore -= 20;
      const overAmount = (totalSpent - totalBudget).toLocaleString();
      highlights.push(`Budget exceeded by ${trip.currency || 'INR'} ${overAmount}`);
    } else if (totalSpent > 0 && totalSpent <= totalBudget) {
      healthScore += 5;
      highlights.push('Spending within designated budget');
    }
  } catch {
    // Graceful fallback
  }

  // Cap between 0 and 100
  const finalScore = Math.min(100, Math.max(10, Math.round(healthScore)));

  let label: HealthRating = 'Good';
  let colorClass = 'text-[#1F8A70]';
  let badgeBg = 'bg-[#E8F8F5] border-[#B2E6DC]';
  let badgeText = 'text-[#1F8A70]';
  let recommendation = 'Your trip is in good shape. Review recommendations to add finishing touches.';

  if (finalScore >= 88) {
    label = 'Excellent';
    colorClass = 'text-[#1F8A70]';
    badgeBg = 'bg-[#E8F8F5] border-[#B2E6DC]';
    badgeText = 'text-[#1F8A70]';
    recommendation = 'Pristine travel plan with balanced daily pacing and zero scheduling friction.';
  } else if (finalScore >= 70) {
    label = 'Good';
    colorClass = 'text-[#20B8A6]';
    badgeBg = 'bg-[#E6F8F5] border-[#B8ECE4]';
    badgeText = 'text-[#168376]';
    recommendation = 'Solid itinerary. Fine-tune your scheduled activities and budget items.';
  } else if (finalScore >= 50) {
    label = 'Needs Attention';
    colorClass = 'text-[#E08A00]';
    badgeBg = 'bg-[#FEF6E8] border-[#FCE2B6]';
    badgeText = 'text-[#B86E00]';
    recommendation = conflictCount > 0 
      ? 'Resolve overlapping activity timings on your timeline.' 
      : 'Add more activities and check your budget allocation.';
  } else {
    label = 'At Risk';
    colorClass = 'text-[#E5484D]';
    badgeBg = 'bg-[#FFF0F0] border-[#FDB8B8]';
    badgeText = 'text-[#C72E33]';
    recommendation = 'Major scheduling or budget issues require attention before departure.';
  }

  return {
    score: finalScore,
    label,
    colorClass,
    badgeBg,
    badgeText,
    conflictCount,
    hasBudgetAlert,
    highlights,
    recommendation,
  };
}
