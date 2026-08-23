import { Router } from 'express';
import { getDb } from '../db/index.ts';
import {
  sharedTripLinks,
  tripCollaborators,
  trips,
  tripCities,
  itineraries,
  itineraryDays,
  itineraryActivities,
  budgetAllocations,
  expenses,
  users,
} from '../db/schema.ts';
import { eq, asc, desc, and } from 'drizzle-orm';
import { requireAuth, optionalAuth, AuthRequest } from '../middleware/auth.ts';
import { AppError } from '../middleware/errorHandler.ts';
import { checkTripAccess } from '../services/tripPermissionService.ts';
import crypto from 'crypto';

const router = Router();

// POST /api/trips/:tripId/share - generate or retrieve share link
router.post('/trips/:tripId/share', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const { tripId } = req.params;
    const { permission = 'view', expiresInDays = 30 } = req.body;

    await checkTripAccess(req.user!.id, tripId, 'owner');
    const db = await getDb();

    // Check if an active link with this permission already exists
    const [existingLink] = await db
      .select()
      .from(sharedTripLinks)
      .where(and(eq(sharedTripLinks.tripId, tripId), eq(sharedTripLinks.permission, permission), eq(sharedTripLinks.isActive, true)));

    if (existingLink) {
      return res.json(existingLink);
    }

    const shareToken = 'gt_' + crypto.randomBytes(16).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + Number(expiresInDays));

    const [newLink] = await db
      .insert(sharedTripLinks)
      .values({
        id: 'link_' + crypto.randomUUID(),
        tripId,
        shareToken,
        permission,
        isActive: true,
        createdAt: new Date(),
        expiresAt,
      })
      .returning();

    res.status(201).json(newLink);
  } catch (error) {
    next(error);
  }
});

// GET /api/shared/:shareToken - public/shared access across devices
router.get('/shared/:shareToken', async (req, res, next) => {
  try {
    const { shareToken } = req.params;
    const db = await getDb();

    const [link] = await db
      .select()
      .from(sharedTripLinks)
      .where(and(eq(sharedTripLinks.shareToken, shareToken), eq(sharedTripLinks.isActive, true)));

    if (!link) {
      throw new AppError('Shared trip link not found or has expired', 404);
    }

    if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
      throw new AppError('This shared trip link has expired', 410);
    }

    const tripId = link.tripId;
    const [trip] = await db.select().from(trips).where(eq(trips.id, tripId));
    if (!trip) {
      throw new AppError('Trip not found', 404);
    }

    const [owner] = await db.select().from(users).where(eq(users.id, trip.userId));

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

    res.json({
      trip: {
        ...trip,
        destination: primaryDest,
        country: cities[0]?.country || itinerary?.country || 'India',
        cities,
        ownerName: owner?.name || 'GlobeTrotter Explorer',
        ownerAvatar: owner?.avatarUrl,
      },
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
      permission: link.permission,
      shareToken: link.shareToken,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/shared/:shareToken/copy - copy a public itinerary into the signed-in user's trips
router.post('/shared/:shareToken/copy', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const { shareToken } = req.params;
    const db = await getDb();
    const [link] = await db.select().from(sharedTripLinks).where(and(eq(sharedTripLinks.shareToken, shareToken), eq(sharedTripLinks.isActive, true)));
    if (!link || (link.expiresAt && new Date(link.expiresAt) < new Date())) throw new AppError('Shared trip link not found or has expired', 404);

    const [sourceTrip] = await db.select().from(trips).where(eq(trips.id, link.tripId));
    if (!sourceTrip) throw new AppError('Trip not found', 404);
    const sourceCities = await db.select().from(tripCities).where(eq(tripCities.tripId, sourceTrip.id)).orderBy(asc(tripCities.orderIndex));
    const [sourceItinerary] = await db.select().from(itineraries).where(eq(itineraries.tripId, sourceTrip.id));
    const sourceDays = sourceItinerary ? await db.select().from(itineraryDays).where(eq(itineraryDays.itineraryId, sourceItinerary.id)).orderBy(asc(itineraryDays.dayNumber)) : [];
    const sourceActivities = sourceItinerary ? await db.select().from(itineraryActivities).where(eq(itineraryActivities.itineraryId, sourceItinerary.id)).orderBy(asc(itineraryActivities.orderIndex)) : [];
    const sourceAllocations = await db.select().from(budgetAllocations).where(eq(budgetAllocations.tripId, sourceTrip.id));
    const newTripId = 'trip_' + crypto.randomUUID();
    const now = new Date();
    const [newTrip] = await db.insert(trips).values({
      id: newTripId, userId: req.user!.id, name: `${sourceTrip.name} (Copy)`, origin: sourceTrip.origin,
      originCountry: sourceTrip.originCountry, coverImage: sourceTrip.coverImage, status: 'draft',
      startDate: sourceTrip.startDate, endDate: sourceTrip.endDate, budget: sourceTrip.budget, currency: sourceTrip.currency,
      isFavorite: false, isPinned: false, createdAt: now, updatedAt: now,
    }).returning();

    for (const city of sourceCities) {
      await db.insert(tripCities).values({ id: 'city_' + crypto.randomUUID(), tripId: newTripId, cityName: city.cityName, country: city.country, orderIndex: city.orderIndex, arrivalDate: city.arrivalDate, departureDate: city.departureDate, stayDurationDays: city.stayDurationDays, latitude: city.latitude, longitude: city.longitude });
    }

    if (sourceItinerary) {
      const newItineraryId = 'itin_' + crypto.randomUUID();
      await db.insert(itineraries).values({ id: newItineraryId, tripId: newTripId, title: sourceItinerary.title, destination: sourceItinerary.destination, country: sourceItinerary.country, createdAt: now, updatedAt: now });
      const dayIdMap = new Map<string, string>();
      for (const day of sourceDays) {
        const newDayId = 'day_' + crypto.randomUUID();
        dayIdMap.set(day.id, newDayId);
        await db.insert(itineraryDays).values({ id: newDayId, itineraryId: newItineraryId, dayNumber: day.dayNumber, date: day.date, title: day.title, theme: day.theme });
      }
      for (const activity of sourceActivities) {
        await db.insert(itineraryActivities).values({ id: 'act_' + crypto.randomUUID(), itineraryId: newItineraryId, dayId: activity.dayId ? dayIdMap.get(activity.dayId) || null : null, title: activity.title, category: activity.category, startTime: activity.startTime, durationMinutes: activity.durationMinutes, cost: activity.cost, currency: activity.currency, location: activity.location, latitude: activity.latitude, longitude: activity.longitude, notes: activity.notes, orderIndex: activity.orderIndex, createdAt: now, updatedAt: now });
      }
    }

    for (const allocation of sourceAllocations) {
      await db.insert(budgetAllocations).values({ id: 'alloc_' + crypto.randomUUID(), tripId: newTripId, category: allocation.category, percentage: allocation.percentage, plannedAmount: allocation.plannedAmount });
    }
    res.status(201).json({ ...newTrip, id: newTripId });
  } catch (error) {
    next(error);
  }
});

// GET /api/trips/:tripId/collaborators
router.get('/trips/:tripId/collaborators', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const { tripId } = req.params;
    await checkTripAccess(req.user!.id, tripId, 'viewer');
    const db = await getDb();

    const collabs = await db
      .select()
      .from(tripCollaborators)
      .where(eq(tripCollaborators.tripId, tripId));

    res.json(collabs);
  } catch (error) {
    next(error);
  }
});

