import { Router } from 'express';
import { getDb } from '../db/index.ts';
import { expenses, trips } from '../db/schema.ts';
import { eq, desc } from 'drizzle-orm';
import { requireAuth, optionalAuth, AuthRequest } from '../middleware/auth.ts';
import { AppError } from '../middleware/errorHandler.ts';
import { checkTripAccess } from '../services/tripPermissionService.ts';
import crypto from 'crypto';

const router = Router();

// GET /api/trips/:tripId/expenses
router.get('/trips/:tripId/expenses', optionalAuth, async (req: AuthRequest, res, next) => {
  try {
    const { tripId } = req.params;
    await checkTripAccess(req.user?.id, tripId, 'viewer');
    const db = await getDb();

    const tripExpenses = await db
      .select()
      .from(expenses)
      .where(eq(expenses.tripId, tripId))
      .orderBy(desc(expenses.createdAt));

    res.json(tripExpenses);
  } catch (error) {
    next(error);
  }
});

// POST /api/trips/:tripId/expenses
router.post('/trips/:tripId/expenses', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const { tripId } = req.params;
    const { id, title, category, amount, currency, date, paymentMethod, notes } = req.body;

    if (!title || amount === undefined) {
      throw new AppError('Expense title and amount are required', 422);
    }

    await checkTripAccess(req.user!.id, tripId, 'editor');
    const db = await getDb();
    const [trip] = await db.select().from(trips).where(eq(trips.id, tripId));

    const expenseId = id || ('exp_' + crypto.randomUUID());
    const [newExpense] = await db
      .insert(expenses)
      .values({
        id: expenseId,
        tripId,
        userId: req.user!.id,
        title: title.trim(),
        category: category || 'Other',
        amount: Number(amount) || 0,
        currency: currency || trip.currency || 'INR',
        date: date || new Date().toISOString().split('T')[0],
        paymentMethod: paymentMethod || 'Credit Card',
        notes: notes || '',
        createdAt: new Date(),
      })
      .returning();

    res.status(201).json(newExpense);
  } catch (error) {
    next(error);
  }
});

// PUT /api/expenses/:expenseId
router.put('/expenses/:expenseId', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const { expenseId } = req.params;
    const { title, category, amount, currency, date, paymentMethod, notes } = req.body;

    const db = await getDb();
    const [exp] = await db.select().from(expenses).where(eq(expenses.id, expenseId));
    if (!exp) throw new AppError('Expense not found', 404);

    await checkTripAccess(req.user!.id, exp.tripId, 'editor');

    const [updatedExpense] = await db
      .update(expenses)
      .set({
        ...(title ? { title: title.trim() } : {}),
        ...(category ? { category } : {}),
        ...(amount !== undefined ? { amount: Number(amount) } : {}),
        ...(currency ? { currency } : {}),
        ...(date ? { date } : {}),
        ...(paymentMethod ? { paymentMethod } : {}),
        ...(notes !== undefined ? { notes } : {}),
      })
      .where(eq(expenses.id, expenseId))
      .returning();

    res.json(updatedExpense);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/expenses/:expenseId
router.delete('/expenses/:expenseId', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const { expenseId } = req.params;
    const db = await getDb();

    const [exp] = await db.select().from(expenses).where(eq(expenses.id, expenseId));
    if (!exp) throw new AppError('Expense not found', 404);

    await checkTripAccess(req.user!.id, exp.tripId, 'editor');

    await db.delete(expenses).where(eq(expenses.id, expenseId));

    res.json({ success: true, message: 'Expense deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
