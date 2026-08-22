/**
 * Intelligent Travel Personalization & Match Scoring Engine
 * 
 * Computes deep contextual match scores and humanized explanations
 * for places, stays, dining, and experiences based on trip parameters & onboarding preferences.
 */

import { Recommendation, EstimatedCategoryBreakdown, AIInsightData, TripRecommendations } from '../types/recommendation';
import { Trip, TripPlannerDraft } from '../types/trip';
import { UserPreferences } from '../types/profile';
import { DESTINATION_RECOMMENDATIONS_DATABASE, generateProceduralDestinationSet, RawDestinationRecommendations } from '../data/mockRecommendations';
import { convertCurrency } from './currency';
import { FEATURED_DESTINATIONS } from '../data/destinations';

/**
 * Calculates individualized match score and explains why it fits the traveler
 */
export const scoreRecommendation = (
  raw: Omit<Recommendation, 'matchScore' | 'whyRecommended' | 'currency'>,
  trip: Trip,
  userPrefs?: UserPreferences | null,
  overrides?: Partial<TripPlannerDraft>
): Recommendation => {
  const activeInterests = overrides?.interests || trip.interests || userPrefs?.interests || ['culture', 'food', 'photography'];
  const activePace = overrides?.travelPace || trip.travelPace || userPrefs?.travelStyle || 'balanced';
  const activeBudgetStyle = overrides?.budgetStyle || trip.budgetStyle || userPrefs?.budget || 'balanced';
  const activeAccom = overrides?.accommodationStyle || trip.accommodationStyle || 'boutique_hotel';
  const activePersonality = userPrefs?.travelPersonality || 'explorer';
  const tripCurrency = trip.currency || 'INR';

  let score = 72; // baseline foundation score
  const matchedFactors: string[] = [];

  // 1. Tag & Interest overlap
  const lowerTags = (raw.tags || []).map((t) => t.toLowerCase());
  activeInterests.forEach((interest) => {
    const intLower = interest.toLowerCase();
    if (
      lowerTags.some((t) => t.includes(intLower) || intLower.includes(t)) ||
      raw.description.toLowerCase().includes(intLower) ||
      raw.name.toLowerCase().includes(intLower)
    ) {
      score += 7;
      matchedFactors.push(interest);
    }
  });

  // 2. Pace alignment
  if (activePace === 'relaxed') {
    if (lowerTags.includes('relaxed') || lowerTags.includes('peaceful') || lowerTags.includes('gardens') || raw.category === 'hotel') {
      score += 6;
      matchedFactors.push('relaxed pace');
    }
  } else if (activePace === 'packed') {
    if (lowerTags.includes('adventure') || lowerTags.includes('trekking') || lowerTags.includes('full day') || lowerTags.includes('city views')) {
      score += 6;
      matchedFactors.push('active pacing');
    }
  } else {
    // balanced
    score += 5;
  }

  // 3. Category & personality bonus
  if (activePersonality === 'foodie' && raw.category === 'food') {
    score += 8;
    matchedFactors.push('foodie passion');
  } else if (activePersonality === 'photographer' && (lowerTags.includes('photography') || lowerTags.includes('views') || lowerTags.includes('sunset'))) {
    score += 8;
    matchedFactors.push('photography spots');
  } else if (activePersonality === 'culture_lover' && (raw.category === 'place' || lowerTags.includes('history') || lowerTags.includes('culture'))) {
    score += 8;
    matchedFactors.push('cultural curiosity');
  } else if (activePersonality === 'relaxer' && (raw.category === 'hotel' || lowerTags.includes('wellness') || lowerTags.includes('spa'))) {
    score += 8;
    matchedFactors.push('restorative travel');
  }

  // 4. Rating contribution
  score += Math.round((raw.rating - 4.0) * 10);

  // Clamp score between 82% and 98%
  const finalScore = Math.min(98, Math.max(82, score));

  // Convert raw estimated cost (stored in INR baseline) to trip currency
  const convertedCost = Math.round(convertCurrency(raw.estimatedCost, 'INR', tripCurrency));

  // Generate personalized "Why this matches you" narrative
  let whyRecommended = '';
  const distinctFactors = Array.from(new Set(matchedFactors)).slice(0, 3);

  if (raw.category === 'place') {
    if (distinctFactors.length >= 2) {
      whyRecommended = `Recommended because you enjoy ${distinctFactors[0]} and prefer ${distinctFactors[1]}.`;
    } else if (distinctFactors.length === 1) {
      whyRecommended = `Ideal for your interest in ${distinctFactors[0]} and fits your ${activePace} pace.`;
    } else {
      whyRecommended = `Top-rated iconic landmark carefully matched to your ${trip.tripType || 'leisure'} itinerary.`;
    }
  } else if (raw.category === 'hotel') {
    if (activeBudgetStyle === 'luxury') {
      whyRecommended = `Selected for supreme comfort, scenic location, and first-class amenities.`;
    } else if (activeBudgetStyle === 'budget_friendly') {
      whyRecommended = `High-value stay with top reviews that preserves your daily travel budget.`;
    } else {
      whyRecommended = `Fits your ${activeAccom.replace('_', ' ')} preference and keeps you comfortably on budget.`;
    }
  } else if (raw.category === 'food') {
    if (distinctFactors.includes('food') || activePersonality === 'foodie') {
      whyRecommended = `Handpicked for your love of authentic local cuisine and distinctive culinary experiences.`;
    } else {
      whyRecommended = `Celebrated local favorite offering authentic dishes with excellent reviews.`;
    }
  } else {
    // experience
    if (distinctFactors.length >= 1) {
      whyRecommended = `Tailored for your interest in ${distinctFactors[0]} and ${activePace} schedule.`;
    } else {
      whyRecommended = `Unforgettable signature experience highly recommended for ${trip.destination}.`;
    }
  }

  return {
    ...raw,
    currency: tripCurrency,
    estimatedCost: convertedCost,
    matchScore: finalScore,
    whyRecommended,
    hotelDetails: raw.hotelDetails
      ? {
          ...raw.hotelDetails,
          pricePerNight: Math.round(convertCurrency(raw.hotelDetails.pricePerNight, 'INR', tripCurrency)),
        }
      : undefined,
  };
};

