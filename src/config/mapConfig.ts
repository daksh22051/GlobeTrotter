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
    tokyo: { lat: 35.6762, lng: 139.6503, zoom: 13 },
    paris: { lat: 48.8566, lng: 2.3522, zoom: 13 },
    bali: { lat: -8.4095, lng: 115.1889, zoom: 11 },
    dubai: { lat: 25.2048, lng: 55.2708, zoom: 12 },
    manali: { lat: 32.2432, lng: 77.1892, zoom: 13 },
    goa: { lat: 15.2993, lng: 74.1240, zoom: 11 },
    rome: { lat: 41.9028, lng: 12.4964, zoom: 13 },
    london: { lat: 51.5074, lng: -0.1278, zoom: 13 },
    newyork: { lat: 40.7128, lng: -74.0060, zoom: 13 },
    singapore: { lat: 1.3521, lng: 103.8198, zoom: 12 },
    barcelona: { lat: 41.3879, lng: 2.1699, zoom: 13 },
    kyoto: { lat: 35.0116, lng: 135.7681, zoom: 13 },
    bangkok: { lat: 13.7563, lng: 100.5018, zoom: 12 },
    sydney: { lat: -33.8688, lng: 151.2093, zoom: 12 },
    default: { lat: 20.0, lng: 0.0, zoom: 3 },
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
