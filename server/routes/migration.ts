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
  userPreferences,
} from '../db/schema.ts';
import { eq } from 'drizzle-orm';
import { requireAuth, AuthRequest } from '../middleware/auth.ts';
import crypto from 'crypto';

const router = Router();

// POST /api/migration/import - import client-side localStorage data into PostgreSQL
router.post('/import', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const { localTrips = [], localPreferences, localExpenses = [] } = req.body;
    const db = await getDb();
    const userId = req.user!.id;

    let importedTripsCount = 0;
    let importedExpensesCount = 0;

    // 1. Import Preferences if present
    if (localPreferences) {
      const [existingPref] = await db.select().from(userPreferences).where(eq(userPreferences.userId, userId));
      if (existingPref) {
        await db
          .update(userPreferences)
          .set({
            interests: localPreferences.interests ? JSON.stringify(localPreferences.interests) : existingPref.interests,
            travelStyle: localPreferences.travelStyle || existingPref.travelStyle,
            travelPace: localPreferences.travelPace || existingPref.travelPace,
            budgetStyle: localPreferences.budgetStyle || existingPref.budgetStyle,
            companion: localPreferences.companion || existingPref.companion,
            personality: localPreferences.personality || existingPref.personality,
            currency: localPreferences.currency || existingPref.currency,
            updatedAt: new Date(),
          })
          .where(eq(userPreferences.userId, userId));
      }
    }

    // 2. Import Trips
    for (const trip of localTrips) {
      if (!trip.name) continue;

      // Check if trip already exists by id
      const tripId = trip.id && typeof trip.id === 'string' ? trip.id : 'trip_' + crypto.randomUUID();
      const [existing] = await db.select().from(trips).where(eq(trips.id, tripId));

      if (!existing) {
        await db.insert(trips).values({
          id: tripId,
          userId,
          name: trip.name,
          status: trip.status || 'planning',
          startDate: trip.startDate || new Date().toISOString().split('T')[0],
          endDate: trip.endDate || new Date().toISOString().split('T')[0],
          budget: Number(trip.budget) || 50000,
          currency: trip.currency || 'INR',
          isFavorite: !!trip.isFavorite,
          isPinned: !!trip.isPinned,
          createdAt: trip.createdAt ? new Date(trip.createdAt) : new Date(),
          updatedAt: new Date(),
        });

        // Insert cities
        const rawCities = Array.isArray(trip.cities) && trip.cities.length > 0
          ? trip.cities
          : [{ cityName: trip.destination || trip.name, country: trip.country || 'India', orderIndex: 0 }];

        for (let i = 0; i < rawCities.length; i++) {
          const c = rawCities[i];
          await db.insert(tripCities).values({
            id: 'city_' + crypto.randomUUID(),
            tripId,
            cityName: c.cityName || c.name || 'Destination',
            country: c.country || trip.country || 'India',
            orderIndex: c.orderIndex !== undefined ? c.orderIndex : i,
            arrivalDate: c.arrivalDate || trip.startDate,
            departureDate: c.departureDate || trip.endDate,
            stayDurationDays: Number(c.stayDurationDays) || 1,
            latitude: c.latitude ? Number(c.latitude) : null,
            longitude: c.longitude ? Number(c.longitude) : null,
          });
        }

        // Insert Itinerary & days if present in local data
        const itinId = 'itin_' + crypto.randomUUID();
        await db.insert(itineraries).values({
          id: itinId,
          tripId,
          title: `${trip.name} Itinerary`,
          destination: rawCities.map((c: any) => c.cityName || c.name).join(' → '),
          country: trip.country || 'India',
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        if (trip.itinerary && Array.isArray(trip.itinerary.days)) {
          for (const d of trip.itinerary.days) {
            const dayId = 'day_' + crypto.randomUUID();
            await db.insert(itineraryDays).values({
              id: dayId,
              itineraryId: itinId,
              dayNumber: d.dayNumber,
              date: d.date,
              title: d.title,
              theme: d.theme || 'Sightseeing',
            });

            if (Array.isArray(d.activities)) {
              for (let a = 0; a < d.activities.length; a++) {
                const act = d.activities[a];
                await db.insert(itineraryActivities).values({
                  id: 'act_' + crypto.randomUUID(),
                  itineraryId: itinId,
                  dayId,
                  title: act.title,
                  category: act.category || 'Sightseeing',
                  startTime: act.startTime,
                  durationMinutes: Number(act.durationMinutes) || 60,
                  cost: Number(act.cost) || 0,
                  currency: act.currency || trip.currency || 'INR',
                  location: act.location || '',
                  latitude: act.latitude ? Number(act.latitude) : null,
                  longitude: act.longitude ? Number(act.longitude) : null,
                  notes: act.notes || '',
                  orderIndex: a,
                });
              }
            }
          }
        }

        // Budget allocations
        const defaultCategories = [
          { category: 'Hotels', percentage: 35, plannedAmount: Math.round((trip.budget || 50000) * 0.35) },
          { category: 'Food', percentage: 25, plannedAmount: Math.round((trip.budget || 50000) * 0.25) },
          { category: 'Transport', percentage: 20, plannedAmount: Math.round((trip.budget || 50000) * 0.20) },
          { category: 'Activities', percentage: 12, plannedAmount: Math.round((trip.budget || 50000) * 0.12) },
          { category: 'Shopping', percentage: 5, plannedAmount: Math.round((trip.budget || 50000) * 0.05) },
          { category: 'Other', percentage: 3, plannedAmount: Math.round((trip.budget || 50000) * 0.03) },
        ];

        for (const alloc of defaultCategories) {
          await db.insert(budgetAllocations).values({
            id: 'alloc_' + crypto.randomUUID(),
            tripId,
            ...alloc,
          });
        }

        importedTripsCount++;
      }
    }

    // 3. Import Expenses
    for (const exp of localExpenses) {
      if (!exp.title || !exp.tripId) continue;
      const expId = exp.id || 'exp_' + crypto.randomUUID();
      const [existing] = await db.select().from(expenses).where(eq(expenses.id, expId));
      if (!existing) {
        await db.insert(expenses).values({
          id: expId,
          tripId: exp.tripId,
          userId,
          title: exp.title,
          category: exp.category || 'Other',
          amount: Number(exp.amount) || 0,
          currency: exp.currency || 'INR',
          date: exp.date || new Date().toISOString().split('T')[0],
          paymentMethod: exp.paymentMethod || 'Credit Card',
          notes: exp.notes || '',
          createdAt: new Date(),
        });
        importedExpensesCount++;
      }
    }

    res.json({
      success: true,
      message: `Successfully imported ${importedTripsCount} trips and ${importedExpensesCount} expenses into your account.`,
      importedTripsCount,
      importedExpensesCount,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
