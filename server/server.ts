import express from 'express';
import cors from 'cors';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { getDb } from './db/index.ts';
import { users } from './db/schema.ts';
import { errorHandler } from './middleware/errorHandler.ts';
import authRouter from './routes/auth.ts';
import profileRouter from './routes/profile.ts';
import tripsRouter from './routes/trips.ts';
import citiesRouter from './routes/cities.ts';
import itinerariesRouter from './routes/itineraries.ts';
import budgetRouter from './routes/budget.ts';
import expensesRouter from './routes/expenses.ts';
import sharingRouter from './routes/sharing.ts';
import migrationRouter from './routes/migration.ts';
import { seedDemoData } from './services/seedService.ts';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 1. Health Check Endpoint
app.get('/api/health', async (req, res) => {
  try {
    const db = await getDb();
    const { getDatabaseInfo } = await import('./db/index.ts');
    const info = await getDatabaseInfo();
    // Test simple query from public.users
    await db.select().from(users).limit(1);
    res.json({
      status: 'ok',
      database: 'connected',
      currentDatabase: info.current_database,
      currentSchema: info.current_schema,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Database health check failed:', error);
    res.status(500).json({
      status: 'error',
      database: 'disconnected',
      error: error?.message || 'Database connection error',
    });
  }
});

// 2. Database Schema & Tables Inspection Endpoint
app.get('/api/db/inspect', async (req, res) => {
  try {
    const db = await getDb();
    const { getDatabaseInfo } = await import('./db/index.ts');
    const info = await getDatabaseInfo();
    const { sql } = await import('drizzle-orm');
    const tablesResult = await db.execute(
      sql`SELECT table_schema, table_name, table_type FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;`
    );
    const userCountResult = await db.execute(sql`SELECT count(*)::int as count FROM public.users;`);
    const usersResult = await db.execute(
      sql`SELECT id, email, name, avatar_url, preferred_currency, created_at, (password_hash LIKE '$2%') as is_bcrypt_hashed FROM public.users ORDER BY created_at DESC;`
    );
    const userViewResult = await db.execute(
      sql`SELECT id, email, name, "preferredCurrency" FROM public."User" ORDER BY "createdAt" DESC;`
    );

    res.json({
      status: 'ok',
      currentDatabase: info.current_database,
      currentSchema: info.current_schema,
      tables: tablesResult.rows || tablesResult,
      totalUsers: userCountResult.rows?.[0]?.count ?? 0,
      users: usersResult.rows || usersResult,
      userViewCount: (userViewResult.rows || userViewResult).length,
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      error: error?.message || 'Failed to inspect database',
    });
  }
});

// 3. Demo Seed Endpoint
app.post('/api/seed', async (req, res, next) => {
  try {
    const seedResult = await seedDemoData();
    res.json({
      success: true,
      message: 'Demo dataset seeded successfully.',
      ...seedResult,
    });
  } catch (error) {
    next(error);
  }
});

// 3. Mount All REST Routers
app.use('/api/auth', authRouter);
app.use('/api/profile', profileRouter);
app.use('/api/trips', tripsRouter);
app.use('/api', citiesRouter);
app.use('/api', itinerariesRouter);
app.use('/api', budgetRouter);
app.use('/api', expensesRouter);
app.use('/api', sharingRouter);
app.use('/api/migration', migrationRouter);

async function startServer() {
  try {
    console.log('[Server] Connecting to PostgreSQL database (Travel) and initializing tables...');
    // Await database connection and table initialization before listening to traffic
    await getDb();
    console.log('[Server] Seeding initial baseline datasets if needed...');
    await seedDemoData();
    console.log('[Server] Database initialization and schema verification complete.');

    // 1. Setup Vite dev middleware or static serving
    if (process.env.NODE_ENV !== 'production') {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } else {
      const distPath = path.join(process.cwd(), 'dist');
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }

    // 2. Error Handler
    app.use(errorHandler);

    // 3. Start HTTP Server
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`GlobeTrotter Server is running on http://0.0.0.0:${PORT}`);
    });
  } catch (err: any) {
    console.error('[Server] CRITICAL: Failed to start server or initialize PostgreSQL database:', err);
    process.exit(1);
  }
}

startServer();

export default app;