/**
 * Calculates estimated category cost breakdown and budget status
 */
export const calculateCategoryCosts = (
  trip: Trip,
  overrides?: Partial<TripPlannerDraft>
): EstimatedCategoryBreakdown => {
  const travelers = Math.max(1, trip.travelersCount || 1);
  const days = Math.max(1, trip.durationDays || 3);
  const budget = overrides?.budget || trip.budget || 50000;
  const currency = trip.currency || 'INR';

  // Base daily rates in INR by destination tier
  let dailyBasePerPerson = 4500;
  const matchDest = FEATURED_DESTINATIONS.find(
    (d) => d.name.toLowerCase() === trip.destination.toLowerCase() ||
           trip.destination.toLowerCase().includes(d.name.toLowerCase())
  );
  if (matchDest) {
    dailyBasePerPerson = matchDest.estimatedDailyBudget;
  }

  // Adjust by budget style
  const style = overrides?.budgetStyle || trip.budgetStyle || 'balanced';
  const styleMultiplier = style === 'budget_friendly' ? 0.7 : style === 'luxury' ? 1.6 : 1.0;

  const totalINR = dailyBasePerPerson * styleMultiplier * days * travelers;
  const totalConverted = Math.round(convertCurrency(totalINR, 'INR', currency));

  // Category splits
  const accommodation = Math.round(totalConverted * 0.42);
  const food = Math.round(totalConverted * 0.22);
  const transport = Math.round(totalConverted * 0.16);
  const activities = Math.round(totalConverted * 0.14);
  const shoppingMisc = Math.max(0, totalConverted - accommodation - food - transport - activities);

  const remainingOrOver = budget - totalConverted;
  const isOverBudget = totalConverted > budget;
  const isCloseToBudget = !isOverBudget && totalConverted >= budget * 0.85;

  let statusMessage = "You're within budget ✓";
  if (isOverBudget) {
    statusMessage = 'Your current plan is over budget.';
  } else if (isCloseToBudget) {
    statusMessage = "You're close to your budget.";
  }

  return {
    accommodation,
    food,
    transport,
    activities,
    shoppingMisc,
    totalEstimated: totalConverted,
    budget,
    remainingOrOver,
    isOverBudget,
    isCloseToBudget,
    statusMessage,
    confidence: 'Medium',
    confidenceReason: 'Based on destination averages, seasonality, and your selected travel pace.',
  };
};

/**
 * Generates personalized AI insight narrative
 */
