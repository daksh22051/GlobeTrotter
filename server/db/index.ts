import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import { PGlite } from '@electric-sql/pglite';
import pg from 'pg';
import * as schema from './schema.ts';
import fs from 'fs';
import path from 'path';

const { Pool } = pg;

// Data directory for persistent PostgreSQL storage
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

let dbInstance: any = null;
let pgliteInstance: PGlite | null = null;
let pgPoolInstance: pg.Pool | null = null;
let currentDbName = 'Travel';
let currentSchemaName = 'public';

/**
 * Utility to parse and sanitize database connection strings for comprehensive logging
 */
function parseConnectionStringForLogging(connStr: string) {
  try {
    const url = new URL(connStr);
    return {
      protocol: url.protocol.replace(':', ''),
      user: url.username,
      hasPassword: !!url.password,
      passwordLength: url.password ? url.password.length : 0,
      host: url.hostname,
      port: url.port || '5432',
      database: url.pathname.replace(/^\//, '') || 'Travel',
      searchParams: Object.fromEntries(url.searchParams.entries()),
      sanitizedString: connStr.replace(/:[^:@]+@/, ':****@'),
    };
  } catch {
    return {
      protocol: 'postgresql',
      user: 'unknown',
      hasPassword: false,
      passwordLength: 0,
      host: 'unknown',
      port: '5432',
      database: 'Travel',
      searchParams: {},
      sanitizedString: connStr.replace(/:[^:@]+@/, ':****@'),
    };
  }
}

async function getOrCreatePglite(): Promise<PGlite> {
  if (pgliteInstance && (pgliteInstance as any).ready) return pgliteInstance;

  const pgPath = path.join(dataDir, 'travel_pg.db');
  console.log(`[PostgreSQL:Storage] Initializing persistent PGlite storage at path: "${pgPath}"`);

  try {
    const instance = new PGlite(pgPath);
    await instance.waitReady;
    pgliteInstance = instance;
    console.log(`[PostgreSQL:Storage] Persistent PGlite ready at: "${pgPath}"`);
    return pgliteInstance;
  } catch (err: any) {
    console.warn('[PostgreSQL:Storage] Notice during storage initialization:', {
      message: err?.message,
      code: err?.code,
    });
    try {
      if (fs.existsSync(pgPath)) {
        fs.rmSync(pgPath, { recursive: true, force: true });
      }
    } catch {}

    const instance = new PGlite(pgPath);
    await instance.waitReady;
    pgliteInstance = instance;
    console.log(`[PostgreSQL:Storage] Recreated persistent storage at: "${pgPath}"`);
    return pgliteInstance;
  }
}

export async function getDb() {
  if (dbInstance) return dbInstance;

  const rawUrl = (process.env.DATABASE_URL || '').trim();
  const isLocalhost =
    rawUrl.includes('localhost') ||
    rawUrl.includes('127.0.0.1') ||
    rawUrl.includes('0.0.0.0') ||
    rawUrl.includes('::1');
  const hasValidExternalDatabaseUrl = Boolean(rawUrl && !isLocalhost && rawUrl.startsWith('postgres'));

  console.log('[PostgreSQL:Init] Database Engine Initialization:', {
    hasExternalDb: hasValidExternalDatabaseUrl,
    mode: hasValidExternalDatabaseUrl ? 'External Cloud PostgreSQL (TCP)' : 'High-Performance Persistent PostgreSQL (PGlite)',
    targetDatabase: 'Travel',
    targetSchema: 'public',
  });

  try {
    // 1. Attempt connection with external PostgreSQL server ONLY if a valid remote DATABASE_URL is explicitly configured
    if (hasValidExternalDatabaseUrl) {
      const connDetails = parseConnectionStringForLogging(rawUrl);
      let pool: pg.Pool | null = null;
      try {
        console.log(`[PostgreSQL:TCP] Connecting to remote PostgreSQL at ${connDetails.sanitizedString}...`);
        pool = new Pool({
          connectionString: rawUrl,
          max: 10,
          connectionTimeoutMillis: 3000,
        });

        pool.on('error', () => {
          // Suppress idle client errors on pool fallback
        });

        const client = await pool.connect();
        const checkRes = await client.query('SELECT current_database() as db_name, current_schema() as schema_name, version() as pg_version;');
        currentDbName = checkRes.rows[0]?.db_name || 'Travel';
        currentSchemaName = checkRes.rows[0]?.schema_name || 'public';
        const pgVersion = checkRes.rows[0]?.pg_version;
        client.release();

        console.log(`[PostgreSQL:TCP] Remote database connection established successfully: ${currentDbName}`);
        pgPoolInstance = pool;
        dbInstance = drizzlePg(pgPoolInstance, { schema });
      } catch (err: any) {
        if (pool) {
          try {
            await pool.end();
          } catch {}
        }
        console.log(`[PostgreSQL] Remote database unreachable (${err.code || err.message}). Activating persistent embedded PostgreSQL engine.`);
      }
    }

    // 2. Use embedded PostgreSQL (PGlite) engine if direct pool is not active
    if (!dbInstance) {
      console.log(`[PostgreSQL:Engine] Initializing embedded persistent PostgreSQL engine (PGlite)...`);
      const pglite = await getOrCreatePglite();
      const { drizzle: drizzlePglite } = await import('drizzle-orm/pglite');
      dbInstance = drizzlePglite(pglite, { schema });
      currentDbName = 'Travel';
      currentSchemaName = 'public';
      console.log(`[PostgreSQL:Engine] Ready: Database "${currentDbName}" in schema "${currentSchemaName}"`);
    }

    // 3. Ensure all tables and views are initialized in public schema before returning
    await initTables();

    return dbInstance;
  } catch (err: any) {
    dbInstance = null;
    pgliteInstance = null;
    console.error('[PostgreSQL:Init:Error] Database initialization failed:', err?.message || err);
    throw err;
  }
}

export async function getDatabaseInfo() {
  await getDb();
  if (pgPoolInstance) {
    const res = await pgPoolInstance.query('SELECT current_database() as current_database, current_schema() as current_schema;');
    return res.rows[0];
  } else if (pgliteInstance) {
    return {
      current_database: currentDbName,
      current_schema: currentSchemaName,
    };
  }
  return {
    current_database: currentDbName,
    current_schema: currentSchemaName,
  };
}

export async function initTables() {
  console.log(`[PostgreSQL] Ensuring tables and views exist in database "${currentDbName}" under schema "${currentSchemaName}"...`);

  const initSql = `
    SET search_path TO public;

    -- 1. users table
    CREATE TABLE IF NOT EXISTS public.users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      avatar_url TEXT,
      preferred_currency TEXT NOT NULL DEFAULT 'INR',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    -- 2. user_preferences table
    CREATE TABLE IF NOT EXISTS public.user_preferences (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
      interests TEXT,
      travel_style TEXT,
      travel_pace TEXT,
      budget_style TEXT,
      companion TEXT,
      personality TEXT,
      currency TEXT DEFAULT 'INR',
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    -- 3. trips table
    CREATE TABLE IF NOT EXISTS public.trips (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      origin TEXT,
      origin_country TEXT,
      status TEXT NOT NULL DEFAULT 'planning',
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      budget REAL NOT NULL DEFAULT 0,
      currency TEXT NOT NULL DEFAULT 'INR',
      is_favorite BOOLEAN NOT NULL DEFAULT FALSE,
      is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    ALTER TABLE public.trips ADD COLUMN IF NOT EXISTS origin TEXT;
    ALTER TABLE public.trips ADD COLUMN IF NOT EXISTS origin_country TEXT;
    ALTER TABLE public.trips ADD COLUMN IF NOT EXISTS cover_image TEXT;

    -- 4. trip_cities table
    CREATE TABLE IF NOT EXISTS public.trip_cities (
      id TEXT PRIMARY KEY,
      trip_id TEXT NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
      city_name TEXT NOT NULL,
      country TEXT NOT NULL,
      order_index INTEGER NOT NULL DEFAULT 0,
      arrival_date TEXT,
      departure_date TEXT,
      stay_duration_days INTEGER NOT NULL DEFAULT 1,
      latitude REAL,
      longitude REAL
    );

    -- 5. itineraries table
    CREATE TABLE IF NOT EXISTS public.itineraries (
      id TEXT PRIMARY KEY,
      trip_id TEXT NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      destination TEXT NOT NULL,
      country TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    -- 6. itinerary_days table
    CREATE TABLE IF NOT EXISTS public.itinerary_days (
      id TEXT PRIMARY KEY,
      itinerary_id TEXT NOT NULL REFERENCES public.itineraries(id) ON DELETE CASCADE,
      day_number INTEGER NOT NULL,
      date TEXT NOT NULL,
      title TEXT NOT NULL,
      theme TEXT
    );

    -- 7. itinerary_activities table
    CREATE TABLE IF NOT EXISTS public.itinerary_activities (
      id TEXT PRIMARY KEY,
      itinerary_id TEXT NOT NULL REFERENCES public.itineraries(id) ON DELETE CASCADE,
      day_id TEXT REFERENCES public.itinerary_days(id) ON DELETE SET NULL,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      start_time TEXT,
      duration_minutes INTEGER NOT NULL DEFAULT 60,
      cost REAL NOT NULL DEFAULT 0,
      currency TEXT NOT NULL DEFAULT 'INR',
      location TEXT,
      latitude REAL,
      longitude REAL,
      notes TEXT,
      order_index INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    -- 8. budget_allocations table
    CREATE TABLE IF NOT EXISTS public.budget_allocations (
      id TEXT PRIMARY KEY,
      trip_id TEXT NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
      category TEXT NOT NULL,
      percentage REAL NOT NULL,
      planned_amount REAL NOT NULL
    );

    -- 9. expenses table
    CREATE TABLE IF NOT EXISTS public.expenses (
      id TEXT PRIMARY KEY,
      trip_id TEXT NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      amount REAL NOT NULL,
      currency TEXT NOT NULL DEFAULT 'INR',
      date TEXT NOT NULL,
      payment_method TEXT NOT NULL DEFAULT 'Credit Card',
      notes TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    -- 10. trip_collaborators table
    CREATE TABLE IF NOT EXISTS public.trip_collaborators (
      id TEXT PRIMARY KEY,
      trip_id TEXT NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
      user_id TEXT REFERENCES public.users(id) ON DELETE SET NULL,
      email TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'viewer',
      status TEXT NOT NULL DEFAULT 'pending',
      invited_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      accepted_at TIMESTAMP
    );

    -- 11. shared_trip_links table
    CREATE TABLE IF NOT EXISTS public.shared_trip_links (
      id TEXT PRIMARY KEY,
      trip_id TEXT NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
      share_token TEXT NOT NULL UNIQUE,
      permission TEXT NOT NULL DEFAULT 'view',
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      expires_at TIMESTAMP
    );

    -- 12. cities catalog table
    CREATE TABLE IF NOT EXISTS public.cities (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      country TEXT NOT NULL,
      region TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      cost_index REAL NOT NULL DEFAULT 1.0,
      popularity_rating REAL NOT NULL DEFAULT 4.5,
      review_count INTEGER NOT NULL DEFAULT 1000,
      estimated_daily_budget REAL NOT NULL DEFAULT 3000,
      currency TEXT NOT NULL DEFAULT 'INR',
      image_url TEXT NOT NULL,
      short_description TEXT NOT NULL,
      tagline TEXT NOT NULL,
      best_for TEXT NOT NULL,
      tags TEXT NOT NULL,
      highlights TEXT NOT NULL,
      is_domestic BOOLEAN NOT NULL DEFAULT FALSE,
      is_featured BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    -- 13. activities catalog table
    CREATE TABLE IF NOT EXISTS public.activities (
      id TEXT PRIMARY KEY,
      city_id TEXT REFERENCES public.cities(id) ON DELETE CASCADE,
      city_name TEXT NOT NULL,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      estimated_cost REAL NOT NULL DEFAULT 0,
      currency TEXT NOT NULL DEFAULT 'INR',
      duration_minutes INTEGER NOT NULL DEFAULT 60,
      rating REAL NOT NULL DEFAULT 4.8,
      review_count INTEGER NOT NULL DEFAULT 500,
      location TEXT NOT NULL,
      latitude REAL,
      longitude REAL,
      image_url TEXT,
      tags TEXT,
      best_time TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'activities' AND column_name = 'cityname'
      ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'activities' AND column_name = 'city_name'
      ) THEN
        ALTER TABLE public.activities RENAME COLUMN cityname TO city_name;
      END IF;
    END $$;

    -- 14. "User" view created after public.users is confirmed to exist
    CREATE OR REPLACE VIEW public."User" AS 
    SELECT 
      id, 
      email, 
      password_hash as "passwordHash", 
      name, 
      avatar_url as "avatarUrl", 
      preferred_currency as "preferredCurrency", 
      created_at as "createdAt", 
      updated_at as "updatedAt" 
    FROM public.users;
  `;

  try {
    if (pgPoolInstance) {
      await pgPoolInstance.query(initSql);
    } else if (pgliteInstance) {
      await pgliteInstance.exec(initSql);
    }
    console.log(`[PostgreSQL:DDL] All 13 tables and "User" view verified and ready in schema "${currentSchemaName}" for database "${currentDbName}".`);
  } catch (err: any) {
    console.error('[PostgreSQL:DDL:CRITICAL] Table initialization error encountered:', {
      message: err.message,
      code: err.code || 'UNKNOWN',
      errno: err.errno,
      syscall: err.syscall,
      detail: err.detail,
      hint: err.hint,
      position: err.position,
      table: err.table,
      schema: err.schema,
      stack: err.stack,
    });
    throw err;
  }
}


