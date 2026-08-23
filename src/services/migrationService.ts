/**
 * GlobeTrotter Client-to-Server Data Migration Service
 * 
 * Inspects legacy localStorage data (trips, itineraries, expenses, preferences)
 * and syncs them automatically to PostgreSQL on authentication.
 */

import { authService } from './authService';
import { apiRequest } from './apiClient';

const MIGRATION_DONE_KEY = 'globetrotter_migration_completed';

export const migrationService = {
  /**
   * Checks if local legacy data exists and has not been migrated yet
   */
  hasPendingMigration(userId?: string): boolean {
    const user = authService.getCurrentUser();
    const effectiveUserId = userId || user?.id;
    if (!effectiveUserId) return false;

    const migrationDone = localStorage.getItem(`${MIGRATION_DONE_KEY}_${effectiveUserId}`);
    if (migrationDone === 'true') return false;

    // Check if there are local trips
    const tripsKey = `globetrotter_trips_${effectiveUserId}`;
    const rawTrips = localStorage.getItem(tripsKey);
    if (rawTrips) {
      try {
        const trips = JSON.parse(rawTrips);
        if (Array.isArray(trips) && trips.length > 0) {
          return true;
        }
      } catch {
        // ignore
      }
    }

    return false;
  },

  /**
   * Runs the data import migration against /api/migration/import
   */
  async runMigration(userId?: string): Promise<{ success: boolean; message: string }> {
    const user = authService.getCurrentUser();
    const effectiveUserId = userId || user?.id;
    if (!effectiveUserId) {
      return { success: false, message: 'User not authenticated' };
    }

    try {
      const tripsKey = `globetrotter_trips_${effectiveUserId}`;
      const itinerariesKey = `globetrotter_itineraries_${effectiveUserId}`;
      const expensesKey = `globetrotter_expenses_${effectiveUserId}`;
      const preferencesKey = `globetrotter_preferences_${effectiveUserId}`;

      const rawTrips = localStorage.getItem(tripsKey);
      const rawItineraries = localStorage.getItem(itinerariesKey);
      const rawExpenses = localStorage.getItem(expensesKey);
      const rawPreferences = localStorage.getItem(preferencesKey);

      const trips = rawTrips ? JSON.parse(rawTrips) : [];
      const itinerariesMap = rawItineraries ? JSON.parse(rawItineraries) : {};
      const expensesMap = rawExpenses ? JSON.parse(rawExpenses) : {};
      const preferences = rawPreferences ? JSON.parse(rawPreferences) : null;

      const itineraries = Object.values(itinerariesMap);
      const expenses = Object.values(expensesMap).flat();

      if (trips.length === 0 && !preferences) {
        localStorage.setItem(`${MIGRATION_DONE_KEY}_${effectiveUserId}`, 'true');
        return { success: true, message: 'No legacy data to migrate' };
      }

      const res = await apiRequest('/migration/import', {
        method: 'POST',
        body: JSON.stringify({
          trips,
          itineraries,
          expenses,
          preferences,
        }),
      });

      localStorage.setItem(`${MIGRATION_DONE_KEY}_${effectiveUserId}`, 'true');
      return { success: true, message: res.message || 'Migration completed successfully' };
    } catch (error: any) {
      console.warn('Migration sync note:', error.message);
      return { success: false, message: error.message };
    }
  },
};
