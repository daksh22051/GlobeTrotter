/**
 * Location & Coordinate Resolution Service
 * Provides precise geographical coordinate mapping, landmark resolution,
 * and travel time estimation for itinerary activities.
 */

import { Coordinates } from '../types/map';
import { ItineraryActivity } from '../types/itinerary';
import { Recommendation } from '../types/recommendation';
import { MAP_CONFIG } from '../config/mapConfig';

/**
 * Structured Landmark & Place Coordinates Database
 * Accurate coordinates for curated recommendations across all destinations.
 */
const KNOWN_PLACE_COORDINATES: Record<string, Coordinates> = {
  // TOKYO
  tokyo_rec_place_1: { latitude: 35.7147, longitude: 139.7967 }, // Senso-ji Temple & Asakusa
  tokyo_rec_place_2: { latitude: 35.6595, longitude: 139.7005 }, // Shibuya Sky & Scramble
  tokyo_rec_place_3: { latitude: 35.6852, longitude: 139.7100 }, // Shinjuku Gyoen National Garden
  tokyo_rec_place_4: { latitude: 35.6764, longitude: 139.6993 }, // Meiji Jingu Shrine
  tokyo_rec_place_5: { latitude: 35.6712, longitude: 139.7649 }, // Tsukiji Outer Market
  tokyo_rec_food_1: { latitude: 35.7118, longitude: 139.7960 },  // Asakusa Imahan Sukiyaki
  tokyo_rec_food_2: { latitude: 35.6598, longitude: 139.7020 },  // Ichiran Shibuya Ramen
  tokyo_rec_food_3: { latitude: 35.6695, longitude: 139.7672 },  // Sushizanmai Tsukiji
  tokyo_rec_food_4: { latitude: 35.6938, longitude: 139.7034 },  // Omoide Yokocho Yakitori
  tokyo_rec_exp_1: { latitude: 35.6491, longitude: 139.7898 },   // teamLab Planets Toyosu
  tokyo_rec_exp_2: { latitude: 35.7100, longitude: 139.8107 },   // Sumida River Cruise
  tokyo_rec_exp_3: { latitude: 35.6700, longitude: 139.7050 },   // Harajuku Street Fashion Tour
  tokyo_rec_hotel_1: { latitude: 35.6868, longitude: 139.7690 }, // Palace Hotel Tokyo (Marunouchi)
  tokyo_rec_hotel_2: { latitude: 35.6601, longitude: 139.7012 }, // TRUNK Hotel Shibuya
  tokyo_rec_hotel_3: { latitude: 35.6909, longitude: 139.6921 }, // Park Hyatt Tokyo

  // PARIS
  paris_rec_place_1: { latitude: 48.8606, longitude: 2.3376 },   // Louvre Museum
  paris_rec_place_2: { latitude: 48.8584, longitude: 2.2945 },   // Eiffel Tower
  paris_rec_place_3: { latitude: 48.8867, longitude: 2.3431 },   // Sacré-Cœur & Montmartre
  paris_rec_place_4: { latitude: 48.8530, longitude: 2.3499 },   // Sainte-Chapelle & Notre-Dame
  paris_rec_place_5: { latitude: 48.8462, longitude: 2.3372 },   // Jardin du Luxembourg
  paris_rec_food_1: { latitude: 48.8540, longitude: 2.3330 },    // Café de Flore
  paris_rec_food_2: { latitude: 48.8566, longitude: 2.3580 },    // Le Marais Bistro
  paris_rec_food_3: { latitude: 48.8672, longitude: 2.3275 },    // Angelina Paris Chocolat
  paris_rec_exp_1: { latitude: 48.8610, longitude: 2.2980 },    // Seine River Evening Cruise
  paris_rec_exp_2: { latitude: 48.8570, longitude: 2.3540 },    // Pastry Masterclass Le Marais
  paris_rec_hotel_1: { latitude: 48.8678, longitude: 2.3292 },  // Le Meurice Paris
  paris_rec_hotel_2: { latitude: 48.8550, longitude: 2.3610 },  // Hotel Pavillon de la Reine

  // BALI
  bali_rec_place_1: { latitude: -8.4333, longitude: 115.2813 },  // Tegallalang Rice Terraces
  bali_rec_place_2: { latitude: -8.8291, longitude: 115.0849 },  // Uluwatu Cliff Temple
  bali_rec_place_3: { latitude: -8.5192, longitude: 115.2606 },  // Sacred Monkey Forest Ubud
  bali_rec_place_4: { latitude: -8.6212, longitude: 115.0868 },  // Tanah Lot Sea Temple
  bali_rec_food_1: { latitude: -8.5130, longitude: 115.2650 },   // Locavore Ubud
  bali_rec_food_2: { latitude: -8.6539, longitude: 115.1308 },   // La Brisa Beach Club Echo Beach
  bali_rec_exp_1: { latitude: -8.2420, longitude: 115.3780 },   // Mount Batur Sunrise Hike
  bali_rec_exp_2: { latitude: -8.4720, longitude: 115.2750 },   // Ayung River White Water Rafting
  bali_rec_hotel_1: { latitude: -8.4850, longitude: 115.2410 },  // Maya Ubud Resort
  bali_rec_hotel_2: { latitude: -8.8100, longitude: 115.1550 },  // Bulgari Resort Uluwatu

  // DUBAI
  dubai_rec_place_1: { latitude: 25.1972, longitude: 55.2744 },  // Burj Khalifa & Dubai Mall
  dubai_rec_place_2: { latitude: 25.0760, longitude: 55.1330 },  // Dubai Marina & JBR
  dubai_rec_place_3: { latitude: 25.1412, longitude: 55.1852 },  // Burj Al Arab
  dubai_rec_place_4: { latitude: 25.2630, longitude: 55.2972 },  // Al Fahidi Historical Quarter
  dubai_rec_food_1: { latitude: 25.1980, longitude: 55.2790 },   // Time Out Market Downtown
  dubai_rec_exp_1: { latitude: 24.8350, longitude: 55.5700 },   // Red Dune Desert Safari
  dubai_rec_hotel_1: { latitude: 25.1304, longitude: 55.1171 }, // Atlantis The Palm

  // MANALI
  manali_rec_place_1: { latitude: 32.3167, longitude: 77.1583 }, // Solang Valley Adventure Park
  manali_rec_place_2: { latitude: 32.2470, longitude: 77.1818 }, // Hadimba Devi Temple
  manali_rec_place_3: { latitude: 32.2580, longitude: 77.1850 }, // Old Manali Village
  manali_rec_place_4: { latitude: 32.3716, longitude: 77.2466 }, // Rohtang Pass / Atal Tunnel
  manali_rec_food_1: { latitude: 32.2575, longitude: 77.1860 },  // Cafe 1947 Old Manali
  manali_rec_exp_1: { latitude: 32.3200, longitude: 77.1600 },  // Beas River Paragliding
  manali_rec_hotel_1: { latitude: 32.2450, longitude: 77.1800 }, // The Himalayan Luxury Resort

  // GOA
  goa_rec_place_1: { latitude: 15.4989, longitude: 73.8343 },   // Fontainhas Latin Quarter
  goa_rec_place_2: { latitude: 15.4920, longitude: 73.7737 },   // Fort Aguada & Lighthouse
  goa_rec_place_3: { latitude: 15.0100, longitude: 74.0230 },   // Palolem Beach South Goa
  goa_rec_place_4: { latitude: 15.5494, longitude: 73.7535 },   // Anjuna Flea Market
  goa_rec_food_1: { latitude: 15.5700, longitude: 73.7420 },    // Thalassa Greek Restaurant Vagator
  goa_rec_exp_1: { latitude: 15.3144, longitude: 74.3143 },    // Dudhsagar Waterfalls Trek
  goa_rec_hotel_1: { latitude: 15.4800, longitude: 73.8050 },   // Taj Fort Aguada Resort
};

