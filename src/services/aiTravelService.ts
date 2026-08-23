/**
 * AI Travel Intelligence Service & Provider Architecture
 * 
 * Cleanly separates UI from AI providers (Gemini API, Local Intelligence, Hybrid).
 * Ensures 100% resilient operation with rich fallback datasets and seamless Gemini connectivity.
 */

import { Trip, TripItem, TripPlannerDraft } from '../types/trip';
import { UserPreferences } from '../types/profile';
import { TripRecommendations, Recommendation, EstimatedCategoryBreakdown, RecommendationCategory } from '../types/recommendation';
import { buildTripRecommendations, calculateCategoryCosts } from '../utils/recommendationMatcher';
import { tripService } from './tripService';
import { TRAVEL_IMAGES } from '../assets/images';

/**
 * Resolves a high-quality "sane" image URL based on keyword or category
 */
const resolveSaneImage = (category: RecommendationCategory, keyword?: string): string => {
  if (keyword) {
    const cleanKeyword = keyword.toLowerCase().trim().replace(/\s+/g, '_');
    const mapped = (TRAVEL_IMAGES.keywords as any)[cleanKeyword];
    if (mapped) {
      // Add a unique signature to avoid browser caching the exact same image if it's reused
      return `${mapped}?auto=format&fit=crop&w=800&q=80&sig=${Math.random().toString(36).substring(7)}`;
    }
    
    // If no direct map, return a high-quality Unsplash search URL as a fallback
    // We use a variety of travel-related keywords to get different images
    const genericTravelTerms = ['scenic', 'explore', 'adventure', 'culture', 'landmark', 'architecture', 'landscape'];
    const randomTerm = genericTravelTerms[Math.floor(Math.random() * genericTravelTerms.length)];
    return `https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80&sig=${Math.random().toString(36).substring(7)}&q=${randomTerm}`;
  }

  // Fallback to category default with randomness
  const sig = `sig=${Math.random().toString(36).substring(7)}`;
  switch (category) {
    case 'place': return `${TRAVEL_IMAGES.catPlace}&${sig}`;
    case 'hotel': return `${TRAVEL_IMAGES.catHotel}&${sig}`;
    case 'food': return `${TRAVEL_IMAGES.catFood}&${sig}`;
    case 'experience': return `${TRAVEL_IMAGES.catExperience}&${sig}`;
    default: return `${TRAVEL_IMAGES.catPlace}&${sig}`;
  }
};

export interface AITravelProvider {
  name: string;
  isAvailable(): boolean;
  generateRecommendations(
    trip: Trip,
    userPrefs?: UserPreferences | null,
    overrides?: Partial<TripPlannerDraft>
  ): Promise<TripRecommendations>;
}

/**
 * Builds structured JSON prompt for Gemini models
 */
export const buildTripRecommendationPrompt = (
  trip: Trip,
  userPrefs?: UserPreferences | null,
  overrides?: Partial<TripPlannerDraft>
): string => {
  const destination = trip.destination;
  const country = trip.country;
  const days = trip.durationDays || 3;
  const travelers = trip.travelersCount || 1;
  const budget = overrides?.budget || trip.budget;
  const currency = trip.currency || 'INR';
  const pace = overrides?.travelPace || trip.travelPace || userPrefs?.travelStyle || 'balanced';
  const interests = (overrides?.interests || trip.interests || userPrefs?.interests || ['culture', 'food']).join(', ');
  const personality = userPrefs?.travelPersonality || 'explorer';

  return `You are GlobeTrotter AI, an expert travel intelligence engine.
Analyze this traveler and destination blueprint:
- Destination: ${destination}, ${country}
- Duration: ${days} days (${trip.dateDisplay || 'Upcoming'})
- Travelers: ${travelers}
- Budget: ${currency} ${budget}
- Travel Pace: ${pace}
- Personality: ${personality}
- Interests: ${interests}
- Accommodation Style: ${overrides?.accommodationStyle || trip.accommodationStyle || 'boutique_hotel'}
- Transport Preference: ${(overrides?.transportPreferences || trip.transportPreferences || ['flights']).join(', ')}

Return a valid JSON object matching the TripRecommendations schema with:
1. "destinationSummary": A concise 2-sentence narrative on why ${destination} fits their personality and interests.
2. "places": List of 4 top sightseeing places with name, description, category ("place"), location, latitude, longitude, searchKeyword (e.g. "temple", "museum", "garden"), rating, priceLevel ("$"/"$$"/"$$$"), estimatedCost, duration, bestTime, tags, whyRecommended, and matchScore (85-98).
3. "hotels": List of 3 hotels/stays with name, description, category ("hotel"), location, latitude, longitude, searchKeyword (e.g. "luxury", "boutique"), rating...
4. "food": List of 3 authentic local restaurants with name, description, category ("food"), location, latitude, longitude, searchKeyword (e.g. "sushi", "pasta", "street_food")...
5. "attractions": List of 3 distinctive activities with name, description, category ("experience"), location, latitude, longitude, searchKeyword (e.g. "hiking", "adventure")...
6. "travelTips": 4 smart actionable local travel tips.
7. "aiInsight": Highlight quote, pacing description, and 2 advice points.
Respond ONLY with valid JSON without markdown formatting.`;
};

