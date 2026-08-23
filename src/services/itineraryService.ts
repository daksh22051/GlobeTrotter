/**
 * Itinerary Management Service
 * 
 * Central persistence, state management, and CRUD operations for trip itineraries.
 * Connected to PostgreSQL backend with optimistic local caching.
 */

import { Itinerary, ItineraryDay, ItineraryActivity } from '../types/itinerary';
import { Trip, TripItem } from '../types/trip';
import { Recommendation } from '../types/recommendation';
import { authService } from './authService';
import { apiRequest } from './apiClient';
import { buildTripRecommendations } from '../utils/recommendationMatcher';

const STORAGE_KEY_PREFIX = 'globetrotter_itineraries';

const getStorageKey = (userId?: string): string => {
  const currentUser = authService.getCurrentUser();
  const id = userId || currentUser?.id || 'guest';
  return `${STORAGE_KEY_PREFIX}_${id}`;
};

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

function formatDateISO(date: Date): string {
  return date.toISOString().split('T')[0];
}

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

  const orderedCities = [...(trip.cities || [])]
    .filter((city) => city.cityName.trim())
    .sort((a, b) => a.orderIndex - b.orderIndex);
  let cityIndex = 0;
  let cityDayCount = 0;

  for (let i = 0; i < duration; i++) {
    const city = orderedCities.length > 0 ? orderedCities[cityIndex] : undefined;
    const cityStay = city?.stayDurationDays || 1;
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
      cityName: city?.cityName || trip.destination,
      cityCountry: city?.country || trip.country,
      stopIndex: city ? cityIndex : undefined,
      activities: [],
    });

    if (city) {
      cityDayCount += 1;
      if (cityDayCount >= cityStay && cityIndex < orderedCities.length - 1) {
        cityIndex += 1;
        cityDayCount = 0;
      }
    }
  }

  return days;
}

