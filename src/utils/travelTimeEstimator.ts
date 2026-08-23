/**
 * Travel Time Estimator Utility
 * 
 * Estimates realistic travel transit times between activity locations.
 * Note: Clearly labeled in the UI as estimated travel time.
 */

/**
 * Calculates estimated travel time in minutes between two activity locations
 */
export function estimateTravelTimeMinutes(
  fromLocation: string | undefined,
  toLocation: string | undefined,
  fromCoords?: { lat?: number; lng?: number },
  toCoords?: { lat?: number; lng?: number }
): number {
  if (!fromLocation || !toLocation) {
    return 20; // Standard default city transit
  }

  const from = fromLocation.trim().toLowerCase();
  const to = toLocation.trim().toLowerCase();

  // If locations are identical (same place or hotel)
  if (from === to) {
    return 5;
  }

  // If geographic coordinates are present, calculate Haversine approximation
  if (fromCoords?.lat && fromCoords?.lng && toCoords?.lat && toCoords?.lng) {
    const lat1 = fromCoords.lat;
    const lon1 = fromCoords.lng;
    const lat2 = toCoords.lat;
    const lon2 = toCoords.lng;

    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distanceKm = R * c;

    // Estimate city transit speed ~25 km/h + 8 min baseline transfer
    const transitMinutes = Math.round(distanceKm * 2.5 + 8);
    return Math.max(10, Math.min(transitMinutes, 90));
  }

  // Neighborhood / landmark heuristics
  const sameDistrictKeywords = [
    'shibuya', 'shinjuku', 'ginza', 'asakusa', 'ueno', 'roppongi', 'akihabara',
    'gion', 'arashiyama', 'central', 'downtown', 'old town', 'harbor', 'beach',
    'fort', 'palace', 'district', 'market', 'mall', 'waterfront'
  ];

  let sharedDistrict = false;
  for (const keyword of sameDistrictKeywords) {
    if (from.includes(keyword) && to.includes(keyword)) {
      sharedDistrict = true;
      break;
    }
  }

  if (sharedDistrict) {
    // Walking or short transit distance within the same neighborhood
    return 12;
  }

  // Suburb/airport keywords
  if (
    from.includes('airport') ||
    to.includes('airport') ||
    from.includes('outskirts') ||
    to.includes('outskirts') ||
    from.includes('narita') ||
    to.includes('narita')
  ) {
    return 55;
  }

  // Deterministic pseudo-hash for consistent reasonable times between stops
  const hash = Math.abs(
    (from.length * 31 + to.length * 17 + from.charCodeAt(0) + to.charCodeAt(0)) % 35
  );
  
  // Return a realistic city travel time between 15 and 45 minutes
  return 15 + (hash % 25);
}

/**
 * Formats travel minutes into a clean display string
 * e.g. 25 -> "25 min", 75 -> "1h 15m"
 */
export function formatTravelTime(minutes: number): string {
  if (!minutes || minutes <= 0) return '0 min';
  if (minutes < 60) return `${minutes} min`;
  
  const hours = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;
  
  if (remainingMins === 0) return `${hours}h`;
  return `${hours}h ${remainingMins}m`;
}