export const generateAIInsight = (
  trip: Trip,
  userPrefs?: UserPreferences | null,
  overrides?: Partial<TripPlannerDraft>
): AIInsightData => {
  const pace = overrides?.travelPace || trip.travelPace || 'balanced';
  const rawInterests = overrides?.interests || trip.interests || userPrefs?.interests;
  const interests = Array.isArray(rawInterests) && rawInterests.length > 0 ? rawInterests : ['culture', 'food'];
  const dest = trip.destination || 'your destination';
  const travelers = trip.travelersCount || 1;

  let highlight = `Your itinerary is well-balanced for ${travelers > 1 ? `${travelers} travelers` : 'a solo adventure'}.`;
  let description = `We've balanced morning iconic visits with afternoon downtime to prevent travel fatigue.`;
  const adviceList: string[] = [];

  if (pace === 'relaxed') {
    highlight = `Your relaxed travel pace allows immersive cultural connection in ${dest}.`;
    description = `We've limited scheduled activities to 2 per day so you have ample time to wander neighborhood alleys, enjoy leisurely meals, and soak up local atmosphere.`;
    adviceList.push(`Schedule main sights during mid-morning when lighting is softest.`);
    adviceList.push(`Reserve evenings for spontaneous dining discoveries without strict bookings.`);
  } else if (pace === 'packed') {
    highlight = `High-energy expedition maximizing key highlights and active experiences.`;
    description = `Your schedule is dynamic and adventure-ready. Grouping adjacent attractions will save up to 45 minutes of transit daily.`;
    adviceList.push(`Pre-purchase skip-the-line passes for morning slots.`);
    adviceList.push(`Start early at 8:00 AM to beat midday tour crowds.`);
  } else {
    highlight = `Optimally balanced between iconic landmarks and authentic local experiences.`;
    description = `Your ${pace} pacing pairs well with your interest in ${interests.slice(0, 2).join(' & ')}. You may want to leave one afternoon free for spontaneous exploration.`;
    adviceList.push(`Keep 2–3 hours uncommitted on your third day for unplanned local discoveries.`);
    adviceList.push(`Pair high-energy mornings with relaxed sunset coffee or scenic strolls.`);
  }

  return {
    title: "GlobeTrotter's AI Insight ✨",
    highlight,
    description,
    adviceList,
  };
};

/**
 * Builds the complete TripRecommendations package
 */
export const buildTripRecommendations = (
  trip: Trip,
  userPrefs?: UserPreferences | null,
  overrides?: Partial<TripPlannerDraft>
): TripRecommendations => {
  const destKey = trip.destination.toLowerCase().trim();
  
  // Find matched curated database or generate procedural fallback
  let rawData: RawDestinationRecommendations = DESTINATION_RECOMMENDATIONS_DATABASE[destKey];
  if (!rawData) {
    // Check partial name match in database
    const matchedKey = Object.keys(DESTINATION_RECOMMENDATIONS_DATABASE).find((k) =>
      destKey.includes(k) || k.includes(destKey)
    );
    if (matchedKey) {
      rawData = DESTINATION_RECOMMENDATIONS_DATABASE[matchedKey];
    } else {
      rawData = generateProceduralDestinationSet(trip.destination, trip.country);
    }
  }

  // Score each category
  const places = rawData.places.map((p) => scoreRecommendation(p, trip, userPrefs, overrides));
  const hotels = rawData.hotels.map((h) => scoreRecommendation(h, trip, userPrefs, overrides));
  const food = rawData.food.map((f) => scoreRecommendation(f, trip, userPrefs, overrides));
  const attractions = rawData.experiences.map((e) => scoreRecommendation(e, trip, userPrefs, overrides));

  // Sort each list descending by match score
  places.sort((a, b) => b.matchScore - a.matchScore);
  hotels.sort((a, b) => b.matchScore - a.matchScore);
  food.sort((a, b) => b.matchScore - a.matchScore);
  attractions.sort((a, b) => b.matchScore - a.matchScore);

  const allRecommendations = [...places, ...hotels, ...food, ...attractions].sort(
    (a, b) => b.matchScore - a.matchScore
  );

  const costEstimate = calculateCategoryCosts(trip, overrides);
  const aiInsight = generateAIInsight(trip, userPrefs, overrides);

  // Pick destination hero image
  let heroImage = trip.coverImage;
  const matchFeatured = FEATURED_DESTINATIONS.find(
    (d) => d.name.toLowerCase() === destKey || destKey.includes(d.name.toLowerCase())
  );
  if (matchFeatured?.image) {
    heroImage = matchFeatured.image;
  }

  const destinationSummary = rawData.summaryTemplate || `${trip.destination} is a spectacular destination aligned with your travel preferences.`;

  return {
    tripId: trip.id,
    destination: trip.destination,
    country: trip.country,
    destinationSummary,
    destinationHeroImage: heroImage,
    places,
    hotels,
    food,
    attractions,
    allRecommendations,
    costEstimate,
    aiInsight,
    travelTips: rawData.tips || [],
    generatedAt: new Date().toISOString(),
    isAiGenerated: true,
    provider: 'hybrid-engine',
  };
};