export function recommendationToActivity(
  rec: Recommendation | { id: string; name?: string; title?: string; category?: string; type?: string; location?: string; image?: string; estimatedCost?: number; duration?: string; currency?: string; latitude?: number; longitude?: number },
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
    latitude: typeof (rec as any).latitude === 'number' && !isNaN((rec as any).latitude) && (rec as any).latitude !== 0 ? (rec as any).latitude : undefined,
    longitude: typeof (rec as any).longitude === 'number' && !isNaN((rec as any).longitude) && (rec as any).longitude !== 0 ? (rec as any).longitude : undefined,
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
   * Fetch itinerary asynchronously from PostgreSQL
   */
  async fetchItinerary(tripId: string): Promise<Itinerary | null> {
    try {
      const serverItin = await apiRequest<any>(`/trips/${tripId}/itinerary`);
      if (serverItin) {
        const days: ItineraryDay[] = (serverItin.days || []).map((d: any) => ({
          id: d.id,
          dayNumber: d.dayNumber,
          date: d.date,
          dateDisplay: formatDateDisplay(new Date(d.date)),
          title: d.title,
          theme: d.theme,
          activities: (d.activities || []).map((a: any) => ({
            id: a.id,
            recommendationId: a.id,
            title: a.title,
            category: (a.category?.toLowerCase() || 'place') as any,
            location: a.location || '',
            latitude: typeof a.latitude === 'number' && !isNaN(a.latitude) ? a.latitude : undefined,
            longitude: typeof a.longitude === 'number' && !isNaN(a.longitude) ? a.longitude : undefined,
            startTime: a.startTime || '10:00',
            duration: `${a.durationMinutes || 60} mins`,
            durationMinutes: a.durationMinutes || 60,
            estimatedCost: Number(a.cost) || 0,
            currency: a.currency || 'INR',
            notes: a.notes || '',
            status: 'Scheduled' as const,
            dayNumber: d.dayNumber,
            image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80',
          })),
        }));

        const mapped: Itinerary = {
          id: serverItin.id,
          tripId: serverItin.tripId,
          title: serverItin.title,
          destination: serverItin.destination,
          country: serverItin.country,
          days,
          unscheduledActivities: (serverItin.unscheduledActivities || []).map((a: any) => ({
            id: a.id,
            recommendationId: a.id,
            title: a.title,
            category: (a.category?.toLowerCase() || 'place') as any,
            location: a.location || '',
            latitude: typeof a.latitude === 'number' && !isNaN(a.latitude) ? a.latitude : undefined,
            longitude: typeof a.longitude === 'number' && !isNaN(a.longitude) ? a.longitude : undefined,
            startTime: a.startTime || '',
            duration: `${a.durationMinutes || 60} mins`,
            durationMinutes: a.durationMinutes || 60,
            estimatedCost: Number(a.cost) || 0,
            currency: a.currency || 'INR',
            notes: a.notes || '',
            status: 'Unscheduled' as const,
            image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80',
          })),
          createdAt: serverItin.createdAt || new Date().toISOString(),
          updatedAt: serverItin.updatedAt || new Date().toISOString(),
        };

        const all = this.getAllItineraries();
        all[tripId] = mapped;
        localStorage.setItem(getStorageKey(), JSON.stringify(all));
        return mapped;
      }
      return null;
    } catch {
      return null;
    }
  },

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

  seedTripItems(itinerary: Itinerary, trip: Trip): Itinerary {
    const hasRecommendationId = (id: string | undefined): id is string =>
      typeof id === 'string' && id.length > 0;
    const existingRecommendationIds = new Set<string>([
      ...itinerary.days.flatMap((day) =>
        (day.activities || [])
          .map((activity) => activity.recommendationId)
          .filter(hasRecommendationId)
      ),
      ...(itinerary.unscheduledActivities || [])
        .map((activity) => activity.recommendationId)
        .filter(hasRecommendationId),
    ]);
    const missingItems = (trip.items || []).filter((item) => !existingRecommendationIds.has(item.recommendationId));

    if (missingItems.length === 0) return itinerary;

    const days: ItineraryDay[] = (itinerary.days || []).map((day) => ({
      ...day,
      activities: [...(day.activities || [])],
    }));
    const unscheduledActivities: ItineraryActivity[] = [
      ...(itinerary.unscheduledActivities || []),
    ];
    const timeSlots = ['09:30', '13:30', '17:00'];

    missingItems.forEach((item, index) => {
      const activity = recommendationToActivity(item as any);
      const day = days[index % (days.length || 1)];

      if (!day) {
        unscheduledActivities.push(activity);
        return;
      }

      days[index % days.length].activities.push({
        ...activity,
        startTime: timeSlots[index % timeSlots.length],
        status: 'Scheduled',
        dayNumber: day.dayNumber,
      });
    });

    return {
      ...itinerary,
      days,
      unscheduledActivities,
      updatedAt: new Date().toISOString(),
    };
  },

  getItinerary(tripId: string, trip?: Trip): Itinerary {
    const all = this.getAllItineraries(trip?.userId);
    if (all[tripId]) {
      let existing = trip ? this.seedTripItems(all[tripId], trip) : all[tripId];
      if (trip && existing.days.length > 0) {
        const seenRecommendationIds = new Set<string>();
        let timelineChanged = false;
        const days = existing.days.map((day) => ({
          ...day,
          activities: day.activities.filter((activity) => {
            const normalizedTitle = activity.title.trim().toLowerCase();
            const recommendationKey = activity.recommendationId || '';
            if (seenRecommendationIds.has(recommendationKey) || seenRecommendationIds.has(normalizedTitle)) {
              timelineChanged = true;
              return false;
            }
            if (recommendationKey) seenRecommendationIds.add(recommendationKey);
            seenRecommendationIds.add(normalizedTitle);
            if (activity.recommendationId === 'udaipur_amrai' || normalizedTitle.includes('amrai waterfront')) {
              activity.title = 'Amrai Restaurant at Amet Haveli';
              timelineChanged = true;
            }
            return true;
          }),
        }));
        const hasSightseeing = days.some((day) =>
          day.activities.some((activity) => activity.category === 'place' || activity.category === 'experience')
        );
        if (!hasSightseeing) {
          const recommendations = buildTripRecommendations(trip);
          const sightseeing = [...recommendations.places, ...recommendations.attractions][0];
          if (sightseeing && !seenRecommendationIds.has(sightseeing.id)) {
            days[0].activities.unshift(recommendationToActivity(sightseeing, days[0].dayNumber, '09:30'));
            timelineChanged = true;
          }
        }
        if (timelineChanged || days.some((day, index) => day.activities.length !== existing.days[index].activities.length)) {
          existing = { ...existing, days, updatedAt: new Date().toISOString() };
        }
      }
      const totalActivities = existing.days.reduce((acc, d) => acc + d.activities.length, 0);
      if (totalActivities > 0) {
        const emptyDays = existing.days.filter((day) => day.activities.length === 0);
        if (trip && emptyDays.length > 0) {
          const recommendations = buildTripRecommendations(trip).allRecommendations;
          const usedIds = new Set<string>(
            existing.days
              .flatMap((day) => (day.activities || []).map((activity) => activity.recommendationId))
              .filter((id): id is string => typeof id === 'string' && id.length > 0)
          );
          const available = recommendations.filter((recommendation) => !usedIds.has(recommendation.id));
          const repairedDays = existing.days.map((day) => {
            if (day.activities.length > 0) return day;
            const recommendation = available.shift();
            if (!recommendation) return day;
            return {
              ...day,
              activities: [recommendationToActivity(recommendation, day.dayNumber, '10:00')],
            };
          });
          if (repairedDays.some((day, index) => day.activities.length !== existing.days[index].activities.length)) {
            const repaired = { ...existing, days: repairedDays, updatedAt: new Date().toISOString() };
            this.saveItinerary(repaired, trip.userId);
            return repaired;
          }
        }
        if (existing !== all[tripId]) this.saveItinerary(existing, trip?.userId);
        return existing;
      }

      if (existing !== all[tripId]) {
        this.saveItinerary(existing, trip?.userId);
        return existing;
      }
    }

    const days = trip ? generateDefaultDays(trip) : [];
    const unscheduledActivities: ItineraryActivity[] = [];

    if (trip) {
      if (trip.arrivalLocation?.trim() && days.length > 0) {
        const arrivalActivity = recommendationToActivity(
          {
            id: `arrival_${trip.id}`,
            name: `Arrival at ${trip.arrivalLocation.trim()}`,
            category: 'place',
            location: trip.arrivalLocation.trim(),
            duration: '30 mins',
            estimatedCost: 0,
            currency: trip.currency,
            latitude: undefined,
            longitude: undefined,
          },
          days[0].dayNumber,
          trip.arrivalTime || '11:00'
        );
        days[0].activities.push({ ...arrivalActivity, status: 'Scheduled' });
      }

      if (trip.items && trip.items.length > 0) {
        let currentDayIdx = 0;
        let timeOffset = trip.arrivalTime
          ? Number(trip.arrivalTime.split(':')[0]) * 60 + Number(trip.arrivalTime.split(':')[1]) + 90
          : 9 * 60 + 30;

        const uniqueItems = Array.from(
          new Map(trip.items.map((item) => [item.recommendationId, item])).values()
        );
        const orderedItems = uniqueItems.sort((first, second) => {
          const categoryOrder: Record<TripItem['type'], number> = {
            place: 0,
            experience: 1,
            food: 2,
            hotel: 3,
          };
          return categoryOrder[first.type] - categoryOrder[second.type];
        });

        // A saved selection can contain only dining items. Add one sightseeing
        // recommendation so the generated timeline is useful rather than food-only.
        const hasSightseeing = orderedItems.some((item) => item.type === 'place' || item.type === 'experience');
        if (!hasSightseeing) {
          const recommendations = buildTripRecommendations(trip);
          const sightseeing = [...recommendations.places, ...recommendations.attractions][0];
          if (sightseeing && !orderedItems.some((item) => item.recommendationId === sightseeing.id)) {
            orderedItems.unshift(sightseeing as TripItem);
          }
        }

        orderedItems.forEach((item) => {
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
        // Build destination-specific tailored recommendations
        const recs = buildTripRecommendations(trip);
        const starters = [
          ...recs.places.slice(0, 2),
          ...recs.attractions.slice(0, 1),
          ...recs.food.slice(0, 1),
          ...recs.hotels.slice(0, 1),
          ...recs.food.slice(1, 2),
        ];

        let dayIdx = 0;
        const timeSlots = ['09:30', '13:30', '17:00'];

        starters.slice(0, Math.max(6, days.length * 3)).forEach((rec, idx) => {
          const day = days[dayIdx % (days.length || 1)];
          const slot = timeSlots[idx % timeSlots.length];
          if (day) {
            day.activities.push(
              recommendationToActivity(rec, day.dayNumber, slot)
            );
          } else {
            unscheduledActivities.push(recommendationToActivity(rec));
          }

          dayIdx += 1;
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

  addActivity(
    itinerary: Itinerary,
    activityData: Partial<ItineraryActivity>,
    targetDayNumber?: number
  ): Itinerary {
    const actId = `act_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newAct: ItineraryActivity = {
      id: actId,
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
    let targetDayDbId: string | undefined;

    if (targetDayNumber) {
      updatedDays = updatedDays.map((day) => {
        if (day.dayNumber === targetDayNumber) {
          targetDayDbId = day.id;
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

    // Sync to PostgreSQL
    if (authService.isAuthenticated() && targetDayDbId && !targetDayDbId.startsWith('day_temp')) {
      apiRequest(`/itinerary-days/${targetDayDbId}/activities`, {
        method: 'POST',
        body: JSON.stringify({
          title: newAct.title,
          category: newAct.category,
          startTime: newAct.startTime,
          durationMinutes: newAct.durationMinutes,
          cost: newAct.estimatedCost,
          currency: newAct.currency,
          location: newAct.location,
          notes: newAct.notes,
        }),
      }).catch((err) => console.log('Activity insert sync:', err.message));
    }

    return updatedItinerary;
  },

  updateActivity(
    itinerary: Itinerary,
    activityId: string,
    updates: Partial<ItineraryActivity>
  ): Itinerary {
    const updatedDays = (itinerary.days || []).map((day) => {
      const idx = day.activities.findIndex((a) => a.id === activityId);
      if (idx !== -1) {
        const current = day.activities[idx];
        const merged: ItineraryActivity = {
          ...current,
          ...updates,
          id: current.id,
        };

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
        return {
          ...act,
          ...updates,
        };
      }
      return act;
    });

    if (updates.dayNumber) {
      const targetDay = updatedDays.find((d) => d.dayNumber === updates.dayNumber);
      const isAlreadyInTarget = targetDay?.activities.some((a) => a.id === activityId);
      if (targetDay && !isAlreadyInTarget) {
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

    // Find dayId if activity is in a day
    let targetDayId: string | undefined;
    updatedDays.forEach((d) => {
      if (d.activities.some((a) => a.id === activityId)) {
        targetDayId = d.id;
      }
    });

    let currentActivity: ItineraryActivity | undefined;
    itinerary.days.forEach((d) => {
      const found = d.activities.find((a) => a.id === activityId);
      if (found) currentActivity = found;
    });
    if (!currentActivity) {
      currentActivity = itinerary.unscheduledActivities?.find((a) => a.id === activityId);
    }

    // Sync to PostgreSQL
    if (authService.isAuthenticated() && !activityId.startsWith('act_temp')) {
      apiRequest(`/activities/${activityId}`, {
        method: 'PUT',
        body: JSON.stringify({
          title: updates.title !== undefined ? updates.title : currentActivity?.title,
          category: updates.category !== undefined ? updates.category : currentActivity?.category,
          startTime: updates.startTime !== undefined ? updates.startTime : currentActivity?.startTime,
          durationMinutes: updates.durationMinutes !== undefined ? updates.durationMinutes : currentActivity?.durationMinutes,
          cost: updates.estimatedCost !== undefined ? updates.estimatedCost : currentActivity?.estimatedCost,
          location: updates.location !== undefined ? updates.location : currentActivity?.location,
          notes: updates.notes !== undefined ? updates.notes : currentActivity?.notes,
          dayId: targetDayId,
          itineraryId: itinerary.id,
        }),
      }).catch((err) => console.log('Activity update sync:', err.message));
    }

    return updated;
  },

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

    // Sync to PostgreSQL
    if (authService.isAuthenticated() && !activityId.startsWith('act_temp')) {
      apiRequest(`/activities/${activityId}`, {
        method: 'DELETE',
      }).catch((err) => console.log('Activity delete sync:', err.message));
    }

    return updated;
  },

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

  moveActivity(
    itinerary: Itinerary,
    activityId: string,
    targetDayNumber: number | null,
    newIndex?: number,
    newStartTime?: string
  ): Itinerary {
    let sourceActivity: ItineraryActivity | null = null;

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
      title: newTrip.name ? `${newTrip.name} Itinerary` : (existing.title || `Trip to ${newTrip.destination}`),
      destination: newTrip.destination,
      country: newTrip.country || existing.country || '',
      days: clonedDays,
      unscheduledActivities: clonedUnscheduled,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.saveItinerary(clonedItinerary, userId);
    return clonedItinerary;
  },

  restoreItinerary(itinerary: Itinerary, userId?: string): boolean {
    return this.saveItinerary(itinerary, userId);
  },

  /**
   * Transaction-safe background batch synchronization to PostgreSQL
   */
  async batchSyncItinerary(itinerary: Itinerary): Promise<boolean> {
    if (!itinerary || !itinerary.id) return false;
    try {
      const activityMoves: any[] = [];
      (itinerary.days || []).forEach((d) => {
        (d.activities || []).forEach((a, idx) => {
          activityMoves.push({
            id: a.id,
            dayId: d.id,
            orderIndex: idx,
            startTime: a.startTime,
            durationMinutes: a.durationMinutes,
            cost: a.estimatedCost,
            title: a.title,
            category: a.category,
            location: a.location,
            notes: a.notes,
          });
        });
      });
      (itinerary.unscheduledActivities || []).forEach((a, idx) => {
        activityMoves.push({
          id: a.id,
          dayId: null,
          orderIndex: idx,
          startTime: a.startTime,
          durationMinutes: a.durationMinutes,
          cost: a.estimatedCost,
          title: a.title,
          category: a.category,
          location: a.location,
          notes: a.notes,
        });
      });

      const dayUpdates = (itinerary.days || []).map((d) => ({
        id: d.id,
        dayNumber: d.dayNumber,
        date: d.date,
        title: d.title,
        theme: d.theme,
      }));

      await apiRequest(`/itinerary/${itinerary.id}/batch-update`, {
        method: 'POST',
        body: JSON.stringify({ activityMoves, dayUpdates }),
      });
      return true;
    } catch (err) {
      console.warn('Background batch sync:', err);
      return false;
    }
  },
};
