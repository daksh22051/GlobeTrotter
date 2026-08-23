/**
 * What-If Simulation Engine
 * 
 * Functional, non-destructive simulation state engine.
 * Computes alternative scenarios, hotel/transport replacements,
 * budget shifts, duration adjustments, and health score impacts.
 */

import { Trip } from '../types/trip';
import { Itinerary, ItineraryDay, ItineraryActivity } from '../types/itinerary';
import {
  WhatIfScenario,
  WhatIfSimulationResult,
  WhatIfAlternative,
  TransportPreference,
  AccommodationLevel,
  TravelPace,
  ScenarioPreset,
} from '../types/intelligence';
import { itineraryService } from './itineraryService';
import { tripHealthService } from './tripHealthService';
import { budgetService } from './budgetService';
import { tripService } from './tripService';
import { mockRecommendations } from '../data/mockRecommendations';

const UNDO_SNAPSHOT_PREFIX = 'globetrotter_whatif_undo_';

interface FlightAccess {
  available: boolean;
  airportName: string;
  groundTransferMinutes: number;
  groundTransferCostPerTraveler: number;
}

const getFlightAccess = (destination: string): FlightAccess => {
  const normalized = destination.toLowerCase().trim();

  if (normalized.includes('manali') || normalized.includes('kullu')) {
    return {
      available: true,
      airportName: 'Kullu-Manali Airport (Bhuntar)',
      groundTransferMinutes: 120,
      groundTransferCostPerTraveler: 2500,
    };
  }

  if (normalized.includes('leh')) {
    return {
      available: true,
      airportName: 'Kushok Bakula Rimpochee Airport',
      groundTransferMinutes: 30,
      groundTransferCostPerTraveler: 800,
    };
  }

  if (normalized.includes('shimla')) {
    return {
      available: true,
      airportName: 'Shimla Airport (Jubbarhatti)',
      groundTransferMinutes: 60,
      groundTransferCostPerTraveler: 1200,
    };
  }

  if (normalized.includes('spiti') || normalized.includes('tawang')) {
    return {
      available: false,
      airportName: 'no nearby operational airport',
      groundTransferMinutes: 360,
      groundTransferCostPerTraveler: 4500,
    };
  }

  return {
    available: true,
    airportName: 'nearest commercial airport',
    groundTransferMinutes: 45,
    groundTransferCostPerTraveler: 1000,
  };
};