// POST /api/trips/:tripId/collaborators - invite collaborator
router.post('/trips/:tripId/collaborators', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const { tripId } = req.params;
    const { email, role = 'viewer' } = req.body;

    if (!email) {
      throw new AppError('Collaborator email is required', 422);
    }

    await checkTripAccess(req.user!.id, tripId, 'owner');
    const db = await getDb();

    const normalizedEmail = email.toLowerCase().trim();
    const [matchingUser] = await db.select().from(users).where(eq(users.email, normalizedEmail));

    const collabId = 'collab_' + crypto.randomUUID();
    const [newCollab] = await db
      .insert(tripCollaborators)
      .values({
        id: collabId,
        tripId,
        userId: matchingUser ? matchingUser.id : null,
        email: normalizedEmail,
        role: role as 'owner' | 'editor' | 'viewer',
        status: matchingUser ? 'accepted' : 'pending',
        invitedAt: new Date(),
        acceptedAt: matchingUser ? new Date() : null,
      })
      .returning();

    res.status(201).json(newCollab);
  } catch (error) {
    next(error);
  }
});

// PUT /api/collaborators/:collaboratorId
router.put('/collaborators/:collaboratorId', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const { collaboratorId } = req.params;
    const { role, status } = req.body;
    const db = await getDb();

    const [collab] = await db.select().from(tripCollaborators).where(eq(tripCollaborators.id, collaboratorId));
    if (!collab) throw new AppError('Collaborator not found', 404);

    await checkTripAccess(req.user!.id, collab.tripId, 'owner');

    const [updated] = await db
      .update(tripCollaborators)
      .set({
        ...(role ? { role } : {}),
        ...(status ? { status } : {}),
        ...(status === 'accepted' ? { acceptedAt: new Date() } : {}),
      })
      .where(eq(tripCollaborators.id, collaboratorId))
      .returning();

    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/collaborators/:collaboratorId
router.delete('/collaborators/:collaboratorId', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const { collaboratorId } = req.params;
    const db = await getDb();

    const [collab] = await db.select().from(tripCollaborators).where(eq(tripCollaborators.id, collaboratorId));
    if (!collab) throw new AppError('Collaborator not found', 404);

    await checkTripAccess(req.user!.id, collab.tripId, 'owner');

    await db.delete(tripCollaborators).where(eq(tripCollaborators.id, collaboratorId));

    res.json({ success: true, message: 'Collaborator removed successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