/**
 * Local Deterministic Provider (Zero-latency, rich multi-factor intelligence)
 */
class LocalIntelligenceProvider implements AITravelProvider {
  name = 'local-intelligence';

  isAvailable(): boolean {
    return true;
  }

  async generateRecommendations(
    trip: Trip,
    userPrefs?: UserPreferences | null,
    overrides?: Partial<TripPlannerDraft>
  ): Promise<TripRecommendations> {
    // Return computed recommendations
    return buildTripRecommendations(trip, userPrefs, overrides);
  }
}

const sanitizeRecommendationList = (
  items: any[],
  category: RecommendationCategory,
  fallbackList: Recommendation[],
  trip: Trip
): Recommendation[] => {
  if (!Array.isArray(items) || items.length === 0) {
    return fallbackList;
  }

  return items.map((raw, idx) => {
    const fallbackItem = fallbackList[idx] || fallbackList[0];
    const recId = raw.id ? String(raw.id) : `ai_${category}_${trip.id}_${idx}_${Math.random().toString(36).substring(2, 7)}`;
    
    return {
      id: recId,
      name: String(raw.name || fallbackItem?.name || `Recommended ${category}`),
      category,
      description: String(raw.description || fallbackItem?.description || ''),
      image: String(raw.image || resolveSaneImage(category, raw.searchKeyword || raw.name) || fallbackItem?.image),
      location: String(raw.location || fallbackItem?.location || `${trip.destination}, ${trip.country}`),
      latitude: typeof raw.latitude === 'number' ? raw.latitude : fallbackItem?.latitude,
      longitude: typeof raw.longitude === 'number' ? raw.longitude : fallbackItem?.longitude,
      searchKeyword: raw.searchKeyword || fallbackItem?.searchKeyword,
      rating: typeof raw.rating === 'number' && !isNaN(raw.rating) ? raw.rating : (fallbackItem?.rating || 4.8),
      reviewCount: typeof raw.reviewCount === 'number' && !isNaN(raw.reviewCount) ? raw.reviewCount : (fallbackItem?.reviewCount || 600),
      priceLevel: raw.priceLevel || fallbackItem?.priceLevel || '$$',
      estimatedCost: typeof raw.estimatedCost === 'number' && !isNaN(raw.estimatedCost) ? raw.estimatedCost : (fallbackItem?.estimatedCost || 1500),
      currency: raw.currency || trip.currency || 'INR',
      duration: raw.duration || fallbackItem?.duration || '2 hours',
      bestTime: raw.bestTime || fallbackItem?.bestTime || 'Morning',
      tags: Array.isArray(raw.tags) ? raw.tags.map(String) : (fallbackItem?.tags || ['Top Pick']),
      whyRecommended: raw.whyRecommended || fallbackItem?.whyRecommended || 'Matches your travel preferences.',
      matchScore: typeof raw.matchScore === 'number' && !isNaN(raw.matchScore) ? raw.matchScore : (fallbackItem?.matchScore || 92),
      hotelDetails: category === 'hotel' ? {
        pricePerNight: raw.hotelDetails?.pricePerNight || fallbackItem?.hotelDetails?.pricePerNight || 3500,
        amenities: Array.isArray(raw.hotelDetails?.amenities) ? raw.hotelDetails.amenities.map(String) : (fallbackItem?.hotelDetails?.amenities || ['Free WiFi', 'Breakfast']),
        accommodationType: raw.hotelDetails?.accommodationType || fallbackItem?.hotelDetails?.accommodationType || 'Boutique Stay',
      } : undefined,
      foodDetails: category === 'food' ? {
        cuisine: raw.foodDetails?.cuisine || fallbackItem?.foodDetails?.cuisine || 'Local Delicacies',
        signatureDish: raw.foodDetails?.signatureDish || fallbackItem?.foodDetails?.signatureDish || 'Regional Specialty',
        diningStyle: raw.foodDetails?.diningStyle || fallbackItem?.foodDetails?.diningStyle || 'Casual Dining',
      } : undefined,
      experienceDetails: category === 'experience' ? {
        activityType: raw.experienceDetails?.activityType || fallbackItem?.experienceDetails?.activityType || 'Signature Tour',
        fitnessLevel: raw.experienceDetails?.fitnessLevel || fallbackItem?.experienceDetails?.fitnessLevel || 'Easy',
        groupSize: raw.experienceDetails?.groupSize || fallbackItem?.experienceDetails?.groupSize || 'Small Group',
      } : undefined,
    };
  });
};

