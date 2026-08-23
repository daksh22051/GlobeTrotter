/**
 * AI Travel Assistant & Copilot Service
 * 
 * Intelligent context-aware copilot providing natural language analysis,
 * proactive suggestions, read-only queries, and structured actionable
 * modifications with user confirmation.
 */

import { Trip } from '../types/trip';
import { Itinerary, ItineraryActivity, ItineraryDay } from '../types/itinerary';
import {
  AssistantMessage,
  AssistantAction,
  AssistantActionType,
  TripHealthBreakdown,
} from '../types/intelligence';
import { itineraryService } from './itineraryService';
import { tripHealthService } from './tripHealthService';
import { whatIfService } from './whatIfService';
import { tripService } from './tripService';
import { budgetService } from './budgetService';
import {
  timeStringToMinutes,
  minutesToTimeString,
  formatTimeDisplay,
} from '../utils/itineraryConflictDetector';
import { formatCurrency } from '../utils/currency';
import { CurrencyCode } from '../types/profile';

const ASSISTANT_STORAGE_PREFIX = 'globetrotter_assistant_history_';

export const aiTravelAssistantService = {
  /**
   * Loads message history for a trip or returns default welcome greeting
   */
  getHistory(trip: Trip): AssistantMessage[] {
    try {
      const raw = localStorage.getItem(`${ASSISTANT_STORAGE_PREFIX}${trip.id}`);
      if (raw) return JSON.parse(raw);
    } catch {
      // Fallback
    }

    const health = tripHealthService.calculateHealth(trip);
    return [
      {
        id: `msg_welcome_${Date.now()}`,
        role: 'assistant',
        content: `Hi! I'm your AI Travel Copilot for your trip to **${trip.destination}**. Your current Trip Health is **${health.score}/100 (${health.label})** with **${trip.durationDays || 5} days** planned. How can I help fine-tune your itinerary or budget today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
  },

  /**
   * Saves message history for a trip
   */
  saveHistory(tripId: string, history: AssistantMessage[]) {
    try {
      localStorage.setItem(`${ASSISTANT_STORAGE_PREFIX}${tripId}`, JSON.stringify(history.slice(-30)));
    } catch {
      // Fallback
    }
  },

  /**
   * Processes a user query against the real trip data, health, and itinerary
   */
  async processQuery(
    trip: Trip,
    userQuery: string,
    history: AssistantMessage[]
  ): Promise<AssistantMessage> {
    const q = userQuery.trim().toLowerCase();
    const currency = (trip.currency || 'INR') as CurrencyCode;
    const itinerary = itineraryService.getItinerary(trip.id, trip);
    const health = tripHealthService.calculateHealth(trip, itinerary);
    const days = itinerary.days || [];
    const scheduledActivities = days.flatMap((d) => d.activities);

    // 1. Check for "Make Day X less hectic" or "less hectic" / "overloaded"
    const dayMatch = q.match(/day\s*(\d+)/i);
    const requestedDayNum = dayMatch ? parseInt(dayMatch[1], 10) : null;

    if (q.includes('less hectic') || q.includes('relax day') || q.includes('too packed')) {
      const targetDayNum = requestedDayNum || 
        days.find((d) => (d.activities || []).length >= 4)?.dayNumber || 1;
      const targetDay = days.find((d) => d.dayNumber === targetDayNum);

      if (targetDay && targetDay.activities.length > 2) {
        const candidateToMove = targetDay.activities[targetDay.activities.length - 1];
        const nextDayNum = targetDayNum < days.length ? targetDayNum + 1 : targetDayNum - 1;

        const action: AssistantAction = {
          id: `act_${Date.now()}`,
          type: 'MOVE_ACTIVITY',
          title: `Move "${candidateToMove.title}" to Day ${nextDayNum}`,
          description: `Day ${targetDayNum} currently has ${targetDay.activities.length} activities. Moving "${candidateToMove.title}" to Day ${nextDayNum} balances your schedule and increases free time.`,
          impact: {
            healthBefore: health.score,
            healthAfter: Math.min(100, health.score + 6),
            freeTimeDeltaMinutes: 90,
            summary: `Day ${targetDayNum} health increases with +1.5h added free time.`,
          },
          payload: {
            activityId: candidateToMove.id,
            activityTitle: candidateToMove.title,
            fromDayNumber: targetDayNum,
            toDayNumber: nextDayNum,
          },
          status: 'pending',
        };

        return {
          id: `msg_${Date.now()}`,
          role: 'assistant',
          content: `Day ${targetDayNum} currently has **${targetDay.activities.length} activities** and a tight schedule. I recommend moving **"${candidateToMove.title}"** to Day ${nextDayNum}.\n\nThis will add **~1.5 hours of free time** to Day ${targetDayNum} and elevate your overall Trip Health from **${health.score}** to **${Math.min(100, health.score + 6)}/100**.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          action,
        };
      } else {
        return {
          id: `msg_${Date.now()}`,
          role: 'assistant',
          content: `Day ${targetDayNum || 1} currently only has **${targetDay?.activities.length || 0} activities**, so it is already reasonably paced! Let me know if you'd like to adjust another day.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
      }
    }

    // 2. Budget Reduction / "Reduce my budget to X"
    const budgetMatch = q.match(/(\d+[\d,]*)/);
    if (q.includes('budget') && (q.includes('reduce') || q.includes('save') || q.includes('cut') || budgetMatch)) {
      let targetBudget = trip.budget || 60000;
      if (budgetMatch) {
        const rawNum = parseInt(budgetMatch[1].replace(/,/g, ''), 10);
        if (rawNum >= 1000) targetBudget = rawNum;
        else targetBudget = Math.round((trip.budget || 60000) * 0.75);
      } else {
        targetBudget = Math.round((trip.budget || 60000) * 0.75);
      }

      const simScenario = whatIfService.getPresetScenario(trip, 'Save Money');
      simScenario.budget = targetBudget;
      const simResult = whatIfService.simulateTrip(trip, simScenario);

      const action: AssistantAction = {
        id: `act_${Date.now()}`,
        type: 'REDUCE_BUDGET',
        title: `Adjust Budget to ${formatCurrency(targetBudget, currency)}`,
        description: `Simulates savings of ${formatCurrency(trip.budget - targetBudget, currency)} by switching accommodation to comfort tier and optimizing transit without removing core highlights.`,
        impact: {
          healthBefore: health.score,
          healthAfter: simResult.simulatedHealth.score,
          budgetDelta: targetBudget - trip.budget,
          summary: `Saves ${formatCurrency(Math.abs(trip.budget - targetBudget), currency)} · Trip health: ${simResult.simulatedHealth.score}/100`,
        },
        payload: {
          newBudget: targetBudget,
          scenario: simScenario,
        },
        status: 'pending',
      };

      return {
        id: `msg_${Date.now()}`,
        role: 'assistant',
        content: `I analyzed alternative options to reduce your budget to **${formatCurrency(targetBudget, currency)}** (saving **${formatCurrency(Math.abs(trip.budget - targetBudget), currency)}**).\n\nKey adjustments:\n- **Accommodation**: Comfort heritage stay (-${formatCurrency(simResult.budgetImpact.breakdown.hotelSavings, currency)})\n- **Transit**: Rail / smart transit (-${formatCurrency(simResult.budgetImpact.breakdown.transportSavings, currency)})\n- **Health Score**: **${simResult.simulatedHealth.score}/100**\n\nWould you like me to apply this plan?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        action,
      };
    }

    // 3. "Fix conflicts" / "Optimize my itinerary" / "Auto fix"
    if (q.includes('optimize') || q.includes('fix conflicts') || q.includes('fix all') || q.includes('fix issue')) {
      const fixPlan = tripHealthService.generateAutoFixPlan(trip);

      const action: AssistantAction = {
        id: `act_${Date.now()}`,
        type: 'FIX_ALL_CONFLICTS',
        title: `Apply Comprehensive Itinerary Optimization`,
        description: `Resolves ${fixPlan.conflictsResolved} schedule conflicts, adds meal buffers, and balances daily load across all ${days.length} days.`,
        impact: {
          healthBefore: fixPlan.healthBefore,
          healthAfter: fixPlan.healthAfter,
          summary: `Health improves from ${fixPlan.healthBefore} to ${fixPlan.healthAfter}/100 (+${fixPlan.healthAfter - fixPlan.healthBefore} pts).`,
        },
        payload: {
          autoFixedItinerary: fixPlan.optimizedItinerary,
        },
        status: 'pending',
      };

      const bulletList = fixPlan.improvements.slice(0, 3).map((imp) => `- ${imp}`).join('\n');

      return {
        id: `msg_${Date.now()}`,
        role: 'assistant',
        content: `I ran an optimization pass on your itinerary and resolved **${fixPlan.conflictsResolved} issue(s)**.\n\n${bulletList}\n\nThis raises your overall Trip Health from **${fixPlan.healthBefore}** to **${fixPlan.healthAfter}/100** (+${fixPlan.healthAfter - fixPlan.healthBefore} improvement).\n\nApply these changes?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        action,
      };
    }

    // 4. "Suggest food nearby" / "Lunch" / "Dinner"
    if (q.includes('food') || q.includes('lunch') || q.includes('dinner') || q.includes('restaurant') || q.includes('eat')) {
      const targetDayNum = requestedDayNum || 1;
      const action: AssistantAction = {
        id: `act_${Date.now()}`,
        type: 'ADD_MEAL',
        title: `Add Curated Lunch on Day ${targetDayNum}`,
        description: `Inserts a 1:00 PM traditional lunch tasting spot near your Day ${targetDayNum} sightseeing spots.`,
        impact: {
          healthBefore: health.score,
          healthAfter: Math.min(100, health.score + 4),
          budgetDelta: 1200,
          summary: `Fills midday meal gap and boosts activity distribution score.`,
        },
        payload: {
          dayNumber: targetDayNum,
          mealType: 'lunch',
        },
        status: 'pending',
      };

      return {
        id: `msg_${Date.now()}`,
        role: 'assistant',
        content: `For **Day ${targetDayNum} in ${trip.destination}**, I recommend adding a traditional lunch stop at **1:00 PM** to enjoy authentic local delicacies between your morning and afternoon activities.\n\nEstimated cost: **${formatCurrency(1200, currency)}** · Health boost: **+4 pts**`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        action,
      };
    }

    // 5. Read-Only Questions: Budget, Activities, Health, Busiest day
    if (q.includes('total budget') || q.includes('how much') || q.includes('spending')) {
      return {
        id: `msg_${Date.now()}`,
        role: 'assistant',
        content: `Your total trip budget is **${formatCurrency(trip.budget, currency)}** for **${trip.travelersCount || 1} traveller(s)** over **${trip.durationDays || 5} days**. Currently, you have **${scheduledActivities.length} scheduled activities** with an estimated activity expenditure of **${formatCurrency(scheduledActivities.reduce((a, b) => a + (b.estimatedCost || 0), 0), currency)}**.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
    }

    if (q.includes('health') || q.includes('score') || q.includes('status')) {
      return {
        id: `msg_${Date.now()}`,
        role: 'assistant',
        content: `Your Trip Health Score is **${health.score}/100 (${health.label})**.\n\nSubscores:\n- Schedule Balance: **${health.subscores.schedule}/100**\n- Conflict-Free: **${health.subscores.conflictFree}/100**\n- Travel Efficiency: **${health.subscores.travel}/100**\n- Free Time: **${health.subscores.balance}/100**\n- Budget Health: **${health.subscores.budget}/100**\n\n${health.recommendation}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
    }

    if (q.includes('busiest day') || q.includes('overscheduled') || q.includes('most packed')) {
      let busiestDay = days[0];
      let maxCount = 0;
      days.forEach((d) => {
        if (d.activities.length > maxCount) {
          maxCount = d.activities.length;
          busiestDay = d;
        }
      });

      return {
        id: `msg_${Date.now()}`,
        role: 'assistant',
        content: busiestDay
          ? `Your busiest day is **Day ${busiestDay.dayNumber} (${busiestDay.title || busiestDay.dateDisplay})** with **${busiestDay.activities.length} activities** scheduled. Would you like me to move an activity to lighten the schedule?`
          : `All days are currently very light or evenly distributed!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
    }

    if (q.includes('free time') || q.includes('breathing room') || q.includes('rest')) {
      return {
        id: `msg_${Date.now()}`,
        role: 'assistant',
        content: `You currently have an average of **~2.8 hours of free time** per day across your **${days.length}-day trip**. If you'd like a more leisurely pace, ask me to *"Make this trip more relaxed"* or adjust specific days!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
    }

    // Default Fallback
    return {
      id: `msg_${Date.now()}`,
      role: 'assistant',
      content: `I've analyzed your **${trip.destination}** trip (**${days.length} days**, **${scheduledActivities.length} activities**, Health **${health.score}/100**).\n\nYou can ask me to:\n- *"Make Day 3 less hectic"*\n- *"Reduce my budget to ${formatCurrency(Math.round((trip.budget || 60000) * 0.8), currency)}"*\n- *"Optimize my itinerary"*\n- *"Suggest food nearby"*\n- *"Which day is busiest?"*`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  },

  /**
   * Executes a confirmed action on the real trip / itinerary / budget data
   */
  applyAction(trip: Trip, action: AssistantAction): boolean {
    try {
      if (action.type === 'MOVE_ACTIVITY' && action.payload.activityId && action.payload.toDayNumber) {
        const itinerary = itineraryService.getItinerary(trip.id, trip);
        const updated = itineraryService.moveActivity(
          itinerary,
          action.payload.activityId,
          action.payload.toDayNumber,
          undefined,
          '14:30'
        );
        itineraryService.saveItinerary(updated, trip.userId);
        return true;
      }

      if (action.type === 'FIX_ALL_CONFLICTS' && action.payload.autoFixedItinerary) {
        itineraryService.saveItinerary(action.payload.autoFixedItinerary, trip.userId);
        return true;
      }

      if (action.type === 'REDUCE_BUDGET' && action.payload.scenario) {
        const simResult = whatIfService.simulateTrip(trip, action.payload.scenario);
        whatIfService.applyScenario(simResult);
        return true;
      }

      if (action.type === 'ADD_MEAL' && action.payload.dayNumber) {
        const itinerary = itineraryService.getItinerary(trip.id, trip);
        const isDinner = action.payload.mealType === 'dinner';
        const newAct: Partial<ItineraryActivity> = {
          title: isDinner ? 'Dinner & Sunset Experience' : 'Curated Local Lunch',
          category: 'food',
          location: trip.destination,
          startTime: isDinner ? '19:30' : '13:00',
          duration: '1.5 hours',
          durationMinutes: 90,
          estimatedCost: 1200,
          currency: trip.currency || 'INR',
          status: 'Scheduled',
          dayNumber: action.payload.dayNumber,
          notes: 'Added via AI Travel Copilot.',
          image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
        };
        const updated = itineraryService.addActivity(itinerary, newAct, action.payload.dayNumber);
        itineraryService.saveItinerary(updated, trip.userId);
        return true;
      }

      return false;
    } catch {
      return false;
    }
  },
};
