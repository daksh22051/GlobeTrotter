import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { getDb } from '../db/index.ts';
import { users, userPreferences } from '../db/schema.ts';
import { eq } from 'drizzle-orm';
import { generateToken, requireAuth, AuthRequest } from '../middleware/auth.ts';
import { AppError } from '../middleware/errorHandler.ts';
import crypto from 'crypto';

const router = Router();

// POST /api/auth/register
router.post('/register', async (req, res, next) => {
  try {
    const { email, password, name, avatarUrl, preferredCurrency } = req.body;

    if (!email || !password || !name) {
      throw new AppError('Email, password, and name are required', 422);
    }

    if (password.length < 6) {
      throw new AppError('Password must be at least 6 characters long', 422);
    }

    const db = await getDb();
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const [existing] = await db.select().from(users).where(eq(users.email, normalizedEmail));
    if (existing) {
      throw new AppError('User with this email already exists', 409);
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const userId = 'usr_' + crypto.randomUUID();

    const [newUser] = await db
      .insert(users)
      .values({
        id: userId,
        email: normalizedEmail,
        passwordHash,
        name: name.trim(),
        avatarUrl: avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
        preferredCurrency: preferredCurrency || 'INR',
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    // Create default preferences
    const prefId = 'pref_' + crypto.randomUUID();
    await db.insert(userPreferences).values({
      id: prefId,
      userId: newUser.id,
      interests: JSON.stringify(['Culture', 'Food', 'Nature', 'Photography']),
      travelStyle: 'Balanced',
      travelPace: 'Moderate',
      budgetStyle: 'Mid-range',
      companion: 'Friends',
      personality: 'Explorer',
      currency: newUser.preferredCurrency,
      updatedAt: new Date(),
    });

    const token = generateToken({
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
    });

    res.status(201).json({
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        avatarUrl: newUser.avatarUrl,
        preferredCurrency: newUser.preferredCurrency,
        createdAt: newUser.createdAt,
      },
      token,
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError('Email and password are required', 422);
    }

    const db = await getDb();
    const normalizedEmail = email.toLowerCase().trim();

    const [user] = await db.select().from(users).where(eq(users.email, normalizedEmail));
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new AppError('Invalid email or password', 401);
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      name: user.name,
    });

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        preferredCurrency: user.preferredCurrency,
        createdAt: user.createdAt,
      },
      token,
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/google
router.post('/google', async (req, res, next) => {
  try {
    const { email, name, avatarUrl } = req.body;

    if (!email) {
      throw new AppError('Google account email is required', 422);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const normalizedEmail = email.toLowerCase().trim();
    if (!emailRegex.test(normalizedEmail)) {
      throw new AppError('Invalid Google email address format', 422);
    }

    const db = await getDb();

    // Check if user already exists in PostgreSQL "users" / "User" table
    let [user] = await db.select().from(users).where(eq(users.email, normalizedEmail));
    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      const userId = 'usr_' + crypto.randomUUID();
      const displayName = (name && name.trim()) || normalizedEmail.split('@')[0];
      const avatar =
        avatarUrl ||
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(displayName)}`;
      
      // Secure non-usable OAuth password hash placeholder (Google users authenticate via OAuth)
      const oauthPlaceholderHash = 'OAUTH_GOOGLE_' + crypto.randomBytes(16).toString('hex');

      [user] = await db
        .insert(users)
        .values({
          id: userId,
          email: normalizedEmail,
          passwordHash: oauthPlaceholderHash,
          name: displayName,
          avatarUrl: avatar,
          preferredCurrency: 'INR',
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      // Create default user preferences in PostgreSQL
      const prefId = 'pref_' + crypto.randomUUID();
      await db.insert(userPreferences).values({
        id: prefId,
        userId: user.id,
        interests: JSON.stringify(['Culture', 'Food', 'Nature', 'Photography']),
        travelStyle: 'Balanced',
        travelPace: 'Moderate',
        budgetStyle: 'Mid-range',
        companion: 'Friends',
        personality: 'Explorer',
        currency: 'INR',
        updatedAt: new Date(),
      });
    } else {
      // Update avatar or name if provided and not previously customized
      if (avatarUrl && (!user.avatarUrl || user.avatarUrl.includes('dicebear'))) {
        await db
          .update(users)
          .set({ avatarUrl, updatedAt: new Date() })
          .where(eq(users.id, user.id));
        user.avatarUrl = avatarUrl;
      }
    }

    // Generate normal application JWT session token
    const token = generateToken({
      id: user.id,
      email: user.email,
      name: user.name,
    });

    res.status(isNewUser ? 201 : 200).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        preferredCurrency: user.preferredCurrency,
        createdAt: user.createdAt,
      },
      token,
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
      isNewUser,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

// GET /api/auth/me
router.get('/me', requireAuth, async (req: AuthRequest, res, next) => {
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

export default router;
