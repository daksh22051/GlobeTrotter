import { Router } from 'express';
import { getDb } from '../db/index.ts';
import { users, userPreferences } from '../db/schema.ts';
import { eq } from 'drizzle-orm';
import { requireAuth, AuthRequest } from '../middleware/auth.ts';
import { AppError } from '../middleware/errorHandler.ts';
import crypto from 'crypto';

const router = Router();

// GET /api/profile
router.get('/', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const db = await getDb();
    const [user] = await db.select().from(users).where(eq(users.id, req.user!.id));

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const [prefs] = await db.select().from(userPreferences).where(eq(userPreferences.userId, user.id));

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        preferredCurrency: user.preferredCurrency,
        createdAt: user.createdAt,
      },
      preferences: prefs
        ? {
            ...prefs,
            interests: prefs.interests ? JSON.parse(prefs.interests) : [],
          }
        : null,
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/profile
router.put('/', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const { name, email, avatarUrl, preferredCurrency } = req.body;
    const db = await getDb();

    const [updatedUser] = await db
      .update(users)
      .set({
        ...(name ? { name: name.trim() } : {}),
        ...(email ? { email: email.trim().toLowerCase() } : {}),
        ...(avatarUrl !== undefined ? { avatarUrl } : {}),
        ...(preferredCurrency ? { preferredCurrency } : {}),
        updatedAt: new Date(),
      })
      .where(eq(users.id, req.user!.id))
      .returning();

    res.json({
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        avatarUrl: updatedUser.avatarUrl,
        preferredCurrency: updatedUser.preferredCurrency,
        createdAt: updatedUser.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/profile/preferences
router.get('/preferences', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const db = await getDb();
    const [prefs] = await db.select().from(userPreferences).where(eq(userPreferences.userId, req.user!.id));

    if (!prefs) {
      // return default
      return res.json({
        interests: ['Culture', 'Food', 'Nature', 'Photography'],
        travelStyle: 'Balanced',
        travelPace: 'Moderate',
        budgetStyle: 'Mid-range',
        companion: 'Friends',
        personality: 'Explorer',
        currency: 'INR',
      });
    }

    res.json({
      id: prefs.id,
      userId: prefs.userId,
      interests: prefs.interests ? JSON.parse(prefs.interests) : [],
      travelStyle: prefs.travelStyle,
      travelPace: prefs.travelPace,
      budgetStyle: prefs.budgetStyle,
      companion: prefs.companion,
      personality: prefs.personality,
      currency: prefs.currency,
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/profile/preferences
router.put('/preferences', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const { interests, travelStyle, travelPace, budgetStyle, companion, personality, currency } = req.body;
    const db = await getDb();
    const userId = req.user!.id;

    const [existing] = await db.select().from(userPreferences).where(eq(userPreferences.userId, userId));

    let updatedPrefs;
    if (existing) {
      [updatedPrefs] = await db
        .update(userPreferences)
        .set({
          interests: interests ? JSON.stringify(interests) : existing.interests,
          travelStyle: travelStyle ?? existing.travelStyle,
          travelPace: travelPace ?? existing.travelPace,
          budgetStyle: budgetStyle ?? existing.budgetStyle,
          companion: companion ?? existing.companion,
          personality: personality ?? existing.personality,
          currency: currency ?? existing.currency,
          updatedAt: new Date(),
        })
        .where(eq(userPreferences.userId, userId))
        .returning();
    } else {
      [updatedPrefs] = await db
        .insert(userPreferences)
        .values({
          id: 'pref_' + crypto.randomUUID(),
          userId,
          interests: JSON.stringify(interests || []),
          travelStyle,
          travelPace,
          budgetStyle,
          companion,
          personality,
          currency: currency || 'INR',
          updatedAt: new Date(),
        })
        .returning();
    }

    res.json({
      id: updatedPrefs.id,
      userId: updatedPrefs.userId,
      interests: updatedPrefs.interests ? JSON.parse(updatedPrefs.interests) : [],
      travelStyle: updatedPrefs.travelStyle,
      travelPace: updatedPrefs.travelPace,
      budgetStyle: updatedPrefs.budgetStyle,
      companion: updatedPrefs.companion,
      personality: updatedPrefs.personality,
      currency: updatedPrefs.currency,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