/**
 * Gemini AI Provider (Connects when API key is present in environment)
 */
class GeminiTravelProvider implements AITravelProvider {
  name = 'gemini';

  isAvailable(): boolean {
    // Check client or server environment key
    const clientKey = typeof import.meta !== 'undefined' && (import.meta as any)?.env ? ((import.meta as any).env.VITE_GEMINI_API_KEY as string | undefined) : undefined;
    const processKey = typeof process !== 'undefined' && process.env ? (process.env.GEMINI_API_KEY as string | undefined) : undefined;
    return Boolean(clientKey || processKey);
  }

  async generateRecommendations(
    trip: Trip,
    userPrefs?: UserPreferences | null,
    overrides?: Partial<TripPlannerDraft>
  ): Promise<TripRecommendations> {
    const apiKey =
      (typeof import.meta !== 'undefined' && (import.meta as any)?.env ? ((import.meta as any).env.VITE_GEMINI_API_KEY as string | undefined) : undefined) ||
      (typeof process !== 'undefined' && process.env ? (process.env.GEMINI_API_KEY as string | undefined) : undefined);

    if (!apiKey) {
      // Graceful fallback without showing errors
      return buildTripRecommendations(trip, userPrefs, overrides);
    }

    try {
      // Lazy load Google GenAI
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey });
      const prompt = buildTripRecommendationPrompt(trip, userPrefs, overrides);

      const candidateModels = ['gemini-3.7-flash', 'gemini-3.6-flash', 'gemini-3.1-flash-lite', 'gemini-3.7-flash-lite'];
      let responseText = '';

      for (const m of candidateModels) {
        try {
          const response = await ai.models.generateContent({
            model: m,
            contents: prompt,
            config: {
              responseMimeType: 'application/json',
              temperature: 0.7,
            },
          });
          const txt = response.text?.trim();
          if (txt) {
            responseText = txt;
            break;
          }
        } catch {
          // Try next flash model
        }
      }

      if (!responseText) {
        return buildTripRecommendations(trip, userPrefs, overrides);
      }

      // Safely parse JSON
      const parsed = JSON.parse(responseText);
      const fallback = buildTripRecommendations(trip, userPrefs, overrides);

      const places = sanitizeRecommendationList(parsed.places, 'place', fallback.places, trip);
      const hotels = sanitizeRecommendationList(parsed.hotels, 'hotel', fallback.hotels, trip);
      const food = sanitizeRecommendationList(parsed.food, 'food', fallback.food, trip);
      const attractions = sanitizeRecommendationList(parsed.attractions, 'experience', fallback.attractions, trip);

      const allRecommendations = [...places, ...hotels, ...food, ...attractions].sort(
        (a, b) => b.matchScore - a.matchScore
      );

      return {
        ...fallback,
        destinationSummary: parsed.destinationSummary || fallback.destinationSummary,
        places,
        hotels,
        food,
        attractions,
        allRecommendations,
        aiInsight: parsed.aiInsight && parsed.aiInsight.highlight ? {
          title: "GlobeTrotter's AI Insight ✨",
          highlight: String(parsed.aiInsight.highlight),
          description: String(parsed.aiInsight.description || fallback.aiInsight.description),
          adviceList: Array.isArray(parsed.aiInsight.adviceList) ? parsed.aiInsight.adviceList.map(String) : fallback.aiInsight.adviceList,
        } : fallback.aiInsight,
        travelTips: Array.isArray(parsed.travelTips) && parsed.travelTips.length > 0
          ? parsed.travelTips.map((t: any, idx: number) => ({
              id: t.id ? String(t.id) : `tip_${trip.id}_${idx}`,
              iconName: t.iconName || 'Lightbulb',
              title: String(t.title || 'Local Insight'),
              tip: String(t.tip || ''),
              category: String(t.category || 'General'),
            }))
          : fallback.travelTips,
        isAiGenerated: true,
        provider: 'gemini',
      };
    } catch {
      // Silently fall back to rich local intelligence
      return buildTripRecommendations(trip, userPrefs, overrides);
    }
  }
}

