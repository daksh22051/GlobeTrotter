import { UserPreferences } from '../types/profile';
import { authService } from './authService';

const STORAGE_KEY_PREFIX = 'globetrotter_preferences';

export const DEFAULT_PREFERENCES: UserPreferences = {
  interests: ['food', 'mountains', 'photography'],
  travelStyle: 'balanced',
  travelStylePace: 50,
  budget: 50000,
  budgetStyle: 'balanced',
  currency: 'INR',
  travelCompanion: 'friends',
  travelPersonality: 'explorer',
  isComplete: false,
  updatedAt: new Date().toISOString(),
};

/**
 * Helper to get the specific storage key for current user
 */
const getStorageKey = (userId?: string): string => {
  const currentUser = authService.getCurrentUser();
  const id = userId || currentUser?.id || 'guest';
  return `${STORAGE_KEY_PREFIX}_${id}`;
};

export const profileService = {
  /**
   * Retrieves default initial preferences
   */
  getDefaultPreferences(userId?: string): UserPreferences {
    const currentUser = authService.getCurrentUser();
    const currency = (currentUser?.preferredCurrency as any) || 'INR';

    return {
      ...DEFAULT_PREFERENCES,
      userId: userId || currentUser?.id,
      currency,
      updatedAt: new Date().toISOString(),
    };
  },

  /**
   * Retrieves saved preferences for the user
   */
  getPreferences(userId?: string): UserPreferences | null {
    try {
      const key = getStorageKey(userId);
      const raw = localStorage.getItem(key);
      if (!raw) {
        // Check fallback generic key
        const generic = localStorage.getItem(STORAGE_KEY_PREFIX);
        if (generic) return JSON.parse(generic);
        return null;
      }
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  /**
   * Saves or creates comprehensive preferences
   */
  savePreferences(prefs: Partial<UserPreferences>): UserPreferences {
    const currentUser = authService.getCurrentUser();
    const existing = this.getPreferences(currentUser?.id) || this.getDefaultPreferences(currentUser?.id);

    const merged: UserPreferences = {
      ...existing,
      ...prefs,
      userId: currentUser?.id || existing.userId,
      updatedAt: new Date().toISOString(),
    };

    try {
      const key = getStorageKey(currentUser?.id);
      localStorage.setItem(key, JSON.stringify(merged));
      localStorage.setItem(STORAGE_KEY_PREFIX, JSON.stringify(merged)); // generic fallback
    } catch {
      // Storage fallback
    }

    return merged;
  },

  /**
   * Updates partial preference fields
   */
  updatePreferences(updates: Partial<UserPreferences>): UserPreferences {
    return this.savePreferences(updates);
  },

  /**
   * Checks if user has already finalized onboarding
   */
  hasCompletedOnboarding(userId?: string): boolean {
    const prefs = this.getPreferences(userId);
    return !!prefs && prefs.isComplete;
  },

  /**
   * Clears saved user preferences
   */
  clearPreferences(userId?: string): void {
    try {
      const key = getStorageKey(userId);
      localStorage.removeItem(key);
      localStorage.removeItem(STORAGE_KEY_PREFIX);
    } catch {
      // Storage fallback
    }
  },
};
