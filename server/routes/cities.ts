import { Router } from 'express';
import { getDb } from '../db/index.ts';
import { tripCities, itineraries, cities, activities } from '../db/schema.ts';
import { eq, asc, desc, and, ilike, or } from 'drizzle-orm';
import { requireAuth, AuthRequest } from '../middleware/auth.ts';
import { AppError } from '../middleware/errorHandler.ts';
import { checkTripAccess } from '../services/tripPermissionService.ts';
import crypto from 'crypto';

const router = Router();

// ==========================================
// CATALOG DESTINATIONS & ACTIVITIES ENDPOINTS
// ==========================================

// GET /api/cities (or /api/catalog/cities) - Search and explore catalog destinations
router.get('/catalog/cities', async (req, res, next) => {
  try {
    const { query, isDomestic, region, sort } = req.query;
    const db = await getDb();

    let allCities = await db.select().from(cities);

    if (query && typeof query === 'string') {
      const q = query.toLowerCase().trim();
      allCities = allCities.filter(
        (c: any) =>
          c.name.toLowerCase().includes(q) ||
          c.country.toLowerCase().includes(q) ||
          c.region.toLowerCase().includes(q) ||
          c.tags.toLowerCase().includes(q) ||
          c.highlights.toLowerCase().includes(q)
      );
    }

    if (isDomestic !== undefined) {
      const isDom = isDomestic === 'true' || isDomestic === '1';
      allCities = allCities.filter((c: any) => c.isDomestic === isDom);
    }

    if (region && typeof region === 'string' && region !== 'all') {
      const r = region.toLowerCase();
      allCities = allCities.filter((c: any) => c.region.toLowerCase().includes(r));
    }

    if (sort === 'rating') {
      allCities.sort((a: any, b: any) => b.popularityRating - a.popularityRating);
    } else if (sort === 'budget_asc') {
      allCities.sort((a: any, b: any) => a.estimatedDailyBudget - b.estimatedDailyBudget);
    } else if (sort === 'budget_desc') {
      allCities.sort((a: any, b: any) => b.estimatedDailyBudget - a.estimatedDailyBudget);
    } else {
      // Default: balanced featured ranking with domestic prominent
      allCities.sort((a: any, b: any) => {
        if (a.isDomestic !== b.isDomestic) {
          return a.isDomestic ? -1 : 1; // Highlight domestic gems
        }
        return b.popularityRating - a.popularityRating;
      });
    }

    res.json(allCities);
  } catch (error) {
    next(error);
  }
});

