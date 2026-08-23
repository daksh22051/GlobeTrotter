import { GoogleGenAI } from '@google/genai';
import { ItineraryDay, ItineraryActivity } from '../../src/types/itinerary.ts';
import { getDb } from '../db/index.ts';
import { activities as catalogActivities, cities as catalogCities } from '../db/schema.ts';
import { eq } from 'drizzle-orm';

/**
 * AI Itinerary Generation Service (Backend)
 * Uses Gemini to generate highly personalized, destination-specific itineraries.
 */

export class AIGenerationService {
  private ai: GoogleGenAI | null = null;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      this.ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    }
  }

  /**
   * Generates a full itinerary for a trip with model fallback and retries
   */
  async generateItinerary(trip: any): Promise<{ days: any[] }> {
    const verifiedActivities = await this.getVerifiedActivities(trip.destination);
    if (!this.ai) {
      return this.normalizeItinerary(this.generateFallbackItinerary(trip, verifiedActivities), trip, verifiedActivities);
    }

    // Use high-throughput, low-latency Flash models (avoiding Pro models which have 0 quota on free tier)
    const models = ['gemini-3.7-flash', 'gemini-3.6-flash', 'gemini-3.1-flash-lite', 'gemini-3.7-flash-lite'];
    let lastError: any = null;

    for (const modelName of models) {
      try {
        const result = await this.executeGeneration(trip, modelName);
        if (result && Array.isArray(result.days) && result.days.length > 0) {
          return this.normalizeItinerary(result, trip, verifiedActivities);
        }
      } catch (error: any) {
        lastError = error;
        console.warn(`AI Generation failed with model ${modelName}, trying next...`, error?.message || error);
        // Short pause between model retries on 503/429
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    console.warn('AI models temporarily unavailable or rate-limited; generating rich destination fallback itinerary:', lastError?.message || lastError);
    return this.normalizeItinerary(this.generateFallbackItinerary(trip, verifiedActivities), trip, verifiedActivities);
  }

  /**
   * Normalizes itinerary output to guarantee every day from 1 to durationDays is populated evenly.
   */
  private normalizeItinerary(rawResult: any, trip: any, verifiedActivities: any[] = []): { days: any[] } {
    const totalDays = trip.durationDays || 3;
    const dest = (trip.destination || trip.name || 'Manali').trim();
    const fallbackItin = this.generateFallbackItinerary(trip, verifiedActivities);
    const rawActivities = (rawResult?.days || []).flatMap((day: any) =>
      Array.isArray(day.activities) ? day.activities : []
    );
    const fallbackActivities = (fallbackItin.days || []).flatMap((day: any) =>
      Array.isArray(day.activities) ? day.activities : []
    );
    const coveragePool = this.dedupeActivities([...fallbackActivities, ...rawActivities]);
    let coverageCursor = 0;

    const days: any[] = [];
    for (let i = 0; i < totalDays; i++) {
      const dayNum = i + 1;
      const existingDay = rawResult?.days?.find((d: any) => Number(d.dayNumber) === dayNum || d.dayNumber === dayNum);
      const fallbackDay = fallbackItin.days.length > 0
        ? fallbackItin.days[i % fallbackItin.days.length]
        : undefined;

      if (existingDay && Array.isArray(existingDay.activities) && existingDay.activities.length > 0) {
        const activities = this.dedupeActivities(existingDay.activities).map((a: any) => ({
          title: a.title || 'Activity',
          category: a.category || 'place',
          startTime: a.startTime || '10:00',
          durationMinutes: Number(a.durationMinutes) || 120,
          cost: Number(a.cost) || 500,
          currency: a.currency || trip.currency || 'INR',
          location: a.location || dest,
          notes: a.notes || '',
          latitude: typeof a.latitude === 'number' && !isNaN(a.latitude) ? a.latitude : undefined,
          longitude: typeof a.longitude === 'number' && !isNaN(a.longitude) ? a.longitude : undefined,
        }));

        days.push({
          dayNumber: dayNum,
          title: existingDay.title || fallbackDay?.title || `Day ${dayNum}`,
          theme: existingDay.theme || fallbackDay?.theme,
          activities: this.ensureDayCoverage(activities, fallbackDay, trip),
        });
      } else {
        let fallbackActivitiesForDay = fallbackDay?.activities || [];
        if (fallbackActivitiesForDay.length === 0 && coveragePool.length > 0) {
          const itemsForDay = Math.min(3, coveragePool.length);
          fallbackActivitiesForDay = Array.from({ length: itemsForDay }, () => {
            const activity = coveragePool[coverageCursor % coveragePool.length];
            coverageCursor += 1;
            return {
              ...activity,
              title: coveragePool.length > totalDays && coverageCursor > coveragePool.length
                ? `${activity.title} - Local Discovery`
                : activity.title,
            };
          });
        }

        days.push({
          dayNumber: dayNum,
          title: fallbackDay?.title || `Day ${dayNum}`,
          theme: fallbackDay?.theme,
          activities: this.ensureDayCoverage(fallbackActivitiesForDay.map((a: any) => ({
            ...a,
            currency: trip.currency || 'INR',
          })), fallbackDay || { activities: fallbackActivitiesForDay }, trip)
        });
      }
    }
    return { days };
  }

  private dedupeActivities(activities: any[]): any[] {
    const seen = new Set<string>();
    return activities.filter((activity) => {
      const key = `${String(activity.title || '').trim().toLowerCase()}|${String(activity.location || '').trim().toLowerCase()}`;
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  private ensureDayCoverage(activities: any[], fallbackDay: any, trip: any): any[] {
    const timeToMinutes = (time: string) => {
      const [hours, minutes] = String(time || '00:00').split(':').map(Number);
      return (hours || 0) * 60 + (minutes || 0);
    };
    const normalized = activities.map((activity) => ({
      ...activity,
      cost: Number(activity.cost) || 0,
      currency: activity.currency || trip.currency || 'INR',
    }));
    const additions: any[] = [];
    if (!fallbackDay) return normalized;

    const fallbackActivities = Array.isArray(fallbackDay.activities) ? fallbackDay.activities : [];

    const addCoverage = (kind: 'morning' | 'afternoon' | 'evening' | 'food', startTime: string, fallbackCategory: string) => {
      const hasCoverage = kind === 'food'
        ? normalized.some((activity) => String(activity.category).toLowerCase() === 'food')
        : normalized.some((activity) => {
            const minutes = timeToMinutes(activity.startTime);
            return kind === 'morning' ? minutes < 12 * 60 : kind === 'afternoon' ? minutes >= 12 * 60 && minutes < 17 * 60 : minutes >= 17 * 60;
          });
      if (hasCoverage) return;

      const fallback = fallbackActivities.find((activity) =>
        kind === 'food'
          ? String(activity.category).toLowerCase() === 'food'
          : String(activity.category).toLowerCase() === fallbackCategory
      );
      if (!fallback) return;
      const fallbackKey = `${String(fallback.title || '').trim().toLowerCase()}|${String(fallback.location || '').trim().toLowerCase()}`;
      if (normalized.concat(additions).some((activity) =>
        `${String(activity.title || '').trim().toLowerCase()}|${String(activity.location || '').trim().toLowerCase()}` === fallbackKey
      )) return;

      additions.push({
        ...fallback,
        id: undefined,
        title: fallback.title,
        category: fallback.category,
        startTime,
        durationMinutes: Number(fallback.durationMinutes) || 90,
        cost: Number(fallback.cost) || 0,
        currency: trip.currency || 'INR',
        location: fallback.location,
        notes: fallback.notes || '',
      });
    };

    addCoverage('morning', '09:30', 'place');
    addCoverage('afternoon', '13:30', 'place');
    addCoverage('evening', '18:00', 'experience');
    addCoverage('food', '12:30', 'food');

    return [...normalized, ...additions].sort(
      (first, second) => timeToMinutes(first.startTime) - timeToMinutes(second.startTime)
    );
  }

  /**
   * Internal execution of generation logic
   */
  private async executeGeneration(trip: any, modelName: string): Promise<{ days: any[] } | null> {
    if (!this.ai) return null;

    let context = '';
    if (trip.isOptimization && trip.currentItinerary) {
      context = `
      Current Itinerary (to be optimized):
      ${JSON.stringify(trip.currentItinerary)}
      
      The user has reported that the current itinerary is repetitive.
      Please REGENERATE it to be much more diverse, specific to ${trip.destination}, and unique across all days.
      Do NOT use repetitive phrases like "Morning Discovery" or "Authentic Dining" repeatedly.
      `;
    }

    const verifiedActivities = await this.getVerifiedActivities(trip.destination);
    const verifiedContext = verifiedActivities.length > 0
      ? `\n    VERIFIED CITY ACTIVITIES (use these locations and names; do not substitute another city):\n    ${JSON.stringify(verifiedActivities)}`
      : '';

    const prompt = `You are an expert travel planner. Generate a highly personalized and diverse itinerary for a trip to ${trip.name} (${trip.destination}, ${trip.country}).
    
    Trip Details:
    - Duration: ${trip.durationDays || 3} days
    - Start Date: ${trip.startDate}
    - End Date: ${trip.endDate}
    - Budget: ${trip.currency || 'INR'} ${trip.budget || 50000}
    - Travelers: ${trip.travelersCount || 2}
    ${verifiedContext}
    ${context}
    
    Requirements:
    1. Provide exactly ${trip.durationDays || 3} days of activities.
    2. Each day must have a unique 'title' and 'theme'.
    3. Each day must have 3-4 distinct activities with:
       - 'title': Specific and interesting (e.g. "Tea at The Imperial", "Rickshaw tour of Chandni Chowk").
       - 'category': One of 'place', 'food', 'hotel', 'experience', 'transport', 'Culture', 'Sightseeing', 'Activities'.
       - 'startTime': HH:MM format (e.g. "09:30").
       - 'durationMinutes': Number (e.g. 120).
       - 'cost': Estimated in ${trip.currency || 'INR'}.
       - 'location': Specific neighborhood, landmark, or venue name.
       - 'notes': 1-2 sentence description.
    4. Variety is key: avoid repetition across days. Every activity title must be unique and authentic to ${trip.destination}. If verified city activities are listed above, use them as the source of truth and do not invent locations in another city.
    5. Return ONLY a valid JSON object matching this structure:
    {
      "days": [
        {
          "dayNumber": 1,
          "title": "Day 1: ...",
          "theme": "...",
          "activities": [
            { "title": "...", "category": "...", "startTime": "...", "durationMinutes": 0, "cost": 0, "location": "...", "notes": "..." }
          ]
        }
      ]
    }`;

    const response = await this.ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.7,
      },
    });

    const text = response.text || '';
    
    // Clean potential markdown formatting
    const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanJson);
    
    if (parsed && Array.isArray(parsed.days) && parsed.days.length > 0) {
      return parsed;
    }
    
    return null;
  }

  private async getVerifiedActivities(destination: string): Promise<any[]> {
    try {
      const db = await getDb();
      const cityRows = await db.select().from(catalogCities);
      const normalizedDestination = String(destination || '').toLowerCase();
      const city = cityRows.find((candidate: any) => {
        const name = String(candidate.name || '').toLowerCase();
        return normalizedDestination.includes(name) || name.includes(normalizedDestination);
      });
      if (!city) return [];

      const rows = await db
        .select()
        .from(catalogActivities)
        .where(eq(catalogActivities.cityId, city.id));
      return rows.map((activity: any) => ({
        title: activity.title,
        category: activity.category,
        location: activity.location,
        estimatedCost: activity.estimatedCost,
        durationMinutes: activity.durationMinutes,
        bestTime: activity.bestTime,
      }));
    } catch (error) {
      console.warn('Verified activity catalog unavailable; using curated fallback:', error);
      return [];
    }
  }

  /**
   * Destination-aware rich fallback logic when AI is unavailable or rate-limited
   */
  private generateFallbackItinerary(trip: any, verifiedActivities: any[] = []): { days: any[] } {
    const days: any[] = [];
    const totalDays = trip.durationDays || 3;
    const dest = (trip.destination || trip.name || 'Manali').trim();
    const destLower = dest.toLowerCase();

    // Specific curated activity collections for popular destinations
    const destinationCurations: Record<string, { theme: string; activities: any[] }[]> = {
      ahmedabad: [
        {
          theme: 'Heritage Pols & Gujarati Flavors',
          activities: [
            { title: 'Walled City Pol Heritage Walk', category: 'place', startTime: '09:00', durationMinutes: 150, cost: 400, location: 'Kalupur Swaminarayan Temple, Ahmedabad', notes: 'Guided walk through Ahmedabad pols, carved wooden havelis, and historic community courtyards.' },
            { title: 'Gujarati Thali at Agashiye', category: 'food', startTime: '13:00', durationMinutes: 90, cost: 1200, location: 'The House of MG, Lal Darwaja, Ahmedabad', notes: 'Seasonal Gujarati thali served on a heritage terrace with regional sweets and farsan.' },
            { title: 'Sabarmati Ashram & Gandhi Memorial', category: 'place', startTime: '15:30', durationMinutes: 120, cost: 100, location: 'Gandhi Smarak Sangrahalaya, Ashram Road, Ahmedabad', notes: 'Explore the peaceful riverside ashram and its archive of India’s independence movement.' },
            { title: 'Manek Chowk Night Street Food', category: 'food', startTime: '20:30', durationMinutes: 90, cost: 450, location: 'Manek Chowk, Ahmedabad', notes: 'Sample Ahmedabad favorites including butter bhaji pav, local dosas, chocolate sandwiches, and kulfi.' },
          ],
        },
        {
          theme: 'Stepwells, Textiles & Riverfront Light',
          activities: [
            { title: 'Adalaj Stepwell Architectural Visit', category: 'place', startTime: '09:30', durationMinutes: 120, cost: 100, location: 'Adalaj, Gandhinagar-Ahmedabad Highway', notes: 'Descend through a richly carved five-story stepwell built for travelers and pilgrims.' },
            { title: 'Traditional Gujarati Lunch', category: 'food', startTime: '13:00', durationMinutes: 75, cost: 850, location: 'Old City, Ahmedabad', notes: 'Taste dal, kadhi, rotla, shaak, and farsan at a local Gujarati dining house.' },
            { title: 'Calico Museum Textile Heritage Tour', category: 'place', startTime: '15:00', durationMinutes: 150, cost: 300, location: 'Shahi Baug, Ahmedabad', notes: 'View historic Indian textiles, embroidery, and weaving traditions in a heritage setting.' },
            { title: 'Sabarmati Riverfront Sunset Stroll', category: 'experience', startTime: '18:00', durationMinutes: 90, cost: 0, location: 'Sabarmati Riverfront, Ahmedabad', notes: 'Relax beside the river with an evening promenade through Ahmedabad’s modern public waterfront.' },
          ],
        },
      ],
      manali: [
        {
          theme: 'Ancient Temples & Cedar Forest Walks',
          activities: [
            { title: 'Hadimba Devi Temple & Dhungri Van Vihar', category: 'place', startTime: '09:30', durationMinutes: 120, cost: 200, location: 'Dhungri Forest, Hadimba Temple Rd', notes: 'Historic wooden pagoda temple built in 1553 surrounded by towering deodar trees.' },
            { title: 'Traditional Himachali Lunch (Siddu & Dham)', category: 'food', startTime: '12:45', durationMinutes: 75, cost: 650, location: 'Old Manali Lane', notes: 'Authentic steamed wheat dough stuffed with poppy seeds and walnut chutney.' },
            { title: 'Jogini Waterfalls Nature Hike', category: 'experience', startTime: '15:00', durationMinutes: 150, cost: 0, location: 'Vashisht Village', notes: 'Scenic riverside trek through apple orchards leading to cascading mountain waters.' },
            { title: 'Cafe 1947 Riverside Evening', category: 'food', startTime: '19:00', durationMinutes: 120, cost: 1200, location: 'Old Manali Bridge', notes: 'Artisan woodfired pizzas and live acoustic folk music beside the Beas River.' },
          ]
        },
        {
          theme: 'High Altitude Thrills & Alpine Pass',
          activities: [
            { title: 'Solang Valley Paragliding & Zorbing', category: 'experience', startTime: '09:00', durationMinutes: 180, cost: 2500, location: 'Solang Valley Adventure Hub', notes: 'Tandem paragliding flight offering sweeping panoramas of snow-capped peaks.' },
            { title: 'Hot Maggi & Kashmiri Kahwa at Mountain Hut', category: 'food', startTime: '13:00', durationMinutes: 45, cost: 300, location: 'Solang Upper Ridge', notes: 'Hearty warm noodles and saffron-cardamom spiced tea in the crisp mountain air.' },
            { title: 'Atal Tunnel & Sissu Waterfall Excursion', category: 'place', startTime: '14:30', durationMinutes: 180, cost: 1500, location: 'Lahaul Valley Entrance', notes: 'Drive through the world-famous engineering marvel into the dramatic Lahaul landscapes.' },
          ]
        },
        {
          theme: 'Culture, Handicrafts & Mall Road',
          activities: [
            { title: 'Naggar Castle & Roerich Heritage Art Gallery', category: 'place', startTime: '10:00', durationMinutes: 150, cost: 400, location: 'Naggar Heritage Village', notes: 'Charming medieval timber-and-stone estate with panoramic Beas Valley vistas.' },
            { title: 'Trout Fish & Siddu Feast at Naggar Cafe', category: 'food', startTime: '13:00', durationMinutes: 90, cost: 1100, location: 'Castle Road', notes: 'Fresh local river trout pan-fried with Himalayan herbs and garlic butter.' },
            { title: 'Mall Road Tibetan Handloom Shopping & Stroll', category: 'place', startTime: '16:00', durationMinutes: 120, cost: 800, location: 'Mall Road Promenade', notes: 'Browse handwoven Pashmina shawls, Kullu caps, and Tibetan prayer flags.' },
          ]
        }
      ],
      puducherry: [
        {
          theme: 'French Quarter Heritage & Promenade',
          activities: [
            { title: 'White Town Heritage Architecture Walk', category: 'place', startTime: '09:00', durationMinutes: 120, cost: 300, location: 'Rue Romain Rolland, French Quarter', notes: 'Stroll past pastel yellow colonial villas, vibrant bougainvillea, and French street names.' },
            { title: 'Cafe des Arts Brunch & Crepes', category: 'food', startTime: '11:30', durationMinutes: 75, cost: 800, location: 'Suffren Street', notes: 'Artisan buckwheat galettes, fresh croissants, and iced filter coffee in a bohemian courtyard.' },
            { title: 'Sri Aurobindo Ashram & Paper Factory', category: 'place', startTime: '14:30', durationMinutes: 90, cost: 100, location: 'Marine Street', notes: 'Peaceful spiritual sanctuary and historic handmade rag-paper workshops.' },
            { title: 'Rock Beach Sunset Promenade Walk', category: 'experience', startTime: '17:00', durationMinutes: 90, cost: 0, location: 'Goubert Avenue', notes: 'Vehicle-free seaside boulevard stroll past the Gandhi Statue and Old French Lighthouse.' },
          ]
        },
        {
          theme: 'Universal Harmony & Auroville Experiential Tour',
          activities: [
            { title: 'Auroville & Matrimandir Viewing Point', category: 'place', startTime: '09:30', durationMinutes: 180, cost: 200, location: 'Auroville International Township', notes: 'Visit the architectural golden dome designed for silent concentration and sustainable living.' },
            { title: 'Farm Fresh Organic Lunch at Solar Kitchen', category: 'food', startTime: '13:00', durationMinutes: 60, cost: 500, location: 'Auroville Core', notes: 'Wholesome buffet cooked using solar energy and locally grown organic vegetables.' },
            { title: 'Paradise Beach Boat Cruise & Lagoon Swim', category: 'experience', startTime: '15:30', durationMinutes: 150, cost: 900, location: 'Chunnambar Boat House', notes: 'Scenic ferry ride through backwaters reaching pristine golden sand beach.' },
          ]
        }
      ],
      ladakh: [
        {
          theme: 'Acclimatization & Monastery Heritage',
          activities: [
            { title: 'Shanti Stupa Sunrise & Panoramic Vista', category: 'place', startTime: '09:00', durationMinutes: 90, cost: 100, location: 'Chanspa, Leh', notes: 'White-domed Buddhist stupa offering 360-degree views of Leh town and snow-capped peaks.' },
            { title: 'The Tibetan Kitchen Authentic Lunch', category: 'food', startTime: '12:30', durationMinutes: 75, cost: 750, location: 'Fort Road, Leh', notes: 'Hearty Thukpa noodle soup, steaming Momos, and butter tea.' },
            { title: 'Leh Royal Palace & Tsemo Fort', category: 'place', startTime: '15:00', durationMinutes: 120, cost: 300, location: 'Old Town Leh', notes: '9-story 17th-century palace modeled after Lhasa’s Potala Palace.' },
          ]
        },
        {
          theme: 'Pangong High Altitude Lake Expedition',
          activities: [
            { title: 'Chang La Pass Drive to Pangong Tso', category: 'experience', startTime: '08:00', durationMinutes: 240, cost: 2000, location: 'Chang La Pass', notes: 'Scenic drive across world’s third highest motorable mountain pass.' },
            { title: 'Pangong Color-Shifting Lake Exploration', category: 'place', startTime: '13:30', durationMinutes: 180, cost: 500, location: 'Pangong Tso Banks', notes: 'Crystal clear saline lake changing hues from turquoise to cobalt blue.' },
          ]
        }
      ],
      udaipur: [
        {
          theme: 'Royal Palaces & Lake Pichola Cruise',
          activities: [
            { title: 'City Palace Architectural Wonder', category: 'place', startTime: '09:30', durationMinutes: 150, cost: 400, location: 'Lake Pichola Bank, Udaipur', notes: 'Magnificent palace complex blending Rajasthani and Mughal architectural grandeur.' },
            { title: 'Traditional Mewari Thali at Ambrai', category: 'food', startTime: '12:45', durationMinutes: 90, cost: 1200, location: 'Hanuman Ghat, Udaipur', notes: 'Scenic lakeside dining overlooking the illuminated City Palace.' },
            { title: 'Lake Pichola Sunset Boat Cruise to Jag Mandir', category: 'experience', startTime: '16:30', durationMinutes: 120, cost: 800, location: 'Bansi Ghat Jetty', notes: 'Serene boat ride across tranquil waters visiting the historic island palace.' },
          ]
        },
        {
          theme: 'Gardens, Temples & Vintage Heritage',
          activities: [
            { title: 'Saheliyon-ki-Bari Fountain Gardens', category: 'place', startTime: '10:00', durationMinutes: 90, cost: 100, location: 'Panchwati, Udaipur', notes: 'Historic royal garden adorned with lotus pools, marble elephants, and marble kiosks.' },
            { title: 'Vintage Car Museum & Royal Collection', category: 'place', startTime: '13:30', durationMinutes: 90, cost: 450, location: 'Gulab Bagh Road', notes: 'Exclusive collection of historic royal Rolls-Royces and classic automobiles.' },
            { title: 'Bagore Ki Haveli Folk Dance & Puppet Show', category: 'experience', startTime: '18:00', durationMinutes: 60, cost: 150, location: 'Gangaur Ghat', notes: 'Vibrant Rajasthani cultural performance featuring traditional dance and puppetry.' },
          ]
        },
        {
          theme: 'Monsoon Palace & Hillside Panoramas',
          activities: [
            { title: 'Sajjangarh Monsoon Palace Hillside Excursion', category: 'place', startTime: '10:00', durationMinutes: 120, cost: 300, location: 'Sajjangarh Wildlife Sanctuary', notes: ' hilltop palace offering breathtaking panoramic views of Udaipur lakes and Aravali hills.' },
            { title: 'Shilpgram Rural Arts & Crafts Complex', category: 'place', startTime: '13:30', durationMinutes: 120, cost: 100, location: 'Havala Village', notes: 'Living ethnographic museum showcasing traditional rural crafts, folk arts, and rustic huts.' },
            { title: 'Sunset Rooftop Dinner at Jagat Niwas', category: 'food', startTime: '18:30', durationMinutes: 120, cost: 1400, location: 'Lal Ghat', notes: 'Romantic candlelit dining under the stars alongside Lake Pichola.' },
          ]
        }
      ],
      jaipur: [
        {
          theme: 'Majestic Amber Fort & Jal Mahal',
          activities: [
            { title: 'Amber Fort & Sheesh Mahal Exploration', category: 'place', startTime: '09:00', durationMinutes: 180, cost: 500, location: 'Devisinghpura, Amer, Jaipur', notes: 'Hilltop fort famous for its artistic Hindu style elements and mirror palace.' },
            { title: 'Jal Mahal Palace Lake View & Photography', category: 'place', startTime: '13:00', durationMinutes: 60, cost: 0, location: 'Amer Road, Jaipur', notes: 'Picturesque water palace standing gracefully in the center of Man Sagar Lake.' },
            { title: 'Traditional Rajasthani Thali at Chokhi Dhani', category: 'food', startTime: '18:00', durationMinutes: 180, cost: 1500, location: 'Tonk Road, Jaipur', notes: 'Immersive ethnic village experience with authentic dal baati churma and folk performances.' },
          ]
        },
        {
          theme: 'Pink City Palaces & Observatory',
          activities: [
            { title: 'City Palace & Royal Museum', category: 'place', startTime: '09:30', durationMinutes: 150, cost: 700, location: 'Jalebi Chowk, Jaipur', notes: 'Resplendent royal residence combining courtyards, gardens, and museums.' },
            { title: 'Jantar Mantar Astronomical Observatory', category: 'place', startTime: '12:30', durationMinutes: 90, cost: 200, location: 'Gangori Bazaar, J.D.A. Market', notes: 'UNESCO World Heritage site featuring the world’s largest stone sundial.' },
            { title: 'Hawa Mahal Palace of Winds & Bazaars Stroll', category: 'place', startTime: '15:00', durationMinutes: 120, cost: 200, location: 'Hawa Mahal Rd, Badi Choupad', notes: 'Iconic five-story honeycomb facade and bustling adjoining gemstone markets.' },
          ]
        },
        {
          theme: 'Fort Sunsets & Heritage Craft Bazaars',
          activities: [
            { title: 'Nahargarh Fort Sunset Panoramic View', category: 'place', startTime: '16:00', durationMinutes: 150, cost: 200, location: 'Nahargarh Fort, Brahampuri', notes: 'Historic hilltop fort overlooking the glittering lights of Jaipur city.' },
            { title: 'Johari Bazaar & Bapu Bazaar Shopping', category: 'place', startTime: '19:00', durationMinutes: 120, cost: 1000, location: 'Old City Bazaars', notes: 'Famed vibrant markets for Kundan jewelry, block-printed textiles, and mojris.' },
          ]
        }
      ]
    };

    // Find destination matching curation
    let matchedCuration: { theme: string; activities: any[] }[] | null = null;
    for (const [key, curation] of Object.entries(destinationCurations)) {
      if (destLower.includes(key) || key.includes(destLower)) {
        matchedCuration = curation;
        break;
      }
    }

    const verifiedTemplates = verifiedActivities.length > 0
      ? Array.from({ length: Math.ceil(verifiedActivities.length / 4) }, (_, index) => ({
          theme: `${dest} Verified Local Highlights ${index + 1}`,
          activities: verifiedActivities.slice(index * 4, index * 4 + 4).map((activity: any, activityIndex: number) => ({
            title: activity.title,
            category: String(activity.category || '').toLowerCase().includes('food') ? 'food' : 'place',
            startTime: activityIndex === 0 ? '09:30' : activityIndex === 1 ? '12:30' : activityIndex === 2 ? '15:30' : '18:30',
            durationMinutes: Number(activity.durationMinutes) || 90,
            cost: Number(activity.estimatedCost) || 0,
            currency: trip.currency || 'INR',
            location: activity.location || dest,
            notes: `Verified ${dest} destination activity from the curated city catalog.`,
          })),
        }))
      : [];
    const sourcePool = matchedCuration || verifiedTemplates;
    if (sourcePool.length === 0) return { days: [] };

    for (let i = 0; i < totalDays; i++) {
      const templateIndex = i % sourcePool.length;
      const template = sourcePool[templateIndex];
      const cycleNum = Math.floor(i / sourcePool.length);

      let dayTitle = `Day ${i + 1}: ${template.theme}`;
      let dayTheme = template.theme;
      let activities = template.activities.map(a => ({ ...a }));

      if (cycleNum > 0) {
        dayTheme = `${template.theme} (Part ${cycleNum + 1})`;
        dayTitle = `Day ${i + 1}: Explorations & Hidden Gems in ${dest}`;
        activities = template.activities.map((a, idx) => ({
          ...a,
          title: `${a.title} - Extended Experience ${cycleNum + 1}`,
          startTime: idx === 0 ? '09:00' : idx === 1 ? '12:30' : '16:00',
        }));
      }

      days.push({
        dayNumber: i + 1,
        title: dayTitle,
        theme: dayTheme,
        activities: activities.map(a => ({
          ...a,
          cost: Number(a.cost) || 500,
          currency: trip.currency || 'INR',
        }))
      });
    }

    return { days };
  }
}

export const aiGenerationService = new AIGenerationService();
