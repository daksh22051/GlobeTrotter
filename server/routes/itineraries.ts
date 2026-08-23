import { Router } from 'express';
import { getDb } from '../db/index.ts';
import { itineraries, itineraryDays, itineraryActivities, trips } from '../db/schema.ts';
import { eq, asc, and } from 'drizzle-orm';
import { requireAuth, optionalAuth, AuthRequest } from '../middleware/auth.ts';
import { AppError } from '../middleware/errorHandler.ts';
import { checkTripAccess } from '../services/tripPermissionService.ts';
import crypto from 'crypto';

import { aiGenerationService } from '../services/aiGenerationService.ts';

const router = Router();

// POST /api/itinerary/:itineraryId/optimize
router.post('/itinerary/:itineraryId/optimize', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const { itineraryId } = req.params;
    const db = await getDb();

    const [itin] = await db.select().from(itineraries).where(eq(itineraries.id, itineraryId));
    if (!itin) throw new AppError('Itinerary not found', 404);

    const [trip] = await db.select().from(trips).where(eq(trips.id, itin.tripId));
    if (!trip) throw new AppError('Trip not found for itinerary', 404);
    await checkTripAccess(req.user!.id, trip.id, 'editor');

    const days = await db
      .select()
      .from(itineraryDays)
      .where(eq(itineraryDays.itineraryId, itineraryId))
      .orderBy(asc(itineraryDays.dayNumber));

    const activities = await db
      .select()
      .from(itineraryActivities)
      .where(eq(itineraryActivities.itineraryId, itineraryId))
      .orderBy(asc(itineraryActivities.orderIndex));

    const fullItinerary = {
      ...itin,
      days: days.map(d => ({
        ...d,
        activities: activities.filter(a => a.dayId === d.id),
      })),
    };

    // Use AI service to optimize or regenerate if repetitive
    const result = await aiGenerationService.generateItinerary({
      ...trip,
      name: trip.name,
      destination: itin.destination,
      country: itin.country,
      durationDays: days.length,
      currentItinerary: fullItinerary,
      isOptimization: true,
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
});

// GET /api/trips/:tripId/itinerary
router.get('/trips/:tripId/itinerary', optionalAuth, async (req: AuthRequest, res, next) => {
  try {
    const { tripId } = req.params;
    await checkTripAccess(req.user?.id, tripId, 'viewer');
    const db = await getDb();

    const [itinerary] = await db
      .select()
      .from(itineraries)
      .where(eq(itineraries.tripId, tripId));

    if (!itinerary) {
      return res.json(null);
    }

    const days = await db
      .select()
      .from(itineraryDays)
      .where(eq(itineraryDays.itineraryId, itinerary.id))
      .orderBy(asc(itineraryDays.dayNumber));

    const activities = await db
      .select()
      .from(itineraryActivities)
      .where(eq(itineraryActivities.itineraryId, itinerary.id))
      .orderBy(asc(itineraryActivities.orderIndex));

    const formattedDays = days.map(d => ({
      ...d,
      activities: activities.filter(a => a.dayId === d.id),
    }));

    // Auto-backfill any day that has 0 activities
    const emptyDays = formattedDays.filter(d => d.activities.length === 0);
    if (emptyDays.length > 0) {
      try {
        const [trip] = await db.select().from(trips).where(eq(trips.id, tripId));
        const generated = await aiGenerationService.generateItinerary({
          name: trip?.name || itinerary.destination,
          destination: itinerary.destination,
          country: itinerary.country,
          durationDays: days.length,
          currency: trip?.currency || 'INR',
        });

        for (const day of formattedDays) {
          if (day.activities.length === 0) {
            const match = generated.days.find(gd => gd.dayNumber === day.dayNumber) || generated.days[(day.dayNumber - 1) % generated.days.length];
            if (match && match.activities) {
              for (const act of match.activities) {
                const newActId = 'act_' + crypto.randomUUID();
                await db.insert(itineraryActivities).values({
                  id: newActId,
                  itineraryId: itinerary.id,
                  dayId: day.id,
                  title: act.title || 'Activity',
                  category: act.category || 'Sightseeing',
                  startTime: act.startTime || '10:00',
                  durationMinutes: Number(act.durationMinutes) || 120,
                  cost: Number(act.cost) || 500,
                  currency: act.currency || trip?.currency || 'INR',
                  location: act.location || itinerary.destination,
                  notes: act.notes || '',
                });
                day.activities.push({
                  id: newActId,
                  itineraryId: itinerary.id,
                  dayId: day.id,
                  title: act.title || 'Activity',
                  category: act.category || 'Sightseeing',
                  startTime: act.startTime || '10:00',
                  durationMinutes: Number(act.durationMinutes) || 120,
                  cost: Number(act.cost) || 500,
                  currency: act.currency || trip?.currency || 'INR',
                  location: act.location || itinerary.destination,
                  notes: act.notes || '',
                  orderIndex: 0,
                  latitude: null,
                  longitude: null,
                });
              }
            }
          }
        }
      } catch (err) {
        console.error('Auto-backfill itinerary activities error:', err);
      }
    }

    res.json({
      ...itinerary,
      days: formattedDays,
      unscheduledActivities: activities.filter(a => !a.dayId),
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/trips/:tripId/itinerary
router.post('/trips/:tripId/itinerary', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const { tripId } = req.params;
    const { title, destination, country } = req.body;
    await checkTripAccess(req.user!.id, tripId, 'editor');
    const db = await getDb();

    const itineraryId = 'itin_' + crypto.randomUUID();
    const [newItin] = await db
      .insert(itineraries)
      .values({
        id: itineraryId,
        tripId,
        title: title || 'Trip Itinerary',
        destination: destination || 'Destination',
        country: country || 'India',
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    res.status(201).json(newItin);
  } catch (error) {
    next(error);
  }
});

// PUT /api/itinerary/:itineraryId
router.put('/itinerary/:itineraryId', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const { itineraryId } = req.params;
    const { title, destination, country } = req.body;
    const db = await getDb();

    const [existing] = await db.select().from(itineraries).where(eq(itineraries.id, itineraryId));
    if (!existing) throw new AppError('Itinerary not found', 404);

    await checkTripAccess(req.user!.id, existing.tripId, 'editor');

    const [updated] = await db
      .update(itineraries)
      .set({
        ...(title ? { title } : {}),
        ...(destination ? { destination } : {}),
        ...(country ? { country } : {}),
        updatedAt: new Date(),
      })
      .where(eq(itineraries.id, itineraryId))
      .returning();

    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// POST /api/itinerary/:itineraryId/days
router.post('/itinerary/:itineraryId/days', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const { itineraryId } = req.params;
    const { date, title, theme, dayNumber } = req.body;
    const db = await getDb();

    const [itin] = await db.select().from(itineraries).where(eq(itineraries.id, itineraryId));
    if (!itin) throw new AppError('Itinerary not found', 404);

    await checkTripAccess(req.user!.id, itin.tripId, 'editor');

    const existingDays = await db
      .select()
      .from(itineraryDays)
      .where(eq(itineraryDays.itineraryId, itineraryId));

    const nextDayNum = dayNumber !== undefined ? dayNumber : existingDays.length + 1;
    const dayId = 'day_' + crypto.randomUUID();

    const [newDay] = await db
      .insert(itineraryDays)
      .values({
        id: dayId,
        itineraryId,
        dayNumber: nextDayNum,
        date: date || new Date().toISOString().split('T')[0],
        title: title || `Day ${nextDayNum}`,
        theme: theme || 'Sightseeing',
      })
      .returning();

    res.status(201).json(newDay);
  } catch (error) {
    next(error);
  }
});

// PUT /api/itinerary-days/:dayId
router.put('/itinerary-days/:dayId', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const { dayId } = req.params;
    const { date, title, theme, dayNumber } = req.body;
    const db = await getDb();

    const [day] = await db.select().from(itineraryDays).where(eq(itineraryDays.id, dayId));
    if (!day) throw new AppError('Day not found', 404);

    const [itin] = await db.select().from(itineraries).where(eq(itineraries.id, day.itineraryId));
    await checkTripAccess(req.user!.id, itin.tripId, 'editor');

    const [updatedDay] = await db
      .update(itineraryDays)
      .set({
        ...(date ? { date } : {}),
        ...(title ? { title } : {}),
        ...(theme !== undefined ? { theme } : {}),
        ...(dayNumber !== undefined ? { dayNumber: Number(dayNumber) } : {}),
      })
      .where(eq(itineraryDays.id, dayId))
      .returning();

    res.json(updatedDay);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/itinerary-days/:dayId
router.delete('/itinerary-days/:dayId', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const { dayId } = req.params;
    const db = await getDb();

    const [day] = await db.select().from(itineraryDays).where(eq(itineraryDays.id, dayId));
    if (!day) throw new AppError('Day not found', 404);

    const [itin] = await db.select().from(itineraries).where(eq(itineraries.id, day.itineraryId));
    await checkTripAccess(req.user!.id, itin.tripId, 'editor');

    // Unschedule or delete activities for this day
    await db.delete(itineraryActivities).where(eq(itineraryActivities.dayId, dayId));
    await db.delete(itineraryDays).where(eq(itineraryDays.id, dayId));

    res.json({ success: true, message: 'Day deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// POST /api/itinerary-days/:dayId/activities
router.post('/itinerary-days/:dayId/activities', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const { dayId } = req.params;
    const {
      title,
      category,
      startTime,
      durationMinutes,
      cost,
      currency,
      location,
      latitude,
      longitude,
      notes,
    } = req.body;

    const db = await getDb();

    let itineraryId: string;
    let actualDayId: string | null = dayId === 'unscheduled' ? null : dayId;

    if (actualDayId) {
      const [day] = await db.select().from(itineraryDays).where(eq(itineraryDays.id, actualDayId));
      if (!day) throw new AppError('Day not found', 404);
      itineraryId = day.itineraryId;
    } else {
      const reqItinId = req.body.itineraryId;
      if (!reqItinId) throw new AppError('Itinerary ID required for unscheduled activity', 422);
      itineraryId = reqItinId;
    }

    const [itin] = await db.select().from(itineraries).where(eq(itineraries.id, itineraryId));
    await checkTripAccess(req.user!.id, itin.tripId, 'editor');

    const actId = 'act_' + crypto.randomUUID();
    const [newActivity] = await db
      .insert(itineraryActivities)
      .values({
        id: actId,
        itineraryId,
        dayId: actualDayId,
        title: title || 'New Activity',
        category: category || 'Sightseeing',
        startTime: startTime || '10:00',
        durationMinutes: Number(durationMinutes) || 60,
        cost: Number(cost) || 0,
        currency: currency || 'INR',
        location: location || '',
        latitude: latitude ? Number(latitude) : null,
        longitude: longitude ? Number(longitude) : null,
        notes: notes || '',
        orderIndex: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    res.status(201).json(newActivity);
  } catch (error) {
    next(error);
  }
});

// PUT /api/activities/:activityId
router.put('/activities/:activityId', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const { activityId } = req.params;
    const {
      title,
      category,
      startTime,
      durationMinutes,
      cost,
      currency,
      location,
      latitude,
      longitude,
      notes,
      dayId,
      itineraryId,
      orderIndex,
    } = req.body;

    const db = await getDb();
    const [act] = await db.select().from(itineraryActivities).where(eq(itineraryActivities.id, activityId));

    if (!act) {
      // If activity does not exist yet in db, insert it
      if (!dayId && !itineraryId) {
        return res.status(404).json({ error: 'Activity not found and missing dayId/itineraryId for creation' });
      }

      let targetItineraryId = itineraryId;
      if (!targetItineraryId && dayId) {
        const [day] = await db.select().from(itineraryDays).where(eq(itineraryDays.id, dayId));
        if (day) targetItineraryId = day.itineraryId;
      }

      if (targetItineraryId) {
        const [itin] = await db.select().from(itineraries).where(eq(itineraries.id, targetItineraryId));
        if (itin) {
          await checkTripAccess(req.user!.id, itin.tripId, 'editor');
        }
      }

      const [newAct] = await db
        .insert(itineraryActivities)
        .values({
          id: activityId,
          itineraryId: targetItineraryId || '',
          dayId: dayId || null,
          title: title || 'New Activity',
          category: category || 'place',
          startTime: startTime || '10:00',
          durationMinutes: Number(durationMinutes) || 60,
          cost: Number(cost) || 0,
          currency: currency || 'INR',
          location: location || 'Central Area',
          latitude: latitude ? Number(latitude) : null,
          longitude: longitude ? Number(longitude) : null,
          notes: notes || '',
          orderIndex: orderIndex !== undefined ? Number(orderIndex) : 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();
      return res.json(newAct);
    }

    const [itin] = await db.select().from(itineraries).where(eq(itineraries.id, act.itineraryId));
    await checkTripAccess(req.user!.id, itin.tripId, 'editor');

    const [updatedAct] = await db
      .update(itineraryActivities)
      .set({
        ...(title ? { title } : {}),
        ...(category ? { category } : {}),
        ...(startTime !== undefined ? { startTime } : {}),
        ...(durationMinutes !== undefined ? { durationMinutes: Number(durationMinutes) } : {}),
        ...(cost !== undefined ? { cost: Number(cost) } : {}),
        ...(currency ? { currency } : {}),
        ...(location !== undefined ? { location } : {}),
        ...(latitude !== undefined ? { latitude: Number(latitude) } : {}),
        ...(longitude !== undefined ? { longitude: Number(longitude) } : {}),
        ...(notes !== undefined ? { notes } : {}),
        ...(dayId !== undefined ? { dayId } : {}),
        ...(orderIndex !== undefined ? { orderIndex: Number(orderIndex) } : {}),
        updatedAt: new Date(),
      })
      .where(eq(itineraryActivities.id, activityId))
      .returning();

    res.json(updatedAct);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/activities/:activityId
router.delete('/activities/:activityId', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const { activityId } = req.params;
    const db = await getDb();

    const [act] = await db.select().from(itineraryActivities).where(eq(itineraryActivities.id, activityId));
    if (!act) throw new AppError('Activity not found', 404);

    const [itin] = await db.select().from(itineraries).where(eq(itineraries.id, act.itineraryId));
    await checkTripAccess(req.user!.id, itin.tripId, 'editor');

    await db.delete(itineraryActivities).where(eq(itineraryActivities.id, activityId));

    res.json({ success: true, message: 'Activity deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// POST /api/itinerary/:itineraryId/batch-update - Transaction-safe batch update & re-sequencing
router.post('/itinerary/:itineraryId/batch-update', optionalAuth, async (req: AuthRequest, res, next) => {
  try {
    const { itineraryId } = req.params;
    const { activityMoves, dayUpdates } = req.body;
    const db = await getDb();

    const [itin] = await db.select().from(itineraries).where(eq(itineraries.id, itineraryId));
    if (!itin) throw new AppError('Itinerary not found', 404);

    if (req.user?.id) {
      await checkTripAccess(req.user.id, itin.tripId, 'editor');
    }

    // 1. Process Day updates if any
    if (Array.isArray(dayUpdates)) {
      for (const d of dayUpdates) {
        if (d.id) {
          await db
            .update(itineraryDays)
            .set({
              ...(d.dayNumber !== undefined ? { dayNumber: Number(d.dayNumber) } : {}),
              ...(d.date ? { date: d.date } : {}),
              ...(d.title ? { title: d.title } : {}),
              ...(d.theme !== undefined ? { theme: d.theme } : {}),
            })
            .where(eq(itineraryDays.id, d.id));
        }
      }
    }

    // 2. Process Activity Moves / Re-sequencing
    if (Array.isArray(activityMoves)) {
      for (const act of activityMoves) {
        if (act.id) {
          const [existing] = await db
            .select()
            .from(itineraryActivities)
            .where(eq(itineraryActivities.id, act.id));

          if (existing) {
            await db
              .update(itineraryActivities)
              .set({
                ...(act.dayId !== undefined ? { dayId: act.dayId } : {}),
                ...(act.orderIndex !== undefined ? { orderIndex: Number(act.orderIndex) } : {}),
                ...(act.startTime !== undefined ? { startTime: act.startTime } : {}),
                ...(act.durationMinutes !== undefined ? { durationMinutes: Number(act.durationMinutes) } : {}),
                ...(act.cost !== undefined ? { cost: Number(act.cost) } : {}),
                updatedAt: new Date(),
              })
              .where(eq(itineraryActivities.id, act.id));
          } else {
            // Activity was created locally, insert into DB
            await db.insert(itineraryActivities).values({
              id: act.id,
              itineraryId,
              dayId: act.dayId || null,
              title: act.title || 'Activity',
              category: act.category || 'place',
              startTime: act.startTime || '10:00',
              durationMinutes: Number(act.durationMinutes) || 60,
              cost: Number(act.cost) || 0,
              currency: act.currency || 'INR',
              location: act.location || itin.destination,
              latitude: act.latitude ? Number(act.latitude) : null,
              longitude: act.longitude ? Number(act.longitude) : null,
              notes: act.notes || '',
              orderIndex: act.orderIndex !== undefined ? Number(act.orderIndex) : 0,
              createdAt: new Date(),
              updatedAt: new Date(),
            });
          }
        }
      }
    }

    // 3. Return fresh, fully synchronized itinerary
    const days = await db
      .select()
      .from(itineraryDays)
      .where(eq(itineraryDays.itineraryId, itineraryId))
      .orderBy(asc(itineraryDays.dayNumber));

    const activities = await db
      .select()
      .from(itineraryActivities)
      .where(eq(itineraryActivities.itineraryId, itineraryId))
      .orderBy(asc(itineraryActivities.orderIndex));

    const totalCost = activities.reduce((sum, a) => sum + (Number(a.cost) || 0), 0);

    res.json({
      success: true,
      itinerary: {
        ...itin,
        days: days.map((d) => ({
          ...d,
          activities: activities.filter((a) => a.dayId === d.id),
        })),
        unscheduledActivities: activities.filter((a) => !a.dayId),
        totalCost,
      },
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/activities/reorder
router.put('/activities/reorder', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const { activityOrders } = req.body; // array of { id, dayId, orderIndex }
    if (!Array.isArray(activityOrders)) {
      throw new AppError('activityOrders array is required', 422);
    }

    const db = await getDb();

    for (const item of activityOrders) {
      if (item.id) {
        await db
          .update(itineraryActivities)
          .set({
            ...(item.dayId !== undefined ? { dayId: item.dayId } : {}),
            ...(item.orderIndex !== undefined ? { orderIndex: item.orderIndex } : {}),
            updatedAt: new Date(),
          })
          .where(eq(itineraryActivities.id, item.id));
      }
    }

    res.json({ success: true, message: 'Activities reordered successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
