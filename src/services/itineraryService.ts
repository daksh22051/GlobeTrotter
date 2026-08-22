/**
 * Itinerary Management Service
 * 
 * Central persistence, state management, and CRUD operations for trip itineraries.
 */

import { Itinerary, ItineraryDay, ItineraryActivity } from '../types/itinerary';
import { Trip } from '../types/trip';
import { Recommendation } from '../types/recommendation';
import { authService } from './authService';
import { mockRecommendations } from '../data/mockRecommendations';
import { calculateEndTime } from '../utils/itineraryConflictDetector';

const STORAGE_KEY_PREFIX = 'globetrotter_itineraries';

const getStorageKey = (userId?: string): string => {
  const currentUser = authService.getCurrentUser();
  const id = userId || currentUser?.id || 'guest';
  return `${STORAGE_KEY_PREFIX}_${id}`;
};

/**
 * Formats a Date object into a readable display string, e.g. "Tuesday, Nov 13"
 */
function formatDateDisplay(date: Date): string {
  try {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return 'Day Plan';
  }
}

/**
 * Formats a Date object to "YYYY-MM-DD"
 */
function formatDateISO(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Generates default day structure for a trip
 */
export function generateDefaultDays(trip: Trip): ItineraryDay[] {
  const duration = Math.max(1, Math.min(trip.durationDays || 3, 14));
  const days: ItineraryDay[] = [];
  
  let baseDate = new Date();
  if (trip.startDate) {
    const parsed = new Date(trip.startDate);
    if (!isNaN(parsed.getTime())) {
      baseDate = parsed;
    }
  }

  const sampleThemes = [
    'Arrival & City Overview',
    'Historic Landmarks & Culture',
    'Food Trails & Local Markets',
    'Nature & Scenic Escapes',
    'Art, Modern Vibes & Shopping',
    'Hidden Gems & Neighborhoods',
    'Relaxation & Sunset Vistas',
    'Day Excursions & Heritage',
    'Farewell Highlights & Souvenirs',
  ];

  for (let i = 0; i < duration; i++) {
    const dayDate = new Date(baseDate);
    dayDate.setDate(baseDate.getDate() + i);

    const themeIndex = i % sampleThemes.length;
    days.push({
      id: `day_${trip.id}_${i + 1}`,
      dayNumber: i + 1,
      date: formatDateISO(dayDate),
      dateDisplay: formatDateDisplay(dayDate),
      title: sampleThemes[themeIndex],
      theme: sampleThemes[themeIndex],
      activities: [],
    });
  }

  return days;
}

/**
 * Converts a recommendation or trip item into a full ItineraryActivity
 */
export function recommendationToActivity(
  rec: Recommendation | { id: string; name: string; category?: string; type?: string; location?: string; image?: string; estimatedCost?: number; duration?: string; currency?: string },
  dayNumber?: number,
  startTime: string = '10:00'
): ItineraryActivity {
  const category = (rec as any).category || (rec as any).type || 'place';
  const name = (rec as any).name || (rec as any).title || 'Custom Activity';
  const duration = (rec as any).duration || (category === 'food' ? '1.5 hours' : category === 'hotel' ? 'Overnight' : '2 hours');
  
  let durationMins = 90;
  if (duration.includes('1 hour') || duration === '1 hr') durationMins = 60;
  else if (duration.includes('2 hour') || duration === '2 hrs') durationMins = 120;
  else if (duration.includes('3 hour') || duration === '3 hrs') durationMins = 180;
  else if (duration.includes('30 min') || duration === '45 min') durationMins = 45;

  return {
    id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    recommendationId: rec.id,
    title: name,
    category: category as any,
    location: rec.location || 'Central Area',
    startTime,
    duration,
    durationMinutes: durationMins,
    estimatedCost: typeof rec.estimatedCost === 'number' ? rec.estimatedCost : 1200,
    currency: (rec as any).currency || 'INR',
    notes: (rec as any).description || (rec as any).whyRecommended || '',
    image: rec.image || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80',
    status: dayNumber ? 'Scheduled' : 'Unscheduled',
    dayNumber,
    tags: (rec as any).tags || [],
  };
}

export const itineraryService = {
  /**
   * Loads all stored itineraries from local storage
   */
  getAllItineraries(userId?: string): Record<string, Itinerary> {
    try {
      const key = getStorageKey(userId);
      const raw = localStorage.getItem(key);
      if (!raw) return {};
      return JSON.parse(raw);
    } catch {
      return {};
    }
  },

  /**
   * Gets or initializes an itinerary for a trip
   */
  getItinerary(tripId: string, trip?: Trip): Itinerary {
    const all = this.getAllItineraries(trip?.userId);
    if (all[tripId]) {
      return all[tripId];
    }

    // If no existing itinerary, build an initial journey using trip's saved items or recommendations
    const days = trip ? generateDefaultDays(trip) : [];
    const unscheduledActivities: ItineraryActivity[] = [];

    if (trip) {
      // 1. If trip has trip.items, populate them
      if (trip.items && trip.items.length > 0) {
        let currentDayIdx = 0;
        let timeOffset = 9 * 60 + 30; // 09:30 AM

        trip.items.forEach((item, index) => {
          const act = recommendationToActivity(item as any);
          if (days.length > 0) {
            const targetDay = days[currentDayIdx];
            const startHour = Math.floor(timeOffset / 60);
            const startMin = timeOffset % 60;
            const startStr = `${startHour.toString().padStart(2, '0')}:${startMin.toString().padStart(2, '0')}`;

            targetDay.activities.push({
              ...act,
              startTime: startStr,
              status: 'Scheduled',
              dayNumber: targetDay.dayNumber,
            });

            timeOffset += act.durationMinutes + 60;
            if (timeOffset > 18 * 60) {
              timeOffset = 9 * 60 + 30;
              currentDayIdx = (currentDayIdx + 1) % days.length;
            }
          } else {
            unscheduledActivities.push(act);
          }
        });
      } else {
        // 2. Starter suggestions from mock recommendations matching destination
        const destLower = trip.destination.toLowerCase();
        const matches = mockRecommendations.filter(
          (m) => m.destination.toLowerCase().includes(destLower) || m.country.toLowerCase().includes(destLower)
        );
        const starters = matches.length > 0 ? matches.slice(0, 6) : mockRecommendations.slice(0, 6);

        let dayIdx = 0;
        const timeSlots = ['09:30', '13:00', '16:30'];

        starters.forEach((rec, idx) => {
          const day = days[dayIdx];
          const slot = timeSlots[idx % timeSlots.length];
          if (day) {
            day.activities.push(
              recommendationToActivity(rec, day.dayNumber, slot)
            );
          } else {
            unscheduledActivities.push(recommendationToActivity(rec));
          }

          if ((idx + 1) % 2 === 0) {
            dayIdx = (dayIdx + 1) % (days.length || 1);
          }
        });
      }
    }

    const newItinerary: Itinerary = {
      id: `itin_${tripId}`,
      tripId,
      userId: trip?.userId,
      title: trip ? `${trip.name} Itinerary` : 'My Itinerary',
      destination: trip?.destination || 'Destination',
      country: trip?.country || '',
      days,
      unscheduledActivities,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.saveItinerary(newItinerary, trip?.userId);
    return newItinerary;
  },

  /**
   * Persists an itinerary
   */
  saveItinerary(itinerary: Itinerary, userId?: string): boolean {
    try {
      const all = this.getAllItineraries(userId || itinerary.userId);
      all[itinerary.tripId] = {
        ...itinerary,
        updatedAt: new Date().toISOString(),
      };
      const key = getStorageKey(userId || itinerary.userId);
      localStorage.setItem(key, JSON.stringify(all));
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Adds an activity to a specific day or unscheduled area
   */
  addActivity(
    itinerary: Itinerary,
    activityData: Partial<ItineraryActivity>,
    targetDayNumber?: number
  ): Itinerary {
    const newAct: ItineraryActivity = {
      id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: activityData.title || 'New Activity',
      category: activityData.category || 'place',
      location: activityData.location || itinerary.destination,
      startTime: activityData.startTime || (targetDayNumber ? '10:00' : ''),
      duration: activityData.duration || '2 hours',
      durationMinutes: activityData.durationMinutes || 120,
      estimatedCost: typeof activityData.estimatedCost === 'number' ? activityData.estimatedCost : 0,
      currency: activityData.currency || 'INR',
      notes: activityData.notes || '',
      image: activityData.image || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80',
      status: targetDayNumber ? 'Scheduled' : 'Unscheduled',
      dayNumber: targetDayNumber,
      bookingReference: activityData.bookingReference,
      bookingUrl: activityData.bookingUrl,
      tags: activityData.tags || [],
      mealType: activityData.mealType,
    };

    let updatedDays = [...(itinerary.days || [])];
    let updatedUnscheduled = [...(itinerary.unscheduledActivities || [])];

    if (targetDayNumber) {
      updatedDays = updatedDays.map((day) => {
        if (day.dayNumber === targetDayNumber) {
          return {
            ...day,
            activities: [...day.activities, newAct],
          };
        }
        return day;
      });
    } else {
      updatedUnscheduled.push(newAct);
    }

    const updatedItinerary: Itinerary = {
      ...itinerary,
      days: updatedDays,
      unscheduledActivities: updatedUnscheduled,
      updatedAt: new Date().toISOString(),
    };

    this.saveItinerary(updatedItinerary);
    return updatedItinerary;
  },

  /**
   * Updates an existing activity by ID anywhere in the itinerary
   */
  updateActivity(
    itinerary: Itinerary,
    activityId: string,
    updates: Partial<ItineraryActivity>
  ): Itinerary {
    let activityFound = false;

    const updatedDays = (itinerary.days || []).map((day) => {
      const idx = day.activities.findIndex((a) => a.id === activityId);
      if (idx !== -1) {
        activityFound = true;
        const current = day.activities[idx];
        const merged: ItineraryActivity = {
          ...current,
          ...updates,
          id: current.id, // preserve ID
        };

        // If dayNumber was changed, remove from here (it will be placed in target day)
        if (updates.dayNumber && updates.dayNumber !== day.dayNumber) {
          return {
            ...day,
            activities: day.activities.filter((a) => a.id !== activityId),
          };
        }

        const newActivities = [...day.activities];
        newActivities[idx] = merged;
        return {
          ...day,
          activities: newActivities,
        };
      }
      return day;
    });

    let updatedUnscheduled = (itinerary.unscheduledActivities || []).map((act) => {
      if (act.id === activityId) {
        activityFound = true;
        return {
          ...act,
          ...updates,
        };
      }
      return act;
    });

    // If day was updated and target is different, place in new day
    if (updates.dayNumber) {
      const targetDay = updatedDays.find((d) => d.dayNumber === updates.dayNumber);
      const isAlreadyInTarget = targetDay?.activities.some((a) => a.id === activityId);
      if (targetDay && !isAlreadyInTarget) {
        // Find existing activity from old place
        let actToMove: ItineraryActivity | undefined;
        itinerary.days.forEach((d) => {
          const found = d.activities.find((a) => a.id === activityId);
          if (found) actToMove = found;
        });
        if (!actToMove) {
          actToMove = itinerary.unscheduledActivities.find((a) => a.id === activityId);
          updatedUnscheduled = updatedUnscheduled.filter((a) => a.id !== activityId);
        }

        if (actToMove) {
          targetDay.activities.push({
            ...actToMove,
            ...updates,
            dayNumber: updates.dayNumber,
            status: 'Scheduled',
          });
        }
      }
    }

    const updated: Itinerary = {
      ...itinerary,
      days: updatedDays,
      unscheduledActivities: updatedUnscheduled,
      updatedAt: new Date().toISOString(),
    };

    this.saveItinerary(updated);
    return updated;
  },

  /**
   * Removes an activity from the itinerary
   */
  removeActivity(itinerary: Itinerary, activityId: string): Itinerary {
    const updatedDays = (itinerary.days || []).map((day) => ({
      ...day,
      activities: day.activities.filter((a) => a.id !== activityId),
    }));

    const updatedUnscheduled = (itinerary.unscheduledActivities || []).filter(
      (a) => a.id !== activityId
    );

    const updated: Itinerary = {
      ...itinerary,
      days: updatedDays,
      unscheduledActivities: updatedUnscheduled,
      updatedAt: new Date().toISOString(),
    };

    this.saveItinerary(updated);
    return updated;
  },

  /**
   * Duplicates an activity
   */
  duplicateActivity(itinerary: Itinerary, activityId: string): Itinerary {
    let foundAct: ItineraryActivity | null = null;
    let foundDayNumber: number | undefined;

    for (const day of itinerary.days || []) {
      const match = day.activities.find((a) => a.id === activityId);
      if (match) {
        foundAct = match;
        foundDayNumber = day.dayNumber;
        break;
      }
    }

    if (!foundAct) {
      foundAct = (itinerary.unscheduledActivities || []).find((a) => a.id === activityId) || null;
    }

    if (!foundAct) return itinerary;

    const duplicated: ItineraryActivity = {
      ...foundAct,
      id: `act_${Date.now()}_copy_${Math.random().toString(36).substring(2, 6)}`,
      title: `${foundAct.title} (Copy)`,
      isCopied: true,
    };

    return this.addActivity(itinerary, duplicated, foundDayNumber);
  },

  /**
   * Moves an activity to a target day, or unscheduled, and adjusts position/time
   */
  moveActivity(
    itinerary: Itinerary,
    activityId: string,
    targetDayNumber: number | null,
    newIndex?: number,
    newStartTime?: string
  ): Itinerary {
    let sourceActivity: ItineraryActivity | null = null;

    // 1. Extract activity from current location
    const cleanDays = (itinerary.days || []).map((day) => {
      const found = day.activities.find((a) => a.id === activityId);
      if (found) {
        sourceActivity = found;
      }
      return {
        ...day,
        activities: day.activities.filter((a) => a.id !== activityId),
      };
    });

    let cleanUnscheduled = (itinerary.unscheduledActivities || []).filter((a) => {
      if (a.id === activityId) {
        sourceActivity = a;
        return false;
      }
      return true;
    });

    if (!sourceActivity) return itinerary;

    const movedAct: ItineraryActivity = {
      ...(sourceActivity as ItineraryActivity),
      status: targetDayNumber ? 'Scheduled' : 'Unscheduled',
      dayNumber: targetDayNumber || undefined,
      startTime: newStartTime || (targetDayNumber ? (sourceActivity as ItineraryActivity).startTime || '10:00' : ''),
    };

    // 2. Place into target destination
    if (targetDayNumber) {
      const targetDay = cleanDays.find((d) => d.dayNumber === targetDayNumber);
      if (targetDay) {
        if (typeof newIndex === 'number' && newIndex >= 0 && newIndex <= targetDay.activities.length) {
          targetDay.activities.splice(newIndex, 0, movedAct);
        } else {
          targetDay.activities.push(movedAct);
        }
      }
    } else {
      cleanUnscheduled.push(movedAct);
    }

    const updated: Itinerary = {
      ...itinerary,
      days: cleanDays,
      unscheduledActivities: cleanUnscheduled,
      updatedAt: new Date().toISOString(),
    };

    this.saveItinerary(updated);
    return updated;
  },

  /**
   * Reorders activities within the same day
   */
  reorderActivities(
    itinerary: Itinerary,
    dayNumber: number,
    sourceIndex: number,
    destinationIndex: number
  ): Itinerary {
    const updatedDays = (itinerary.days || []).map((day) => {
      if (day.dayNumber === dayNumber) {
        const list = [...day.activities];
        const [moved] = list.splice(sourceIndex, 1);
        if (moved) {
          list.splice(destinationIndex, 0, moved);
        }
        return {
          ...day,
          activities: list,
        };
      }
      return day;
    });

    const updated: Itinerary = {
      ...itinerary,
      days: updatedDays,
      updatedAt: new Date().toISOString(),
    };

    this.saveItinerary(updated);
    return updated;
  },

  /**
   * Deletes an itinerary for a trip
   */
  deleteItinerary(tripId: string, userId?: string): boolean {
    try {
      const all = this.getAllItineraries(userId);
      if (all[tripId]) {
        delete all[tripId];
        const key = getStorageKey(userId);
        localStorage.setItem(key, JSON.stringify(all));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },

  /**
   * Duplicates an existing itinerary for a new trip
   */
  duplicateItinerary(sourceTripId: string, targetTripId: string, newTrip: Trip, userId?: string): Itinerary | null {
    const existing = this.getItinerary(sourceTripId);
    if (!existing) return null;

    const clonedDays = (existing.days || []).map((d) => ({
      ...d,
      id: `day_${targetTripId}_${d.dayNumber}`,
      activities: (d.activities || []).map((a) => ({
        ...a,
        id: `act_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      })),
    }));

    const clonedUnscheduled = (existing.unscheduledActivities || []).map((a) => ({
      ...a,
      id: `act_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    }));

    const clonedItinerary: Itinerary = {
      id: `itin_${targetTripId}`,
      tripId: targetTripId,
      destination: newTrip.destination,
      days: clonedDays,
      unscheduledActivities: clonedUnscheduled,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.saveItinerary(clonedItinerary, userId);
    return clonedItinerary;
  },

  /**
   * Restores an itinerary (for Undo deletion)
   */
  restoreItinerary(itinerary: Itinerary, userId?: string): boolean {
    return this.saveItinerary(itinerary, userId);
  },
};
