/**
 * Travel Guide Data Builder
 * Combines Trip, Itinerary, Recommendations, and Budget into a unified presentation model.
 */

import { TravelGuideData, GuideDayPlan, GuideHighlightItem, GuideQuickFact } from '../types/travelGuide';
import { tripService } from '../services/tripService';
import { itineraryService } from '../services/itineraryService';
import { buildTripRecommendations } from './recommendationMatcher';
import { budgetService } from '../services/budgetService';
import { ItineraryActivity } from '../types/itinerary';

export const guideDataBuilder = {
  /**
   * Builds the comprehensive travel guide view model for a trip
   */
  buildTravelGuideData(tripId: string): TravelGuideData | null {
    const trip = tripService.getTripById(tripId);
    if (!trip) return null;

    const itinerary = itineraryService.getItinerary(tripId);
    const recommendations = buildTripRecommendations(trip);
    const expenses = budgetService.getExpenses(tripId);
    const allocations = budgetService.getBudgetAllocations(tripId, trip);
    const budgetSnapshot = budgetService.getBudgetSnapshot(trip, itinerary, expenses, allocations);
    const categorySummaries = budgetService.getCategorySummaries(trip, itinerary, expenses, allocations);

    // 1. Quick Facts
    const quickFacts: GuideQuickFact[] = [
      { label: 'Destination', value: `${trip.destination}, ${trip.country}` },
      { label: 'Dates', value: trip.dateDisplay || `${trip.startDate} – ${trip.endDate}` },
      {
        label: 'Duration',
        value: `${trip.durationDays} ${trip.durationDays === 1 ? 'Day' : 'Days'} (${Math.max(
          0,
          trip.durationDays - 1
        )} Nights)`,
      },
      {
        label: 'Travellers',
        value: `${trip.travelersCount} ${trip.travelersCount === 1 ? 'Explorer' : 'Explorers'}`,
      },
      {
        label: 'Pace & Style',
        value:
          trip.travelPace === 'relaxed'
            ? 'Relaxed & Immersive'
            : trip.travelPace === 'packed'
            ? 'Fast-paced & High Energy'
            : 'Balanced Pace',
      },
      {
        label: 'Total Budget',
        value: `${trip.currency || 'INR'} ${(trip.budget || 0).toLocaleString()}`,
      },
    ];

    // 2. Day-by-Day Editorial Guide
    const days: GuideDayPlan[] = [];
    let totalActivitiesCount = 0;

    if (itinerary && itinerary.days && itinerary.days.length > 0) {
      itinerary.days.forEach((day) => {
        const activities = day.activities || [];
        totalActivitiesCount += activities.length;

        // Categorize activities by time of day
        const morning: ItineraryActivity[] = [];
        const afternoon: ItineraryActivity[] = [];
        const evening: ItineraryActivity[] = [];

        activities.forEach((act) => {
          const hour = parseInt((act.startTime || '09:00').split(':')[0], 10);
          if (hour < 12) {
            morning.push(act);
          } else if (hour < 17) {
            afternoon.push(act);
          } else {
            evening.push(act);
          }
        });

        const dayCost = activities.reduce((sum, a) => sum + (a.estimatedCost || 0), 0);

        days.push({
          dayNumber: day.dayNumber,
          dateDisplay: day.dateDisplay || `Day ${day.dayNumber}`,
          date: day.date,
          title: day.title || `Day ${day.dayNumber} in ${trip.destination}`,
          theme: day.theme || (day.dayNumber === 1 ? 'Arrival & Discovery' : 'Local Highlights'),
          estimatedCost: dayCost,
          morningActivities: morning,
          afternoonActivities: afternoon,
          eveningActivities: evening,
          allActivities: activities,
        });
      });
    }

    // 3. Highlights: Derived from recommendations & scheduled activities
    const highlights: GuideHighlightItem[] = [];

    if (recommendations) {
      const topPlaces = (recommendations.places || []).slice(0, 3);
      topPlaces.forEach((rec) => {
        highlights.push({
          id: rec.id,
          name: rec.name,
          category: 'place',
          location: rec.location,
          description: rec.description,
          image: rec.image,
          rating: rec.rating,
          cost: rec.estimatedCost,
          whySpecial: rec.whyRecommended,
        });
      });

      const topFood = (recommendations.food || []).slice(0, 2);
      topFood.forEach((rec) => {
        highlights.push({
          id: rec.id,
          name: rec.name,
          category: 'food',
          location: rec.location,
          description: rec.description,
          image: rec.image,
          rating: rec.rating,
          cost: rec.estimatedCost,
          whySpecial: rec.whyRecommended,
        });
      });
    }

    // If no recommendations exist yet, derive from scheduled activities
    if (highlights.length === 0 && itinerary) {
      const allActs = (itinerary.days || []).flatMap((d) => d.activities || []);
      allActs.slice(0, 5).forEach((act) => {
        highlights.push({
          id: act.id,
          name: act.title,
          category: act.category || 'place',
          location: act.location,
          description: act.notes || `${act.title} scheduled in ${trip.destination}`,
          image: act.image,
          cost: act.estimatedCost,
          whySpecial: `Featured in Day ${act.dayNumber || 1} plan`,
        });
      });
    }

    // 4. Places, Food, Hotels
    const places = recommendations?.places || [];
    const food = recommendations?.food || [];
    const hotels = recommendations?.hotels || [];

    // 5. Travel Notes & Insights
    const travelNotes: string[] = [];
    if (trip.notes) {
      travelNotes.push(trip.notes);
    }
    if (recommendations?.aiInsight?.description) {
      travelNotes.push(recommendations.aiInsight.description);
    }
    if (recommendations?.travelTips && recommendations.travelTips.length > 0) {
      recommendations.travelTips.forEach((tip) => {
        travelNotes.push(`${tip.title}: ${tip.tip}`);
      });
    }
    if (travelNotes.length === 0) {
      travelNotes.push(
        `Enjoy an unforgettable journey across ${trip.destination}! Stay mindful of local customs, transport schedules, and carry local currency for neighborhood markets.`
      );
    }

    return {
      trip,
      itinerary,
      quickFacts,
      highlights,
      days,
      places,
      food,
      hotels,
      budgetSnapshot,
      categorySummaries,
      travelNotes,
      totalActivitiesCount,
      generatedAt: new Date().toISOString(),
    };
  },
};
