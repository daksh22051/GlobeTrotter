/**
 * Itinerary Insights Generator
 * 
 * Generates local intelligent observations, pacing suggestions,
 * and routing tips based on actual itinerary state.
 */

import { Itinerary } from '../types/itinerary';
import { calculateItineraryStats } from './dayHealthCalculator';

export interface ItineraryInsightMessage {
  id: string;
  type: 'positive' | 'warning' | 'tip' | 'praise';
  title: string;
  message: string;
  badgeText: string;
  actionText?: string;
  targetDayNumber?: number;
}

export function generateItineraryInsights(
  itinerary: Itinerary,
  tripBudget: number
): ItineraryInsightMessage[] {
  const stats = calculateItineraryStats(itinerary, tripBudget);
  const insights: ItineraryInsightMessage[] = [];

  // 1. Conflict Warning
  if (stats.totalConflicts > 0) {
    insights.push({
      id: 'conflict_insight',
      type: 'warning',
      title: 'Schedule Attention Needed',
      message: `You have ${stats.totalConflicts} time overlap or tight transit conflict(s). Run AI Optimize to balance your timeline automatically.`,
      badgeText: 'Action Recommended',
    });
  }

  // 2. Budget Alert or Praise
  if (stats.isOverBudget) {
    insights.push({
      id: 'budget_over_insight',
      type: 'warning',
      title: 'Budget Threshold Notice',
      message: `Your current planned items exceed your target budget by ${itinerary.days[0]?.activities[0]?.currency || '₹'}${stats.overBudgetAmount.toLocaleString()}.`,
      badgeText: 'Budget Alert',
    });
  } else if (stats.remainingBudget > 0 && stats.scheduledActivities >= 6) {
    insights.push({
      id: 'budget_healthy_insight',
      type: 'positive',
      title: 'Great Budget Discipline',
      message: `You still have ${itinerary.days[0]?.activities[0]?.currency || '₹'}${stats.remainingBudget.toLocaleString()} in comfortable buffer for shopping and spontaneous treats.`,
      badgeText: 'Budget Healthy',
    });
  }

  // 3. Look for packed vs light days
  let packedDay: number | null = null;
  let lightDay: number | null = null;

  for (const day of itinerary.days || []) {
    const health = stats.dayHealths[day.dayNumber];
    if (health) {
      if (health.totalActivities >= 5 && !packedDay) {
        packedDay = day.dayNumber;
      }
      if (health.totalActivities <= 1 && !lightDay) {
        lightDay = day.dayNumber;
      }
    }
  }

  if (packedDay && lightDay && packedDay !== lightDay) {
    insights.push({
      id: 'rebalance_insight',
      type: 'tip',
      title: 'Day Rebalance Opportunity',
      message: `Day ${packedDay} is packed with activities while Day ${lightDay} has plenty of room. Try dragging a stop across days.`,
      badgeText: 'Pacing Tip',
      targetDayNumber: packedDay,
    });
  }

  // 4. Free time praise
  let dayWithGreatFreeTime: number | null = null;
  for (const day of itinerary.days || []) {
    const health = stats.dayHealths[day.dayNumber];
    if (health && health.freeTimeMinutes >= 120 && health.totalActivities >= 2) {
      dayWithGreatFreeTime = day.dayNumber;
      break;
    }
  }

  if (dayWithGreatFreeTime) {
    insights.push({
      id: 'freetime_insight',
      type: 'praise',
      title: 'Spontaneous Exploration Built-In',
      message: `Day ${dayWithGreatFreeTime} has over 2 hours of open time between visits — ideal for neighborhood strolls and coffee breaks.`,
      badgeText: 'Balanced Pacing',
      targetDayNumber: dayWithGreatFreeTime,
    });
  }

  // 5. Unscheduled items reminder
  if (stats.unscheduledActivities > 0) {
    insights.push({
      id: 'unscheduled_insight',
      type: 'tip',
      title: 'Unplaced Saved Spots',
      message: `You have ${stats.unscheduledActivities} saved recommendation(s) in "Unscheduled". Drag them directly into your timeline anytime.`,
      badgeText: 'Unscheduled',
    });
  }

  // 6. Repetitive Content Detection
  const allTitles = itinerary.days.flatMap(d => (d.activities || []).map(a => a.title.toLowerCase().trim()));
  if (allTitles.length >= 3) {
    const uniqueTitles = new Set(allTitles);
    if (uniqueTitles.size / allTitles.length < 0.7) {
      insights.unshift({
        id: 'repetitive_content_insight',
        type: 'warning',
        title: 'Repetitive Content Detected',
        message: 'Your itinerary contains generic or repeated activity names. Run AI Optimize to regenerate unique, destination-specific stops.',
        badgeText: 'Content Refresh',
      });
    }
  }

  // Default fallbacks if clean
  if (insights.length === 0) {
    insights.push({
      id: 'perfect_flow_insight',
      type: 'positive',
      title: 'Harmonious Journey Flow',
      message: 'Your days have clean transit windows, well-spaced activities, and zero schedule conflicts.',
      badgeText: 'Optimal Route',
    });
  }

  return insights;
}
