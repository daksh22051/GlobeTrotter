import { UserPreferences } from '../types/profile';
import { authService } from './authService';
import { apiRequest } from './apiClient';

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

const getStorageKey = (userId?: string): string => {
  const currentUser = authService.getCurrentUser();
  const id = userId || currentUser?.id || 'guest';
  return `${STORAGE_KEY_PREFIX}_${id}`;
};

export const profileService = {
  /**
   * Fetch preferences asynchronously from PostgreSQL
   */
  async fetchPreferences(): Promise<UserPreferences | null> {
    try {
      const prefs = await apiRequest<any>('/profile/preferences');
      if (prefs) {
        const mapped: UserPreferences = {
          userId: prefs.userId,
          interests: prefs.interests || ['food', 'mountains', 'photography'],
          travelStyle: (prefs.travelStyle?.toLowerCase() || 'balanced') as any,
          travelStylePace: 50,
          budget: 50000,
          budgetStyle: (prefs.budgetStyle?.toLowerCase() || 'balanced') as any,
          currency: prefs.currency || 'INR',
          travelCompanion: (prefs.companion?.toLowerCase() || 'friends') as any,
          travelPersonality: (prefs.personality?.toLowerCase() || 'explorer') as any,
          languagePreference: prefs.languagePreference || 'English',
          isComplete: true,
          updatedAt: new Date().toISOString(),
        };

        const key = getStorageKey(prefs.userId);
        localStorage.setItem(key, JSON.stringify(mapped));
        return mapped;
      }
      return this.getPreferences();
    } catch {
      return this.getPreferences();
    }
  },

  getDefaultPreferences(userId?: string): UserPreferences {
    const currentUser = authService.getCurrentUser();
    const currency = (currentUser?.preferredCurrency as any) || 'INR';

    return {
      ...DEFAULT_PREFERENCES,
      userId: userId || currentUser?.id,
      currency,
      updatedAt: new Date().toISOString(),
      languagePreference: 'English',
    };
  },

  getPreferences(userId?: string): UserPreferences | null {
    try {
      const key = getStorageKey(userId);
      const raw = localStorage.getItem(key);
      if (!raw) {
        const generic = localStorage.getItem(STORAGE_KEY_PREFIX);
        if (generic) return JSON.parse(generic);
        return null;
      }
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

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
      localStorage.setItem(STORAGE_KEY_PREFIX, JSON.stringify(merged));
    } catch {
      // Storage fallback
    }

    // Persist to PostgreSQL
    if (authService.isAuthenticated()) {
      apiRequest('/profile/preferences', {
        method: 'PUT',
        body: JSON.stringify({
          interests: merged.interests,
          travelStyle: merged.travelStyle,
          budgetStyle: merged.budgetStyle,
          companion: merged.travelCompanion,
          personality: merged.travelPersonality,
          currency: merged.currency,
        }),
      }).catch((err) => console.log('Profile prefs sync:', err.message));
    }

    return merged;
  },

  updatePreferences(updates: Partial<UserPreferences>): UserPreferences {
    return this.savePreferences(updates);
  },

  updateProfile(
    userId: string,
    userData: { name?: string; email?: string; bio?: string; avatarUrl?: string; preferredCurrency?: string; languagePreference?: string },
    preferences?: Partial<UserPreferences>
  ): { user: any; preferences: UserPreferences } {
    const updatedUser = authService.updateUser({
      name: userData.name,
      bio: userData.bio,
      avatarUrl: userData.avatarUrl,
      preferredCurrency: userData.preferredCurrency,
      email: userData.email,
      languagePreference: userData.languagePreference,
    });

    const updatedPrefs = this.savePreferences({
      ...preferences,
      currency: (userData.preferredCurrency as any) || preferences?.currency,
      bio: userData.bio,
      languagePreference: userData.languagePreference,
    });

    return {
      user: updatedUser,
      preferences: updatedPrefs,
    };
  },

  hasCompletedOnboarding(userId?: string): boolean {
    const prefs = this.getPreferences(userId);
    return !!prefs && prefs.isComplete;
  },

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