export const whatIfService = {
  /**
   * Generates default scenario based on trip's current parameters
   */
  getDefaultScenario(trip: Trip): WhatIfScenario {
    let transport: TransportPreference = 'flight';
    if (trip.transportPreferences?.includes('road_trip')) transport = 'rental_car';
    else if (trip.transportPreferences?.includes('train')) transport = 'train';

    let accommodation: AccommodationLevel = 'premium';
    if (trip.budget < 35000) accommodation = 'budget';
    else if (trip.budget > 120000) accommodation = 'luxury';
    else if (trip.budget < 60000) accommodation = 'comfort';

    return {
      budget: trip.budget || 60000,
      durationDays: trip.durationDays || 5,
      travelersCount: trip.travelersCount || 2,
      transportPreference: transport,
      accommodationLevel: accommodation,
      travelPace: (trip.travelPace as TravelPace) || 'balanced',
      presetName: 'Custom',
    };
  },

  /**
   * Generates scenario preset parameters
   */
  getPresetScenario(trip: Trip, preset: ScenarioPreset): WhatIfScenario {
    const current = this.getDefaultScenario(trip);

    switch (preset) {
      case 'Save Money':
        return {
          ...current,
          budget: Math.max(20000, Math.round((trip.budget || 60000) * 0.75 / 1000) * 1000),
          accommodationLevel: 'comfort',
          transportPreference: 'train',
          travelPace: 'balanced',
          presetName: 'Save Money',
        };
      case 'More Relaxed':
        return {
          ...current,
          travelPace: 'relaxed',
          accommodationLevel: 'premium',
          durationDays: Math.min(14, (trip.durationDays || 5) + 1),
          presetName: 'More Relaxed',
        };
      case 'More Experiences':
        return {
          ...current,
          travelPace: 'fast-paced',
          budget: Math.round((trip.budget || 60000) * 1.15 / 1000) * 1000,
          accommodationLevel: 'premium',
          presetName: 'More Experiences',
        };
      case 'Faster Trip':
        return {
          ...current,
          durationDays: Math.max(2, (trip.durationDays || 5) - 2),
          travelPace: 'fast-paced',
          budget: Math.round((trip.budget || 60000) * 0.85 / 1000) * 1000,
          presetName: 'Faster Trip',
        };
      case 'Family Friendly':
        return {
          ...current,
          travelPace: 'relaxed',
          accommodationLevel: 'comfort',
          transportPreference: 'rental_car',
          presetName: 'Family Friendly',
        };
      default:
        return current;
    }
  },

  /**
   * Simulates a trip scenario WITHOUT mutating the real trip
   */
  simulateTrip(trip: Trip, scenario: WhatIfScenario): WhatIfSimulationResult {
    const originalItinerary = itineraryService.getItinerary(trip.id, trip);
    const originalHealth = tripHealthService.calculateHealth(trip, originalItinerary);
    const currency = trip.currency || 'INR';

    // 1. Simulate Trip Object
    const simulatedTrip: Trip = {
      ...trip,
      budget: scenario.budget,
      durationDays: scenario.durationDays,
      travelersCount: scenario.travelersCount,
      travelPace:
        scenario.travelPace === 'fast-paced'
          ? 'packed'
          : (scenario.travelPace as 'relaxed' | 'balanced' | 'packed'),
    };

    // 2. Simulate Itinerary & Days
    const origDays = originalItinerary.days || [];
    let simDays: ItineraryDay[] = JSON.parse(JSON.stringify(origDays));
    const removedDays: number[] = [];

    // Adjust Days Count
    if (scenario.durationDays < simDays.length) {
      const removed = simDays.slice(scenario.durationDays);
      removed.forEach((d) => removedDays.push(d.dayNumber));
      simDays = simDays.slice(0, scenario.durationDays);

      // Condense orphan activities into earlier days if possible
      const extraActivities: ItineraryActivity[] = removed.flatMap((d) => d.activities);
      if (extraActivities.length > 0 && simDays.length > 0) {
        extraActivities.slice(0, 3).forEach((act, idx) => {
          const targetDay = simDays[idx % simDays.length];
          targetDay.activities.push({
            ...act,
            dayNumber: targetDay.dayNumber,
            startTime: '16:00',
          });
        });
      }
    } else if (scenario.durationDays > simDays.length) {
      const diff = scenario.durationDays - simDays.length;
      const lastDay = simDays[simDays.length - 1];
      let baseDate = new Date(trip.startDate || new Date());

      for (let i = 0; i < diff; i++) {
        const newDayNum = simDays.length + 1;
        const nextDate = new Date(baseDate);
        nextDate.setDate(baseDate.getDate() + newDayNum - 1);

        simDays.push({
          id: `sim_day_${trip.id}_${newDayNum}`,
          dayNumber: newDayNum,
          date: nextDate.toISOString().split('T')[0],
          dateDisplay: nextDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
          title: `Extended Exploration & Leisure`,
          theme: 'Relaxation & Local Flavors',
          activities: [],
        });
      }
    }

    // Adjust Pace on Activities
    if (scenario.travelPace === 'relaxed') {
      simDays.forEach((d) => {
        if (d.activities.length > 3) {
          d.activities = d.activities.slice(0, 3); // Lighten load
        }
        // Space timings out
        d.activities.forEach((a, idx) => {
          a.startTime = idx === 0 ? '10:30' : idx === 1 ? '14:30' : '18:30';
          a.durationMinutes = Math.min(180, (a.durationMinutes || 90) + 30);
        });
      });
    } else if (scenario.travelPace === 'fast-paced') {
      simDays.forEach((d) => {
        d.activities.forEach((a, idx) => {
          a.startTime = idx === 0 ? '08:30' : idx === 1 ? '11:00' : idx === 2 ? '14:00' : '17:30';
        });
      });
    }

    const simulatedItinerary: Itinerary = {
      ...originalItinerary,
      days: simDays,
      updatedAt: new Date().toISOString(),
    };

    // 3. Compute Budget Shifts & Potential Savings
    const originalBudget = trip.budget || 60000;
    const diffBudget = originalBudget - scenario.budget;

    // Rate calculations per night/transport
    const nights = Math.max(1, scenario.durationDays - 1);
    let origNightlyRate = 6500;
    let simNightlyRate = 6500;

    if (scenario.accommodationLevel === 'luxury') simNightlyRate = 12500;
    else if (scenario.accommodationLevel === 'premium') simNightlyRate = 7500;
    else if (scenario.accommodationLevel === 'comfort') simNightlyRate = 4200;
    else simNightlyRate = 2200;

    const hotelSavings = (origNightlyRate - simNightlyRate) * nights;

    // Transport differences
    let transportCostDelta = 0;
    let transportTimeDeltaMinutes = 0;
    let origTransportMode = 'Flight';
    let simTransportMode = 'Flight';
    const flightAccess = getFlightAccess(trip.destination);

    if (scenario.transportPreference === 'flight') {
      if (flightAccess.available) {
        simTransportMode = `Flight via ${flightAccess.airportName}`;
        transportCostDelta = flightAccess.groundTransferCostPerTraveler * scenario.travelersCount;
        transportTimeDeltaMinutes = flightAccess.groundTransferMinutes;
      } else {
        simTransportMode = 'Ground transfer (no nearby operational airport)';
        transportCostDelta = 4500 * scenario.travelersCount;
        transportTimeDeltaMinutes = 360;
      }
    }

    if (scenario.transportPreference === 'train') {
      simTransportMode = 'High-Speed Rail / Train';
      transportCostDelta = -4500 * scenario.travelersCount;
      transportTimeDeltaMinutes = 180; // +3 hours
    } else if (scenario.transportPreference === 'rental_car') {
      simTransportMode = 'Rental Car / Road Trip';
      transportCostDelta = -2000;
      transportTimeDeltaMinutes = 120;
    } else if (scenario.transportPreference === 'public_transit') {
      simTransportMode = 'Metro & Public Express';
      transportCostDelta = -6000 * scenario.travelersCount;
      transportTimeDeltaMinutes = 240;
    } else if (scenario.transportPreference === 'budget_saver') {
      simTransportMode = 'Budget Bus / Saver Transit';
      transportCostDelta = -8000 * scenario.travelersCount;
      transportTimeDeltaMinutes = 300;
    }

    const activitySavings = Math.round(Math.max(0, diffBudget * 0.25));
    const foodAdjustment = Math.round(Math.max(0, diffBudget * 0.15));
    const totalPotentialSavings = Math.max(0, hotelSavings + Math.abs(transportCostDelta) + activitySavings);
    const baselineEstimatedCost = trip.estimatedCost ?? Math.round(originalBudget * 0.88);
    const simulatedEstimatedCost = Math.max(
      0,
      Math.round(baselineEstimatedCost - hotelSavings + transportCostDelta - activitySavings - foodAdjustment)
    );

    // 4. Concrete Alternatives Generation
    const alternatives: WhatIfAlternative[] = [];

    // Accommodation Alternative
    if (scenario.accommodationLevel !== 'premium') {
      const origHotelName = `${trip.destination} Grand Boutique`;
      const simHotelName =
        scenario.accommodationLevel === 'comfort'
          ? `${trip.destination} Central Heritage Inn`
          : scenario.accommodationLevel === 'budget'
          ? `${trip.destination} Traveler Pod & Suites`
          : `${trip.destination} Luxury Sanctuary Resort`;

      alternatives.push({
        id: 'alt_hotel',
        category: 'hotel',
        title: 'Accommodation Tier Shift',
        currentChoice: {
          name: origHotelName,
          cost: origNightlyRate * nights,
          detail: `${currency}${origNightlyRate.toLocaleString()}/night (${nights} nights)`,
        },
        suggestedChoice: {
          name: simHotelName,
          cost: simNightlyRate * nights,
          detail: `${currency}${simNightlyRate.toLocaleString()}/night (${nights} nights)`,
        },
        savings: (origNightlyRate - simNightlyRate) * nights,
        explanation: `Switching to ${scenario.accommodationLevel} tier saves on accommodation with verified clean ratings.`,
      });
    }

    // Transport Alternative
    if (scenario.transportPreference !== 'flight') {
      alternatives.push({
        id: 'alt_transport',
        category: 'transport',
        title: 'Transit Mode Trade-Off',
        currentChoice: {
          name: 'Direct Air Travel',
          cost: 12000 * scenario.travelersCount,
          detail: `~2h travel time · ${scenario.travelersCount} traveler(s)`,
        },
        suggestedChoice: {
          name: simTransportMode,
          cost: (12000 * scenario.travelersCount) + transportCostDelta,
          detail: `~${Math.round((120 + transportTimeDeltaMinutes) / 60)}h travel time · scenic route`,
        },
        savings: Math.abs(transportCostDelta),
        timeImpactMinutes: transportTimeDeltaMinutes,
        explanation: `Choosing ${simTransportMode} yields substantial cost reduction with scenic overland transit.`,
      });
    }

    // 5. Calculate Simulated Health Score
    const simulatedHealth = tripHealthService.calculateHealth(simulatedTrip, simulatedItinerary);
    const healthImpact = simulatedHealth.score - originalHealth.score;

    // 6. AI Narrative Explanation
    let aiExplanation = '';
    if (scenario.presetName === 'Save Money' || diffBudget > 10000) {
      aiExplanation = `Reducing budget by ${currency}${Math.abs(diffBudget).toLocaleString()} shifts accommodation to ${scenario.accommodationLevel} tier and transit to ${simTransportMode}. Your trip health score remains strong at ${simulatedHealth.score}/100.`;
    } else if (scenario.presetName === 'More Relaxed' || scenario.travelPace === 'relaxed') {
      aiExplanation = `Spreading out activities across ${scenario.durationDays} days provides ~3.5 hours of daily breathing room, boosting your health score to ${simulatedHealth.score}/100 (+${Math.max(1, healthImpact)} improvement).`;
    } else if (scenario.durationDays !== (trip.durationDays || 5)) {
      aiExplanation = `Adjusting trip duration to ${scenario.durationDays} days rescales daily pacing with ${simDays.reduce((acc, d) => acc + d.activities.length, 0)} total scheduled activities.`;
    } else {
      aiExplanation = `Simulation scenario applied: ${scenario.accommodationLevel} accommodation, ${simTransportMode}, and ${scenario.travelPace} pace with estimated total cost of ${currency}${simulatedEstimatedCost.toLocaleString()}.`;
    }

    // 7. Structured Changes Summary
    const changesSummary: string[] = [];
    if (diffBudget !== 0) {
      changesSummary.push(`Budget target changed from ${currency}${originalBudget.toLocaleString()} to ${currency}${scenario.budget.toLocaleString()}`);
    }
    if (scenario.durationDays !== (trip.durationDays || 5)) {
      changesSummary.push(`Duration updated from ${trip.durationDays || 5} days to ${scenario.durationDays} days`);
    }
    if (scenario.transportPreference !== 'flight') {
      changesSummary.push(`Transport shifted to ${simTransportMode}`);
    }
    if (scenario.accommodationLevel !== 'premium') {
      changesSummary.push(`Accommodation adjusted to ${scenario.accommodationLevel} tier`);
    }
    if (scenario.travelPace !== (trip.travelPace || 'balanced')) {
      changesSummary.push(`Trip pace set to ${scenario.travelPace}`);
    }

    return {
      originalTrip: trip,
      scenario,
      simulatedTrip,
      simulatedItinerary,
      simulatedExpenses: [],
      originalHealth,
      simulatedHealth,
      healthImpact,
      budgetImpact: {
        originalBudget,
        simulatedBudget: scenario.budget,
        estimatedCost: simulatedEstimatedCost,
        potentialSavings: totalPotentialSavings,
        breakdown: {
          hotelSavings,
          transportSavings: Math.abs(transportCostDelta),
          activitySavings,
          foodAdjustment,
        },
      },
      durationImpact: {
        originalDays: trip.durationDays || 5,
        simulatedDays: scenario.durationDays,
        removedDays,
        condensedSummary:
          removedDays.length > 0
            ? `Condensed Days ${removedDays.join(', ')} into earlier days.`
            : `Balanced schedule across all ${scenario.durationDays} days.`,
      },
      transportImpact: {
        originalMode: origTransportMode,
        simulatedMode: simTransportMode,
        costDelta: transportCostDelta,
        timeDeltaMinutes: transportTimeDeltaMinutes,
        description: `Travel time difference: +${Math.round(transportTimeDeltaMinutes / 60)}h transit buffer.`,
      },
      paceImpact: {
        originalPace: trip.travelPace || 'balanced',
        simulatedPace: scenario.travelPace,
        freeTimeHoursPerDay: scenario.travelPace === 'relaxed' ? 4 : scenario.travelPace === 'balanced' ? 2.5 : 1.2,
        averageActivitiesPerDay: simDays.length > 0 ? Math.round((simDays.reduce((a, b) => a + b.activities.length, 0) / simDays.length) * 10) / 10 : 3,
      },
      alternatives,
      aiExplanation,
      changesSummary,
    };
  },

  /**
   * Applies the simulated scenario to the REAL trip and saves undo snapshot
   */
  applyScenario(simulation: WhatIfSimulationResult): boolean {
    const { originalTrip, simulatedTrip, simulatedItinerary } = simulation;

    try {
      // 1. Save Undo Snapshot
      const undoPayload = {
        trip: originalTrip,
        itinerary: itineraryService.getItinerary(originalTrip.id, originalTrip),
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem(`${UNDO_SNAPSHOT_PREFIX}${originalTrip.id}`, JSON.stringify(undoPayload));

      // 2. Persist updated Trip
      tripService.updateTrip(originalTrip.id, {
        budget: simulatedTrip.budget,
        durationDays: simulatedTrip.durationDays,
        travelersCount: simulatedTrip.travelersCount,
        travelPace: simulatedTrip.travelPace,
      });

      // 3. Persist updated Itinerary
      itineraryService.saveItinerary(simulatedItinerary, originalTrip.userId);

      return true;
    } catch {
      return false;
    }
  },

  /**
   * Restores previous state from undo snapshot
   */
  undoScenario(tripId: string): boolean {
    try {
      const raw = localStorage.getItem(`${UNDO_SNAPSHOT_PREFIX}${tripId}`);
      if (!raw) return false;

      const snapshot = JSON.parse(raw);
      if (snapshot.trip) {
        tripService.updateTrip(tripId, {
          budget: snapshot.trip.budget,
          durationDays: snapshot.trip.durationDays,
          travelersCount: snapshot.trip.travelersCount,
          travelPace: snapshot.trip.travelPace,
        });
      }
      if (snapshot.itinerary) {
        itineraryService.saveItinerary(snapshot.itinerary, snapshot.trip?.userId);
      }

      localStorage.removeItem(`${UNDO_SNAPSHOT_PREFIX}${tripId}`);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Checks if an undo snapshot is available
   */
  hasUndoSnapshot(tripId: string): boolean {
    return !!localStorage.getItem(`${UNDO_SNAPSHOT_PREFIX}${tripId}`);
  },
};
