/**
 * Trip Data Service
 * 
 * Connected to PostgreSQL backend with real-time relational persistence,
 * multi-city support, and optimistic client-side caching.
 */

import { Trip, TripStats, TripPlannerDraft, TripItem, TripCity } from '../types/trip';
import { authService } from './authService';
import { profileService } from './profileService';
import { apiRequest } from './apiClient';
import { getDeterministicCoverImage } from '../components/trips/TripCoverImage';

const STORAGE_KEY_PREFIX = 'globetrotter_trips';
const DRAFT_TRIPS_KEY_PREFIX = 'globetrotter_draft_trips';
const DRAFT_KEY_PREFIX = 'globetrotter_trip_draft';

const getStorageKey = (userId?: string): string => {
  const currentUser = authService.getCurrentUser();
  const id = userId || currentUser?.id || 'guest';
  return `${STORAGE_KEY_PREFIX}_${id}`;
};

const getDraftStorageKey = (userId?: string): string => {
  const currentUser = authService.getCurrentUser();
  const id = userId || currentUser?.id || 'guest';
  return `${DRAFT_KEY_PREFIX}_${id}`;
};

const getDraftTripsStorageKey = (userId?: string): string => {
  const currentUser = authService.getCurrentUser();
  const id = userId || currentUser?.id || 'guest';
  return `${DRAFT_TRIPS_KEY_PREFIX}_${id}`;
};

