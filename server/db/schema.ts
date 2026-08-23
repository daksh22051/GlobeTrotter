import { pgTable, text, integer, real, boolean, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// 1. Users Table
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name').notNull(),
  avatarUrl: text('avatar_url'),
  preferredCurrency: text('preferred_currency').default('INR').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 2. User Preferences Table
export const userPreferences = pgTable('user_preferences', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: 'cascade' }),
  interests: text('interests'), // JSON array string
  travelStyle: text('travel_style'),
  travelPace: text('travel_pace'),
  budgetStyle: text('budget_style'),
  companion: text('companion'),
  personality: text('personality'),
  currency: text('currency').default('INR'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 3. Trips Table
export const trips = pgTable('trips', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  origin: text('origin'),
  originCountry: text('origin_country'),
  coverImage: text('cover_image'),
  status: text('status').default('planning').notNull(), // 'planning' | 'confirmed' | 'completed'
  startDate: text('start_date').notNull(),
  endDate: text('end_date').notNull(),
  budget: real('budget').default(0).notNull(),
  currency: text('currency').default('INR').notNull(),
  isFavorite: boolean('is_favorite').default(false).notNull(),
  isPinned: boolean('is_pinned').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 4. Trip Cities (Multi-City Support)
export const tripCities = pgTable('trip_cities', {
  id: text('id').primaryKey(),
  tripId: text('trip_id')
    .notNull()
    .references(() => trips.id, { onDelete: 'cascade' }),
  cityName: text('city_name').notNull(),
  country: text('country').notNull(),
  orderIndex: integer('order_index').default(0).notNull(),
  arrivalDate: text('arrival_date'),
  departureDate: text('departure_date'),
  stayDurationDays: integer('stay_duration_days').default(1).notNull(),
  latitude: real('latitude'),
  longitude: real('longitude'),
});

// 5. Itineraries Table
export const itineraries = pgTable('itineraries', {
  id: text('id').primaryKey(),
  tripId: text('trip_id')
    .notNull()
    .references(() => trips.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  destination: text('destination').notNull(),
  country: text('country').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 6. Itinerary Days Table
export const itineraryDays = pgTable('itinerary_days', {
  id: text('id').primaryKey(),
  itineraryId: text('itinerary_id')
    .notNull()
    .references(() => itineraries.id, { onDelete: 'cascade' }),
  dayNumber: integer('day_number').notNull(),
  date: text('date').notNull(),
  title: text('title').notNull(),
  theme: text('theme'),
});

// 7. Itinerary Activities Table
export const itineraryActivities = pgTable('itinerary_activities', {
  id: text('id').primaryKey(),
  itineraryId: text('itinerary_id')
    .notNull()
    .references(() => itineraries.id, { onDelete: 'cascade' }),
  dayId: text('day_id').references(() => itineraryDays.id, { onDelete: 'set null' }),
  title: text('title').notNull(),
  category: text('category').notNull(),
  startTime: text('start_time'),
  durationMinutes: integer('duration_minutes').default(60).notNull(),
  cost: real('cost').default(0).notNull(),
  currency: text('currency').default('INR').notNull(),
  location: text('location'),
  latitude: real('latitude'),
  longitude: real('longitude'),
  notes: text('notes'),
  orderIndex: integer('order_index').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 8. Budget Allocations Table
export const budgetAllocations = pgTable('budget_allocations', {
  id: text('id').primaryKey(),
  tripId: text('trip_id')
    .notNull()
    .references(() => trips.id, { onDelete: 'cascade' }),
  category: text('category').notNull(),
  percentage: real('percentage').notNull(),
  plannedAmount: real('planned_amount').notNull(),
});

// 9. Expenses Table
export const expenses = pgTable('expenses', {
  id: text('id').primaryKey(),
  tripId: text('trip_id')
    .notNull()
    .references(() => trips.id, { onDelete: 'cascade' }),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  category: text('category').notNull(),
  amount: real('amount').notNull(),
  currency: text('currency').default('INR').notNull(),
  date: text('date').notNull(),
  paymentMethod: text('payment_method').default('Credit Card').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 10. Trip Collaborators Table
export const tripCollaborators = pgTable('trip_collaborators', {
  id: text('id').primaryKey(),
  tripId: text('trip_id')
    .notNull()
    .references(() => trips.id, { onDelete: 'cascade' }),
  userId: text('user_id').references(() => users.id, { onDelete: 'set null' }),
  email: text('email').notNull(),
  role: text('role').default('viewer').notNull(), // 'owner' | 'editor' | 'viewer'
  status: text('status').default('pending').notNull(), // 'pending' | 'accepted' | 'declined'
  invitedAt: timestamp('invited_at').defaultNow().notNull(),
  acceptedAt: timestamp('accepted_at'),
});

// 11. Shared Trip Links Table
export const sharedTripLinks = pgTable('shared_trip_links', {
  id: text('id').primaryKey(),
  tripId: text('trip_id')
    .notNull()
    .references(() => trips.id, { onDelete: 'cascade' }),
  shareToken: text('share_token').notNull().unique(),
  permission: text('permission').default('view').notNull(), // 'view' | 'edit'
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at'),
});

// =======================
// Relations Definitions
// =======================

export const usersRelations = relations(users, ({ one, many }) => ({
  preferences: one(userPreferences, {
    fields: [users.id],
    references: [userPreferences.userId],
  }),
  trips: many(trips),
  expenses: many(expenses),
  collaborations: many(tripCollaborators),
}));

export const userPreferencesRelations = relations(userPreferences, ({ one }) => ({
  user: one(users, {
    fields: [userPreferences.userId],
    references: [users.id],
  }),
}));

export const tripsRelations = relations(trips, ({ one, many }) => ({
  user: one(users, {
    fields: [trips.userId],
    references: [users.id],
  }),
  cities: many(tripCities),
  itineraries: many(itineraries),
  budgetAllocations: many(budgetAllocations),
  expenses: many(expenses),
  collaborators: many(tripCollaborators),
  sharedLinks: many(sharedTripLinks),
}));

export const tripCitiesRelations = relations(tripCities, ({ one }) => ({
  trip: one(trips, {
    fields: [tripCities.tripId],
    references: [trips.id],
  }),
}));

export const itinerariesRelations = relations(itineraries, ({ one, many }) => ({
  trip: one(trips, {
    fields: [itineraries.tripId],
    references: [trips.id],
  }),
  days: many(itineraryDays),
  activities: many(itineraryActivities),
}));

export const itineraryDaysRelations = relations(itineraryDays, ({ one, many }) => ({
  itinerary: one(itineraries, {
    fields: [itineraryDays.itineraryId],
    references: [itineraries.id],
  }),
  activities: many(itineraryActivities),
}));

export const itineraryActivitiesRelations = relations(itineraryActivities, ({ one }) => ({
  itinerary: one(itineraries, {
    fields: [itineraryActivities.itineraryId],
    references: [itineraries.id],
  }),
  day: one(itineraryDays, {
    fields: [itineraryActivities.dayId],
    references: [itineraryDays.id],
  }),
}));

export const budgetAllocationsRelations = relations(budgetAllocations, ({ one }) => ({
  trip: one(trips, {
    fields: [budgetAllocations.tripId],
    references: [trips.id],
  }),
}));

export const expensesRelations = relations(expenses, ({ one }) => ({
  trip: one(trips, {
    fields: [expenses.tripId],
    references: [trips.id],
  }),
  user: one(users, {
    fields: [expenses.userId],
    references: [users.id],
  }),
}));

export const tripCollaboratorsRelations = relations(tripCollaborators, ({ one }) => ({
  trip: one(trips, {
    fields: [tripCollaborators.tripId],
    references: [trips.id],
  }),
  user: one(users, {
    fields: [tripCollaborators.userId],
    references: [users.id],
  }),
}));

export const sharedTripLinksRelations = relations(sharedTripLinks, ({ one }) => ({
  trip: one(trips, {
    fields: [sharedTripLinks.tripId],
    references: [trips.id],
  }),
}));

// 12. Catalog Cities Table (Curated Global & Domestic Destinations)
export const cities = pgTable('cities', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  country: text('country').notNull(),
  region: text('region').notNull(),
  latitude: real('latitude').notNull(),
  longitude: real('longitude').notNull(),
  costIndex: real('cost_index').default(1.0).notNull(), // 1.0 = baseline, higher = more expensive
  popularityRating: real('popularity_rating').default(4.5).notNull(), // 1.0 - 5.0
  reviewCount: integer('review_count').default(1000).notNull(),
  estimatedDailyBudget: real('estimated_daily_budget').default(3000).notNull(),
  currency: text('currency').default('INR').notNull(),
  imageUrl: text('image_url').notNull(),
  shortDescription: text('short_description').notNull(),
  tagline: text('tagline').notNull(),
  bestFor: text('best_for').notNull(),
  tags: text('tags').notNull(), // JSON string array of tags
  highlights: text('highlights').notNull(), // JSON string array of highlights
  isDomestic: boolean('is_domestic').default(false).notNull(),
  isFeatured: boolean('is_featured').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 13. Catalog Activities Table (Curated Activities, Food Experiences, Landmarks, Adventures)
export const activities = pgTable('activities', {
  id: text('id').primaryKey(),
  cityId: text('city_id').references(() => cities.id, { onDelete: 'cascade' }),
  cityName: text('city_name').notNull(),
  title: text('title').notNull(),
  category: text('category').notNull(), // 'Sightseeing' | 'Culture' | 'Food' | 'Adventure' | 'Relaxation' | 'Nature'
  description: text('description').notNull(),
  estimatedCost: real('estimated_cost').default(0).notNull(),
  currency: text('currency').default('INR').notNull(),
  durationMinutes: integer('duration_minutes').default(60).notNull(),
  rating: real('rating').default(4.8).notNull(),
  reviewCount: integer('review_count').default(500).notNull(),
  location: text('location').notNull(),
  latitude: real('latitude'),
  longitude: real('longitude'),
  imageUrl: text('image_url'),
  tags: text('tags'), // JSON string array
  bestTime: text('best_time'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const citiesRelations = relations(cities, ({ many }) => ({
  activities: many(activities),
}));

export const activitiesRelations = relations(activities, ({ one }) => ({
  city: one(cities, {
    fields: [activities.cityId],
    references: [cities.id],
  }),
}));