/**
 * Text-based landmark coordinate dictionary for lookup by title/location keywords
 */
const KEYWORD_COORDINATES: Array<{ keywords: string[]; coords: Coordinates }> = [
  // Tokyo
  { keywords: ['senso-ji', 'sensoji', 'asakusa'], coords: { latitude: 35.7147, longitude: 139.7967 } },
  { keywords: ['shibuya sky', 'scramble', 'shibuya crossing'], coords: { latitude: 35.6595, longitude: 139.7005 } },
  { keywords: ['shinjuku gyoen', 'gyoen garden'], coords: { latitude: 35.6852, longitude: 139.7100 } },
  { keywords: ['meiji', 'yoyogi'], coords: { latitude: 35.6764, longitude: 139.6993 } },
  { keywords: ['tsukiji', 'sushi'], coords: { latitude: 35.6712, longitude: 139.7649 } },
  { keywords: ['teamlab', 'planets', 'toyosu'], coords: { latitude: 35.6491, longitude: 139.7898 } },
  { keywords: ['tokyo tower', 'roppongi'], coords: { latitude: 35.6586, longitude: 139.7454 } },
  { keywords: ['akihabara', 'electronics'], coords: { latitude: 35.6983, longitude: 139.7731 } },
  { keywords: ['ginza', 'shopping'], coords: { latitude: 35.6719, longitude: 139.7650 } },
  { keywords: ['sumida', 'skytree'], coords: { latitude: 35.7100, longitude: 139.8107 } },
  
  // Paris
  { keywords: ['louvre', 'mona lisa'], coords: { latitude: 48.8606, longitude: 2.3376 } },
  { keywords: ['eiffel', 'champ de mars'], coords: { latitude: 48.8584, longitude: 2.2945 } },
  { keywords: ['sacre-coeur', 'sacre coeur', 'montmartre'], coords: { latitude: 48.8867, longitude: 2.3431 } },
  { keywords: ['notre dame', 'notre-dame', 'sainte-chapelle'], coords: { latitude: 48.8530, longitude: 2.3499 } },
  { keywords: ['luxembourg', 'latin quarter'], coords: { latitude: 48.8462, longitude: 2.3372 } },
  { keywords: ['arc de triomphe', 'champs-elysees'], coords: { latitude: 48.8738, longitude: 2.2950 } },
  { keywords: ['orsay', 'd\'orsay'], coords: { latitude: 48.8599, longitude: 2.3265 } },
  { keywords: ['seine', 'bistro', 'flore'], coords: { latitude: 48.8540, longitude: 2.3330 } },

  // Bali
  { keywords: ['ubud', 'rice terrace', 'tegallalang'], coords: { latitude: -8.4333, longitude: 115.2813 } },
  { keywords: ['uluwatu', 'cliff', 'kecak'], coords: { latitude: -8.8291, longitude: 115.0849 } },
  { keywords: ['monkey forest'], coords: { latitude: -8.5192, longitude: 115.2606 } },
  { keywords: ['tanah lot'], coords: { latitude: -8.6212, longitude: 115.0868 } },
  { keywords: ['canggu', 'echo beach', 'seminyak'], coords: { latitude: -8.6539, longitude: 115.1308 } },
  { keywords: ['batur', 'kintamani'], coords: { latitude: -8.2420, longitude: 115.3780 } },

  // Dubai
  { keywords: ['burj khalifa', 'dubai mall'], coords: { latitude: 25.1972, longitude: 55.2744 } },
  { keywords: ['dubai marina', 'jbr'], coords: { latitude: 25.0760, longitude: 55.1330 } },
  { keywords: ['burj al arab'], coords: { latitude: 25.1412, longitude: 55.1852 } },
  { keywords: ['palm jumeirah', 'atlantis'], coords: { latitude: 25.1304, longitude: 55.1171 } },
  { keywords: ['desert safari'], coords: { latitude: 24.8350, longitude: 55.5700 } },

  // Manali
  { keywords: ['solang', 'adventure'], coords: { latitude: 32.3167, longitude: 77.1583 } },
  { keywords: ['hadimba', 'hidimba'], coords: { latitude: 32.2470, longitude: 77.1818 } },
  { keywords: ['old manali', 'cafe 1947'], coords: { latitude: 32.2580, longitude: 77.1850 } },
  { keywords: ['rohtang', 'atal tunnel'], coords: { latitude: 32.3716, longitude: 77.2466 } },

  // Goa
  { keywords: ['fontainhas', 'panaji'], coords: { latitude: 15.4989, longitude: 73.8343 } },
  { keywords: ['aguada', 'candolim'], coords: { latitude: 15.4920, longitude: 73.7737 } },
  { keywords: ['palolem', 'canacona'], coords: { latitude: 15.0100, longitude: 74.0230 } },
  { keywords: ['anjuna', 'vagator', 'thalassa'], coords: { latitude: 15.5700, longitude: 73.7420 } },
];

