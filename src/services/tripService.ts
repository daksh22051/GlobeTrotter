/**
 * Trip Data Service
 * 
 * Manages user trips, statistics, and persistence.
 * Defaults to clean zero-state for new users while supporting local storage persistence.
 */

import { Trip, TripStats, TripPlannerDraft, TripItem } from '../types/trip';
import { authService } from './authService';
import { profileService } from './profileService';

const STORAGE_KEY_PREFIX = 'globetrotter_trips';
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

export const tripService = {
  /**
   * Retrieves all trips associated with the user
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

  getTrips(userId?: string): Trip[] {
    return this.getUserTrips(userId);
  },

  /**
   * Retrieves a single trip by ID
   */
  getTripById(tripId: string, userId?: string): Trip | null {
    const trips = this.getUserTrips(userId);
    return trips.find((t) => t.id === tripId) || null;
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
   * Computes accurate travel statistics without faking achievements
   */
  getTripStats(userId?: string): TripStats {
    const currentUser = authService.getCurrentUser();
    const effectiveUserId = userId || currentUser?.id;
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
   * Creates a new trip and persists it
   */
  createTrip(tripData: Omit<Trip, 'id' | 'createdAt'>, userId?: string): Trip {
    const currentUser = authService.getCurrentUser();
    const effectiveUserId = userId || currentUser?.id;
    const trips = this.getUserTrips(effectiveUserId);

    const newTrip: Trip = {
      ...tripData,
      id: `trip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: effectiveUserId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = [newTrip, ...trips];

    try {
      const key = getStorageKey(effectiveUserId);
      localStorage.setItem(key, JSON.stringify(updated));
      // Once created, clear any active draft
      this.clearDraft(effectiveUserId);
    } catch {
      // Storage fallback
    }

    return newTrip;
  },

  /**
   * Adds a new trip (alias for createTrip for backward compatibility)
   */
  addTrip(tripData: Omit<Trip, 'id' | 'createdAt'>, userId?: string): Trip {
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
   * Duplicates an existing trip, copying its details, preferences, and structure into a new draft
   */
  duplicateTrip(tripId: string, userId?: string): Trip | null {
    const original = this.getTripById(tripId, userId);
    if (!original) return null;

    const { id, createdAt, updatedAt, isPinned, isFavorite, ...rest } = original;
    const duplicatedTrip = this.createTrip(
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
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Restores a deleted trip (Undo action)
   */
  restoreTrip(trip: Trip, userId?: string): boolean {
    const currentUser = authService.getCurrentUser();
    const effectiveUserId = userId || currentUser?.id;
    const trips = this.getUserTrips(effectiveUserId);

    // If trip is already present, return true
    if (trips.some((t) => t.id === trip.id)) {
      return true;
    }

    const updated = [trip, ...trips];
    try {
      const key = getStorageKey(effectiveUserId);
      localStorage.setItem(key, JSON.stringify(updated));
      return true;
    } catch {
      return false;
    }
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
    // Check if already added by recommendationId
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

