/**
 * GlobeTrotter Centralized Map Configuration
 * Cleanly isolates tile layer providers, styling, colors, and map presets.
 */

export interface MapTileProvider {
  id: string;
  name: string;
  url: string;
  attribution: string;
  maxZoom: number;
  subdomains?: string[];
}

export const MAP_CONFIG = {
  // Tile Providers: Replaceable and compliant with OpenStreetMap and CartoDB Voyager/Positron
  tileProviders: {
    voyager: {
      id: 'voyager',
      name: 'GlobeTrotter Travel Light',
      url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 19,
      subdomains: ['a', 'b', 'c', 'd'],
    },
    osm: {
      id: 'osm',
      name: 'OpenStreetMap Standard',
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    },
  },
  
  // Default initial tile provider
  defaultProviderId: 'voyager' as const,

  // Map view controls
  defaultZoom: 13,
  minZoom: 2,
  maxZoom: 18,
  
  // Default coordinates for known destination fallbacks
  defaultDestinations: {
    manali: { lat: 32.2432, lng: 77.1892, zoom: 13 },
    puducherry: { lat: 11.9416, lng: 79.8083, zoom: 13 },
    pondicherry: { lat: 11.9416, lng: 79.8083, zoom: 13 },
    ladakh: { lat: 34.1526, lng: 77.5771, zoom: 11 },
    leh: { lat: 34.1526, lng: 77.5771, zoom: 12 },
    lehladakh: { lat: 34.1526, lng: 77.5771, zoom: 11 },
    goa: { lat: 15.2993, lng: 74.1240, zoom: 11 },
    jaipur: { lat: 26.9124, lng: 75.7873, zoom: 13 },
    udaipur: { lat: 24.5854, lng: 73.7125, zoom: 13 },
    kerala: { lat: 9.9312, lng: 76.2673, zoom: 10 },
    alleppey: { lat: 9.4981, lng: 76.3388, zoom: 12 },
    alappuzha: { lat: 9.4981, lng: 76.3388, zoom: 12 },
    kochi: { lat: 9.9312, lng: 76.2673, zoom: 12 },
    munnar: { lat: 10.0889, lng: 77.0595, zoom: 12 },
    mumbai: { lat: 19.0760, lng: 72.8777, zoom: 12 },
    varanasi: { lat: 25.3176, lng: 82.9739, zoom: 13 },
    kashi: { lat: 25.3176, lng: 82.9739, zoom: 13 },
    benaras: { lat: 25.3176, lng: 82.9739, zoom: 13 },
    agra: { lat: 27.1767, lng: 78.0081, zoom: 13 },
    rishikesh: { lat: 30.0869, lng: 78.2676, zoom: 13 },
    amritsar: { lat: 31.6340, lng: 74.8723, zoom: 13 },
    delhi: { lat: 28.6139, lng: 77.2090, zoom: 12 },
    newdelhi: { lat: 28.6139, lng: 77.2090, zoom: 12 },
    ahmedabad: { lat: 23.0225, lng: 72.5714, zoom: 13 },
    bengaluru: { lat: 12.9716, lng: 77.5946, zoom: 12 },
    bangalore: { lat: 12.9716, lng: 77.5946, zoom: 12 },
    kolkata: { lat: 22.5726, lng: 88.3639, zoom: 12 },
    chennai: { lat: 13.0827, lng: 80.2707, zoom: 12 },
    shimla: { lat: 31.1048, lng: 77.1734, zoom: 13 },
    tokyo: { lat: 35.6762, lng: 139.6503, zoom: 13 },
    paris: { lat: 48.8566, lng: 2.3522, zoom: 13 },
    bali: { lat: -8.4095, lng: 115.1889, zoom: 11 },
    dubai: { lat: 25.2048, lng: 55.2708, zoom: 12 },
    rome: { lat: 41.9028, lng: 12.4964, zoom: 13 },
    london: { lat: 51.5074, lng: -0.1278, zoom: 13 },
    newyork: { lat: 40.7128, lng: -74.0060, zoom: 13 },
    singapore: { lat: 1.3521, lng: 103.8198, zoom: 12 },
    barcelona: { lat: 41.3879, lng: 2.1699, zoom: 13 },
    kyoto: { lat: 35.0116, lng: 135.7681, zoom: 13 },
    bangkok: { lat: 13.7563, lng: 100.5018, zoom: 12 },
    sydney: { lat: -33.8688, lng: 151.2093, zoom: 12 },
    amsterdam: { lat: 52.3676, lng: 4.9041, zoom: 13 },
    zurich: { lat: 47.3769, lng: 8.5417, zoom: 13 },
    default: { lat: 28.6139, lng: 77.2090, zoom: 5 },
  },

  // Elegant Day Color Palette for distinct visual grouping
  dayColors: [
    { day: 1, primary: '#FF6B4A', light: '#FFE4DD', text: '#FFFFFF', border: '#E55837', name: 'Coral Rose' },
    { day: 2, primary: '#20B8A6', light: '#DDF7F2', text: '#FFFFFF', border: '#179E8E', name: 'Emerald Teal' },
    { day: 3, primary: '#F59E0B', light: '#FEF3C7', text: '#17201D', border: '#D97706', name: 'Amber Sun' },
    { day: 4, primary: '#6366F1', light: '#E0E7FF', text: '#FFFFFF', border: '#4F46E5', name: 'Indigo Horizon' },
    { day: 5, primary: '#EC4899', light: '#FCE7F3', text: '#FFFFFF', border: '#DB2777', name: 'Blush Pink' },
    { day: 6, primary: '#8B5CF6', light: '#EDE9FE', text: '#FFFFFF', border: '#7C3AED', name: 'Royal Violet' },
    { day: 7, primary: '#10B981', light: '#D1FAE5', text: '#FFFFFF', border: '#059669', name: 'Mint Jade' },
    { day: 8, primary: '#0EA5E9', light: '#E0F2FE', text: '#FFFFFF', border: '#0284C7', name: 'Sky Blue' },
    { day: 9, primary: '#D97706', light: '#FFEDD5', text: '#FFFFFF', border: '#B45309', name: 'Warm Ochre' },
    { day: 10, primary: '#14B8A6', light: '#CCFBF1', text: '#FFFFFF', border: '#0F766E', name: 'Ocean Pine' },
  ],

  // Visual Category Config
  categoryConfig: {
    place: {
      label: 'Attraction & Landmark',
      emoji: '📍',
      badgeBg: '#FFF0ED',
      badgeColor: '#FF6B4A',
      borderColor: '#FF6B4A',
    },
    food: {
      label: 'Dining & Food',
      emoji: '🍜',
      badgeBg: '#FEF3C7',
      badgeColor: '#D97706',
      borderColor: '#F59E0B',
    },
    hotel: {
      label: 'Hotel & Stay',
      emoji: '🏨',
      badgeBg: '#E0F2FE',
      badgeColor: '#0284C7',
      borderColor: '#0EA5E9',
    },
    experience: {
      label: 'Experience & Tour',
      emoji: '🎭',
      badgeBg: '#EDE9FE',
      badgeColor: '#7C3AED',
      borderColor: '#8B5CF6',
    },
  },
};

/**
 * Gets day color scheme by day number
 */
export function getDayColor(dayNumber: number) {
  const index = Math.max(0, (dayNumber - 1) % MAP_CONFIG.dayColors.length);
  return MAP_CONFIG.dayColors[index];
}
