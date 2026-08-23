import { Router } from 'express';
import { getDb } from '../db/index.ts';
import {
  trips,
  tripCities,
  itineraries,
  itineraryDays,
  itineraryActivities,
  budgetAllocations,
  expenses,
  tripCollaborators,
  cities as catalogCities,
} from '../db/schema.ts';
import { eq, asc, desc, or, and } from 'drizzle-orm';
import { requireAuth, optionalAuth, AuthRequest } from '../middleware/auth.ts';
import { AppError } from '../middleware/errorHandler.ts';
import { checkTripAccess, getUserTripRole } from '../services/tripPermissionService.ts';
import crypto from 'crypto';

import { aiGenerationService } from '../services/aiGenerationService.ts';

const router = Router();

// GET /api/trips - list user's trips (owned + collaborated)
router.get('/', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const db = await getDb();
    const userId = req.user!.id;

    // Get owned trips
    const ownedTrips = await db
      .select()
      .from(trips)
      .where(eq(trips.userId, userId))
      .orderBy(desc(trips.createdAt));

    // Get collaborated trips
    const collabs = await db
      .select()
      .from(tripCollaborators)
      .where(and(eq(tripCollaborators.userId, userId), eq(tripCollaborators.status, 'accepted')));

    let collabTrips: any[] = [];
    if (collabs.length > 0) {
      for (const c of collabs) {
        const [ct] = await db.select().from(trips).where(eq(trips.id, c.tripId));
        if (ct) {
          collabTrips.push({ ...ct, role: c.role });
        }
      }
    }

    const allTrips = [...ownedTrips.map(t => ({ ...t, role: 'owner' })), ...collabTrips];

    // For each trip, load its cities, destination name, and itinerary activity summary
    const enhancedTrips = await Promise.all(
      allTrips.map(async (trip) => {
        const cities = await db
          .select()
          .from(tripCities)
          .where(eq(tripCities.tripId, trip.id))
          .orderBy(asc(tripCities.orderIndex));

        const [itinerary] = await db
          .select()
          .from(itineraries)
          .where(eq(itineraries.tripId, trip.id));

        const [catalogCity] = cities.length > 0
          ? await db
              .select({ imageUrl: catalogCities.imageUrl })
              .from(catalogCities)
              .where(eq(catalogCities.name, cities[0].cityName))
          : [];

        let primaryDestination = trip.name;
        let primaryCountry = 'India';

        if (cities.length > 0) {
          primaryDestination = cities.map((c: any) => c.cityName).join(' → ');
          primaryCountry = cities[0].country || 'India';
        } else if (itinerary) {
          primaryDestination = itinerary.destination;
          primaryCountry = itinerary.country;
        }

        return {
          id: trip.id,
          userId: trip.userId,
          name: trip.name,
          coverImage: trip.coverImage || catalogCity?.imageUrl || null,
          origin: trip.origin,
          originCountry: trip.originCountry,
          destination: primaryDestination,
          country: primaryCountry,
          startDate: trip.startDate,
          endDate: trip.endDate,
          budget: trip.budget,
          currency: trip.currency,
          status: trip.status,
          isFavorite: trip.isFavorite,
          isPinned: trip.isPinned,
          cities,
          role: trip.role,
          createdAt: trip.createdAt,
          updatedAt: trip.updatedAt,
        };
      })
    );

    res.json(enhancedTrips);
  } catch (error) {
    next(error);
  }
});