// GET /api/catalog/cities/:cityId - Single destination details with activities
router.get('/catalog/cities/:cityId', async (req, res, next) => {
  try {
    const { cityId } = req.params;
    const db = await getDb();

    const [city] = await db.select().from(cities).where(eq(cities.id, cityId));
    if (!city) {
      throw new AppError('City not found in catalog', 404);
    }

    const cityActivities = await db
      .select()
      .from(activities)
      .where(eq(activities.cityId, cityId));

    res.json({
      ...city,
      activities: cityActivities,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/catalog/cities/:cityId/activities - Activities for a specific destination
router.get('/catalog/cities/:cityId/activities', async (req, res, next) => {
  try {
    const { cityId } = req.params;
    const { category } = req.query;
    const db = await getDb();

    let cityActivities = await db
      .select()
      .from(activities)
      .where(eq(activities.cityId, cityId));

    if (category && typeof category === 'string' && category !== 'all') {
      cityActivities = cityActivities.filter(
        (a: any) => a.category.toLowerCase() === category.toLowerCase()
      );
    }

    res.json(cityActivities);
  } catch (error) {
    next(error);
  }
});

// GET /api/catalog/featured - Balanced domestic + international recommendations
router.get('/catalog/featured', async (req, res, next) => {
  try {
    const db = await getDb();
    const allCities = await db.select().from(cities);

    const domestic = allCities.filter((c: any) => c.isDomestic);
    const international = allCities.filter((c: any) => !c.isDomestic);

    domestic.sort((a: any, b: any) => b.popularityRating - a.popularityRating);
    international.sort((a: any, b: any) => b.popularityRating - a.popularityRating);

    // Balanced interleaving: 2 domestic, 1 international, 2 domestic, 1 international...
    const balanced: any[] = [];
    let dIdx = 0;
    let iIdx = 0;

    while (dIdx < domestic.length || iIdx < international.length) {
      if (dIdx < domestic.length) balanced.push(domestic[dIdx++]);
      if (dIdx < domestic.length) balanced.push(domestic[dIdx++]);
      if (iIdx < international.length) balanced.push(international[iIdx++]);
    }

    res.json({
      featured: balanced,
      domesticCount: domestic.length,
      internationalCount: international.length,
    });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// USER TRIP CITIES ROUTING
// ==========================================

// GET /api/trips/:tripId/cities
router.get('/trips/:tripId/cities', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const { tripId } = req.params;
    await checkTripAccess(req.user!.id, tripId, 'viewer');
    const db = await getDb();

    const cities = await db
      .select()
      .from(tripCities)
      .where(eq(tripCities.tripId, tripId))
      .orderBy(asc(tripCities.orderIndex));

    res.json(cities);
  } catch (error) {
    next(error);
  }
});

// POST /api/trips/:tripId/cities
router.post('/trips/:tripId/cities', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const { tripId } = req.params;
    const { cityName, country, arrivalDate, departureDate, stayDurationDays, latitude, longitude } = req.body;

    if (!cityName) {
      throw new AppError('City name is required', 422);
    }

    await checkTripAccess(req.user!.id, tripId, 'editor');
    const db = await getDb();

    // Get current max order
    const existingCities = await db
      .select()
      .from(tripCities)
      .where(eq(tripCities.tripId, tripId))
      .orderBy(asc(tripCities.orderIndex));

    const nextOrder = existingCities.length;
    const cityId = 'city_' + crypto.randomUUID();

    const [newCity] = await db
      .insert(tripCities)
      .values({
        id: cityId,
        tripId,
        cityName: cityName.trim(),
        country: country || 'India',
        orderIndex: nextOrder,
        arrivalDate,
        departureDate,
        stayDurationDays: Number(stayDurationDays) || 1,
        latitude: latitude ? Number(latitude) : null,
        longitude: longitude ? Number(longitude) : null,
      })
      .returning();

    // Update primary destination in itinerary
    const allCities = [...existingCities, newCity];
    const destinationSummary = allCities.map((c: any) => c.cityName).join(' → ');
    await db
      .update(itineraries)
      .set({
        destination: destinationSummary,
        updatedAt: new Date(),
      })
      .where(eq(itineraries.tripId, tripId));

    res.status(201).json(newCity);
  } catch (error) {
    next(error);
  }
});

// PUT /api/trips/:tripId/cities/:cityId
router.put('/trips/:tripId/cities/:cityId', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const { tripId, cityId } = req.params;
    const { cityName, country, arrivalDate, departureDate, stayDurationDays, latitude, longitude, orderIndex } = req.body;

    await checkTripAccess(req.user!.id, tripId, 'editor');
    const db = await getDb();

    const [updatedCity] = await db
      .update(tripCities)
      .set({
        ...(cityName ? { cityName: cityName.trim() } : {}),
        ...(country ? { country: country.trim() } : {}),
        ...(arrivalDate !== undefined ? { arrivalDate } : {}),
        ...(departureDate !== undefined ? { departureDate } : {}),
        ...(stayDurationDays !== undefined ? { stayDurationDays: Number(stayDurationDays) } : {}),
        ...(latitude !== undefined ? { latitude: Number(latitude) } : {}),
        ...(longitude !== undefined ? { longitude: Number(longitude) } : {}),
        ...(orderIndex !== undefined ? { orderIndex: Number(orderIndex) } : {}),
      })
      .where(and(eq(tripCities.id, cityId), eq(tripCities.tripId, tripId)))
      .returning();

    if (!updatedCity) {
      throw new AppError('City not found for this trip', 404);
    }

    res.json(updatedCity);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/trips/:tripId/cities/:cityId
router.delete('/trips/:tripId/cities/:cityId', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const { tripId, cityId } = req.params;
    await checkTripAccess(req.user!.id, tripId, 'editor');
    const db = await getDb();

    await db.delete(tripCities).where(and(eq(tripCities.id, cityId), eq(tripCities.tripId, tripId)));

    // Re-index remaining cities
    const remaining = await db
      .select()
      .from(tripCities)
      .where(eq(tripCities.tripId, tripId))
      .orderBy(asc(tripCities.orderIndex));

    for (let i = 0; i < remaining.length; i++) {
      await db
        .update(tripCities)
        .set({ orderIndex: i })
        .where(eq(tripCities.id, remaining[i].id));
    }

    res.json({ success: true, message: 'City removed successfully' });
  } catch (error) {
    next(error);
  }
});

// PUT /api/trips/:tripId/cities/reorder
router.put('/trips/:tripId/cities/reorder', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const { tripId } = req.params;
    const { cityIds } = req.body; // array of city IDs in new order

    if (!Array.isArray(cityIds)) {
      throw new AppError('cityIds array is required', 422);
    }

    await checkTripAccess(req.user!.id, tripId, 'editor');
    const db = await getDb();

    for (let i = 0; i < cityIds.length; i++) {
      await db
        .update(tripCities)
        .set({ orderIndex: i })
        .where(and(eq(tripCities.id, cityIds[i]), eq(tripCities.tripId, tripId)));
    }

    const updatedCities = await db
      .select()
      .from(tripCities)
      .where(eq(tripCities.tripId, tripId))
      .orderBy(asc(tripCities.orderIndex));

    // Update itinerary destination title
    const destinationSummary = updatedCities.map((c: any) => c.cityName).join(' → ');
    await db
      .update(itineraries)
      .set({
        destination: destinationSummary,
        updatedAt: new Date(),
      })
      .where(eq(itineraries.tripId, tripId));

    res.json(updatedCities);
  } catch (error) {
    next(error);
  }
});

export default router;