/**
 * AI Travel Service Manager
 */
class AITravelService {
  private activeProvider: AITravelProvider;
  private fallbackProvider: AITravelProvider;

  constructor() {
    this.fallbackProvider = new LocalIntelligenceProvider();
    this.activeProvider = new GeminiTravelProvider();
  }

  /**
   * Generates comprehensive personalized recommendations for a trip
   */
  async generateTripRecommendations(
    trip: Trip,
    userPrefs?: UserPreferences | null,
    overrides?: Partial<TripPlannerDraft>
  ): Promise<TripRecommendations> {
    try {
      if (this.activeProvider.isAvailable()) {
        return await this.activeProvider.generateRecommendations(trip, userPrefs, overrides);
      }
    } catch {
      // Fallback
    }

    return this.fallbackProvider.generateRecommendations(trip, userPrefs, overrides);
  }

  /**
   * Generates recommendations specific to sightseeing places
   */
  async generateDestinationRecommendations(
    trip: Trip,
    userPrefs?: UserPreferences | null
  ): Promise<Recommendation[]> {
    const full = await this.generateTripRecommendations(trip, userPrefs);
    return full.places;
  }

  /**
   * Generates recommendations specific to hotels and stays
   */
  async generateHotelRecommendations(
    trip: Trip,
    userPrefs?: UserPreferences | null
  ): Promise<Recommendation[]> {
    const full = await this.generateTripRecommendations(trip, userPrefs);
    return full.hotels;
  }

  /**
   * Generates recommendations specific to food and culinary experiences
   */
  async generateFoodRecommendations(
    trip: Trip,
    userPrefs?: UserPreferences | null
  ): Promise<Recommendation[]> {
    const full = await this.generateTripRecommendations(trip, userPrefs);
    return full.food;
  }

  /**
   * Generates recommendations specific to activities and tours
   */
  async generateAttractionRecommendations(
    trip: Trip,
    userPrefs?: UserPreferences | null
  ): Promise<Recommendation[]> {
    const full = await this.generateTripRecommendations(trip, userPrefs);
    return full.attractions;
  }

  /**
   * Estimates trip cost breakdown based on trip preferences
   */
  estimateTripCost(
    trip: Trip,
    _recommendations?: Recommendation[],
    overrides?: Partial<TripPlannerDraft>
  ): EstimatedCategoryBreakdown {
    return calculateCategoryCosts(trip, overrides);
  }

  /**
   * Bookmark a recommendation in user's trip preferences
   */
  saveRecommendation(tripId: string, recommendationId: string, userId?: string): void {
    tripService.saveRecommendation(tripId, recommendationId, userId);
  }

  /**
   * Remove a recommendation bookmark
   */
  removeRecommendation(tripId: string, recommendationId: string, userId?: string): void {
    tripService.removeSavedRecommendation(tripId, recommendationId, userId);
  }

  /**
   * Get all saved recommendation IDs for a trip
   */
  getSavedRecommendations(tripId: string, userId?: string): string[] {
    return tripService.getSavedRecommendations(tripId, userId);
  }

  /**
   * Adds an item to the trip plan
   */
  addTripItem(
    tripId: string,
    rec: Recommendation,
    userId?: string
  ): TripItem | null {
    return tripService.addTripItem(
      tripId,
      {
        tripId,
        recommendationId: rec.id,
        type: rec.category,
        name: rec.name,
        location: rec.location,
        latitude: rec.latitude,
        longitude: rec.longitude,
        image: rec.image,
        estimatedCost: rec.estimatedCost,
        currency: rec.currency,
        status: 'Unscheduled',
      },
      userId
    );
  }

  /**
   * Removes an item from the trip plan
   */
  removeTripItem(tripId: string, recOrItemId: string, userId?: string): boolean {
    return tripService.removeTripItem(tripId, recOrItemId, userId);
  }

  /**
   * Retrieves all items added to a trip
   */
  getTripItems(tripId: string, userId?: string): TripItem[] {
    return tripService.getTripItems(tripId, userId);
  }
}

export const aiTravelService = new AITravelService();