/**
 * Generates a deterministic geo-offset for unknown items in a destination
 * based on string hashing, ensuring stability without random jitter across renders.
 */
function getDeterministicOffset(seed: string, scaleKm: number = 2.5): { dLat: number; dLng: number } {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  
  const angle = Math.abs(hash % 360) * (Math.PI / 180);
  const dist = ((Math.abs(hash >> 3) % 100) / 100) * scaleKm;
  
  // 1 degree latitude ~ 111 km
  const dLat = (dist * Math.cos(angle)) / 111;
  const dLng = (dist * Math.sin(angle)) / (111 * 0.85); // approx cos(lat)
  
  return { dLat, dLng };
}

export const locationService = {
  /**
   * Resolves coordinates for any activity or recommendation.
   * Priority order:
   * 1. Already provided latitude and longitude on the item
   * 2. Direct recommendationId lookup in KNOWN_PLACE_COORDINATES
   * 3. Keyword match in title and location
   * 4. Destination center + deterministic local offset
   */
  resolveCoordinates(
    item: {
      id?: string;
      recommendationId?: string;
      title?: string;
      name?: string;
      location?: string;
      latitude?: number;
      longitude?: number;
    },
    destinationName: string = 'Tokyo'
  ): Coordinates {
    // 1. Direct coordinates on item
    if (
      typeof item.latitude === 'number' &&
      typeof item.longitude === 'number' &&
      !isNaN(item.latitude) &&
      !isNaN(item.longitude) &&
      item.latitude !== 0 &&
      item.longitude !== 0
    ) {
      return { latitude: item.latitude, longitude: item.longitude };
    }

    // 2. Known Place ID
    const recId = item.recommendationId || item.id;
    if (recId && KNOWN_PLACE_COORDINATES[recId]) {
      return KNOWN_PLACE_COORDINATES[recId];
    }

    // 3. Keyword Match in Title / Location
    const searchText = `${item.title || item.name || ''} ${item.location || ''}`.toLowerCase();
    for (const entry of KEYWORD_COORDINATES) {
      if (entry.keywords.some((kw) => searchText.includes(kw))) {
        return entry.coords;
      }
    }

    // 4. Destination Center with Deterministic Offset
    const destKey = destinationName.toLowerCase().replace(/[^a-z0-9]/g, '');
    let baseCenter = { lat: 35.6762, lng: 139.6503 }; // Default Tokyo

    for (const [key, dest] of Object.entries(MAP_CONFIG.defaultDestinations)) {
      if (destKey.includes(key) || key.includes(destKey)) {
        baseCenter = { lat: dest.lat, lng: dest.lng };
        break;
      }
    }

    const seed = `${item.id || ''}_${item.title || item.name || 'place'}`;
    const offset = getDeterministicOffset(seed, 3.2);

    return {
      latitude: baseCenter.lat + offset.dLat,
      longitude: baseCenter.lng + offset.dLng,
    };
  },

  /**
   * Calculates Haversine distance in Kilometers between two coordinates
   */
  calculateDistanceKm(coord1: Coordinates, coord2: Coordinates): number {
    const R = 6371; // Earth's radius in km
    const dLat = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
    const dLng = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((coord1.latitude * Math.PI) / 180) *
        Math.cos((coord2.latitude * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10;
  },

  /**
   * Estimates urban travel time in minutes based on distance.
   * Assumes ~15-25 km/h urban average speed (transit + walking buffer) + 5 min transfer buffer.
   */
  estimateTravelTimeMinutes(distanceKm: number): number {
    if (distanceKm <= 0.3) return 5;
    if (distanceKm <= 1.0) return 10;
    // ~20 km/h average city transit speed + 5 min walking/waiting buffer
    const minutes = Math.round((distanceKm / 20) * 60 + 5);
    return Math.max(5, Math.min(minutes, 180));
  },

  /**
   * Formats travel minutes to readable display, e.g. "1h 20m" or "25 min"
   */
  formatTravelTime(minutes: number): string {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  },
};