// POST /api/trips - create a new trip with cities, itinerary, days, budget
router.post('/', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const {
      id,
      name,
      origin,
      originCountry,
      destination,
      country,
      startDate,
      endDate,
      budget,
      currency,
      style,
      cities = [],
      itineraryDays: customDays = [],
      budgetAllocations: customAllocations = [],
    } = req.body;

    const tripName = (name || destination || '').trim();
    if (!tripName || !startDate || !endDate) {
      throw new AppError('Trip name or destination, start date, and end date are required', 422);
    }

    const indianCities = ['manali', 'shimla', 'delhi', 'mumbai', 'bengaluru', 'bangalore', 'goa', 'jaipur', 'agra', 'kolkata', 'chennai', 'hyderabad', 'ahmedabad', 'pune', 'leh', 'ladakh', 'kerala', 'rishikesh', 'varanasi', 'udaipur', 'mandi', 'kullu', 'dharamshala'];
    const destToCheck = (destination || tripName || '').toLowerCase();
    const resolvedCountry = country && country.trim().length > 0 
      ? country 
      : (indianCities.some(c => destToCheck.includes(c)) ? 'India' : (country || 'India'));

    const db = await getDb();
    const userId = req.user!.id;
    const tripId = id || ('trip_' + crypto.randomUUID());

    // 1. Insert Trip
    const [newTrip] = await db
      .insert(trips)
      .values({
        id: tripId,
        userId,
        name: tripName,
        origin: origin ? origin.trim() : null,
        originCountry: originCountry ? originCountry.trim() : null,
        coverImage: [req.body.coverImage, req.body.cover_image].find(
          (value) => typeof value === 'string' && value.trim()
        )?.trim() || null,
        status: req.body.status || 'draft',
        startDate,
        endDate,
        budget: Number(budget) || 50000,
        currency: currency || 'INR',
        isFavorite: false,
        isPinned: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    // 2. Insert Cities (Multi-City support)
    const cityList = cities.length > 0 ? cities : [
      {
        cityName: destination || tripName,
        country: resolvedCountry,
        orderIndex: 0,
        arrivalDate: startDate,
        departureDate: endDate,
        stayDurationDays: 1,
      }
    ];

    const insertedCities: any[] = [];
    for (let i = 0; i < cityList.length; i++) {
      const c = cityList[i];
      const cityId = 'city_' + crypto.randomUUID();
      const [insertedCity] = await db
        .insert(tripCities)
        .values({
          id: cityId,
          tripId,
          cityName: c.cityName || c.name || destination || 'City',
          country: c.country || resolvedCountry,
          orderIndex: c.orderIndex !== undefined ? c.orderIndex : i,
          arrivalDate: c.arrivalDate || startDate,
          departureDate: c.departureDate || endDate,
          stayDurationDays: Number(c.stayDurationDays) || 1,
          latitude: c.latitude ? Number(c.latitude) : null,
          longitude: c.longitude ? Number(c.longitude) : null,
        })
        .returning();
      insertedCities.push(insertedCity);
    }

    // 3. Insert Itinerary
    const itineraryId = 'itin_' + crypto.randomUUID();
    const primaryDest = insertedCities.map(c => c.cityName).join(' → ');
    const primaryCountry = insertedCities[0]?.country || resolvedCountry;

    const [newItinerary] = await db
      .insert(itineraries)
      .values({
        id: itineraryId,
        tripId,
        title: `${name} Itinerary`,
        destination: primaryDest,
        country: primaryCountry,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    // 4. Generate & Insert Days and Auto-seed Recommended Activities if none provided
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const totalDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);

    // If no custom days are provided, try to generate a rich AI itinerary
    let generatedItinerary = { days: [] as any[] };
    if (customDays.length === 0) {
      try {
        generatedItinerary = await aiGenerationService.generateItinerary({
          name: tripName,
          destination: primaryDest,
          country: primaryCountry,
          startDate,
          endDate,
          durationDays: totalDays,
          budget: Number(budget) || 50000,
          currency: currency || 'INR',
        });
      } catch (err) {
        console.error('Failed to generate AI itinerary:', err);
      }
    }

    const insertedDays: any[] = [];
    for (let d = 0; d < totalDays; d++) {
      const currentDayDate = new Date(start);
      currentDayDate.setDate(start.getDate() + d);
      const dateString = currentDayDate.toISOString().split('T')[0];

      const currentCity = insertedCities[d % insertedCities.length].cityName;
      const customDay = customDays.find((cd: any) => cd.dayNumber === d + 1);
      const aiDay = generatedItinerary.days.find((ad: any) => ad.dayNumber === d + 1);
      
      const dayId = 'day_' + crypto.randomUUID();

      const [day] = await db
        .insert(itineraryDays)
        .values({
          id: dayId,
          itineraryId,
          dayNumber: d + 1,
          date: dateString,
          title: customDay?.title || aiDay?.title || `Day ${d + 1}: Explore ${currentCity}`,
          theme: customDay?.theme || aiDay?.theme || 'Exploration & Sightseeing',
        })
        .returning();
      insertedDays.push(day);

      // Determine activities to insert: custom or auto-seeded recommendations
      let activitiesToInsert = [];
      if (customDay && customDay.activities && customDay.activities.length > 0) {
        activitiesToInsert = customDay.activities;
      } else if (aiDay && aiDay.activities && aiDay.activities.length > 0) {
        activitiesToInsert = aiDay.activities;
      } else {
        // Ultimate fallback if AI failed
        activitiesToInsert = [
          {
            title: `Morning Discovery & Iconic Landmarks in ${currentCity}`,
            category: 'place',
            startTime: '09:30',
            durationMinutes: 120,
            cost: 600,
            location: currentCity,
            notes: 'Top-rated sightseeing and historic orientation walk.',
          },
          {
            title: `Authentic Regional Dining Experience in ${currentCity}`,
            category: 'food',
            startTime: '13:00',
            durationMinutes: 90,
            cost: 1500,
            location: `${currentCity} Culinary District`,
            notes: 'Savor signature local delicacies and specialties.',
          },
          {
            title: `Evening Sunset Stroll & Cultural Tour in ${currentCity}`,
            category: 'experience',
            startTime: '16:30',
            durationMinutes: 120,
            cost: 800,
            location: `${currentCity} Promenade`,
            notes: 'Immersive afternoon excursion and scenic views.',
          },
        ];
      }

      for (let a = 0; a < activitiesToInsert.length; a++) {
        const act = activitiesToInsert[a];
        await db.insert(itineraryActivities).values({
          id: 'act_' + crypto.randomUUID(),
          itineraryId,
          dayId: day.id,
          title: act.title || 'Activity',
          category: act.category || 'Sightseeing',
          startTime: act.startTime || '10:00',
          durationMinutes: Number(act.durationMinutes) || 60,
          cost: Number(act.cost) || 0,
          currency: act.currency || newTrip.currency,
          location: act.location || currentCity,
          latitude: act.latitude ? Number(act.latitude) : null,
          longitude: act.longitude ? Number(act.longitude) : null,
          notes: act.notes || '',
          orderIndex: a,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }

    // 5. Insert Budget Allocations
    const defaultCategories = [
      { category: 'Hotels', percentage: 35 },
      { category: 'Food', percentage: 25 },
      { category: 'Transport', percentage: 20 },
      { category: 'Activities', percentage: 12 },
      { category: 'Shopping', percentage: 5 },
      { category: 'Other', percentage: 3 },
    ];

    const allocationsToInsert = customAllocations.length > 0 ? customAllocations : defaultCategories;
    for (const alloc of allocationsToInsert) {
      const percentage = Number(alloc.percentage) || 10;
      const plannedAmount = Math.round((newTrip.budget * percentage) / 100);
      await db.insert(budgetAllocations).values({
        id: 'alloc_' + crypto.randomUUID(),
        tripId,
        category: alloc.category,
        percentage,
        plannedAmount,
      });
    }

    res.status(201).json({
      ...newTrip,
      destination: primaryDest,
      country: primaryCountry,
      cities: insertedCities,
      itinerary: newItinerary,
      role: 'owner',
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/trips/:tripId - fetch full trip bundle
router.get('/:tripId', optionalAuth, async (req: AuthRequest, res, next) => {
  try {
    const { tripId } = req.params;
    const db = await getDb();

    // Check permissions
    const { trip, role } = await checkTripAccess(req.user?.id, tripId, 'viewer');

    const cities = await db
      .select()
      .from(tripCities)
      .where(eq(tripCities.tripId, tripId))
      .orderBy(asc(tripCities.orderIndex));

    const [itinerary] = await db
      .select()
      .from(itineraries)
      .where(eq(itineraries.tripId, tripId));

    let days: any[] = [];
    let activities: any[] = [];
    if (itinerary) {
      days = await db
        .select()
        .from(itineraryDays)
        .where(eq(itineraryDays.itineraryId, itinerary.id))
        .orderBy(asc(itineraryDays.dayNumber));

      activities = await db
        .select()
        .from(itineraryActivities)
        .where(eq(itineraryActivities.itineraryId, itinerary.id))
        .orderBy(asc(itineraryActivities.orderIndex));
    }

    const allocations = await db
      .select()
      .from(budgetAllocations)
      .where(eq(budgetAllocations.tripId, tripId));

    const tripExpenses = await db
      .select()
      .from(expenses)
      .where(eq(expenses.tripId, tripId))
      .orderBy(desc(expenses.createdAt));

    const collaborators = await db
      .select()
      .from(tripCollaborators)
      .where(eq(tripCollaborators.tripId, tripId));

    const primaryDest = cities.length > 0 ? cities.map((c: any) => c.cityName).join(' → ') : (itinerary?.destination || trip.name);
    const primaryCountry = cities[0]?.country || itinerary?.country || 'India';
    const [catalogCity] = cities.length > 0
      ? await db
          .select({ imageUrl: catalogCities.imageUrl })
          .from(catalogCities)
          .where(eq(catalogCities.name, cities[0].cityName))
      : [];

    res.json({
      ...trip,
      coverImage: trip.coverImage || catalogCity?.imageUrl || null,
      destination: primaryDest,
      country: primaryCountry,
      cities,
      itinerary: itinerary ? {
        ...itinerary,
        days: days.map(d => ({
          ...d,
          activities: activities.filter(a => a.dayId === d.id),
        })),
        unscheduledActivities: activities.filter(a => !a.dayId),
      } : null,
      budgetAllocations: allocations,
      expenses: tripExpenses,
      collaborators,
      role,
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/trips/:tripId - update trip details
router.put('/:tripId', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const { tripId } = req.params;
    const { name, origin, originCountry, startDate, endDate, budget, currency, status, isFavorite, isPinned } = req.body;

    await checkTripAccess(req.user!.id, tripId, 'editor');
    const db = await getDb();

    const [updatedTrip] = await db
      .update(trips)
      .set({
        ...(name ? { name: name.trim() } : {}),
        ...(origin !== undefined ? { origin: origin ? origin.trim() : null } : {}),
        ...(originCountry !== undefined ? { originCountry: originCountry ? originCountry.trim() : null } : {}),
        ...(startDate ? { startDate } : {}),
        ...(endDate ? { endDate } : {}),
        ...(budget !== undefined ? { budget: Number(budget) } : {}),
        ...(currency ? { currency } : {}),
        ...(status ? { status } : {}),
        ...(isFavorite !== undefined ? { isFavorite } : {}),
        ...(isPinned !== undefined ? { isPinned } : {}),
        updatedAt: new Date(),
      })
      .where(eq(trips.id, tripId))
      .returning();

    res.json(updatedTrip);
  } catch (error) {
    next(error);
  }
});

// POST /api/trips/:tripId/cities/reorder - Re-sequence cities/stops
router.post('/:tripId/cities/reorder', optionalAuth, async (req: AuthRequest, res, next) => {
  try {
    const { tripId } = req.params;
    const { cityOrders } = req.body; // array of { id, orderIndex, arrivalDate, departureDate, stayDurationDays }
    if (!Array.isArray(cityOrders)) {
      throw new AppError('cityOrders array is required', 422);
    }

    if (req.user?.id) {
      await checkTripAccess(req.user.id, tripId, 'editor');
    }

    const db = await getDb();

    for (let idx = 0; idx < cityOrders.length; idx++) {
      const item = cityOrders[idx];
      if (item.id) {
        await db
          .update(tripCities)
          .set({
            orderIndex: item.orderIndex !== undefined ? Number(item.orderIndex) : idx,
            ...(item.arrivalDate ? { arrivalDate: item.arrivalDate } : {}),
            ...(item.departureDate ? { departureDate: item.departureDate } : {}),
            ...(item.stayDurationDays ? { stayDurationDays: Number(item.stayDurationDays) } : {}),
          })
          .where(and(eq(tripCities.id, item.id), eq(tripCities.tripId, tripId)));
      }
    }

    const updatedCities = await db
      .select()
      .from(tripCities)
      .where(eq(tripCities.tripId, tripId))
      .orderBy(asc(tripCities.orderIndex));

    res.json({ success: true, cities: updatedCities });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/trips/:tripId - delete trip and cascade all sub-resources
router.delete('/:tripId', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const { tripId } = req.params;
    await checkTripAccess(req.user!.id, tripId, 'owner');
    const db = await getDb();

    await db.delete(trips).where(eq(trips.id, tripId));

    res.json({ success: true, message: 'Trip deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