// Formats date display
function formatDisplayDate(start?: string, end?: string): string {
  if (!start) return '';
  try {
    const s = new Date(start);
    const sStr = s.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (!end) return sStr;
    const e = new Date(end);
    const eStr = e.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${sStr} – ${eStr}`;
  } catch {
    return `${start} - ${end}`;
  }
}

export const tripService = {
  /**
   * Fetch trips asynchronously from PostgreSQL backend and update local cache
   */
  async fetchTrips(userId?: string): Promise<Trip[]> {
    try {
      const serverTrips = await apiRequest<any[]>('/trips');
      if (Array.isArray(serverTrips)) {
        const mapped: Trip[] = serverTrips.filter((st) => st.status !== 'draft').map((st) => ({
          id: st.id,
          userId: st.userId,
          name: st.name,
          destination: st.destination || st.name,
          country: st.country || 'India',
          coverImage: st.coverImage || st.cover_image || st.cities?.[0]?.imageUrl || st.cities?.[0]?.image_url || getDeterministicCoverImage(st.destination, st.name),
          startDate: st.startDate,
          endDate: st.endDate,
          dateDisplay: formatDisplayDate(st.startDate, st.endDate),
          durationDays: Math.max(1, Math.ceil((new Date(st.endDate).getTime() - new Date(st.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1),
          travelersCount: 2,
          tripType: 'leisure',
          budget: Number(st.budget) || 50000,
          currency: st.currency || 'INR',
          budgetStyle: 'balanced',
          travelPace: 'balanced',
          transportPreferences: ['flights'],
          accommodationStyle: 'boutique_hotel',
          interests: ['Culture', 'Food'],
          status: st.status || 'planning',
          cities: st.cities || [],
          role: st.role || 'owner',
          isFavorite: !!st.isFavorite,
          isPinned: !!st.isPinned,
          createdAt: st.createdAt ? new Date(st.createdAt).toISOString() : new Date().toISOString(),
          updatedAt: st.updatedAt ? new Date(st.updatedAt).toISOString() : new Date().toISOString(),
        }));

        // Update local cache
        const effectiveUserId = userId || authService.getCurrentUser()?.id;
        const key = getStorageKey(effectiveUserId);
        localStorage.setItem(key, JSON.stringify(mapped));
        return mapped;
      }
      throw new Error('Trips API returned an invalid response.');
    } catch (error) {
      throw error;
    }
  },

  /**
   * Retrieves all trips associated with the user (synchronous from cache)
   */
  getUserTrips(userId?: string): Trip[] {
    try {
      const key = getStorageKey(userId);
      const raw = localStorage.getItem(key);
      if (!raw) return [];
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  getDraftTrip(tripId: string, userId?: string): Trip | null {
    try {
      const raw = localStorage.getItem(getDraftTripsStorageKey(userId));
      const drafts: Trip[] = raw ? JSON.parse(raw) : [];
      return drafts.find((trip) => trip.id === tripId) || null;
    } catch {
      return null;
    }
  },

  getTrips(userId?: string): Trip[] {
    return this.getUserTrips(userId);
  },

  /**
   * Retrieves a single trip by ID
   */
  getTripById(tripId: string, userId?: string): Trip | null {
    const trips = this.getUserTrips(userId);
    return trips.find((t) => t.id === tripId) || this.getDraftTrip(tripId, userId);
  },

  /**
   * Async fetch single trip bundle from PostgreSQL
   */
  async fetchTripById(tripId: string): Promise<Trip | null> {
    try {
      const st = await apiRequest<any>(`/trips/${tripId}`);
      if (st) {
        const mapped: Trip = {
          id: st.id,
          userId: st.userId,
          name: st.name,
          destination: st.destination || st.name,
          country: st.country || 'India',
          coverImage: st.coverImage || st.cover_image || st.cities?.[0]?.imageUrl || st.cities?.[0]?.image_url || getDeterministicCoverImage(st.destination, st.name),
          startDate: st.startDate,
          endDate: st.endDate,
          dateDisplay: formatDisplayDate(st.startDate, st.endDate),
          durationDays: Math.max(1, Math.ceil((new Date(st.endDate).getTime() - new Date(st.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1),
          travelersCount: 2,
          tripType: 'leisure',
          budget: Number(st.budget) || 50000,
          currency: st.currency || 'INR',
          budgetStyle: 'balanced',
          travelPace: 'balanced',
          transportPreferences: ['flights'],
          accommodationStyle: 'boutique_hotel',
          interests: ['Culture', 'Food'],
          status: st.status || 'planning',
          cities: st.cities || [],
          role: st.role || 'owner',
          isFavorite: !!st.isFavorite,
          isPinned: !!st.isPinned,
          createdAt: st.createdAt ? new Date(st.createdAt).toISOString() : new Date().toISOString(),
          updatedAt: st.updatedAt ? new Date(st.updatedAt).toISOString() : new Date().toISOString(),
        };

        // Update in cache
        const trips = this.getUserTrips();
        const idx = trips.findIndex(t => t.id === tripId);
        if (mapped.status === 'draft') {
          const drafts = this.getDraftTrips();
          const draftIndex = drafts.findIndex((trip) => trip.id === tripId);
          if (draftIndex !== -1) drafts[draftIndex] = mapped;
          else drafts.unshift(mapped);
          this.saveDraftTrips(drafts);
        } else {
          if (idx !== -1) trips[idx] = mapped;
          else trips.unshift(mapped);
          localStorage.setItem(getStorageKey(), JSON.stringify(trips));
        }
        return mapped;
      }
      return this.getTripById(tripId);
    } catch {
      return this.getTripById(tripId);
    }
  },

  /**
   * Retrieves upcoming trips sorted by start date
   */
  getUpcomingTrips(userId?: string): Trip[] {
    const trips = this.getUserTrips(userId);
    return trips.filter((t) => t.status === 'upcoming' || t.status === 'planning');
  },

  /**
   * Retrieves completed trips
   */
  getCompletedTrips(userId?: string): Trip[] {
    const trips = this.getUserTrips(userId);
    return trips.filter((t) => t.status === 'completed');
  },

  /**
   * Computes travel statistics
   */
  getTripStats(userId?: string): TripStats {
    const currentUser = authService.getCurrentUser();
    const effectiveUserId = userId || currentUser?.id;
    if (!authService.isAuthenticated()) {
      throw new Error('You must be signed in to create a trip.');
    }
    const trips = this.getUserTrips(effectiveUserId);
    const prefs = profileService.getPreferences(effectiveUserId) || profileService.getDefaultPreferences(effectiveUserId);

    const completedTrips = trips.filter((t) => t.status === 'completed');
    const uniqueCountries = new Set(completedTrips.map((t) => t.country).filter(Boolean));
    const uniqueCities = new Set(completedTrips.map((t) => t.destination).filter(Boolean));

    return {
      tripsPlanned: trips.length,
      countriesVisited: uniqueCountries.size,
      citiesExplored: uniqueCities.size,
      preferredBudget: prefs.budget,
    };
  },

  /**
   * Creates a new trip with PostgreSQL database persistence and multi-city support
   */
  async createTrip(tripData: Omit<Trip, 'id' | 'createdAt'>, userId?: string): Promise<Trip> {
    const currentUser = authService.getCurrentUser();
    const effectiveUserId = userId || currentUser?.id;
    const trips = this.getUserTrips(effectiveUserId);

    const tripId = `trip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const newTrip: Trip = {
      ...tripData,
      id: tripId,
      userId: effectiveUserId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const draftTrip = { ...newTrip, status: 'draft' as const };

    try {
      const key = getStorageKey(effectiveUserId);
      const draftRaw = localStorage.getItem(getDraftTripsStorageKey(effectiveUserId));
      const drafts: Trip[] = draftRaw ? JSON.parse(draftRaw) : [];
      localStorage.setItem(getDraftTripsStorageKey(effectiveUserId), JSON.stringify([draftTrip, ...drafts]));
      this.clearDraft(effectiveUserId);
    } catch {
      // Storage fallback
    }

    try {
      const serverTrip = await apiRequest<any>('/trips', {
        method: 'POST',
        body: JSON.stringify({
          id: tripId,
          name: tripData.name,
          destination: tripData.destination,
          country: tripData.country,
          coverImage: tripData.coverImage || getDeterministicCoverImage(tripData.destination, tripData.name),
          startDate: tripData.startDate,
          endDate: tripData.endDate,
          budget: tripData.budget,
          currency: tripData.currency,
          status: 'draft',
          cities: tripData.cities || [
            { cityName: tripData.destination, country: tripData.country, orderIndex: 0 }
          ],
        }),
      });

      if (!serverTrip?.id) {
        throw new Error('The server did not confirm the new trip.');
      }

      if (serverTrip.id !== tripId) {
        const currentTrips = this.getUserTrips(effectiveUserId);
        const foundIdx = currentTrips.findIndex((trip) => trip.id === tripId);
        if (foundIdx !== -1) {
          currentTrips[foundIdx].id = serverTrip.id;
          localStorage.setItem(getStorageKey(effectiveUserId), JSON.stringify(currentTrips));
        }
      }

      return { ...draftTrip, id: serverTrip.id };
    } catch (error) {
      const currentDrafts = this.getDraftTrips(effectiveUserId).filter((trip) => trip.id !== tripId);
      this.saveDraftTrips(currentDrafts, effectiveUserId);
      throw error;
    }
  },

  getDraftTrips(userId?: string): Trip[] {
    try {
      const raw = localStorage.getItem(getDraftTripsStorageKey(userId));
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  saveDraftTrips(drafts: Trip[], userId?: string): void {
    localStorage.setItem(getDraftTripsStorageKey(userId), JSON.stringify(drafts));
  },

  saveTrip(tripId: string, userId?: string): Trip | null {
    const draft = this.getDraftTrip(tripId, userId);
    if (!draft) return this.getTripById(tripId, userId);
    const savedTrip = { ...draft, status: 'planning' as const, updatedAt: new Date().toISOString() };
    this.saveDraftTrips(this.getDraftTrips(userId).filter((trip) => trip.id !== tripId), userId);
    const trips = this.getUserTrips(userId).filter((trip) => trip.id !== tripId);
    localStorage.setItem(getStorageKey(userId), JSON.stringify([savedTrip, ...trips]));
    if (authService.isAuthenticated()) {
      apiRequest(`/trips/${tripId}`, { method: 'PUT', body: JSON.stringify({ status: 'planning' }) })
        .catch((err) => console.log('Trip save sync:', err.message));
    }
    return savedTrip;
  },

  async addTrip(tripData: Omit<Trip, 'id' | 'createdAt'>, userId?: string): Promise<Trip> {
    return this.createTrip(tripData, userId);
  },

  /**
   * Updates an existing trip
   */
  updateTrip(tripId: string, updates: Partial<Trip>, userId?: string): Trip | null {
    const currentUser = authService.getCurrentUser();
    const effectiveUserId = userId || currentUser?.id;
    const trips = this.getUserTrips(effectiveUserId);
    const index = trips.findIndex((t) => t.id === tripId);

    if (index === -1) return null;

    const updatedTrip: Trip = {
      ...trips[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    trips[index] = updatedTrip;

    try {
      const key = getStorageKey(effectiveUserId);
      localStorage.setItem(key, JSON.stringify(trips));
    } catch {
      // storage fallback
    }

    // Persist to PostgreSQL backend
    if (authService.isAuthenticated() && !tripId.startsWith('temp_')) {
      apiRequest(`/trips/${tripId}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: updates.name,
          startDate: updates.startDate,
          endDate: updates.endDate,
          budget: updates.budget,
          currency: updates.currency,
          status: updates.status,
          isFavorite: updates.isFavorite,
          isPinned: updates.isPinned,
        }),
      }).catch((err) => console.log('Trip update DB sync:', err.message));
    }

    return updatedTrip;
  },

  /**
   * Toggles the favorite status of a trip
   */
  toggleFavorite(tripId: string, userId?: string): Trip | null {
    const trip = this.getTripById(tripId, userId);
    if (!trip) return null;
    return this.updateTrip(tripId, { isFavorite: !trip.isFavorite }, userId);
  },

  /**
   * Toggles the pinned status of a trip
   */
  togglePinned(tripId: string, userId?: string): Trip | null {
    const trip = this.getTripById(tripId, userId);
    if (!trip) return null;
    return this.updateTrip(tripId, { isPinned: !trip.isPinned }, userId);
  },

  /**
   * Duplicates an existing trip
   */
  async duplicateTrip(tripId: string, userId?: string): Promise<Trip | null> {
    const original = this.getTripById(tripId, userId);
    if (!original) return null;

    const { id, createdAt, updatedAt, isPinned, isFavorite, ...rest } = original;
    const duplicatedTrip = await this.createTrip(
      {
        ...rest,
        name: `${original.name} (Copy)`,
        status: 'planning',
        isFavorite: false,
        isPinned: false,
      },
      userId
    );

    return duplicatedTrip;
  },

  /**
   * Deletes a trip by ID
   */
  deleteTrip(tripId: string, userId?: string): boolean {
    const currentUser = authService.getCurrentUser();
    const effectiveUserId = userId || currentUser?.id;
    const trips = this.getUserTrips(effectiveUserId);
    const filtered = trips.filter((t) => t.id !== tripId);

    try {
      const key = getStorageKey(effectiveUserId);
      localStorage.setItem(key, JSON.stringify(filtered));
    } catch {
      return false;
    }

    // Persist delete to PostgreSQL backend
    if (authService.isAuthenticated() && !tripId.startsWith('temp_')) {
      apiRequest(`/trips/${tripId}`, {
        method: 'DELETE',
      }).catch((err) => console.log('Trip delete DB sync:', err.message));
    }

    return true;
  },

  deleteAllTrips(userId?: string): boolean {
    const currentUser = authService.getCurrentUser();
    const effectiveUserId = userId || currentUser?.id;
    const trips = this.getUserTrips(effectiveUserId);

    try {
      localStorage.setItem(getStorageKey(effectiveUserId), JSON.stringify([]));
    } catch {
      return false;
    }

    if (authService.isAuthenticated()) {
      trips.forEach((trip) => {
        if (!trip.id.startsWith('temp_')) {
          apiRequest(`/trips/${trip.id}`, { method: 'DELETE' }).catch((err) =>
            console.log('Trip bulk delete sync:', err.message)
          );
        }
      });
    }

    return true;
  },

  /**
   * Restores a deleted trip (Undo action)
   */
  restoreTrip(trip: Trip, userId?: string): boolean {
    const currentUser = authService.getCurrentUser();
    const effectiveUserId = userId || currentUser?.id;
    const trips = this.getUserTrips(effectiveUserId);

    if (trips.some((t) => t.id === trip.id)) {
      return true;
    }

    const updated = [trip, ...trips];
    try {
      const key = getStorageKey(effectiveUserId);
      localStorage.setItem(key, JSON.stringify(updated));
    } catch {
      return false;
    }

    // Re-create in DB
    if (authService.isAuthenticated()) {
      apiRequest('/trips', {
        method: 'POST',
        body: JSON.stringify({
          name: trip.name,
          destination: trip.destination,
          country: trip.country,
          startDate: trip.startDate,
          endDate: trip.endDate,
          budget: trip.budget,
          currency: trip.currency,
        }),
      }).catch(() => {});
    }

    return true;
  },

  /**
   * Saves trip planner draft
   */
  saveDraft(draft: TripPlannerDraft, userId?: string): void {
    try {
      const currentUser = authService.getCurrentUser();
      const effectiveUserId = userId || currentUser?.id;
      const key = getDraftStorageKey(effectiveUserId);
      localStorage.setItem(key, JSON.stringify({
        ...draft,
        updatedAt: new Date().toISOString(),
      }));
    } catch {
      // Storage fallback
    }
  },

  /**
   * Retrieves active draft if any
   */
  getDraft(userId?: string): TripPlannerDraft | null {
    try {
      const currentUser = authService.getCurrentUser();
      const effectiveUserId = userId || currentUser?.id;
      const key = getDraftStorageKey(effectiveUserId);
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  /**
   * Clears saved draft
   */
  clearDraft(userId?: string): void {
    try {
      const currentUser = authService.getCurrentUser();
      const effectiveUserId = userId || currentUser?.id;
      const key = getDraftStorageKey(effectiveUserId);
      localStorage.removeItem(key);
    } catch {
      // Storage fallback
    }
  },

  /**
   * Checks if draft exists
   */
  hasDraft(userId?: string): boolean {
    return this.getDraft(userId) !== null;
  },

  /**
   * Adds an item / recommendation to a trip
   */
  addTripItem(
    tripId: string,
    item: Omit<TripItem, 'id' | 'addedAt'>,
    userId?: string
  ): TripItem | null {
    const trip = this.getTripById(tripId, userId);
    if (!trip) return null;

    const newItem: TripItem = {
      ...item,
      id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 7)}`,
      addedAt: new Date().toISOString(),
    };

    const currentItems = trip.items || [];
    const exists = currentItems.some((i) => i.recommendationId === item.recommendationId);
    if (exists) {
      return currentItems.find((i) => i.recommendationId === item.recommendationId) || null;
    }

    const updatedItems = [...currentItems, newItem];
    this.updateTrip(tripId, { items: updatedItems }, userId);
    return newItem;
  },

  /**
   * Removes an item from a trip by item ID or recommendation ID
   */
  removeTripItem(tripId: string, itemOrRecId: string, userId?: string): boolean {
    const trip = this.getTripById(tripId, userId);
    if (!trip || !trip.items) return false;

    const updatedItems = trip.items.filter(
      (i) => i.id !== itemOrRecId && i.recommendationId !== itemOrRecId
    );

    this.updateTrip(tripId, { items: updatedItems }, userId);
    return true;
  },

  /**
   * Gets all items saved in a trip
   */
  getTripItems(tripId: string, userId?: string): TripItem[] {
    const trip = this.getTripById(tripId, userId);
    return trip?.items || [];
  },

  /**
   * Saves a recommendation ID into the trip's bookmarked list
   */
  saveRecommendation(tripId: string, recommendationId: string, userId?: string): void {
    const trip = this.getTripById(tripId, userId);
    if (!trip) return;

    const currentSaved = trip.savedRecommendationIds || [];
    if (!currentSaved.includes(recommendationId)) {
      this.updateTrip(tripId, { savedRecommendationIds: [...currentSaved, recommendationId] }, userId);
    }
  },

  /**
   * Removes a recommendation ID from the saved list
   */
  removeSavedRecommendation(tripId: string, recommendationId: string, userId?: string): void {
    const trip = this.getTripById(tripId, userId);
    if (!trip || !trip.savedRecommendationIds) return;

    const updatedSaved = trip.savedRecommendationIds.filter((id) => id !== recommendationId);
    this.updateTrip(tripId, { savedRecommendationIds: updatedSaved }, userId);
  },

  /**
   * Gets all saved recommendation IDs for a trip
   */
  getSavedRecommendations(tripId: string, userId?: string): string[] {
    const trip = this.getTripById(tripId, userId);
    return trip?.savedRecommendationIds || [];
  },
};
