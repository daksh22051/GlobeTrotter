import { Router } from 'express';
import { getDb } from '../db/index.ts';
import { budgetAllocations, trips } from '../db/schema.ts';
import { eq } from 'drizzle-orm';
import { requireAuth, optionalAuth, AuthRequest } from '../middleware/auth.ts';
import { AppError } from '../middleware/errorHandler.ts';
import { checkTripAccess } from '../services/tripPermissionService.ts';
import crypto from 'crypto';

const router = Router();

// GET /api/trips/:tripId/budget
router.get('/trips/:tripId/budget', optionalAuth, async (req: AuthRequest, res, next) => {
  try {
    const { tripId } = req.params;
    await checkTripAccess(req.user?.id, tripId, 'viewer');
    const db = await getDb();

    const [trip] = await db.select().from(trips).where(eq(trips.id, tripId));
    if (!trip) throw new AppError('Trip not found', 404);

    const allocations = await db
      .select()
      .from(budgetAllocations)
      .where(eq(budgetAllocations.tripId, tripId));

    res.json({
      tripId,
      totalBudget: trip.budget,
      currency: trip.currency,
      allocations,
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/trips/:tripId/budget
router.put('/trips/:tripId/budget', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const { tripId } = req.params;
    const { totalBudget, currency, allocations } = req.body;

    await checkTripAccess(req.user!.id, tripId, 'editor');
    const db = await getDb();

    if (totalBudget !== undefined || currency) {
      await db
        .update(trips)
        .set({
          ...(totalBudget !== undefined ? { budget: Number(totalBudget) } : {}),
          ...(currency ? { currency } : {}),
          updatedAt: new Date(),
        })
        .where(eq(trips.id, tripId));
    }

    if (Array.isArray(allocations)) {
      // Clear existing allocations and re-insert
      await db.delete(budgetAllocations).where(eq(budgetAllocations.tripId, tripId));

      const [trip] = await db.select().from(trips).where(eq(trips.id, tripId));
      const currentBudget = totalBudget !== undefined ? Number(totalBudget) : (trip?.budget || 50000);

      for (const alloc of allocations) {
        const percentage = Number(alloc.percentage) || 0;
        const plannedAmount = alloc.plannedAmount !== undefined ? Number(alloc.plannedAmount) : Math.round((currentBudget * percentage) / 100);
        await db.insert(budgetAllocations).values({
          id: 'alloc_' + crypto.randomUUID(),
          tripId,
          category: alloc.category,
          percentage,
          plannedAmount,
        });
      }
    }

    const updatedAllocations = await db
      .select()
      .from(budgetAllocations)
      .where(eq(budgetAllocations.tripId, tripId));

    const [updatedTrip] = await db.select().from(trips).where(eq(trips.id, tripId));

    res.json({
      tripId,
      totalBudget: updatedTrip.budget,
      currency: updatedTrip.currency,
      allocations: updatedAllocations,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
