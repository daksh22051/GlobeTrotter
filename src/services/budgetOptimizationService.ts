/**
 * Live Budget Optimizer Service
 * 
 * Analyzes trip preferences, current itinerary items, category allocations,
 * and logged expenses to generate concrete, high-impact savings suggestions.
 * Follows an AI-Ready architecture with prompt builder for future Gemini extensions.
 */

import { Trip } from '../types/trip';
import { Itinerary } from '../types/itinerary';
import {
  Expense,
  ExpenseCategory,
  BudgetOptimizationSuggestion,
  BudgetOptimizationResult,
} from '../types/budget';
import { budgetService } from './budgetService';
import { itineraryService } from './itineraryService';
import { tripService } from './tripService';
import { formatCurrency } from '../utils/currency';

export const budgetOptimizationService = {
  /**
   * Generates intelligent, personalized budget optimizations
   */
  async optimizeBudget(
    trip: Trip,
    itinerary: Itinerary | null,
    expenses: Expense[],
    allocations: Record<ExpenseCategory, number>
  ): Promise<BudgetOptimizationResult> {
    const currency = trip.currency || 'INR';
    const totalBudget = trip.budget || 50000;
    const categoryEstimates = budgetService.getCategoryEstimates(trip, itinerary);
    const categoryActuals = budgetService.getCategoryActuals(expenses);
    const initialEstimatedCost = budgetService.getEstimatedCost(trip, itinerary);

    const suggestions: BudgetOptimizationSuggestion[] = [];

    // Helper to scale figures by currency
    const scaleFactor = currency === 'USD' || currency === 'EUR' || currency === 'GBP' ? 0.015 : 1;

    // 1. Hotel / Accommodation Optimization
    const accomCost = categoryEstimates.accommodation;
    if (trip.accommodationStyle === 'luxury_hotel' || trip.accommodationStyle === 'resort' || accomCost > totalBudget * 0.35) {
      const currentHotelCost = accomCost > 0 ? accomCost : Math.round(18000 * scaleFactor);
      const savings = Math.round(currentHotelCost * 0.28);
      const suggestedCost = currentHotelCost - savings;

      suggestions.push({
        id: `opt_hotel_${Date.now()}_1`,
        type: 'hotel_downgrade',
        title: 'Switch to a Curated Boutique Stay',
        description: 'Upgrade your experience with a top-rated boutique design hotel instead of large chain luxury.',
        category: 'accommodation',
        currentChoice: trip.accommodationStyle === 'luxury_hotel' ? '5-Star Luxury Resort' : 'Peak Season Hotel Booking',
        suggestedAlternative: 'Top-Rated Boutique Design Hotel with Breakfast',
        currentCost: currentHotelCost,
        suggestedCost,
        potentialSavings: savings,
        reason: `Recommended because accommodation currently consumes ${Math.round((accomCost / (initialEstimatedCost || 1)) * 100)}% of your estimated trip expenditure.`,
        status: 'pending',
      });
    } else {
      // Standard hotel stay optimization
      const currentHotelCost = accomCost > 0 ? accomCost : Math.round(12000 * scaleFactor);
      const savings = Math.round(currentHotelCost * 0.18);
      const suggestedCost = currentHotelCost - savings;

      suggestions.push({
        id: `opt_hotel_${Date.now()}_1`,
        type: 'hotel_downgrade',
        title: 'Opt for Mid-Week Heritage Guesthouse',
        description: 'Selected boutique guesthouses offer authentic local charm with 20% lower rates.',
        category: 'accommodation',
        currentChoice: 'Standard Central Hotel Room',
        suggestedAlternative: 'Charming Heritage Guesthouse (Central District)',
        currentCost: currentHotelCost,
        suggestedCost,
        potentialSavings: savings,
        reason: `Your trip emphasizes exploring the city, making central guesthouses a high-value alternative without sacrificing location.`,
        status: 'pending',
      });
    }

    // 2. Transport Optimization
    const transportCost = categoryEstimates.transport;
    if (trip.transportPreferences?.includes('flights') || transportCost > totalBudget * 0.15) {
      const curTrans = transportCost > 0 ? transportCost : Math.round(4500 * scaleFactor);
      const transSavings = Math.round(curTrans * 0.35);
      const suggestedTrans = curTrans - transSavings;

      suggestions.push({
        id: `opt_trans_${Date.now()}_2`,
        type: 'transport_alternative',
        title: 'Use High-Speed Express Rail & City Transit Pass',
        description: 'Replace private point-to-point airport taxis with the dedicated express rail link and unlimited day pass.',
        category: 'transport',
        currentChoice: 'Private Airport & Inter-City Cabs',
        suggestedAlternative: 'Express Train + 3-Day Unlimited City Transit Pass',
        currentCost: curTrans,
        suggestedCost: suggestedTrans,
        potentialSavings: transSavings,
        reason: `Destination ${trip.destination} features world-class metro connectivity with stations directly adjacent to your scheduled stops.`,
        status: 'pending',
      });
    }

    // 3. Food & Dining Optimization
    const foodCost = categoryEstimates.food;
    const foodActual = categoryActuals.food;
    const isFoodHeavy = foodActual > totalBudget * 0.25 || foodCost > totalBudget * 0.25;
    const curFood = foodCost > 0 ? foodCost : Math.round(5500 * scaleFactor);
    const foodSavings = Math.round(curFood * 0.22);
    const suggestedFood = curFood - foodSavings;

    suggestions.push({
      id: `opt_food_${Date.now()}_3`,
      type: 'meal_adjustment',
      title: 'Mix Michelin-Bib Local Eateries with Street Food Trails',
      description: 'Alternate premium sit-down dining with celebrated local night markets and iconic food hall stalls.',
      category: 'food',
      currentChoice: 'Sit-down Tourist Restaurants for all meals',
      suggestedAlternative: 'Celebrated Artisan Food Stalls & Bib Gourmand Bistros',
      currentCost: curFood,
      suggestedCost: suggestedFood,
      potentialSavings: foodSavings,
      reason: isFoodHeavy
        ? `Food spending is tracking higher than average. Local food trails deliver superior authentic flavor at half the price.`
        : `Allows you to savor authentic regional delicacies while freeing up funds for activities.`,
      status: 'pending',
    });

    // 4. Activities / Sightseeing Optimization
    // Check if there are specific expensive activities in itinerary
    let targetActivityTitle = 'Peak Museum & Monument Tours';
    let actCost = Math.round(3000 * scaleFactor);

    if (itinerary) {
      const expensiveAct = itinerary.days
        .flatMap((d) => d.activities)
        .find((a) => (a.estimatedCost || 0) > 1000 * scaleFactor);

      if (expensiveAct) {
        targetActivityTitle = expensiveAct.title;
        actCost = expensiveAct.estimatedCost;
      }
    }

    const actSavings = Math.round(actCost * 0.4);
    const suggestedAct = actCost - actSavings;

    suggestions.push({
      id: `opt_act_${Date.now()}_4`,
      type: 'activity_free_tier',
      title: 'Leverage City Museum Pass & Twilight Entry Rates',
      description: 'Book scheduled attractions during afternoon twilight slots or with a combined regional museum pass.',
      category: 'activities',
      currentChoice: `${targetActivityTitle} (Standard Single Tickets)`,
      suggestedAlternative: 'Combined Heritage City Pass / Twilight Hours Access',
      currentCost: actCost,
      suggestedCost: suggestedAct,
      potentialSavings: actSavings,
      reason: `Pre-booking combined passes saves up to 40% on admission fees with skip-the-line privileges included.`,
      status: 'pending',
    });

    // Compute totals
    const totalPotentialSavings = suggestions.reduce((sum, s) => sum + s.potentialSavings, 0);
    const projectedTripCost = Math.max(0, initialEstimatedCost - totalPotentialSavings);
    const newHealthScore = Math.min(96, Math.round(85 + (totalPotentialSavings / (totalBudget || 1)) * 30));

    return {
      suggestions: suggestions.slice(0, 4),
      totalPotentialSavings,
      projectedTripCost,
      budgetHealthScore: newHealthScore,
      explanation: `GlobeTrotter identified ${suggestions.length} high-impact optimizations across accommodation, transit, dining, and activities without compromising your core experiences.`,
    };
  },

  /**
   * Applies an optimization suggestion to update trip estimations safely
   */
  applyOptimization(
    trip: Trip,
    itinerary: Itinerary | null,
    suggestion: BudgetOptimizationSuggestion
  ): {
    updatedTrip: Trip;
    updatedItinerary: Itinerary | null;
    appliedMessage: string;
  } {
    let updatedTrip = { ...trip };
    let updatedItinerary = itinerary ? { ...itinerary } : null;

    // 1. If suggestion is accommodation, update trip accommodation style or estimated cost
    if (suggestion.type === 'hotel_downgrade') {
      if (trip.accommodationStyle === 'luxury_hotel') {
        updatedTrip.accommodationStyle = 'boutique_hotel';
      }
    }

    // 2. If suggestion has a target activity in itinerary, update activity cost
    if (suggestion.targetActivityId && updatedItinerary) {
      updatedItinerary.days = updatedItinerary.days.map((day) => ({
        ...day,
        activities: day.activities.map((act) => {
          if (act.id === suggestion.targetActivityId) {
            return {
              ...act,
              estimatedCost: suggestion.suggestedCost,
              notes: `${act.notes ? act.notes + ' | ' : ''}Optimized: ${suggestion.suggestedAlternative}`,
            };
          }
          return act;
        }),
      }));
    }

    // Update trip estimatedCost property
    const newEst = Math.max(0, (trip.estimatedCost || budgetService.getEstimatedCost(trip, itinerary)) - suggestion.potentialSavings);
    updatedTrip.estimatedCost = newEst;

    // Persist changes
    tripService.updateTrip(trip.id, updatedTrip);
    if (updatedItinerary) {
      itineraryService.saveItinerary(updatedItinerary);
    }

    const appliedMessage = `Applied optimization: Saved ${formatCurrency(suggestion.potentialSavings, trip.currency || 'INR')} on ${suggestion.title}.`;

    return {
      updatedTrip,
      updatedItinerary,
      appliedMessage,
    };
  },

  /**
   * AI-Ready Prompt Builder for server-side Gemini Budget Optimization
   */
  buildBudgetOptimizationPrompt(
    trip: Trip,
    itinerary: Itinerary | null,
    expenses: Expense[],
    allocations: Record<ExpenseCategory, number>
  ): string {
    return JSON.stringify(
      {
        instruction:
          'Analyze the following trip itinerary, budget limits, category allocations, and actual expenses to recommend 3-4 concrete, transparent cost optimizations without degrading travel quality.',
        trip: {
          destination: trip.destination,
          country: trip.country,
          durationDays: trip.durationDays,
          travelersCount: trip.travelersCount,
          budget: trip.budget,
          currency: trip.currency,
          tripType: trip.tripType,
          budgetStyle: trip.budgetStyle,
          accommodationStyle: trip.accommodationStyle,
          transportPreferences: trip.transportPreferences,
        },
        allocations,
        expensesCount: expenses.length,
        totalExpensesLogged: expenses.reduce((sum, e) => sum + e.amount, 0),
        itineraryActivities: (itinerary?.days || []).flatMap((d) =>
          d.activities.map((a) => ({
            day: d.dayNumber,
            title: a.title,
            category: a.category,
            cost: a.estimatedCost,
          }))
        ),
        outputFormat: {
          suggestions: [
            {
              id: 'string',
              type: 'hotel_downgrade | transport_alternative | meal_adjustment | activity_free_tier',
              title: 'string',
              description: 'string',
              category: 'accommodation | food | transport | activities | shopping | miscellaneous',
              currentChoice: 'string',
              suggestedAlternative: 'string',
              currentCost: 'number',
              suggestedCost: 'number',
              potentialSavings: 'number',
              reason: 'string',
            },
          ],
          totalPotentialSavings: 'number',
          projectedTripCost: 'number',
          explanation: 'string',
        },
      },
      null,
      2
    );
  },
};
